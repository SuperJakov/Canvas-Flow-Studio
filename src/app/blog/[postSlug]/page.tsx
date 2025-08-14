import { redirect } from "next/navigation";
import Image from "next/image";
import { blogs } from "../../_components/blog/blogs";
import Link from "next/link";
import type { Metadata } from "next";
import { getBaseUrl } from "~/helpers/baseurl";

type Props = {
  params: Promise<{
    postSlug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postSlug } = await params;
  const post = blogs.find((p) => p.slug === postSlug);

  if (!post) {
    return {
      title: "Blog Post Not Found | Canvas Flow Studio",
      description: "The requested blog post could not be found.",
    };
  }

  const baseUrl = getBaseUrl();

  return {
    title: `${post.title} | Canvas Flow Studio`,
    description: `Read about ${post.title} on Canvas Flow Studio's blog`,
    keywords: post.tags,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: `Read about ${post.title} on Canvas Flow Studio's blog`,
      type: "article",
      publishedTime: post.date,
      authors: [post.author.name],
      images: [post.thumbnail.src ?? `${baseUrl}/logo.png`],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: `Read about ${post.title} on Canvas Flow Studio's blog`,
      images: [post.thumbnail.src ?? `${baseUrl}/logo.png`],
    },
  };
}

function BlogPost({ post }: { post: (typeof blogs)[number] }) {
  const Content = post.content;

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 pt-18">
      {/* Header */}
      <header className="mb-8">
        {/* Tags */}

        {/* Title */}
        <h1 className="text-foreground mb-4 text-4xl font-bold md:text-5xl">
          {post.title}
        </h1>

        <div className="mb-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="bg-secondary text-secondary-foreground rounded-radius px-3 py-1 text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Meta information */}
        <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
          {/* Date */}
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>

          {/* Separator */}
          <span className="text-border">•</span>

          {/* Reading time */}
          <span>{post.readingTime}</span>
        </div>
      </header>

      {/* Featured Image */}
      {post.thumbnail && (
        <div className="rounded-radius bg-muted relative mb-8 h-64 w-full overflow-hidden md:h-96">
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground prose-code:text-accent-foreground prose-code:bg-accent/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-hr:border-border max-w-none">
        <Content />
      </div>

      {/* Footer */}
      <footer className="border-border mt-12 border-t pt-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div></div>
          {/* Back to blog */}
          <Link
            href="/blog"
            className="text-primary hover:text-primary/80 inline-flex items-center text-sm font-medium"
          >
            <svg
              className="mr-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to all posts
          </Link>
        </div>
      </footer>
    </article>
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { postSlug } = await params;
  const post = blogs.find((p) => p.slug === postSlug);
  const baseUrl = getBaseUrl();

  if (!post) redirect("/blog");

  // Generate JSON-LD schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: `Read about ${post.title} on Canvas Flow Studio's blog`,
    image: {
      "@type": "ImageObject",
      url: new URL(post.thumbnail.src, getBaseUrl()).toString(),
      width: post.thumbnail.width,
      height: post.thumbnail.height,
      caption: post.title,
    },
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: "Canvas Flow Studio",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${post.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPost post={post} />
    </>
  );
}
