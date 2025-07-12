"use client";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function ThrowErrorPage() {
  // This is a page which is designed to test out throwing errors
  const [error, setError] = useState<string | null>(null);

  if (error) throw new Error(error);

  const throwError = () => {
    setError(
      "This is a test error thrown intentionally for testing the error boundary!",
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-[var(--destructive)] shadow-[var(--shadow-lg)]">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Error Testing Page</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-[var(--muted-foreground)]">
            Click the button below to throw an example error and test the error
            boundary.
          </p>
          <Button
            onClick={throwError}
            variant="destructive"
            className="bg-gradient-to-r from-[var(--destructive)] to-red-600 text-[var(--destructive-foreground)] shadow-[var(--shadow-lg)] hover:scale-[1.02] hover:shadow-[var(--shadow-xl)]"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Throw Test Error
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
