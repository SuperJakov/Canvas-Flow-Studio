import { redirect } from "next/navigation";

export default async function TemplatePage() {
  // Wrong page, redirect
  redirect("/");
}
