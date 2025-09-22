import { z } from "zod";

const participantSchema = z.object({
  userId: z.string(),
  share: z.number().optional(),
  weight: z.number().optional(),
  fixedAmount: z.number().optional(),
  percent: z.number().optional(),
});

export const createExpenseSchema = z.object({
  payerId: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3).optional(),
  date: z.string(),
  category: z.string(),
  notes: z.string().max(500).optional(),
  splitType: z.enum(["EQUAL", "WEIGHTED", "SHARES", "FIXED", "PERCENT"]),
  participants: z.array(participantSchema).min(1),
  recurringRule: z.string().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const expensesQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  category: z.string().optional(),
  payer: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});
