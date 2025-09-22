import { buildServer } from "./app";
import { config } from "./config/env";

const app = buildServer();

async function start() {
  try {
    await app.listen({ port: Number(process.env.PORT ?? 3333), host: "0.0.0.0" });
    app.log.info(`Server listening on port ${process.env.PORT ?? 3333}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

if (config.NODE_ENV !== "test") {
  start();
}

export type AppType = typeof app;
export default app;
