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

function calculateScore({ monthlyIncome, monthlyExpenses, incomeFrequency }) {
  let score = 500;
  const reasons = [];

  const incomeBonus = Math.min(300, Math.max(0, Math.floor((monthlyIncome / 3000) * 300)));
  score += incomeBonus;

  if (incomeBonus > 0) {
    reasons.push(`Renda mensal contribuiu com +${incomeBonus} pontos`);
  } else {
    reasons.push("Renda mensal nao adicionou pontos de bonus");
  }

  if (incomeFrequency === "daily") {
    score += 200;
    reasons.push("Frequencia de renda diaria adicionou +200 pontos");
  }

  if (incomeFrequency === "weekly") {
    score += 130;
    reasons.push("Frequencia de renda semanal adicionou +130 pontos");
  }

  if (incomeFrequency === "monthly") {
    score += 60;
    reasons.push("Frequencia de renda mensal adicionou +60 pontos");
  }

  if (incomeFrequency === "irregular") {
    score -= 150;
    reasons.push("Frequencia de renda irregular reduziu -150 pontos");
  }

  const ratio = monthlyIncome > 0 ? monthlyExpenses / monthlyIncome : 999;

  if (ratio < 0.5) {
    score += 200;
    reasons.push("Despesas abaixo de 50% da renda adicionaram +200 pontos");
  }

  if (ratio > 1) {
    score -= 200;
    reasons.push("Despesas acima de 100% da renda reduziram -200 pontos");
  }

  const clampedScore = Math.max(0, Math.min(1000, Math.round(score)));

  return {
    score: clampedScore,
    reason: reasons.join(". "),
  };
}

function buildDecision(score) {
  if (score >= 600) {
    return {
      status: "approved",
      creditLimit: 5000,
      reason: "Aprovado por score alto e boa consistencia financeira recente.",
    };
  }

  if (score >= 400) {
    return {
      status: "approved_with_risk",
      creditLimit: 2000,
      reason: "Aprovado com risco por score intermediario. Limite moderado aplicado.",
    };
  }

  return {
    status: "denied",
    creditLimit: 0,
    reason: "Solicitacao negada por score baixo e risco financeiro elevado.",
  };
}

module.exports = {
  toReferenceMonth,
  toNumber,
  calculateScore,
  buildDecision,
};
