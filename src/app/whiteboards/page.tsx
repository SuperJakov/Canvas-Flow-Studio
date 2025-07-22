import { type Metadata } from "next";
import WhiteboardsClient from "./WhiteboardsClient";
import { getConvexToken } from "~/helpers/getConvexToken";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Whiteboards | AI Flow Studio",
};

export default async function WhiteboardsPage() {
  const token = await getConvexToken();
  if (!token) redirect("/sign-in");

  return <WhiteboardsClient />;
}
