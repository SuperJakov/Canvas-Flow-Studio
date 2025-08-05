import { api } from "convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import WhiteboardsClient from "../Whiteboards";
import { redirect } from "next/navigation";
import { getConvexToken } from "~/helpers/getConvexToken";
import { RedirectToSignIn } from "@clerk/nextjs";

type Props = {
  params: Promise<{
    projectIds: string[];
  }>;
};

export default async function ProjectWhiteboardsPage({ params }: Props) {
  const token = await getConvexToken();
  if (!token) return <RedirectToSignIn signInFallbackRedirectUrl={"/"} />;

  const { projectIds } = await params;
  console.log(projectIds);
  try {
    const normalizedProjectIds = await fetchQuery(
      api.projects.normalizeProjectIds,
      {
        projectIds,
      },
    );
    return <WhiteboardsClient projectIds={normalizedProjectIds} />;
  } catch (error) {
    console.error(error);
    redirect("/whiteboards");
  }
}
