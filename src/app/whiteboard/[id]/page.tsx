import { api } from "../../../../convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import WhiteboardPage from "../WhiteboardPage";
import type { Id } from "../../../../convex/_generated/dataModel";
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
      { id: id as Id<"whiteboards"> },
      { token },
    );
  } catch (err) {
    console.log("Invalid whiteboard ID format:", id, err);
    redirect("/");
  }

  if (!whiteboard) {
    console.log("Whiteboard not found:", id);
    redirect("/");
  }

  return <WhiteboardPage id={id as Id<"whiteboards">} />;
}
