const prisma = require("../lib/prisma");

function getConfigNumber(name, fallback) {
  const raw = process.env[name];
  const value = Number(raw);

  if (Number.isFinite(value) && value > 0) {
    return value;
  }

  return fallback;
}

function windowStart(hours) {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
}

async function evaluateIpRisk(ip) {
  const riskWindowHours = getConfigNumber("IP_RISK_WINDOW_HOURS", 24);
  const mediumThreshold = getConfigNumber("IP_RISK_MEDIUM_THRESHOLD", 3);
  const highThreshold = getConfigNumber("IP_RISK_HIGH_THRESHOLD", 5);
  const failThreshold = getConfigNumber("LOGIN_FAIL_THRESHOLD_PER_HOUR", 10);
  const sinceRiskWindow = windowStart(riskWindowHours);
  const sinceFailWindow = windowStart(1);

  const [distinctUsersCount, failedAttemptsCount] = await Promise.all([
    prisma.userIp.groupBy({
      by: ["userId"],
      where: {
        ip,
        lastSeenAt: {
          gte: sinceRiskWindow,
        },
      },
      _count: {
        userId: true,
      },
    }),
    prisma.loginEvent.count({
      where: {
        ip,
        success: false,
        createdAt: {
          gte: sinceFailWindow,
        },
      },
    }),
  ]);

  const totalDistinctUsers = distinctUsersCount.length;

  if (totalDistinctUsers >= highThreshold) {
    return {
      riskLevel: "high",
      riskReason: `${totalDistinctUsers} contas distintas no mesmo IP nas ultimas ${riskWindowHours}h`,
    };
  }

  if (totalDistinctUsers >= mediumThreshold) {
    return {
      riskLevel: "medium",
      riskReason: `${totalDistinctUsers} contas distintas no mesmo IP nas ultimas ${riskWindowHours}h`,
    };
  }

  if (failedAttemptsCount >= failThreshold) {
    return {
      riskLevel: "medium",
      riskReason: `${failedAttemptsCount} tentativas de login falhas neste IP na ultima hora`,
    };
  }

  return {
    riskLevel: "low",
    riskReason: null,
  };
}

module.exports = {
  evaluateIpRisk,
};
