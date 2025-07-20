"use client"; // Error boundaries must be Client Components

import { useEffect, useState } from "react";
import { AlertTriangle, Home, RefreshCw, MessageSquare } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import * as Sentry from "@sentry/nextjs";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [eventId, setEventId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const id = Sentry.captureException(error);
    setEventId(id);
  }, [error]);

  const handleSendFeedback = async () => {
    if (!feedback.trim()) return;
    setSubmitting(true);

    Sentry.captureFeedback({
      message: feedback,
      associatedEventId: eventId ?? undefined,
      url: window.location.href,
    });

    setSubmitted(true);
    setSubmitting(false);
    setTimeout(() => setShowForm(false), 2000);
  };

  return (
    <div className="bg-background dark flex min-h-screen items-center justify-center px-4">
      <Card className="mx-auto w-full max-w-md border-0 shadow-lg">
        <CardContent className="p-8">
          {/* Simplified icon without gradient background */}
          <div className="mb-6 flex justify-center">
            <div className="bg-destructive/10 rounded-full p-3">
              <AlertTriangle className="text-destructive h-6 w-6" />
            </div>
          </div>

          {/* Simplified heading without gradient text */}
          <h2 className="mb-3 text-center text-2xl font-semibold">
            Oops! Something went wrong
          </h2>

          <p className="text-muted-foreground mb-6 text-center text-sm">
            We&apos;ve encountered an error. You can try refreshing the page or
            return home.
          </p>

          {/* Collapsible error details for development */}
          {process.env.NODE_ENV === "development" && (
            <details className="mb-6">
              <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-xs">
                Show error details
              </summary>
              <pre className="bg-muted mt-2 overflow-auto rounded-md p-3 text-xs">
                <code>{error.message}</code>
              </pre>
            </details>
          )}

          {/* Primary actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => {
                if (reset && typeof reset === "function") {
                  reset();
                } else {
                  window.location.reload();
                }
              }}
              className="flex-1"
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>

            <Button asChild variant="outline" size="sm" className="flex-1">
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/">
                <Home className="mr-2 h-4 w-4" />
                Go home
              </a>
            </Button>
          </div>

          {/* Feedback section - more subtle */}
          <div className="mt-6 flex w-full items-center justify-center border-t pt-6">
            {!showForm && !submitted && (
              <Button onClick={() => setShowForm(true)} variant="ghost">
                <MessageSquare className="h-4 w-4" />
                Help us improve
              </Button>
            )}

            {showForm && !submitted && (
              <div className="w-full space-y-3">
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What were you trying to do?"
                  className="min-h-[80px] min-w-full resize-none text-sm"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSendFeedback}
                    disabled={submitting || !feedback.trim()}
                    size="sm"
                    className="flex-1"
                  >
                    {submitting ? "Sending..." : "Send"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowForm(false);
                      setFeedback("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {submitted && (
              <p className="text-accent text-center text-sm">
                ✓ Thank you for your feedback
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
