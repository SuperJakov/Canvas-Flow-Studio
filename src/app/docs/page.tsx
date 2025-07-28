import { permanentRedirect } from "next/navigation";
import { chapters } from "./chapters";

// User went to /docs
// This shouldn't be accessed, the middleware should redirect
// But it's always good to have a fail safe
export default function RedirectDocsPage() {
  const chapter = chapters[0]?.slug;
  const section = chapters[0]?.sections[0]?.slug;
  permanentRedirect(`/docs/${chapter}/${section}`);
}
