"use client";
import { Mail } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

const email = "support@canvasflowstudio.org";

const handleEmailClick = () => {
  window.location.href = `mailto:${email}?subject=Support inquiry`;
};

const handleGmailClick = () => {
  const subject = encodeURIComponent("Support inquiry");
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}`;
  window.open(gmailUrl, "_blank");
};

// Add DialogTrigger and wrap this and trigger inside <Dialog />
export default function EmailContactDialogContent() {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Get in Touch</DialogTitle>
        <DialogDescription>
          We&apos;d love to hear from you! Choose your preferred email method
          below.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Button onClick={handleEmailClick} className="w-full justify-start">
            <Mail className="h-4 w-4" />
            <span className="truncate">{email}</span>
          </Button>
          <Button
            onClick={handleGmailClick}
            variant="outline"
            className="w-full justify-start"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
                fill="currentColor"
              />
            </svg>
            <span>Open in Gmail</span>
          </Button>
        </div>
        <p className="text-muted-foreground mt-2 text-center text-xs">
          Click either button to compose a new email
        </p>
      </div>
    </DialogContent>
  );
}
