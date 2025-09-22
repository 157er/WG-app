import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { updateNotificationPreferencesSchema, subscribeWebpushSchema } from "../schemas/notification";

export async function registerNotificationRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/me/webpush/subscribe",
    {
      preHandler: app.authenticate,
      schema: { body: subscribeWebpushSchema },
    },
    async (request) => {
      const subscription = await app.prisma.webpushSubscription.upsert({
        where: { endpoint: request.body.endpoint },
        update: {},
        create: {
          userId: request.user.sub as string,
          endpoint: request.body.endpoint,
          auth: request.body.auth,
          p256dh: request.body.p256dh,
        },
      });

      return subscription;
    }
  );

  app.withTypeProvider<ZodTypeProvider>().patch(
    "/me/notifications",
    {
      preHandler: app.authenticate,
      schema: { body: updateNotificationPreferencesSchema },
    },
    async (request) => {
      await Promise.all(
        request.body.preferences.map((preference) =>
          app.prisma.notificationPreference.upsert({
            where: {
              userId_channel_type: {
                userId: request.user.sub as string,
                channel: preference.channel,
                type: preference.type,
              },
            },
            update: { enabled: preference.enabled },
            create: {
              userId: request.user.sub as string,
              channel: preference.channel,
              type: preference.type,
              enabled: preference.enabled,
            },
          })
        )
      );

      return { status: "ok" };
    }
  );
}
