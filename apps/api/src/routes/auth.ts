import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { requestMagicLinkSchema, consumeMagicLinkSchema } from "../schemas/auth";
import { MagicLinkService } from "../services/magic-link-service";

const magicLinkService = new MagicLinkService(15);

export async function registerAuthRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/auth/magic-link/request",
    {
      schema: {
        body: requestMagicLinkSchema,
      },
    },
    async (request) => {
      const { email } = request.body;
      const { token, expiresAt } = magicLinkService.issueToken(email);

      app.log.info({ email }, "Magic link issued");
      // TODO post-MVP: integrate Postmark/SES transport

      if (app.config.NODE_ENV === "development") {
        return { token, expiresAt };
      }

      return { expiresAt };
    }
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    "/auth/magic-link/consume",
    {
      schema: {
        body: consumeMagicLinkSchema,
      },
    },
    async (request) => {
      const email = magicLinkService.consumeToken(request.body.token);
      const user = await app.prisma.user.upsert({
        where: { email },
        create: { email },
        update: {},
        include: {
          memberships: {
            include: {
              group: true,
            },
          },
        },
      });

      const token = app.jwt.sign({ sub: user.id, email: user.email });
      return { jwt: token };
    }
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/me",
    {
      preHandler: app.authenticate,
    },
    async (request) => {
      const user = await app.prisma.user.findUnique({
        where: { id: request.user.sub as string },
        include: {
          memberships: {
            include: {
              group: true,
            },
          },
        },
      });

      if (!user) {
        throw app.httpErrors.notFound();
      }

      return user;
    }
  );
}
