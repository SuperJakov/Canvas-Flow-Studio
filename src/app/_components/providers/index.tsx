import type { ReactNode } from "react";
import AuthProvider from "./AuthProvider";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";
import { SpeedInsights } from "@vercel/speed-insights/next";

type Props = {
  children: ReactNode;
};
export default function Providers({ children }: Props) {
  return (
    <>
      <AuthProvider>
        <ConvexQueryCacheProvider>{children}</ConvexQueryCacheProvider>
      </AuthProvider>
      <SpeedInsights />
    </>
  );
}
