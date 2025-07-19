import { api } from "../../../../convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { notFound, redirect } from "next/navigation";
import WhiteboardPage from "../WhiteboardPage";
import { getConvexToken } from "~/helpers/getConvexToken";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function WhiteboardPageWithId({ params }: Props) {
  const { id } = await params;

  const token = await getConvexToken();
  if (!token) redirect("/sign-in");

  let whiteboard = null;
  try {
    whiteboard = await fetchQuery(
      api.whiteboards.getWhiteboard,
      { id: id },
      { token },
    );
  } catch (err) {
    console.log("Invalid whiteboard ID format:", id, err);
    redirect("/");
  }

  const normalizedId = await fetchQuery(api.whiteboards.normalizeWhiteboardId, {
    whiteboardId: id,
  });

  if (!whiteboard || !normalizedId) {
    console.log("Whiteboard not found:", id);
    notFound();
  }
  // Whiteboard id has been validated by the query
  return <WhiteboardPage id={normalizedId} />;
}
