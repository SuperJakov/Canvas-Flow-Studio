import { api } from "convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import WhiteboardsClient from "../Whiteboards";
import { redirect } from "next/navigation";
import { getConvexToken } from "~/helpers/getConvexToken";
import { RedirectToSignIn } from "@clerk/nextjs";
import { type Metadata } from "next";

type Props = {
  params: Promise<{
    projectIds: string[];
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const token = await getConvexToken();
  if (!token)
    return {
      title: "Whiteboards | Canvas Flow Studio",
    };

  const { projectIds } = await params;
  const normalizedProjectIds = await fetchQuery(
    api.projects.normalizeProjectIds,
    {
      projectIds,
    },
  );

  const lastProjectId = normalizedProjectIds[normalizedProjectIds.length - 1];
  if (!lastProjectId)
    return {
      title: "Whiteboards | Canvas Flow Studio",
    };

  const project = await fetchQuery(
    api.projects.getProject,
    {
      projectId: lastProjectId,
    },
    {
      token: token,
    },
  );

  return {
    title: `${project?.name ?? "Whiteboards"} | Canvas Flow Studio`,
  };
}

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
