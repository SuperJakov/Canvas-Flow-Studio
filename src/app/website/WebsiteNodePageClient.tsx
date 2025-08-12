"use client";

import { type api } from "convex/_generated/api";
import { type Preloaded, usePreloadedQuery } from "convex/react";
import SwirlingEffectSpinner from "~/components/spinner";

type Props = {
  preloadedWebsiteNode: Preloaded<typeof api.websiteNodes.getWebsiteNode>;
};

function Generating() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
      <span className="flex items-center gap-2 text-lg">
        <SwirlingEffectSpinner size={70} />
      </span>
      <p className="text-muted-foreground text-sm">
        The page will automatically reload when the website is generated.
      </p>
    </div>
  );
}

export default function WebsiteNodePageClient({ preloadedWebsiteNode }: Props) {
  const website = usePreloadedQuery(preloadedWebsiteNode);
  if (!website) return null;

  if (website.isGenerating || !website.srcDoc) return <Generating />;

  return (
    <main className="h-screen">
      <iframe srcDoc={website.srcDoc} className="h-full w-full"></iframe>
    </main>
  );
}
