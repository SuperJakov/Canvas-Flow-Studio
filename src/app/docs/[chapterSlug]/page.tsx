import { redirect } from "next/navigation";
import { chapters } from "../chapters";

type Props = {
  params: Promise<{
    chapterSlug: string | string[];
  }>;
};

export default async function DocsChapterPage({ params }: Props) {
  const { chapterSlug } = await params;
  if (!chapterSlug || Array.isArray(chapterSlug)) {
    redirect("/docs");
  }
  const chapter = chapters.find((chapter) => chapter.slug === chapterSlug);
  if (!chapter) {
    redirect("/docs");
  }

  // Find the first section in the chapter
  const firstSection = chapter.sections[0]?.slug ?? null;
  if (!firstSection) {
    redirect("/docs");
  }
  redirect(`/docs/${chapterSlug}/${firstSection}`);
}
