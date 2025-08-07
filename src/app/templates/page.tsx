import { type Metadata } from "next";
import { getAllTemplates } from "../template/[templateName]/templates";
import Link from "next/link";

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
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-4xl font-bold">Templates</h1>
      <p className="mb-8 text-lg text-gray-600">
        Get started quickly with one of our templates.
      </p>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Link
            href={`/template/${template.name}`}
            key={template.name}
            className="block rounded-lg border border-gray-200 bg-white p-6 shadow-md hover:bg-gray-100"
          >
            <h2 className="mb-2 text-2xl font-bold">{template.title}</h2>
          </Link>
        ))}
      </div>
    </main>
  );
}
