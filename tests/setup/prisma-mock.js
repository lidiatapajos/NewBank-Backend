const prisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  userIp: {
    upsert: jest.fn(),
    groupBy: jest.fn(),
  },
  loginEvent: {
    create: jest.fn(),
    count: jest.fn(),
  },
  financialData: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  score: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
  decision: {
    create: jest.fn(),
    findFirst: jest.fn(),
  },
  $transaction: jest.fn(async (operations) => Promise.all(operations)),
};

function resetPrismaMock() {
  prisma.user.findUnique.mockReset();
  prisma.user.create.mockReset();
  prisma.user.update.mockReset();

  prisma.userIp.upsert.mockReset();
  prisma.userIp.groupBy.mockReset();

  prisma.loginEvent.create.mockReset();
  prisma.loginEvent.count.mockReset();

  prisma.financialData.upsert.mockReset();
  prisma.financialData.findUnique.mockReset();
  prisma.financialData.findFirst.mockReset();
  prisma.financialData.findMany.mockReset();

  prisma.score.create.mockReset();
  prisma.score.findUnique.mockReset();
  prisma.score.findFirst.mockReset();

  prisma.decision.create.mockReset();
  prisma.decision.findFirst.mockReset();

  prisma.$transaction.mockReset();
  prisma.$transaction.mockImplementation(async (operations) => Promise.all(operations));

  prisma.userIp.groupBy.mockResolvedValue([]);
  prisma.loginEvent.count.mockResolvedValue(0);
  prisma.userIp.upsert.mockResolvedValue({});
  prisma.loginEvent.create.mockResolvedValue({ id: "evt-1" });
}

module.exports = {
  prisma,
  resetPrismaMock,
};
