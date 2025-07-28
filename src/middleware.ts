import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { chapters } from "./app/docs/chapters";

const staticRedirects = {
  "/whiteboard": "/whiteboards",
}; // These are marked as permament.

export default clerkMiddleware((auth, req) => {
  if (req.nextUrl.pathname === "/docs") {
    const url = req.nextUrl.clone();
    const chapter = chapters[0]?.slug;
    const section = chapters[0]?.sections[0]?.slug;
    url.pathname = `/docs/${chapter}/${section}`;
    return NextResponse.redirect(url, 308);
  }
  const staticRedirect =
    staticRedirects[req.nextUrl.pathname as keyof typeof staticRedirects];
  if (staticRedirect) {
    return NextResponse.redirect(new URL(staticRedirect, req.url), 308);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and exclude /error-monitoring
    "/((?!_next|error-monitoring|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
