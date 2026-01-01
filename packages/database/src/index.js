// packages/database/src/index.js
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

let prismaInstance;

export function getPrismaClient() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  }
  return prismaInstance;
}

export const prisma = getPrismaClient();

// Export Prisma types
export { Prisma } from "@prisma/client";
