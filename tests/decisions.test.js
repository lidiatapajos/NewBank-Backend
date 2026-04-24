const request = require("supertest");
const { resetPrismaMock } = require("./setup/prisma-mock");

jest.mock("../src/lib/prisma", () => require("./setup/prisma-mock").prisma);

const prisma = require("../src/lib/prisma");
const app = require("../src/app");

describe("Decisions use cases", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  test("POST /decisions creates decision from latest score", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "user-1" });
    prisma.score.findFirst.mockResolvedValue({
      id: "score-1",
      userId: "user-1",
      score: 850,
      reason: "Renda alta",
    });
    prisma.financialData.findFirst.mockResolvedValue({
      monthlyIncome: "5000.00",
    });
    prisma.decision.create.mockResolvedValue({
      id: "decision-1",
      userId: "user-1",
      scoreId: "score-1",
      status: "approved",
      creditLimit: "10000.00",
      reason: "Aprovado. Renda alta",
    });

    const response = await request(app).post("/decisions").send({
      user_id: "user-1",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      status: "approved",
      creditLimit: "10000.00",
    });
    expect(typeof response.body.reason).toBe("string");
  });
});
