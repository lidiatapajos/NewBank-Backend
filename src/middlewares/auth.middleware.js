const prisma = require("../lib/prisma");
const { unauthorized } = require("../utils/http");
const { verifyAccessToken } = require("../services/auth.service");

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return unauthorized(res, "token ausente ou invalido");
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      return unauthorized(res, "usuario do token nao encontrado");
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    return next();
  } catch (_error) {
    return unauthorized(res, "token ausente ou invalido");
  }
}

module.exports = {
  requireAuth,
};
