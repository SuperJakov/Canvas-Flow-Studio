import { api } from "convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import WhiteboardsClient from "../WhiteboardsClient";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    projectIds: string[];
  }>;
};

export default async function ProjectWhiteboardsPage({ params }: Props) {
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
