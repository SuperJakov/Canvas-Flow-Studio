"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export function WhiteboardUnsupported() {
  return (
    <div className="bg-background/80 fixed inset-0 z-50 flex h-screen w-full flex-col items-center justify-center backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-16 w-16 text-yellow-500" />
        <h1 className="text-2xl font-bold">Unsupported Screen Size</h1>
        <p className="text-muted-foreground text-center">
          The whiteboard is not supported on small devices.
          <br />
          Please use a larger screen to continue.
        </p>
        <Button asChild>
          <Link href="/">Go to Home</Link>
        </Button>
      </div>
    </div>
  );
}
