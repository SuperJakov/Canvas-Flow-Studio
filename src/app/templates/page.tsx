"use client";

import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import posthog from "posthog-js";
import { templates } from "~/app/templates/templates";
import Link from "next/link";

export default function Templates() {
  const visibleTemplates = templates.filter((template) => !template.unlisted);

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
        {visibleTemplates.map((template) => (
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
