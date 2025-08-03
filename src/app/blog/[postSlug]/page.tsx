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
          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="bg-muted relative h-10 w-10 overflow-hidden rounded-full">
              {post.author.avatar ? (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="bg-primary text-primary-foreground flex h-full w-full items-center justify-center font-semibold">
                  {post.author.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <p className="text-foreground font-medium">{post.author.name}</p>
              <p className="text-xs">{post.author.role}</p>
            </div>
          </div>

          {/* Separator */}
          <span className="text-border">•</span>

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
          {/* Share buttons */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground mr-2 text-sm">Share:</span>
            <button className="rounded-radius bg-muted hover:bg-muted/80 p-2 transition-colors">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </button>
            <button className="rounded-radius bg-muted hover:bg-muted/80 p-2 transition-colors">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </button>
          </div>

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
    image: post.thumbnail || `${baseUrl}/logo.png`,
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
