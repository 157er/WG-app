import { z } from "zod";

export const updateNotificationPreferencesSchema = z.object({
  preferences: z.array(
    z.object({
      channel: z.enum(["EMAIL", "PUSH"]),
      type: z.string(),
      enabled: z.boolean(),
    })
  ),
});

export const subscribeWebpushSchema = z.object({
  endpoint: z.string().url(),
  auth: z.string(),
  p256dh: z.string(),
});
