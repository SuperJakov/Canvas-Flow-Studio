import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    CONVEX_DEPLOYMENT: z.string(),
    CLERK_SECRET_KEY: z.string(),
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_PUBLISHABLE_KEY: z.string(),
    PLUS_MONTHLY_SUBSCRIPTION_PRODUCT_ID: z.string(),
    PRO_MONTHLY_SUBSCRIPTION_PRODUCT_ID: z.string(),
    REDIS_URL: z.string(),
  },

  client: {
    NEXT_PUBLIC_CONVEX_URL: z.string(),
    NEXT_PUBLIC_CLERK_FRONTEND_API_URL: z.string(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
    NEXT_PUBLIC_CLERK_FRONTEND_API_URL:
      process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    PLUS_MONTHLY_SUBSCRIPTION_PRODUCT_ID:
      process.env.PLUS_MONTHLY_SUBSCRIPTION_PRODUCT_ID,
    PRO_MONTHLY_SUBSCRIPTION_PRODUCT_ID:
      process.env.PRO_MONTHLY_SUBSCRIPTION_PRODUCT_ID,
    REDIS_URL: process.env.REDIS_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
