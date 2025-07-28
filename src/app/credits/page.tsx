import { RedirectToSignIn } from "@clerk/nextjs";
import { getConvexToken } from "~/helpers/getConvexToken";
import CreditsPageClient from "./CreditsPageClient";

export default async function CreditsPage() {
  const token = await getConvexToken();
  if (!token) return <RedirectToSignIn />;

  return <CreditsPageClient />;
}
