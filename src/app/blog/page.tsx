import type { Metadata } from "next";
import TopSection from "../_components/blog/TopSection";
import AllBlogPosts from "../_components/blog/AllBlogPosts";
import { getBaseUrl } from "~/helpers/baseurl";
import { blogs } from "../_components/blog/blogs";

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  title: "Blog | Canvas Flow Studio",
  description:
    "Canvas Flow tutorials, feature guides, and product updates. Learn efficient workflows, explore app capabilities, and get the most from our latest releases.",
  keywords: [
    "Blog",
    "News",
    "Canvas Flow Studio",
    "Tutorials",
    "Guides",
    "Updates",
  ],
  alternates: {
    canonical: `${baseUrl}/blog`,
  },
  openGraph: {
    title: "Blog | Canvas Flow Studio",
    description:
      "Canvas Flow tutorials, feature guides, and product updates. Learn efficient workflows, explore app capabilities, and get the most from our latest releases.",
    url: `${baseUrl}/blog`,
    type: "website",
    images: [`${baseUrl}/logo.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Canvas Flow Studio",
    description:
      "Canvas Flow tutorials, feature guides, and product updates. Learn efficient workflows, explore app capabilities, and get the most from our latest releases.",
    images: [`${baseUrl}/logo.png`],
  },
};

export default async function BlogPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Canvas Flow Studio Blog",
    description:
      "Canvas Flow tutorials, feature guides, and product updates. Learn efficient workflows, explore app capabilities, and get the most from our latest releases.",
    url: `${baseUrl}/blog`,
    publisher: {
      "@type": "Organization",
      name: "Canvas Flow Studio",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    blogPost: blogs.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${baseUrl}/blog/${post.slug}`,
      datePublished: post.date,
      image:
        typeof post.thumbnail === "string"
          ? post.thumbnail
          : post.thumbnail.src,
      author: {
        "@type": "Person",
        name: post.author.name,
      },
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="pt-18">
        <TopSection />
        <AllBlogPosts />
      </div>
    </main>
  );
}
