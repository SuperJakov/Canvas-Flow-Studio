import IntroductionContent from "./content/IntroductionContent";
import FirstFlowContent from "./content/FirstFlowContent";
import CanvasContent from "./content/CanvasContent";
import NodesConnectionsContent from "./content/NodesConnectionsContent";
import TextNodeContent from "./content/TextNodeContent";
import { type chapters } from "./chapters";
import PageTitle from "./components/PageTitle";

// Extract the structure from chapters to create a type
type ChapterStructure = {
  [K in (typeof chapters)[number] as K["slug"]]: {
    [S in K["sections"][number] as S["slug"]]: React.ComponentType;
  };
};

// Now TypeScript will enforce that contentMap matches the exact structure
export const contentMap: ChapterStructure = {
  "getting-started": {
    introduction: IntroductionContent,
    "first-flow": FirstFlowContent,
    canvas: CanvasContent,
  },
  "core-concepts": {
    "nodes-connections": NodesConnectionsContent,
    "text-node": TextNodeContent,
  },
  "advanced-usage": {
    "complex-workflows": () => <Placeholder title="Complex Workflows" />,
    sharing: () => <Placeholder title="Sharing" />,
    "ai-models": () => <Placeholder title="AI Models" />,
  },
};

function Placeholder({ title }: { title: string }) {
  return (
    <section
      id={title.toLowerCase().replace(/\s+/g, "-")}
      className="mb-16 scroll-mt-16"
    >
      <PageTitle>{title}</PageTitle>

      <div className="">
        <p>Advanced usage content for {title} coming soon…</p>
      </div>
    </section>
  );
}
