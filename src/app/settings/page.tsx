import { RedirectToSignIn } from "@clerk/nextjs";
import { getConvexToken } from "~/helpers/getConvexToken";
import ConstructionPage from "../_components/ConstructionPage";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Under Construction",
};

export default async function SettingsPage() {
  const token = await getConvexToken();
  if (!token) return <RedirectToSignIn />;

  return <ConstructionPage />;
}
