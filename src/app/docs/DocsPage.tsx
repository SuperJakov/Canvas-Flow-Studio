import Sidebar from "../_components/docs/Sidebar";
import ChapterContent from "../_components/docs/ChapterContent";
import { chapters } from "./chapters";
import { MobileMenuButton } from "../_components/docs/MobileMenuButton";
import { contentMap } from "./contentMap";

type Props = {
  activeChapter: string;
  activeSection: string;
};

export default function DocsPage({ activeChapter, activeSection }: Props) {
  if (process.env.NODE_ENV === "development") {
    for (const chapter of chapters) {
      for (const section of chapter.sections) {
        const Component = contentMap[chapter.slug]?.[section.slug];
        if (!Component) {
          throw new Error(
            `Missing content for "${chapter.slug}/${section.slug}"`,
          );
        }
      }
    }
  }
  return (
    <div className="flex min-h-screen flex-col pt-18 md:flex-row">
      {/* Sidebar navigation */}
      <Sidebar
        chapters={chapters}
        activeChapter={activeChapter}
        activeSection={activeSection}
      />

      {/* Main content area */}
      <div className="bg-background flex-1 px-6 md:px-8 lg:px-12">
        <MobileMenuButton />
        <ChapterContent
          activeChapter={activeChapter}
          activeSection={activeSection}
        />
      </div>
    </div>
  );
}
