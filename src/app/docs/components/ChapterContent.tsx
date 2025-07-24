import React from "react";
import { chapters } from "../chapters";
import IntroductionContent from "../content/IntroductionContent";
import FirstFlowContent from "../content/FirstFlowContent";
import CanvasContent from "../content/CanvasContent";
import NodesConnectionsContent from "../content/NodesConnectionsContent";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import TextNodeContent from "../content/TextNodeContent";

interface ChapterContentProps {
  activeChapter: string;
  activeSection: string | null;
}

export default function ChapterContent({
  activeChapter,
  activeSection,
}: ChapterContentProps) {
  // Find the current chapter data
  const currentChapter = chapters.find(
    (chapter) => chapter.slug === activeChapter,
  );

  if (!currentChapter) {
    return <div>Chapter not found</div>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10">
        <h1 className="mb-6 text-3xl font-bold text-white sm:text-4xl">
          <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {currentChapter.title}
          </span>
        </h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Documentation</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentChapter.title}</BreadcrumbPage>
            </BreadcrumbItem>
            {activeSection && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {
                      currentChapter.sections.find(
                        (section) => section.slug === activeSection,
                      )?.title
                    }
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Render different content based on active chapter and section */}
      {activeChapter === "getting-started" && (
        <GettingStartedContent activeSection={activeSection} />
      )}
      {activeChapter === "core-concepts" && (
        <CoreConceptsContent activeSection={activeSection} />
      )}
      {activeChapter === "advanced-usage" && (
        <AdvancedUsageContent activeSection={activeSection} />
      )}
    </div>
  );
}

function GettingStartedContent({
  activeSection,
}: {
  activeSection: string | null;
}) {
  // If no specific section is selected or section is introduction, show introduction
  if (!activeSection || activeSection === "introduction") {
    return <IntroductionContent />;
  }

  // Otherwise, render the specific section
  return (
    <>
      {activeSection === "first-flow" && <FirstFlowContent />}
      {activeSection === "canvas" && <CanvasContent />}
    </>
  );
}

function CoreConceptsContent({
  activeSection,
}: {
  activeSection: string | null;
}) {
  // If no specific section is selected or section is nodes-connections, show nodes-connections
  if (!activeSection || activeSection === "nodes-connections") {
    return <NodesConnectionsContent />;
  }

  if (activeSection === "text-node") {
    return <TextNodeContent />;
  }

  throw new Error(`Doc section not found: ${activeSection}`);
}

function AdvancedUsageContent({
  activeSection,
}: {
  activeSection: string | null;
}) {
  return (
    <section
      id={activeSection ?? "complex-workflows"}
      className="mb-16 scroll-mt-16"
    >
      <h2 className="mb-4 text-2xl font-bold text-white">
        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          {activeSection === "sharing" ? "Sharing" : "Complex Workflows"}
        </span>
      </h2>
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
        <p className="mb-6 text-gray-300">
          Advanced usage content for {activeSection ?? "complex-workflows"}{" "}
          coming soon...
        </p>
      </div>
    </section>
  );
}
