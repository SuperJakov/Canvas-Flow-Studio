import { Loader2, Globe } from "lucide-react";
import { useConvexQuery } from "~/helpers/convex";
import { api } from "convex/_generated/api";

interface WebsiteNodeContentProps {
  id: string;
}

export function WebsiteNodeContent({ id }: WebsiteNodeContentProps) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const websiteNode = useConvexQuery(
    // @ts-expect-error: Convex API not generated yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    api.websiteNodes.getWebsiteNode,
    {
      nodeId: id,
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (websiteNode?.isGenerating) {
    return (
      <div className="group relative flex h-[300px] w-[400px] items-center justify-center bg-gray-800">
        <div className="flex flex-col items-center text-gray-400">
          <Loader2 size={48} className="animate-spin" />
          <p className="mt-2">Generating website...</p>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (websiteNode?.srcDoc) {
    return (
      <div className="group relative flex h-[300px] w-[400px] items-center justify-center bg-gray-800">
        <iframe
          // @ts-expect-error: Convex API not generated yet
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          srcDoc={websiteNode.srcDoc}
          className="h-full w-full"
          sandbox="allow-scripts"
        />
      </div>
    );
  }

  return (
    <div className="group relative flex h-[300px] w-[400px] items-center justify-center bg-gray-800">
      <div className="flex flex-col items-center text-gray-400">
        <Globe size={48} />
        <p className="mt-2">No website generated yet</p>
      </div>
    </div>
  );
}
