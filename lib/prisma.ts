import { PrismaClient } from "@prisma/client";

// Extend the global object to store Prisma instance
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Use existing Prisma client if available (singleton)
export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: ["query"], // Optional: logs all queries, useful in dev
  });

// Attach Prisma to global in development to prevent multiple instances
if (process.env.NODE_ENV !== "production") global.__prisma = prisma;
