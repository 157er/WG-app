import { z } from "zod";

export const createSettlementSchema = z.object({
  fromUserId: z.string(),
  toUserId: z.string(),
  amount: z.number().positive(),
});

export const confirmSettlementSchema = z.object({
  id: z.string(),
});
