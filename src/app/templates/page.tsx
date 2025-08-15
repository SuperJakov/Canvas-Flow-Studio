"use client";

import Link from "next/link";
import {
  Calendar,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  PieChart,
  Users,
} from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import posthog from "posthog-js";

const templates = [
  {
    href: "/template/describe-and-generate",
    title: "Describe and Generate",
    description:
      "Learn the basics of Canvas Flow Studio by describing images and generating content with AI models.",
    icon: Users,
    hoverClasses: "hover:border-orange-500/50 hover:shadow-orange-900/20",
    hoverColorClass: "group-hover:text-orange-400",
    workInProgress: false,
  },
  {
    href: "/template/company-meeting",
    title: "Company Meeting",
    description:
      "Generate meeting minutes, action items, and follow-ups from meeting transcripts.",
    icon: Calendar,
    hoverClasses: "hover:border-blue-500/50 hover:shadow-blue-900/20",
    hoverColorClass: "group-hover:text-blue-400",
    workInProgress: false,
  },
  {
    href: "/template/content-creation",
    title: "Content Creation",
    description:
      "Create anything you want from a single topic using the website node.",
    icon: FileText,
    hoverClasses: "hover:border-purple-500/50 hover:shadow-purple-900/20",
    hoverColorClass: "group-hover:text-purple-400",
    workInProgress: false,
  },
  {
    href: "/template/image-generation",
    title: "Image Generation",
    description:
      "Generate and refine images based on text descriptions and use different styles.",
    icon: ImageIcon,
    hoverClasses: "hover:border-pink-500/50 hover:shadow-pink-900/20",
    hoverColorClass: "group-hover:text-pink-400",
    workInProgress: false,
  },
  {
    href: "/template/language-translation",
    title: "Language Translation",
    description:
      "Translate and localize content between multiple languages while preserving context.",
    icon: MessageSquare,
    hoverClasses: "hover:border-green-500/50 hover:shadow-green-900/20",
    hoverColorClass: "group-hover:text-green-400",
    workInProgress: false,
  },
  {
    href: "/template/data-analysis",
    title: "Data Analysis",
    description:
      "Extract insights, generate visualizations, and create reports from your data.",
    icon: PieChart,
    hoverClasses: "hover:border-teal-500/50 hover:shadow-teal-900/20",
    hoverColorClass: "group-hover:text-teal-400",
    workInProgress: true,
  },
];

export default function Templates() {
  return (
    <main
      className="text-foreground container mx-auto px-4 py-8 pt-20 sm:px-6 lg:px-8"
      id="templates"
    >
      <h1 className="mb-12 text-center text-3xl font-bold sm:text-4xl">
        <span className="animate-[gradient-x_5s_ease_infinite] bg-gradient-to-r from-cyan-400 to-blue-500 bg-[length:200%_200%] bg-clip-text text-transparent">
          Get Started with an Example
        </span>
      </h1>
      <p className="mb-10 text-center text-xl">
        Jump-start your workflow with one of our pre-built templates
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Link
            key={template.href}
            href={template.href}
            onClick={() =>
              posthog.capture("template click", {
                template: template.title,
              })
            }
            className={`group transition ${template.hoverClasses} ${
              template.workInProgress ? "pointer-events-none" : ""
            }`}
          >
            <Card
              className={`relative min-h-[220px] border p-6 shadow-lg ${
                template.workInProgress
                  ? "border-dashed border-gray-400 opacity-75"
                  : ""
              }`}
            >
              <CardContent className="p-0">
                {template.workInProgress && (
                  <Badge
                    variant="secondary"
                    className="absolute top-2 right-2 border-yellow-300 bg-yellow-100 text-yellow-800"
                  >
                    Work in Progress
                  </Badge>
                )}
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${
                    template.workInProgress ? "grayscale" : ""
                  }`}
                >
                  <template.icon
                    className={`text-primary h-8 w-8 transition-all duration-300 ${template.hoverColorClass}`}
                  />
                </div>
                <h3
                  className={`mb-2 text-xl font-semibold ${
                    template.hoverColorClass
                  } transition-all duration-300 ${
                    template.workInProgress ? "text-gray-500" : ""
                  }`}
                >
                  {template.title}
                </h3>
                <p className={template.workInProgress ? "text-gray-500" : ""}>
                  {template.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
