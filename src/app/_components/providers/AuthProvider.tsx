import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { type ReactNode } from "react";
import ConvexClientProvider from "./ConvexClientProvider";

export default function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{ baseTheme: dark }}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl="/"
    >
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </ClerkProvider>
  );
}
