import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  createGroupSchema,
  updateGroupSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from "../schemas/group";
import { assertAdminOrOwner } from "../services/permission-service";
import crypto from "crypto";

const idParamSchema = z.object({ id: z.string() });
const memberParamSchema = z.object({ id: z.string(), memberId: z.string() });

export async function registerGroupRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/groups",
    {
      preHandler: app.authenticate,
      schema: { body: createGroupSchema },
    },
    async (request) => {
      const group = await app.prisma.group.create({
        data: {
          name: request.body.name,
          currency: request.body.currency,
          rounding: request.body.rounding,
          ownerId: request.user.sub as string,
          members: {
            create: {
              userId: request.user.sub as string,
              role: "OWNER",
            },
          },
        },
      });

      return group;
    }
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/groups",
    { preHandler: app.authenticate },
    async (request) => {
      return app.prisma.group.findMany({
        where: {
          members: {
            some: { userId: request.user.sub as string },
          },
        },
        include: {
          members: true,
        },
      });
    }
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/groups/:id",
    { preHandler: app.authenticate, schema: { params: idParamSchema } },
    async (request) => {
      const { id } = request.params;
      const group = await app.prisma.group.findUnique({
        where: { id },
        include: {
          members: {
            include: { user: true },
          },
        },
      });

      if (!group) {
        throw app.httpErrors.notFound();
      }

      return group;
    }
  );

  app.withTypeProvider<ZodTypeProvider>().patch(
    "/groups/:id",
    {
      preHandler: app.authenticate,
      schema: { body: updateGroupSchema, params: idParamSchema },
    },
    async (request) => {
      const { id } = request.params;
      const member = await app.prisma.groupMember.findFirst({
        where: { groupId: id, userId: request.user.sub as string },
      });

      if (!member) {
        throw app.httpErrors.forbidden();
      }

      assertAdminOrOwner(member.role);

      return app.prisma.group.update({
        where: { id },
        data: request.body,
      });
    }
  );

  app.withTypeProvider<ZodTypeProvider>().delete(
    "/groups/:id",
    { preHandler: app.authenticate, schema: { params: idParamSchema } },
    async (request, reply) => {
      const { id } = request.params;
      const member = await app.prisma.groupMember.findFirst({
        where: { groupId: id, userId: request.user.sub as string },
      });

      if (!member || member.role !== "OWNER") {
        throw app.httpErrors.forbidden();
      }

      await app.prisma.group.delete({ where: { id } });
      reply.code(204);
      return null;
    }
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    "/groups/:id/invites",
    {
      preHandler: app.authenticate,
      schema: { body: inviteMemberSchema, params: idParamSchema },
    },
    async (request) => {
      const { id } = request.params;
      const member = await app.prisma.groupMember.findFirst({
        where: { groupId: id, userId: request.user.sub as string },
      });

      if (!member) {
        throw app.httpErrors.forbidden();
      }
      assertAdminOrOwner(member.role);

      const token = crypto.randomUUID();
      const invite = await app.prisma.invite.create({
        data: {
          groupId: id,
          email: request.body.email,
          role: request.body.role,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return { inviteUrl: `${app.config.WEB_APP_URL}/invite/${invite.token}` };
    }
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    "/groups/:id/members/:memberId/role",
    {
      preHandler: app.authenticate,
      schema: { body: updateMemberRoleSchema, params: memberParamSchema },
    },
    async (request) => {
      const { id, memberId } = request.params;
      const actor = await app.prisma.groupMember.findFirst({
        where: { groupId: id, userId: request.user.sub as string },
      });

      if (!actor) {
        throw app.httpErrors.forbidden();
      }
      assertAdminOrOwner(actor.role);

      return app.prisma.groupMember.update({
        where: { id: memberId },
        data: { role: request.body.role },
      });
    }
  );
}
