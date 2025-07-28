import Sidebar from "./components/Sidebar";
import ChapterContent from "./components/ChapterContent";
import { chapters } from "./chapters";
import { permanentRedirect } from "next/navigation";
import { MobileMenuButton } from "./components/MobileMenuButton";

type Props = {
  activeChapter: string;
  activeSection: string;
};

export default function DocsPage({ activeChapter, activeSection }: Props) {
  if (!activeChapter || !activeSection) {
    const chapter = activeChapter ?? chapters[0]?.slug;
    const section = activeSection ?? chapters[0]?.sections[0]?.slug;
    permanentRedirect(`/docs/${chapter}/${section}`);
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
      <main className="bg-background flex-1 px-6 md:px-8 lg:px-12">
        <MobileMenuButton />
        <ChapterContent
          activeChapter={activeChapter}
          activeSection={activeSection}
        />
      </main>
    </div>
  );
}
