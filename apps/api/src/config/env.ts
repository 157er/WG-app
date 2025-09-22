import { loadConfig } from "@wg-split/config";

function withTestFallback(env: NodeJS.ProcessEnv) {
  if (env.NODE_ENV === "test") {
    return {
      NODE_ENV: "test",
      DATABASE_URL: env.DATABASE_URL ?? "postgresql://user:pass@localhost:5432/test",
      REDIS_URL: env.REDIS_URL ?? "redis://localhost:6379",
      JWT_SECRET: env.JWT_SECRET ?? "test_jwt_secret_123456789012345678901234",
      MAGIC_LINK_SECRET:
        env.MAGIC_LINK_SECRET ?? "test_magic_secret_123456789012345678901234",
      POSTMARK_TOKEN: env.POSTMARK_TOKEN,
      SMTP_HOST: env.SMTP_HOST ?? "localhost",
      SMTP_PORT: env.SMTP_PORT ?? "1025",
      SMTP_USER: env.SMTP_USER,
      SMTP_PASSWORD: env.SMTP_PASSWORD,
      WEB_APP_URL: env.WEB_APP_URL ?? "http://localhost:5173",
      STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
      STRIPE_PRICE_ID: env.STRIPE_PRICE_ID,
      ENABLE_PRO_PLAN: env.ENABLE_PRO_PLAN ?? "false",
      PLAUSIBLE_DOMAIN: env.PLAUSIBLE_DOMAIN,
    } satisfies NodeJS.ProcessEnv;
  }

  return env;
}

export const config = loadConfig(withTestFallback(process.env));
