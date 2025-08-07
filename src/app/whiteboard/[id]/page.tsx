import { api } from "../../../../convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import WhiteboardPage from "../WhiteboardPage";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function WhiteboardPageWithId({ params }: Props) {
  const { id } = await params;

  const preloadedWhiteboard = await preloadQuery(
    api.whiteboards.getWhiteboard,
    {
      id,
    },
  );

  if (!preloadedWhiteboard) {
    console.log("Whiteboard not found:", id);
    notFound();
  }

  return <WhiteboardPage preloadedWhiteboard={preloadedWhiteboard} />;
}
