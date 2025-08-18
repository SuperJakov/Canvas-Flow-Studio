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
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="bg-destructive mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <AlertTriangle className="text-destructive-foreground h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Error Testing Page</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            Click the button below to throw an example error and test the error
            boundary.
          </p>
          <Button onClick={throwError} variant="destructive">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Throw Test Error
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
