import { type Metadata } from "next";
import { getConvexToken } from "~/helpers/getConvexToken";
import GalleryClient from "./GalleryClient";
import { RedirectToSignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Gallery | AI Flow Studio",
  description: "All AI Flow Studio generated images",
};

export default async function Gallery() {
  const token = await getConvexToken();
  if (!token) return <RedirectToSignIn signInFallbackRedirectUrl={"/"} />;

  return <GalleryClient />;
}
