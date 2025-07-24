import DocsPage from "../../page";

type Props = {
  params: Promise<{
    chapterSlug: string;
    sectionSlug: string;
  }>;
};

export default async function DocsSectionPage({ params }: Props) {
  const { chapterSlug, sectionSlug } = await params;
  return <DocsPage activeChapter={chapterSlug} activeSection={sectionSlug} />;
}
