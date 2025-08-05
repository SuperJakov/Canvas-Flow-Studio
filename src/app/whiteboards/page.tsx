import { type Metadata } from "next";
import WhiteboardsClient from "./Whiteboards";
import { getConvexToken } from "~/helpers/getConvexToken";
import { RedirectToSignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Whiteboards | Canvas Flow Studio",
  description:
    "Organize, create, and manage your AI-powered whiteboards and projects in Canvas Flow Studio.",
};

export default async function WhiteboardsPage() {
  const token = await getConvexToken();
  if (!token) return <RedirectToSignIn signInFallbackRedirectUrl={"/"} />;

  return <WhiteboardsClient />;
}
