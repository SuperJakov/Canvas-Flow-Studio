import DocsPage from "../../DocsPage";
import type { Metadata } from "next";
import { chapters } from "../../chapters";

type Props = {
  params: Promise<{
    chapterSlug: string;
    sectionSlug: string;
  }>;
};

// Generate dynamic metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapterSlug, sectionSlug } = await params;

  const chapter = chapters.find((c) => c.slug === chapterSlug);
  if (!chapter) {
    return {
      title: "Documentation | Canvas Flow Studio",
    };
  }
  const section = chapter.sections.find((s) => s.slug === sectionSlug);
  if (!section) {
    return {
      title: "Documentation | Canvas Flow Studio",
    };
  }

  return {
    title: `${chapter.title}: ${section.title}`,
  };
}

export default async function DocsSectionPage({ params }: Props) {
  const { chapterSlug, sectionSlug } = await params;

  return <DocsPage activeChapter={chapterSlug} activeSection={sectionSlug} />;
}
