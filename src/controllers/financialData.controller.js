const prisma = require("../lib/prisma");
const { badRequest, notFound } = require("../utils/http");
const { toReferenceMonth, toNumber } = require("../utils/financial");

const validFrequencies = ["daily", "weekly", "monthly", "irregular"];

async function upsertFinancialData(req, res, next) {
  try {
    const { user_id: userId, reference_month: referenceMonthInput, monthly_income: monthlyIncomeInput, income_frequency: incomeFrequency, monthly_expenses: monthlyExpensesInput } = req.body;

    if (!userId || !referenceMonthInput || monthlyIncomeInput === undefined || monthlyExpensesInput === undefined || !incomeFrequency) {
      return badRequest(
        res,
        "user_id, reference_month, monthly_income, income_frequency e monthly_expenses sao obrigatorios"
      );
    }

    if (!validFrequencies.includes(incomeFrequency)) {
      return badRequest(res, "income_frequency invalido");
    }

    const referenceMonth = toReferenceMonth(referenceMonthInput);
    if (!referenceMonth) {
      return badRequest(res, "reference_month invalido");
    }

    const monthlyIncome = toNumber(monthlyIncomeInput);
    const monthlyExpenses = toNumber(monthlyExpensesInput);

    if (monthlyIncome === null || monthlyIncome <= 0) {
      return badRequest(res, "monthly_income deve ser maior que 0");
    }

    if (monthlyExpenses === null || monthlyExpenses < 0) {
      return badRequest(res, "monthly_expenses deve ser maior ou igual a 0");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return notFound(res, "usuario nao encontrado");
    }

    const record = await prisma.financialData.upsert({
      where: {
        userId_referenceMonth: {
          userId,
          referenceMonth,
        },
      },
      update: {
        monthlyIncome: monthlyIncome.toFixed(2),
        monthlyExpenses: monthlyExpenses.toFixed(2),
        incomeFrequency,
      },
      create: {
        userId,
        referenceMonth,
        monthlyIncome: monthlyIncome.toFixed(2),
        monthlyExpenses: monthlyExpenses.toFixed(2),
        incomeFrequency,
      },
    });

    return res.status(201).json(record);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  upsertFinancialData,
};
