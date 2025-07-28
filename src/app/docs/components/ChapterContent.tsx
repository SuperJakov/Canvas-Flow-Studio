import { redirect } from "next/navigation";
import React from "react";

import { chapters } from "../chapters";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { contentMap } from "../contentMap";

interface Props {
  activeChapter: string;
  activeSection: string | null;
}

export default function ChapterContent({
  activeChapter,
  activeSection,
}: Props) {
  const chapter = chapters.find((c) => c.slug === activeChapter);
  if (!chapter) redirect("/docs");

  const sectionExists =
    !activeSection || chapter.sections.some((s) => s.slug === activeSection);
  if (!sectionExists) redirect("/docs");

  const Component =
    contentMap[activeChapter]?.[
      (activeSection ?? Object.keys(contentMap[activeChapter])[0])!
    ];
  if (!Component) redirect("/docs");

  const sectionTitle = activeSection
    ? chapter.sections.find((s) => s.slug === activeSection)?.title
    : undefined;

  return (
    <div className="mx-auto max-w-3xl pt-5">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Documentation</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{chapter.title}</BreadcrumbPage>
          </BreadcrumbItem>
          {sectionTitle && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{sectionTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <Component />
    </div>
  );
}
