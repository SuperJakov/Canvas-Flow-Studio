"use client"; // Identifies user for Posthog
import { useUser } from "@clerk/nextjs";
import posthog from "posthog-js";
import { useEffect, useRef } from "react";

export default function PosthogIdentifier() {
  const user = useUser();
  const identified = useRef(false);

  useEffect(() => {
    if (!user.isLoaded || !user.isSignedIn || identified.current) return;
    posthog.identify(
      user.user.id, // Replace 'distinct_id' with your user's unique identifier
      {
        email: user.user.emailAddresses[0]?.emailAddress,
        name: user.user.fullName,
      },
    );
    identified.current = true;
  }, [user]);

  return null;
}
