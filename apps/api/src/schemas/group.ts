import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(1),
  currency: z.string().length(3),
  rounding: z.number().int().min(0).max(4).default(2),
});

export const updateGroupSchema = createGroupSchema.partial();

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]).default("MEMBER"),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
});
