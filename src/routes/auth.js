const express = require("express");
const { register, login, me } = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - cpf
 *         - password
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
 *         password:
 *           type: string
 *           minLength: 8
 *           example: "senha-super-segura"
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *         passwordEncypted:
 *           type: boolean
 *           default: false
 *           description: Quando true, o campo password deve conter o hash salvo no banco e a validacao e por igualdade direta.
 *         passwordEncrypted:
 *           type: boolean
 *           default: false
 *           description: Alias de passwordEncypted.
 *     AuthUser:
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
 *         riskLevel:
 *           type: string
 *           enum:
 *             - low
 *             - medium
 *             - high
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *     AuthTokenResponse:
 *       type: object
 *       properties:
 *         access_token:
 *           type: string
 *         token_type:
 *           type: string
 *           example: Bearer
 *         user:
 *           $ref: '#/components/schemas/AuthUser'
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Cria conta com senha e CPF protegido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Conta criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUser'
 *       400:
 *         description: Erro de validacao
 *       409:
 *         description: Email ou CPF ja existente
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Realiza login e retorna token de acesso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokenResponse'
 *       400:
 *         description: Erro de validacao
 *       401:
 *         description: Credenciais invalidas
 *       429:
 *         description: Muitas tentativas
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Retorna usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario autenticado
 *       401:
 *         description: Token ausente ou invalido
 */
router.get("/me", requireAuth, me);

module.exports = router;
