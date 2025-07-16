"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function NotFound() {
  return (
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
          <div className="flex justify-center">
            <Link href="/">
              <Button size="xl">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
