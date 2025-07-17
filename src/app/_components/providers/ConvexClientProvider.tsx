"use client";

import { type ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const auth = useAuth(); // safe: this component is *inside* ClerkProvider
  return (
    <ConvexProviderWithClerk client={convex} useAuth={() => auth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
