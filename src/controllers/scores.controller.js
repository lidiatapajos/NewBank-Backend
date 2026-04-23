const prisma = require("../lib/prisma");
const { badRequest, notFound } = require("../utils/http");
const { calculateScore, toReferenceMonth } = require("../utils/financial");

async function createScore(req, res, next) {
  try {
    const { user_id: userId, reference_month: referenceMonthInput } = req.body;

    if (!userId) {
      return badRequest(res, "user_id e obrigatorio");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return notFound(res, "usuario nao encontrado");
    }

    let financialData;

    if (referenceMonthInput) {
      const referenceMonth = toReferenceMonth(referenceMonthInput);
      if (!referenceMonth) {
        return badRequest(res, "reference_month invalido");
      }

      financialData = await prisma.financialData.findUnique({
        where: {
          userId_referenceMonth: {
            userId,
            referenceMonth,
          },
        },
      });
    } else {
      financialData = await prisma.financialData.findFirst({
        where: { userId },
        orderBy: { referenceMonth: "desc" },
      });
    }

    if (!financialData) {
      return notFound(res, "dados financeiros nao encontrados para o usuario");
    }

    const { score, reason } = calculateScore({
      monthlyIncome: Number(financialData.monthlyIncome),
      monthlyExpenses: Number(financialData.monthlyExpenses),
    });

    const createdScore = await prisma.score.create({
      data: {
        userId,
        score,
        reason,
      },
    });

    return res.status(201).json(createdScore);
  } catch (error) {
    return next(error);
  }
}

async function getLatestScoreByUser(req, res, next) {
  try {
    const { user_id: userId } = req.params;

    if (!userId) {
      return badRequest(res, "user_id e obrigatorio");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return notFound(res, "usuario nao encontrado");
    }

    const score = await prisma.score.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!score) {
      return notFound(res, "score nao encontrado para o usuario");
    }

    return res.status(200).json(score);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createScore,
  getLatestScoreByUser,
};
