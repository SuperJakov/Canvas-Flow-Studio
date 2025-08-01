import "~/styles/globals.css";

import { type Metadata } from "next";
import { Nunito } from "next/font/google";
import Providers from "./_components/providers";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Header } from "./_components/Header";
import { Toaster } from "~/components/ui/sonner";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Canvas Flow Studio",
  description:
    "Canvas Flow Studio is an app which is used to create AI-powered workflows through a visual, node-based interface.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  keywords: ["Canvas Flow Studio", "Whiteboard AI", "Nodes", "Flow"],
  verification: {
    google: "p4gzWQ-1iXVG0l_lfeyeSHMr_37F_pq6QH3hu8zmL40",
  },
};

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={nunito.variable}>
      <ConvexAuthNextjsServerProvider>
        <Providers>
          <body className="dark">
            {process.env.NEXT_PUBLIC_REACT_SCAN === "true" && (
              <Script
                src="https://unpkg.com/react-scan/dist/auto.global.js"
                strategy="afterInteractive"
                crossOrigin="anonymous"
              />
            )}
            <Header />
            {children}
            <Toaster />
          </body>
        </Providers>
      </ConvexAuthNextjsServerProvider>
    </html>
  );
}
