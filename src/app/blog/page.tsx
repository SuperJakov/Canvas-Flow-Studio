import type { Metadata } from "next";
import TopSection from "../_components/blog/TopSection";
import AllBlogPosts from "../_components/blog/AllBlogPosts";

export const metadata: Metadata = {
  title: "Blog | Canvas Flow Studio",
  description: "Latest blog posts from Canvas Flow Studio.",
  keywords: ["Blog", "News", "Canvas Flow Studio"],
};

export default async function BlogPage() {
  return (
    <div className="pt-18">
      <TopSection />
      <AllBlogPosts />
    </div>
  );
}
