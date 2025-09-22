import { FastifyInstance } from "fastify";
import { registerAuthRoutes } from "./auth";
import { registerGroupRoutes } from "./groups";
import { registerExpenseRoutes } from "./expenses";
import { registerSettlementRoutes } from "./settlements";
import { registerReportRoutes } from "./reports";
import { registerNotificationRoutes } from "./notifications";

export async function registerRoutes(app: FastifyInstance) {
  await registerAuthRoutes(app);
  await registerGroupRoutes(app);
  await registerExpenseRoutes(app);
  await registerSettlementRoutes(app);
  await registerReportRoutes(app);
  await registerNotificationRoutes(app);
}
