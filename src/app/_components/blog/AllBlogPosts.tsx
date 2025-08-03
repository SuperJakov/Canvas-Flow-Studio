import Image from "next/image";
import { blogs } from "./blogs";
import Link from "next/link";

function BlogPost({ post }: { post: (typeof blogs)[number] }) {
  return (
    <Link href={`/blog/${post.slug}`} prefetch={true}>
      <article className="group bg-card rounded-radius border-border hover:border-muted-foreground/20 relative flex flex-col gap-6 border p-6 shadow-sm transition-all duration-300 hover:shadow-xl sm:flex-row">
        {/* Thumbnail */}
        <div className="rounded-radius bg-muted relative h-48 w-full flex-shrink-0 overflow-hidden sm:h-32 sm:w-48">
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="flex flex-grow flex-col justify-between">
          <div>
            {/* Date */}
            <time className="text-muted-foreground text-xs font-medium tracking-wider">
              {new Date(post.date)
                .toLocaleDateString("en-US", {
                  dateStyle: "medium",
                })
                .toUpperCase()}
            </time>

            {/* Title */}
            <h2 className="text-foreground group-hover:text-primary mt-2 text-xl font-bold transition-colors sm:text-2xl">
              {post.title}
            </h2>

            {/* Excerpt */}
            <p className="text-muted-foreground mt-3 line-clamp-2">
              {post.excerpt}
            </p>
          </div>

          {/* Read more link */}
          <div className="mt-4">
            <span className="text-primary group-hover:text-primary/80 inline-flex items-center text-sm font-medium">
              Read more
              <svg
                className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function AllBlogPosts() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-6">
        {blogs.map((post) => (
          <BlogPost post={post} key={post.slug} />
        ))}
      </div>
    </div>
  );
}
