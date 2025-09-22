import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";

export default fp(async (fastify) => {
  fastify.register(fastifyJwt, {
    secret: fastify.config.JWT_SECRET,
    sign: {
      expiresIn: "15m",
    },
  });

  fastify.decorate("authenticate", async (request) => {
    try {
      await request.jwtVerify();
    } catch (error) {
      throw fastify.httpErrors.unauthorized();
    }
  });
});

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<void>;
  }
}

import type { FastifyRequest } from "fastify";
