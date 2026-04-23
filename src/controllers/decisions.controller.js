const prisma = require("../lib/prisma");
const { badRequest, notFound } = require("../utils/http");
const { buildDecision } = require("../utils/financial");

async function createDecision(req, res, next) {
  try {
    const { user_id: userId, score_id: scoreId } = req.body;

    if (!userId) {
      return badRequest(res, "user_id e obrigatorio");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return notFound(res, "usuario nao encontrado");
    }

    let score;
    if (scoreId) {
      score = await prisma.score.findUnique({ where: { id: scoreId } });
    } else {
      score = await prisma.score.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!score || score.userId !== userId) {
      return notFound(res, "score nao encontrado para gerar decisao");
    }

    const financialData = await prisma.financialData.findFirst({
      where: { userId },
      orderBy: { referenceMonth: "desc" },
    });

    const monthlyIncome = financialData ? Number(financialData.monthlyIncome) : 0;

    const decisionData = buildDecision(score.score, score.reason, monthlyIncome);

    const decision = await prisma.decision.create({
      data: {
        userId,
        scoreId: score.id,
        status: decisionData.status,
        creditLimit: Math.max(0, decisionData.creditLimit).toFixed(2),
        reason: decisionData.reason,
      },
    });

    return res.status(201).json(decision);
  } catch (error) {
    return next(error);
  }
}

async function getLatestDecisionByUser(req, res, next) {
  try {
    const { user_id: userId } = req.params;

    if (!userId) {
      return badRequest(res, "user_id e obrigatorio");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return notFound(res, "usuario nao encontrado");
    }

    const decision = await prisma.decision.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!decision) {
      return notFound(res, "decisao nao encontrada para o usuario");
    }

    return res.status(200).json(decision);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createDecision,
  getLatestDecisionByUser,
};
