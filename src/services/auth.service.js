const jwt = require("jsonwebtoken");

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  return secret;
}

function getJwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || "1d";
}

function signAccessToken(payload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: getJwtExpiresIn(),
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
};
