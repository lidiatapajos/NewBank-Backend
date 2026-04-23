const express = require("express");
const { createScore, getLatestScoreByUser } = require("../controllers/scores.controller");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Score:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         score:
 *           type: integer
 *           minimum: 0
 *           maximum: 1000
 *         reason:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     ScoreInput:
 *       type: object
 *       required:
 *         - user_id
 *       properties:
 *         user_id:
 *           type: string
 *           format: uuid
 *         reference_month:
 *           type: string
 *           format: date
 *           example: "2026-04-01"
 */

/**
 * @swagger
 * /scores:
 *   post:
 *     tags:
 *       - Scores
 *     summary: Calcula e salva um novo score
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScoreInput'
 *     responses:
 *       201:
 *         description: Score criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Score'
 *       400:
 *         description: Erro de validacao
 *       404:
 *         description: Usuario ou dados financeiros nao encontrados
 *       500:
 *         description: Erro interno
 */
router.post("/", createScore);

/**
 * @swagger
 * /scores/{user_id}:
 *   get:
 *     tags:
 *       - Scores
 *     summary: Retorna o score mais recente do usuario
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Score retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Score'
 *       404:
 *         description: Usuario ou score nao encontrado
 *       500:
 *         description: Erro interno
 */
router.get("/:user_id", getLatestScoreByUser);

module.exports = router;
