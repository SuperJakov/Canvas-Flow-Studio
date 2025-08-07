import { api } from "../../../../convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import WhiteboardPage from "../WhiteboardPage";
import { getConvexToken } from "~/helpers/getConvexToken";
import { RedirectToSignIn } from "@clerk/nextjs";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function WhiteboardPageWithId({ params }: Props) {
  const { id } = await params;

  const token = await getConvexToken();
  if (!token) {
    return <RedirectToSignIn signInFallbackRedirectUrl="/" />;
  }

  const preloadedWhiteboard = await preloadQuery(
    api.whiteboards.getWhiteboard,
    {
      id,
    },
    {
      token,
    },
  );

  if (!preloadedWhiteboard) {
    console.log("Whiteboard not found:", id);
    notFound();
  }

  return <WhiteboardPage preloadedWhiteboard={preloadedWhiteboard} />;
}
