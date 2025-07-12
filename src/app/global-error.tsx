"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { AlertTriangle, Home } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import * as Sentry from "@sentry/nextjs";

// This is error component for root layout
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="dark flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <Card className="mx-auto max-w-lg shadow-[var(--shadow-2xl)]">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[var(--destructive)] to-orange-500 shadow-[var(--shadow-lg)]">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <h2 className="mb-4 text-3xl font-bold">
            <span className="bg-gradient-to-r from-orange-400 via-[var(--destructive)] to-pink-500 bg-clip-text text-transparent">
              Something went wrong!
            </span>
          </h2>
          <p className="mb-8 text-[var(--muted-foreground)]">
            An unexpected error occurred. We&#39;ve logged the issue and our
            team is looking into it. You can try to reload the page or return to
            the homepage.
          </p>

          {/* Displaying a simplified error message in development for easier debugging */}
          <pre className="mb-8 w-full overflow-auto rounded-md bg-[var(--muted)] p-4 text-left text-sm text-[var(--destructive)]">
            <code>{error.message}</code>
          </pre>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              onClick={() => {
                if (reset && typeof reset === "function") {
                  reset();
                } else {
                  window.location.reload();
                }
              }}
              className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-[var(--primary-foreground)] shadow-[var(--shadow-lg)] hover:scale-[1.02] hover:shadow-[var(--shadow-xl)]"
            >
              Try again
            </Button>
            {/* We need to use <a> because <Link> doesn't work in global-error.tsx */}
            <Button asChild variant="secondary">
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                className="bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/80"
              >
                <Home className="mr-2 h-5 w-5" />
                Go to Homepage
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
