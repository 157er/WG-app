import { z } from "zod";

/**
 * Global configuration schema shared between server and worker processes.
 * The schema keeps validation close to the consumer which prevents
 * missconfigured deployments from reaching production unnoticed.
 */
export const appConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 characters"),
  MAGIC_LINK_SECRET: z
    .string()
    .min(32, "Magic link secret must be at least 32 characters"),
  POSTMARK_TOKEN: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  WEB_APP_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PRICE_ID: z.string().optional(),
  ENABLE_PRO_PLAN: z.coerce.boolean().default(false),
  PLAUSIBLE_DOMAIN: z.string().optional(),
});

export type AppConfig = z.infer<typeof appConfigSchema>;

/**
 * Validates environment variables and returns the typed configuration.
 * Consumers must pass `process.env` explicitly to avoid implicit globals in tests.
 */
export function loadConfig(env: NodeJS.ProcessEnv): AppConfig {
  const result = appConfigSchema.safeParse(env);
  if (!result.success) {
    throw new Error(`Invalid configuration: ${result.error.message}`);
  }

  return result.data;
}
