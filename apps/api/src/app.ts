import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { config } from "./config/env";
import { logger } from "./config/logger";
import prismaPlugin from "./plugins/prisma";
import authPlugin from "./plugins/auth";
import { registerRoutes } from "./routes";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export function buildServer() {
  const app = Fastify({ logger }).withTypeProvider<ZodTypeProvider>();

  app.decorate("config", config);

  app.register(fastifyCors, { origin: true, credentials: true });
  app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
  app.register(swagger, {
    openapi: {
      info: {
        title: "WG-Split API",
        version: "1.0.0",
      },
    },
  });
  app.register(swaggerUi, {
    routePrefix: "/docs",
  });

  app.register(prismaPlugin);
  app.register(authPlugin);
  app.register(registerRoutes);

  return app;
}
