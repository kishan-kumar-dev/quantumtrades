import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "../lib/prisma";

describe("Auth API", () => {
  beforeAll(async () => {
    await prisma.$executeRaw`PRAGMA foreign_keys = OFF`;
    await prisma.trade.deleteMany();
    await prisma.order.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$executeRaw`PRAGMA foreign_keys = ON`;
  });

  it("registers and logs in a user", async () => {
    const res = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "u1@test.com",
        name: "U1",
        password: "secret123",
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user.email).toBe("u1@test.com");
  });
});
