const express = require("express");
const { createDecision, getLatestDecisionByUser } = require("../controllers/decisions.controller");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     DecisionStatus:
 *       type: string
 *       enum:
 *         - approved
 *         - approved_with_risk
 *         - denied
 *     Decision:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         scoreId:
 *           type: string
 *           format: uuid
 *         status:
 *           $ref: '#/components/schemas/DecisionStatus'
 *         creditLimit:
 *           type: string
 *           example: "2000.00"
 *         reason:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     DecisionInput:
 *       type: object
 *       required:
 *         - user_id
 *       properties:
 *         user_id:
 *           type: string
 *           format: uuid
 *         score_id:
 *           type: string
 *           format: uuid
 */

/**
 * @swagger
 * /decisions:
 *   post:
 *     tags:
 *       - Decisions
 *     summary: Gera uma decisao de credito a partir do score
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DecisionInput'
 *     responses:
 *       201:
 *         description: Decisao criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Decision'
 *       400:
 *         description: Erro de validacao
 *       404:
 *         description: Usuario ou score nao encontrado
 *       500:
 *         description: Erro interno
 */
router.post("/", createDecision);

/**
 * @swagger
 * /decisions/{user_id}:
 *   get:
 *     tags:
 *       - Decisions
 *     summary: Retorna a decisao de credito mais recente do usuario
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Decisao retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Decision'
 *       404:
 *         description: Usuario ou decisao nao encontrado
 *       500:
 *         description: Erro interno
 */
router.get("/:user_id", getLatestDecisionByUser);

module.exports = router;
