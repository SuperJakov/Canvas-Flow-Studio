import Sidebar from "./components/Sidebar";
import ChapterContent from "./components/ChapterContent";
import { chapters } from "./chapters";
import { redirect } from "next/navigation";

type Props = {
  activeChapter: string;
  activeSection: string;
};

export default function DocsPage({ activeChapter, activeSection }: Props) {
  if (!activeChapter || !activeSection) {
    const chapter = activeChapter ?? chapters[0]?.slug;
    const section = activeSection ?? chapters[0]?.sections[0]?.slug;
    redirect(`/docs/${chapter}/${section}`);
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar navigation */}
      <Sidebar
        chapters={chapters}
        activeChapter={activeChapter}
        activeSection={activeSection}
      />

      {/* Main content area */}
      <main className="bg-background flex-1 p-6 md:p-8 lg:p-12">
        <ChapterContent
          activeChapter={activeChapter}
          activeSection={activeSection}
        />
      </main>
    </div>
  );
}
