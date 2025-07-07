"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { AlertTriangle, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="mx-auto max-w-lg rounded-xl border border-gray-700 bg-gray-800 p-8 text-center shadow-2xl shadow-purple-900/20">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-500 shadow-lg">
          <AlertTriangle className="h-8 w-8 text-white" />
        </div>
        <h2 className="mb-4 text-3xl font-bold text-white">
          <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
            Something went wrong!
          </span>
        </h2>
        <p className="mb-8 text-gray-300">
          An unexpected error occurred. We&#39;ve logged the issue and our team
          is looking into it. You can try to reload the page or return to the
          homepage.
        </p>

        {/* Displaying a simplified error message in development for easier debugging */}

        <pre className="mb-8 w-full overflow-auto rounded-md bg-gray-900 p-4 text-left text-sm text-red-400">
          <code>{error.message}</code>
        </pre>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <button
            onClick={() => {
              if (reset && typeof reset === "function") {
                reset();
              } else {
                window.location.reload();
              }
            }}
            className="flex cursor-pointer items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:from-blue-600 hover:to-purple-700 hover:shadow-xl"
          >
            Try again
          </button>
          {/* We need to use <a> because <Link> doesn't work here */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            className="flex cursor-pointer items-center justify-center rounded-lg bg-gray-700 px-6 py-3 font-medium text-white shadow transition-all hover:bg-gray-600"
          >
            <Home className="mr-2 h-5 w-5" />
            Go to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}
