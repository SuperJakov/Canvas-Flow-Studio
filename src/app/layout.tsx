import "~/styles/globals.css";

import { type Metadata } from "next";
import { Nunito } from "next/font/google";
import Providers from "./_components/providers";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Header } from "./_components/Header";
import { Toaster } from "~/components/ui/sonner";

export const metadata: Metadata = {
  title: "AI Flow Studio",
  description: "TODO: Add a description for AI Flow Studio",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  keywords: ["AI Flow Studio", "Whiteboard AI", "Nodes", "Flow"],
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
          {process.env.REACT_SCAN === "true" && (
            <script
              async
              crossOrigin="anonymous"
              src="//unpkg.com/react-scan/dist/auto.global.js"
            />
          )}
          <body className="dark">
            <Header />
            {children}
            <Toaster />
          </body>
        </Providers>
      </ConvexAuthNextjsServerProvider>
    </html>
  );
}
