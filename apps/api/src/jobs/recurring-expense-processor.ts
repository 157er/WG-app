import { Queue, Worker, JobsOptions } from "bullmq";
import { config } from "../config/env";
import { PrismaClient } from "@prisma/client";
import { logger } from "../config/logger";
import dayjs from "dayjs";

const connection = { connection: { url: config.REDIS_URL } };

export const recurringExpenseQueue = new Queue("recurring-expenses", connection);

export interface RecurringExpenseJobData {
  expenseId: string;
}

export function scheduleRecurringExpense(expenseId: string, options?: JobsOptions) {
  return recurringExpenseQueue.add("generate", { expenseId }, options);
}

export function startRecurringExpenseWorker(prisma = new PrismaClient()) {
  return new Worker<RecurringExpenseJobData>(
    "recurring-expenses",
    async (job) => {
      const template = await prisma.expense.findUnique({
        where: { id: job.data.expenseId },
        include: { participants: true },
      });
      if (!template?.recurringRule) {
        logger.warn({ expenseId: job.data.expenseId }, "Skipping non recurring expense");
        return;
      }

      // TODO post-MVP: evaluate RRULE for exact next date
      const nextDate = dayjs(template.date).add(1, "month").toDate();
      const { id, createdAt, updatedAt, participants, ...rest } = template;
      await prisma.expense.create({
        data: {
          ...rest,
          date: nextDate,
          createdAt: new Date(),
          updatedAt: new Date(),
          participants: {
            create: participants.map((participant) => ({
              userId: participant.userId,
              share: participant.share,
              weight: participant.weight,
              fixedAmount: participant.fixedAmount,
              percent: participant.percent,
            })),
          },
        },
      });

      logger.info({ expenseId: job.data.expenseId }, "Recurring expense instantiated");
    },
    connection
  );
}
