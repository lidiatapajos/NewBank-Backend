const request = require("supertest");
const bcrypt = require("bcryptjs");
const { resetPrismaMock } = require("./setup/prisma-mock");

jest.mock("../src/lib/prisma", () => require("./setup/prisma-mock").prisma);

const prisma = require("../src/lib/prisma");
const app = require("../src/app");

describe("Auth use cases", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  test("POST /auth/register creates account", async () => {
    const createdUser = {
      id: "user-1",
      name: "Ana",
      email: "ana@email.com",
      riskLevel: "low",
      createdAt: new Date().toISOString(),
    };

    prisma.user.create.mockResolvedValue(createdUser);
    prisma.user.update.mockResolvedValue(createdUser);

    const response = await request(app).post("/auth/register").send({
      name: "Ana",
      email: "ana@email.com",
      cpf: "12345678900",
      password: "12345678",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: createdUser.id,
      email: createdUser.email,
    });
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
    expect(prisma.userIp.upsert).toHaveBeenCalledTimes(1);
  });

  test("POST /auth/register validates required fields", async () => {
    const response = await request(app).post("/auth/register").send({
      email: "ana@email.com",
      cpf: "12345678900",
      password: "12345678",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("bad_request");
  });

  test("POST /auth/login authenticates with plain password", async () => {
    const passwordHash = await bcrypt.hash("12345678", 10);
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "ana@email.com",
      passwordHash,
    });
    prisma.user.update.mockResolvedValue({
      id: "user-1",
      name: "Ana",
      email: "ana@email.com",
      riskLevel: "low",
      lastLoginAt: new Date().toISOString(),
    });

    const response = await request(app).post("/auth/login").send({
      email: "ana@email.com",
      password: "12345678",
    });

    expect(response.status).toBe(200);
    expect(response.body.token_type).toBe("Bearer");
    expect(typeof response.body.access_token).toBe("string");
  });

  test("POST /auth/login rejects wrong plain password", async () => {
    const passwordHash = await bcrypt.hash("12345678", 10);
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "ana@email.com",
      passwordHash,
    });

    const response = await request(app).post("/auth/login").send({
      email: "ana@email.com",
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("unauthorized");
  });

  test("POST /auth/login authenticates with encrypted password flag", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "ana@email.com",
      passwordHash: "stored-hash-value",
    });
    prisma.user.update.mockResolvedValue({
      id: "user-1",
      name: "Ana",
      email: "ana@email.com",
      riskLevel: "low",
      lastLoginAt: new Date().toISOString(),
    });

    const response = await request(app).post("/auth/login").send({
      email: "ana@email.com",
      password: "stored-hash-value",
      passwordEncypted: true,
    });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe("ana@email.com");
  });

  test("POST /auth/login rejects wrong hash with encrypted password flag", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "ana@email.com",
      passwordHash: "stored-hash-value",
    });

    const response = await request(app).post("/auth/login").send({
      email: "ana@email.com",
      password: "different-hash",
      passwordEncypted: true,
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("unauthorized");
  });
});
