const prisma = require("../lib/prisma");
const { badRequest, conflict } = require("../utils/http");
const {
  normalizeCpf,
  buildCpfHash,
  encryptCpf,
  hashPassword,
} = require("../services/crypto.service");

async function createUser(req, res, next) {
  try {
    const { name, email, cpf, password } = req.body;

    if (!name || !email || !cpf || !password) {
      return badRequest(res, "name, email, cpf e password sao obrigatorios");
    }

    if (String(password).length < 8) {
      return badRequest(res, "password deve ter no minimo 8 caracteres");
    }

    const normalizedCpf = normalizeCpf(cpf);
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        cpf: null,
        cpfHash: buildCpfHash(normalizedCpf),
        cpfEncrypted: encryptCpf(normalizedCpf),
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        riskLevel: true,
      },
    });

    return res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return conflict(res, "email ou cpf ja cadastrado");
    }

    return next(error);
  }
}

module.exports = {
  createUser,
};
