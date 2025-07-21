import { type Metadata } from "next";
import { Button } from "~/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Under Construction",
  robots: {
    index: false,
    follow: true,
  },
};

export default function ConstructionPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-6 text-4xl font-bold sm:text-5xl md:text-6xl">
        <span className="bg-gradient-to-r from-[var(--chart-1)] via-[var(--chart-3)] to-[var(--chart-5)] bg-clip-text text-transparent">
          Under Construction
        </span>
      </h1>
      <p className="text-muted-foreground mb-10 text-xl">
        We are working hard to bring this page to you. Stay tuned!
      </p>
      <div className="flex w-full items-center justify-center">
        <Link href="/" passHref>
          <Button variant="outline" className="flex items-center space-x-2">
            <Home className="h-4 w-4" />
            <span>Go Home</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
