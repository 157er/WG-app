import { Queue, Worker } from "bullmq";
import { config } from "../config/env";
import { PrismaClient, SettlementStatus } from "@prisma/client";
import { logger } from "../config/logger";

const connection = { connection: { url: config.REDIS_URL } };

export const reminderQueue = new Queue("reminders", connection);

export interface ReminderJobData {
  settlementId: string;
}

export function scheduleReminder(settlementId: string, delayMs: number) {
  return reminderQueue.add("settlement-reminder", { settlementId }, { delay: delayMs });
}

export function startReminderWorker(prisma = new PrismaClient()) {
  return new Worker<ReminderJobData>(
    "reminders",
    async (job) => {
      const settlement = await prisma.settlement.findUnique({ where: { id: job.data.settlementId } });
      if (!settlement || settlement.status !== SettlementStatus.OPEN) {
        logger.info({ settlementId: job.data.settlementId }, "Reminder skipped");
        return;
      }

      // TODO post-MVP: send email/push via provider
      logger.info({ settlementId: settlement.id }, "Reminder would be sent now");
    },
    connection
  );
}
