"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Home, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent } from "~/components/ui/card";
import { Authenticated, AuthLoading } from "convex/react";
import * as Sentry from "@sentry/nextjs";
import Loading from "./loading";

export default function NotFound() {
  const [eventId, setEventId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const id = Sentry.captureException(new Error("404 Page Not Found"), {
      level: "warning",
      tags: { section: "not-found" },
      extra: {
        pathname: window.location.pathname,
      },
    });
    setEventId(id);
  }, []);

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
    <>
      <AuthLoading>
        {/* This is a full screen loader */}
        <Loading />
      </AuthLoading>
      <div className="bg-background dark flex min-h-screen items-center justify-center px-4">
        <Card className="mx-auto w-full max-w-md border-0 p-0 shadow-lg">
          <CardContent className="p-8">
            {/* Simplified icon without gradient background */}
            <div className="mb-6 flex justify-center">
              <div className="bg-destructive/10 rounded-full p-3">
                <AlertCircle className="text-destructive h-6 w-6" />
              </div>
            </div>

            {/* Simplified heading without gradient text */}
            <h2 className="mb-3 text-center text-2xl font-semibold">
              Page Not Found
            </h2>

            <p className="text-muted-foreground mb-6 text-center text-sm">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>

            {/* Primary actions */}
            <div className="flex gap-3">
              <Button asChild className="flex-1" size="sm">
                <Link href="/" prefetch={true}>
                  <Home className="mr-2 h-4 w-4" />
                  Go home
                </Link>
              </Button>

              <Authenticated>
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href="/whiteboards" prefetch={true}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Whiteboards
                  </Link>
                </Button>
              </Authenticated>
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
                    autoFocus
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
    </>
  );
}
