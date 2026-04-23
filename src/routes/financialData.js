const express = require("express");
const { upsertFinancialData } = require("../controllers/financialData.controller");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     IncomeFrequency:
 *       type: string
 *       enum:
 *         - daily
 *         - weekly
 *         - monthly
 *         - irregular
 *     FinancialData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         referenceMonth:
 *           type: string
 *           format: date
 *         monthlyIncome:
 *           type: string
 *           example: "5000.00"
 *         incomeFrequency:
 *           $ref: '#/components/schemas/IncomeFrequency'
 *         monthlyExpenses:
 *           type: string
 *           example: "2200.00"
 *         createdAt:
 *           type: string
 *           format: date-time
 *     FinancialDataInput:
 *       type: object
 *       required:
 *         - user_id
 *         - reference_month
 *         - monthly_income
 *         - income_frequency
 *         - monthly_expenses
 *       properties:
 *         user_id:
 *           type: string
 *           format: uuid
 *         reference_month:
 *           type: string
 *           format: date
 *           example: "2026-04-01"
 *         monthly_income:
 *           type: number
 *           example: 5000
 *         income_frequency:
 *           $ref: '#/components/schemas/IncomeFrequency'
 *         monthly_expenses:
 *           type: number
 *           example: 2200
 */

/**
 * @swagger
 * /financial-data:
 *   post:
 *     tags:
 *       - FinancialData
 *     summary: Cria ou atualiza snapshot mensal do formulario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FinancialDataInput'
 *     responses:
 *       201:
 *         description: Snapshot salvo com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FinancialData'
 *       400:
 *         description: Erro de validacao
 *       404:
 *         description: Usuario nao encontrado
 *       500:
 *         description: Erro interno
 */
router.post("/", upsertFinancialData);

module.exports = router;
