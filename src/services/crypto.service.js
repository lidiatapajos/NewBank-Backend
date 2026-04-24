const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const BCRYPT_ROUNDS = 10;

function normalizeCpf(value) {
  return String(value || "").replace(/\D/g, "");
}

function getEncryptionKey() {
  const source = process.env.ENCRYPTION_KEY;

  if (!source) {
    throw new Error("ENCRYPTION_KEY environment variable is required");
  }

  return crypto.createHash("sha256").update(source).digest();
}

function getCpfHashSecret() {
  return process.env.CPF_HASH_SECRET || process.env.ENCRYPTION_KEY;
}

function buildCpfHash(cpf) {
  const secret = getCpfHashSecret();
  if (!secret) {
    throw new Error("ENCRYPTION_KEY or CPF_HASH_SECRET environment variable is required");
  }

  const normalized = normalizeCpf(cpf);
  return crypto.createHmac("sha256", secret).update(normalized).digest("hex");
}

function encryptCpf(cpf) {
  const normalized = normalizeCpf(cpf);
  const iv = crypto.randomBytes(12);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([cipher.update(normalized, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

function decryptCpf(payload) {
  const [ivB64, tagB64, dataB64] = String(payload || "").split(":");

  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid encrypted CPF payload");
  }

  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const encrypted = Buffer.from(dataB64, "base64");
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);

  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

async function hashPassword(password) {
  return bcrypt.hash(String(password), BCRYPT_ROUNDS);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(String(password), String(hash || ""));
}

module.exports = {
  normalizeCpf,
  buildCpfHash,
  encryptCpf,
  decryptCpf,
  hashPassword,
  comparePassword,
};
