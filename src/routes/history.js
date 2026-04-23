const express = require("express");
const { getHistoryByUser } = require("../controllers/history.controller");

const router = express.Router();

/**
 * @swagger
 * /history/{user_id}:
 *   get:
 *     tags:
 *       - History
 *     summary: Retorna historico financeiro mensal do usuario
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Historico retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FinancialData'
 *       404:
 *         description: Usuario nao encontrado
 *       500:
 *         description: Erro interno
 */
router.get("/:user_id", getHistoryByUser);

module.exports = router;
