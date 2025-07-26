import { RedirectToSignIn } from "@clerk/nextjs";
import { getConvexToken } from "~/helpers/getConvexToken";
import { getTemplate } from "./templates";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { notFound, redirect } from "next/navigation";

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
  if (!template) return notFound();

  // There's a bug in nextjs with redirect() function so we have to use this way
  let redirectTo = "";
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
    redirectTo = `/whiteboard/${newWhiteboardId}`;
  } catch (error) {
    console.error(error);
    redirectTo = "/whiteboards";
  } finally {
    redirect(redirectTo);
  }
}
