"use client";

import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import posthog from "posthog-js";
import { templates } from "~/app/templates/templates";

export default function TemplatesSection() {
  const visibleTemplates = templates.filter((template) => !template.unlisted);

  return (
    <section
      className="container mx-auto px-4 pt-20 sm:px-6 lg:px-8"
      id="templates"
    >
      <div className="mx-auto mb-10 max-w-2xl space-y-4 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          <span className="text-primary">Get Started with an Example</span>
        </h2>
        <p className="text-muted-foreground">
          Jump-start your workflow with one of our pre-built templates
        </p>
      </div>

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
    </section>
  );
}
