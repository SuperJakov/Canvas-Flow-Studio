import { RedirectToSignIn } from "@clerk/nextjs";
import { getConvexToken } from "~/helpers/getConvexToken";
import BillingPageClient from "./BillingPageClient";

export default async function BillingPage() {
  const token = await getConvexToken();
  if (!token) return <RedirectToSignIn />;

  return <BillingPageClient />;
}
