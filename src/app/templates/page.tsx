import { type Metadata } from "next";
import { getAllTemplates } from "../template/[templateName]/templates";
import Link from "next/link";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export const metadata: Metadata = {
  title: "Templates | Canvas Flow Studio",
  description:
    "Explore our collection of pre-built templates to kickstart your creative process. From image generation to language translation, find the perfect starting point for your next project.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function Templates() {
  const templates = getAllTemplates();

  return (
    <main className="text-foreground container mx-auto px-4 py-8">
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
            key={template.name}
            href={`/template/${template.name}`}
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
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${template.iconBg} shadow-lg ${
                    template.workInProgress ? "grayscale" : ""
                  }`}
                >
                  {template.icon && (
                    <template.icon className="h-6 w-6 text-white" />
                  )}
                </div>
                <h3
                  className={`mb-2 text-xl font-semibold ${template.titleClasses} transition-all duration-300 ${
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
