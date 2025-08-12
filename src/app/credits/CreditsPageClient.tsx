"use client";

import { api } from "convex/_generated/api";
import { useConvexQuery } from "~/helpers/convex";
import Loading from "../loading";

export default function CreditsPageClient() {
  const imageCredits = useConvexQuery(api.credits.getRemainingCreditsPublic, {
    creditType: "image",
  });
  const speechCredits = useConvexQuery(api.credits.getRemainingCreditsPublic, {
    creditType: "speech",
  });
  const websiteCredits = useConvexQuery(api.credits.getRemainingCreditsPublic, {
    creditType: "website",
  });

  if (
    imageCredits === undefined ||
    speechCredits === undefined ||
    websiteCredits === undefined
  )
    return <Loading />;
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Credits</h1>
      <p className="text-muted-foreground">
        This page is used entirely for debugging purposes
      </p>
      <p className="text-lg">Image Credits: {imageCredits}</p>
      <p className="text-lg">Speech Credits: {speechCredits}</p>
      <p className="text-lg">Website Credits: {websiteCredits}</p>
    </div>
  );
}
