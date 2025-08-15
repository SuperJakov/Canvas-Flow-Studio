import type { Metadata } from "next";
import { changelogs } from "./changelogs";
import { formatDate, formatDistanceToNow, parseISO } from "date-fns";
import nodeToString from "react-node-to-string";

export const metadata: Metadata = {
  title: "Changelog | Latest Updates & New Features - Canvas Flow Studio",
  description:
    "See every new feature, fix, and improvement in Canvas Flow Studio. Get release notes, version history, and stay ahead with the newest AI-driven workflow tools.",
  openGraph: {
    title: "Canvas Flow Studio Changelog - Latest Updates & New Features",
    description:
      "Explore the latest Canvas Flow Studio releases. Discover new AI workflow capabilities, bug fixes, and performance improvements in our detailed changelog.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Canvas Flow Studio Changelog - Latest Updates & New Features",
    description:
      "Track Canvas Flow Studio’s evolution. View release notes, new features, and improvements in our AI workflow platform.",
  },
};

export default function ChangelogPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Canvas Flow Studio Changelog",
    itemListOrder: "Descending",
    numberOfItems: changelogs.length,
    itemListElement: changelogs.map((log, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `Release ${log.date}`,
      description: log.changes
        .map((change) => nodeToString(change))
        .join(" | "),
      datePublished: parseISO(log.date).toISOString(),
    })),
  };

  return (
    <div suppressHydrationWarning>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="container mx-auto max-w-3xl px-4 py-12 pt-18 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Changelog
          </h1>
          <p className="text-muted-foreground mx-auto mt-3 max-w-md text-base sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
            Stay up to date with the latest Canvas Flow Studio releases, new
            issue fixes, and performance improvements.
          </p>
        </header>

        <section aria-label="Release notes" className="space-y-4">
          {changelogs.map((log, index) => (
            <article key={index}>
              <header className="pb-2">
                <h2 className="mb-4 inline text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatDate(log.date, "yyyy-MM-dd")}{" "}
                </h2>
                <span className="text-md text-muted-foreground">
                  ({formatDistanceToNow(log.date, { addSuffix: true })})
                </span>
              </header>
              <ul className="list-inside list-disc space-y-2">
                {log.changes.map((change, i) => (
                  <li key={i} className="text-gray-700 dark:text-gray-300">
                    {change}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
