const request = require("supertest");
const { resetPrismaMock } = require("./setup/prisma-mock");

jest.mock("../src/lib/prisma", () => require("./setup/prisma-mock").prisma);

const prisma = require("../src/lib/prisma");
const app = require("../src/app");

describe("Scores use cases", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  test("POST /scores returns not found when user has no financial data", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "user-1" });
    prisma.financialData.findFirst.mockResolvedValue(null);

    const response = await request(app).post("/scores").send({
      user_id: "user-1",
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("dados financeiros nao encontrados para o usuario");
  });
});
