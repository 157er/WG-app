import { z } from "zod";

export const requestMagicLinkSchema = z.object({
  email: z.string().email(),
});

export const consumeMagicLinkSchema = z.object({
  token: z.string().min(10),
});
