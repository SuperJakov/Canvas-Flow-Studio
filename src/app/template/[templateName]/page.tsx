import { RedirectToSignIn } from "@clerk/nextjs";
import ConstructionPage from "~/app/_components/ConstructionPage";
import { getConvexToken } from "~/helpers/getConvexToken";
import { getTemplate } from "./templates";
import { fetchMutation } from "convex/nextjs";
import { api } from "convex/_generated/api";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    templateName: string;
  }>;
};

export default async function TemplatePage({ params }: Props) {
  const token = await getConvexToken();
  if (!token) return <RedirectToSignIn />;
  const { templateName } = await params;

  const template = getTemplate(templateName);
  if (!template) return <ConstructionPage />;
  try {
    const newWhiteboardId = await fetchMutation(
      api.whiteboards.createWhiteboard,
      {
        title: template.title,
      },
      {
        token,
      },
    );

    await fetchMutation(
      api.whiteboards.editWhiteboard,
      {
        id: newWhiteboardId,
        title: template.title,
        edges: template.edges,
        nodes: template.nodes,
      },
      {
        token,
      },
    );

    redirect(`/whiteboard/${newWhiteboardId}`);
  } catch (error) {
    console.error(error);
    redirect("/whiteboards");
  }
}
