import "fastify";
import { PrismaClient } from "@prisma/client";
import { AppConfig } from "@wg-split/config";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
    config: AppConfig;
  }
}
