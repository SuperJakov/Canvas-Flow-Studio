import { type Metadata } from "next";
import WhiteboardsClient from "./WhiteboardsClient";
import { getConvexToken } from "~/helpers/getConvexToken";
import { RedirectToSignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Whiteboards | AI Flow Studio",
};

export default async function WhiteboardsPage() {
  const token = await getConvexToken();
  if (!token) return <RedirectToSignIn signInFallbackRedirectUrl={"/"} />;

  return <WhiteboardsClient />;
}
