import type { DocChapter } from "./components/Sidebar";

// Documentation structure
export const chapters: DocChapter[] = [
  {
    title: "Getting Started",
    slug: "getting-started",
    sections: [
      { title: "Introduction", slug: "introduction" },
      { title: "Creating Your First Flow", slug: "first-flow" },
      { title: "Understanding the Canvas", slug: "canvas" },
    ],
  },
  {
    title: "Core Concepts",
    slug: "core-concepts",
    sections: [
      { title: "Nodes & Connections", slug: "nodes-connections" },
      { title: "AI Models", slug: "ai-models" },
      { title: "Data Flow", slug: "data-flow" },
    ],
  },
  {
    title: "Advanced Usage",
    slug: "advanced-usage",
    sections: [
      { title: "Complex Workflows", slug: "complex-workflows" },
      { title: "Sharing", slug: "sharing" },
    ],
  },
];
