import { RedirectToSignIn } from "@clerk/nextjs";
import { api } from "convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { redirect } from "node_modules/next/navigation";
import { getConvexToken } from "~/helpers/getConvexToken";
import WebsiteNodePageClient from "../WebsiteNodePageClient";

type Props = {
  params: Promise<{
    nodeId: string;
  }>;
};

export default async function WebsiteNodePage(props: Props) {
  const { nodeId } = await props.params;

  const token = await getConvexToken();
  if (!token) return <RedirectToSignIn />;

  const preloadedWebsiteNode = await preloadQuery(
    api.websiteNodes.getWebsiteNode,
    {
      nodeId,
    },
  );
  if (!preloadedWebsiteNode) redirect("/whiteboards");

  return <WebsiteNodePageClient preloadedWebsiteNode={preloadedWebsiteNode} />;
}
