import { PrismaClient } from "@prisma/client";

// Type for attaching prisma to the global object in dev
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Use existing PrismaClient if present, otherwise create a new one
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"], // Logs queries, errors, warnings
  });

// Only attach to global in non-production to prevent multiple instances
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Default export
export default prisma;
