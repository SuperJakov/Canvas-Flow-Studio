"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
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
        <Loading />
      </AuthLoading>
      <div className="min-h-screen bg-gradient-to-b text-[var(--foreground)]">
        <div className="container mx-auto px-4 pt-32 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-8xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                404
              </span>
            </h1>
            <h2 className="mb-6 text-4xl font-bold">Page Not Found</h2>
            <p className="mb-10 text-xl text-[var(--muted-foreground)]">
              Oops! The page you&apos;re looking for doesn&apos;t exist or has
              been moved.
            </p>
            <div className="mb-8 flex justify-center gap-4">
              <Link href="/">
                <Button size="xl">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Home
                </Button>
              </Link>
              <Authenticated>
                <Link href="/whiteboards">
                  <Button size="xl" variant="secondary">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Go to Whiteboards
                  </Button>
                </Link>
              </Authenticated>
            </div>

            <Card className="mx-auto max-w-lg border-0 shadow-md">
              <CardContent className="p-6">
                {!showForm && !submitted && (
                  <Button
                    onClick={() => setShowForm(true)}
                    variant="ghost"
                    className="mx-auto"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Help us improve
                  </Button>
                )}

                {showForm && !submitted && (
                  <div className="space-y-3">
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="What were you trying to do?"
                      className="min-h-[80px] resize-none text-sm"
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
                  <p className="text-center text-sm text-green-600">
                    ✓ Thank you for your feedback
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
