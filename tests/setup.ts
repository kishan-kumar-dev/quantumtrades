import { execSync } from "node:child_process";
import { beforeEach, afterAll } from "vitest";
import { prisma } from "../lib/prisma";

// Reset SQLite DB before each test
beforeEach(() => {
  try {
    execSync("rm -f ./prisma/dev.db"); // macOS / Linux
  } catch {
    execSync("del /f /q .\\prisma\\dev.db"); // Windows
  }
});

// Disconnect Prisma after all tests
afterAll(async () => {
  await prisma.$disconnect();
});
