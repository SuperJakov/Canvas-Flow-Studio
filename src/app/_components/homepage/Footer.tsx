"use client";

import { Separator } from "~/components/ui/separator";
import { ArrowUp, Mail } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import EmailContactDialogContent from "../EmailContactDialogContent";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-between space-y-6 pb-4 lg:flex-row lg:space-y-0">
        <div className="text-center lg:text-left">
          <h2 className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-2xl font-bold text-transparent">
            Canvas Flow Studio
          </h2>
          <p className="mt-1 text-sm sm:text-base">
            Build AI-powered workflows visually.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Mail className="h-4 w-4" />
                <span>Contact Us</span>
              </Button>
            </DialogTrigger>
            <EmailContactDialogContent />
          </Dialog>
          <Button
            onClick={scrollToTop}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <span>Back to top</span>
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Separator />

      <p className="text-muted-foreground pt-4 text-center text-xs sm:text-sm">
        © {new Date().getFullYear()} Canvas Flow Studio. All rights reserved.
      </p>
    </footer>
  );
}
