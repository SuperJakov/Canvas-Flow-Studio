"use client";

import { useAtom } from "jotai";
import { errorMessageAtom } from "../atoms";
import { AlertCircle } from "lucide-react";

export default function ErrorMessage() {
  const [errorMessage] = useAtom(errorMessageAtom);

  return (
    errorMessage && (
      <div className="border-destructive/50 bg-destructive/10 mb-6 rounded-lg border p-4">
        <div className="text-destructive flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="font-medium">{errorMessage}</p>
        </div>
      </div>
    )
  );
}
