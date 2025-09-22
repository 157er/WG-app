import fp from "fastify-plugin";
import { PrismaClient } from "@prisma/client";

/**
 * Provides a single PrismaClient instance per Fastify server.
 */
export default fp(async (fastify) => {
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  await prisma.$connect();

  fastify.decorate("prisma", prisma);

  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});
