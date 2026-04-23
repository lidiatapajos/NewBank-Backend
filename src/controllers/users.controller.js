const prisma = require("../lib/prisma");
const { badRequest, conflict } = require("../utils/http");

async function createUser(req, res, next) {
  try {
    const { name, email, cpf } = req.body;

    if (!name || !email || !cpf) {
      return badRequest(res, "name, email e cpf sao obrigatorios");
    }

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        cpf: String(cpf).trim(),
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
