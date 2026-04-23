function toReferenceMonth(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const normalized = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  return normalized;
}

function toNumber(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return numberValue;
}

function calculateScore({ monthlyIncome, monthlyExpenses }) {
  let score = 0;
  const reasons = [];

  if (monthlyIncome >= 1780) {
    score += 500;
    reasons.push("Renda alta (>= 1780/mes) adicionou +500 pontos");
  }

  if (monthlyIncome >= 1621) {
    score += 300;
    reasons.push("Renda frequente (>= 1621/mes) adicionou +300 pontos");
  }

  if (monthlyExpenses <= 1000) {
    score += 300;
    reasons.push("Gastos controlados (<= 1000/mes) adicionaram +300 pontos");
  }

  const expenseToIncomeRatio = monthlyIncome > 0 ? monthlyExpenses / monthlyIncome : 0;
  if (expenseToIncomeRatio >= 0.9) {
    score += 150;
    reasons.push("Gastos altos (>= 90% da renda) adicionaram +150 pontos");
  }

  if (reasons.length === 0) {
    reasons.push("Nenhuma regra de pontuacao foi atendida");
  }

  const clampedScore = Math.max(0, Math.min(1000, Math.round(score)));

  return {
    score: clampedScore,
    reason: reasons.join(". "),
  };
}

function buildDecision(score, scoreReason, monthlyIncome) {
  if (score >= 800) {
    return {
      status: "approved",
      creditLimit: monthlyIncome * 2,
      reason: `Aprovado. ${scoreReason}`,
    };
  }

  if (score >= 500) {
    return {
      status: "approved_with_risk",
      creditLimit: monthlyIncome * 0.5,
      reason: `Aprovado com limite reduzido. ${scoreReason}`,
    };
  }

  return {
    status: "denied",
    creditLimit: 0,
    reason: `Solicitacao negada. ${scoreReason}`,
  };
}

module.exports = {
  toReferenceMonth,
  toNumber,
  calculateScore,
  buildDecision,
};
