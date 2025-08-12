import { Loader2, Globe } from "lucide-react";
import { useConvexQuery } from "~/helpers/convex";
import { api } from "convex/_generated/api";

interface WebsiteNodeContentProps {
  id: string;
}

export function WebsiteNodeContent({ id }: WebsiteNodeContentProps) {
  const websiteNode = useConvexQuery(api.websiteNodes.getWebsiteNode, {
    nodeId: id,
  });

  if (websiteNode?.isGenerating) {
    return (
      <div className="group relative flex h-full w-full items-center justify-center bg-gray-800">
        <div className="flex flex-col items-center text-gray-400">
          <Loader2 size={48} className="animate-spin" />
          <p className="mt-2">Generating website...</p>
        </div>
      </div>
    );
  }

  if (websiteNode?.srcDoc) {
    return (
      <div className="group relative flex h-full w-full items-center justify-center bg-gray-800">
        <iframe
          srcDoc={websiteNode.srcDoc}
          className="h-full w-full"
          sandbox="allow-scripts"
        />
      </div>
    );
  }

  return (
    <div className="group relative flex h-full w-full items-center justify-center bg-gray-800">
      <div className="flex flex-col items-center text-gray-400">
        <Globe size={48} />
        <p className="mt-2">No website generated yet</p>
      </div>
    </div>
  );
}
