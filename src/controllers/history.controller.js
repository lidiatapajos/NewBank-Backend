const prisma = require("../lib/prisma");
const { notFound, badRequest } = require("../utils/http");

async function getHistoryByUser(req, res, next) {
  try {
    const { user_id: userId } = req.params;

    if (!userId) {
      return badRequest(res, "user_id e obrigatorio");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return notFound(res, "usuario nao encontrado");
    }

    const history = await prisma.financialData.findMany({
      where: { userId },
      orderBy: { referenceMonth: "desc" },
    });

    return res.status(200).json(history);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getHistoryByUser,
};
