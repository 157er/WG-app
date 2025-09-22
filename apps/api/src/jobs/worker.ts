import { startRecurringExpenseWorker } from "./recurring-expense-processor";
import { startReminderWorker } from "./reminder-processor";
import { logger } from "../config/logger";

async function bootstrap() {
  startRecurringExpenseWorker();
  startReminderWorker();
  logger.info("Background workers started");
}

bootstrap().catch((error) => {
  logger.error(error, "Failed to start workers");
  process.exit(1);
});
