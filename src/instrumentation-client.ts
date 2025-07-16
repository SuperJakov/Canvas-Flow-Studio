import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

Sentry.init({
  dsn: "https://05a4e96999496b960926879507ff5921@o4507876822548480.ingest.us.sentry.io/4509654763962368",

  sendDefaultPii: true,
  tracesSampleRate: 1.0,

  integrations: [
    Sentry.feedbackIntegration({
      colorScheme: "system",
      autoInject: false,
    }),
  ],

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  _experiments: { enableLogs: true },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: "2025-05-24",
});
