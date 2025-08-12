import { redirect } from "next/navigation";

// This page is used for displaying website nodes, and this did not go to /website/[id]
export default function WebsiteWrongPage() {
  redirect("/");
}
