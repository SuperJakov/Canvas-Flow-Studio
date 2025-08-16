"use client";

import dynamic from "next/dynamic";
import { Authenticated, Unauthenticated } from "convex/react";
import posthog from "posthog-js";
import { Button } from "~/components/ui/button";

const SignInButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.SignInButton),
  { ssr: false },
);
const SignUpButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.SignUpButton),
  { ssr: false },
);
const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  { ssr: false },
);

interface AuthButtonsProps {
  location: "header" | "mobile menu";
  onAuthAction?: () => void; // Callback for mobile menu to close itself
}

export function AuthButtons({ location, onAuthAction }: AuthButtonsProps) {
  const captureAuthClick = (action: "sign_in" | "sign_up") => {
    posthog?.capture("auth click", { action, location });
    onAuthAction?.();
  };

  if (location === "mobile menu") {
    return (
      <>
        <Unauthenticated>
          <div className="flex w-full flex-col gap-4">
            <SignInButton mode="modal">
              <Button
                variant="outline"
                size="lg"
                className="h-12 w-full text-lg"
                onClick={() => captureAuthClick("sign_in")}
              >
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button
                size="lg"
                className="h-12 w-full text-lg"
                onClick={() => captureAuthClick("sign_up")}
              >
                Sign Up
              </Button>
            </SignUpButton>
          </div>
        </Unauthenticated>
        <Authenticated>
          <div className="scale-125">
            <UserButton />
          </div>
        </Authenticated>
      </>
    );
  }

  // Default header buttons
  return (
    <div className="hidden items-center space-x-4 md:flex">
      <Unauthenticated>
        <SignInButton mode="modal">
          <Button variant="ghost" onClick={() => captureAuthClick("sign_in")}>
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button onClick={() => captureAuthClick("sign_up")}>Sign Up</Button>
        </SignUpButton>
      </Unauthenticated>
      <Authenticated>
        <UserButton />
      </Authenticated>
    </div>
  );
}
