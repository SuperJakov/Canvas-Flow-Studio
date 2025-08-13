"use client";

import React, { useState } from "react";
import { Textarea } from "~/components/ui/textarea";

export default function AndrewClient() {
  const [prompt, setPrompt] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    e.target.style.height = "auto";
    const newHeight = e.target.scrollHeight;
    e.target.style.height = `${newHeight}px`;
  };

  return (
    <div className="h-screen w-screen">
      <div className="flex h-full w-full items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h1 className="text-4xl font-bold">I&apos;m Andrew</h1>
            <p className="text-base">
              I&apos;ll help you build a whiteboard for Canvas Flow Studio.
            </p>
          </div>
          <div className="relative">
            {/* Rotating gradient border */}
            <div className="from-chart-1 via-chart-2 via-chart-3 via-chart-4 to-chart-5 animate-spin-slow absolute -inset-0.5 rounded-lg bg-gradient-to-r opacity-75 blur-sm" />
            <div className="from-chart-1 via-chart-2 via-chart-3 via-chart-4 to-chart-5 animate-spin-slow absolute -inset-0.5 rounded-lg bg-gradient-to-r" />

            {/* Input container with background */}
            <div className="bg-background relative rounded-lg">
              <Textarea
                value={prompt}
                onChange={handleInputChange}
                placeholder="What do you want to build?"
                rows={1}
                className="max-h-[400px] resize-none overflow-hidden border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
