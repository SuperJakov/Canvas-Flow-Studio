"use client";

import { type api } from "convex/_generated/api";
import { type Preloaded, usePreloadedQuery } from "convex/react";

type Props = {
  preloadedWebsiteNode: Preloaded<typeof api.websiteNodes.getWebsiteNode>;
};

export default function WebsiteNodePageClient({ preloadedWebsiteNode }: Props) {
  const website = usePreloadedQuery(preloadedWebsiteNode);
  if (!website) return null;

  if (website.isGenerating || !website.srcDoc)
    return <div className="pt-18">Generating website...</div>;

  return (
    <main className="h-screen">
      <iframe srcDoc={website.srcDoc} className="h-full w-full"></iframe>
    </main>
  );
}
