"use client";
import { Separator } from "~/components/ui/separator";
import { ArrowUp } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-between space-y-6 pb-4 md:flex-row md:space-y-0 md:space-x-6">
        <div className="text-center md:text-left">
          <h2 className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-2xl font-bold text-transparent">
            Canvas Flow Studio
          </h2>
          <p className="mt-1">Build AI-powered workflows visually.</p>
        </div>
        <Button onClick={scrollToTop} variant={"outline"}>
          <span>Back to top</span>
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
      <Separator />

      <p className="text-muted-foreground pt-4 text-center text-sm">
        © {new Date().getFullYear()} Canvas Flow Studio. All rights reserved.
      </p>
    </footer>
  );
}
