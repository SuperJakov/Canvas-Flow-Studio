import { Loader2, Globe } from "lucide-react";
import { useConvexQuery } from "~/helpers/convex";
import { api } from "convex/_generated/api";

interface WebsiteNodeContentProps {
  id: string;
  isResizing: boolean;
  isDragging: boolean;
}

export function WebsiteNodeContent({
  id,
  isDragging,
  isResizing,
}: WebsiteNodeContentProps) {
  const websiteNode = useConvexQuery(api.websiteNodes.getWebsiteNode, {
    nodeId: id,
  });

  const isInteracting = isDragging || isResizing;

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
        <div className="group relative flex h-full w-full items-center justify-center overflow-hidden bg-gray-800">
          <iframe
            srcDoc={websiteNode.srcDoc}
            sandbox="allow-scripts"
            className={`transition-filter h-full w-full duration-200 ease-in-out ${isInteracting ? "pointer-events-none blur-sm" : "blur-none"} `}
          />
        </div>
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
