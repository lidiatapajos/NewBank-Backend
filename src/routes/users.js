const express = require("express");
const { createUser } = require("../controllers/users.controller");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: bad_request
 *         message:
 *           type: string
 *           example: Campo obrigatorio ausente
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         cpf:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreateUserInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - cpf
 *       properties:
 *         name:
 *           type: string
 *           example: Joao Silva
 *         email:
 *           type: string
 *           format: email
 *           example: joao@email.com
 *         cpf:
 *           type: string
 *           example: "12345678900"
 */

/**
 * @swagger
 * /users:
 *   post:
 *     tags:
 *       - Users
 *     summary: Cria um novo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserInput'
 *     responses:
 *       201:
 *         description: Usuario criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Erro de validacao
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email ou CPF ja existente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno
 */
router.post("/", createUser);

module.exports = router;
