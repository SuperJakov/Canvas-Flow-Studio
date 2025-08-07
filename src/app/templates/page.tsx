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
      <h1 className="text-4xl font-bold mb-4">Templates</h1>
      <p className="text-lg text-gray-600 mb-8">
        Get started quickly with one of our templates.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((template) => (
          <Link
            href={`/template/${template.name}`}
            key={template.name}
            className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100"
          >
            <h2 className="text-2xl font-bold mb-2">{template.title}</h2>
          </Link>
        ))}
      </div>
    </main>
  );
}
