const request = require("supertest");
const { resetPrismaMock } = require("./setup/prisma-mock");

jest.mock("../src/lib/prisma", () => require("./setup/prisma-mock").prisma);

const prisma = require("../src/lib/prisma");
const app = require("../src/app");

describe("Financial data use cases", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  test("POST /financial-data validates invalid income_frequency", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "user-1" });

    const response = await request(app).post("/financial-data").send({
      user_id: "user-1",
      reference_month: "2026-04-01",
      monthly_income: 5000,
      income_frequency: "yearly",
      monthly_expenses: 2200,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("income_frequency invalido");
  });

  test("POST /financial-data returns not found for unknown user", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const response = await request(app).post("/financial-data").send({
      user_id: "user-not-found",
      reference_month: "2026-04-01",
      monthly_income: 5000,
      income_frequency: "monthly",
      monthly_expenses: 2200,
    });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("not_found");
  });
});
