// catalog-service/src/config/database.js

import { PrismaClient } from "../generated/prisma/index.js";

let prisma;

const getPrismaClient = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "info", "warn", "error"]
          : ["error"],
    });

    // Graceful shutdown
    process.on("beforeExit", async () => {
      console.log("🔌 Disconnecting from database...");
      await prisma.$disconnect();
    });
  }

  return prisma;
};

export default getPrismaClient();
