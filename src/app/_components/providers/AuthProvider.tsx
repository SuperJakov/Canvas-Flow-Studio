"use client";
import { type ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const clerkAppearance = {
  variables: {
    colorPrimary: "#9333ea",
    colorBackground: "#1f2937",
    colorInputBackground: "#374151",
    colorTextOnPrimaryBackground: "white",
    colorTextSecondary: "#9ca3af",
  },
  elements: {
    formButtonPrimary: "bg-purple-600 hover:bg-purple-700 text-white",
    card: "bg-gray-800 shadow-xl",
    headerTitle: "text-gray-100",
    headerSubtitle: "text-gray-400",
    socialButtonsBlockButton: "bg-gray-700 hover:bg-gray-600 border-gray-600",
    socialButtonsBlockButtonText: "text-gray-200",
    formFieldLabel: "text-gray-300",
    formFieldInput: "bg-gray-700 border-gray-600 text-gray-200",
    footerActionLink: "text-purple-400 hover:text-purple-300",
    dividerLine: "bg-gray-700",
    dividerText: "text-gray-400",
  },
};

export default function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={clerkAppearance}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
