const prisma = require("../lib/prisma");
const { badRequest, conflict, unauthorized } = require("../utils/http");
const { extractIp } = require("../utils/ip");
const { evaluateIpRisk } = require("../services/risk.service");
const { signAccessToken } = require("../services/auth.service");
const {
  normalizeCpf,
  buildCpfHash,
  encryptCpf,
  hashPassword,
  comparePassword,
} = require("../services/crypto.service");

async function register(req, res, next) {
  try {
    const { name, email, cpf, password } = req.body;

    if (!name || !email || !cpf || !password) {
      return badRequest(res, "name, email, cpf e password sao obrigatorios");
    }

    if (String(password).length < 8) {
      return badRequest(res, "password deve ter no minimo 8 caracteres");
    }

    const ip = extractIp(req);
    const normalizedCpf = normalizeCpf(cpf);
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        cpf: null,
        cpfHash: buildCpfHash(normalizedCpf),
        cpfEncrypted: encryptCpf(normalizedCpf),
        passwordHash,
        riskLevel: "low",
        riskFlaggedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        riskLevel: true,
        createdAt: true,
      },
    });

    await prisma.userIp.upsert({
      where: {
        userId_ip: {
          userId: user.id,
          ip,
        },
      },
      update: {
        lastSeenAt: new Date(),
      },
      create: {
        userId: user.id,
        ip,
        loginCount: 0,
      },
    });

    const risk = await evaluateIpRisk(ip);

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          riskLevel: risk.riskLevel,
          riskFlaggedAt: risk.riskLevel === "low" ? null : new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          riskLevel: true,
          createdAt: true,
        },
      }),
      prisma.loginEvent.create({
        data: {
          userId: user.id,
          ip,
          userAgent: req.headers["user-agent"] || null,
          success: true,
          riskLevel: risk.riskLevel,
          riskReason: risk.riskReason || "cadastro inicial",
        },
      }),
    ]);

    return res.status(201).json(updatedUser);
  } catch (error) {
    if (error.code === "P2002") {
      return conflict(res, "email ou cpf ja cadastrado");
    }

    return next(error);
  }
}

async function login(req, res, next) {
  const ip = extractIp(req);
  const userAgent = req.headers["user-agent"] || null;

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return badRequest(res, "email e password sao obrigatorios");
    }

    const user = await prisma.user.findUnique({
      where: {
        email: String(email).trim().toLowerCase(),
      },
    });

    if (!user || !user.passwordHash) {
      await prisma.loginEvent.create({
        data: {
          userId: user?.id || null,
          ip,
          userAgent,
          success: false,
          riskLevel: "low",
          riskReason: "credenciais invalidas",
        },
      });
      return unauthorized(res, "credenciais invalidas");
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      await prisma.loginEvent.create({
        data: {
          userId: user.id,
          ip,
          userAgent,
          success: false,
          riskLevel: "low",
          riskReason: "credenciais invalidas",
        },
      });
      return unauthorized(res, "credenciais invalidas");
    }

    await prisma.userIp.upsert({
      where: {
        userId_ip: {
          userId: user.id,
          ip,
        },
      },
      update: {
        lastSeenAt: new Date(),
        loginCount: {
          increment: 1,
        },
      },
      create: {
        userId: user.id,
        ip,
        loginCount: 1,
      },
    });

    const risk = await evaluateIpRisk(ip);

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          riskLevel: risk.riskLevel,
          riskFlaggedAt: risk.riskLevel === "low" ? null : new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          riskLevel: true,
          lastLoginAt: true,
        },
      }),
      prisma.loginEvent.create({
        data: {
          userId: user.id,
          ip,
          userAgent,
          success: true,
          riskLevel: risk.riskLevel,
          riskReason: risk.riskReason,
        },
      }),
    ]);

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
    });

    return res.status(200).json({
      access_token: accessToken,
      token_type: "Bearer",
      user: updatedUser,
    });
  } catch (error) {
    await prisma.loginEvent.create({
      data: {
        userId: null,
        ip,
        userAgent,
        success: false,
        riskLevel: "low",
        riskReason: "erro interno durante login",
      },
    });
    return next(error);
  }
}

async function me(req, res) {
  return res.status(200).json({
    id: req.user.id,
    email: req.user.email,
  });
}

module.exports = {
  register,
  login,
  me,
};
