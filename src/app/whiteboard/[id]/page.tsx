import { auth } from "@clerk/nextjs/server";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import WhiteboardPage from "../WhiteboardPage";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function WhiteboardPageWithId({ params }: Props) {
  const { id } = await params;
  const token =
    (await (await auth()).getToken({ template: "convex" })) ?? undefined;
  if (!token) redirect("/sign-in");
  // Check if whiteboard exists
  const whiteboard = await fetchQuery(
    api.whiteboards.getWhiteboard,
    { id: id as Id<"whiteboards"> }, // id will be validated
    { token },
  );
  if (!whiteboard) {
    console.log("Whiteboard not found, redirecting to home, id:", id);
    redirect("/");
  }

  return <WhiteboardPage id={id as Id<"whiteboards">} />;
}
