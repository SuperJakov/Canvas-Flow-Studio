import IntroductionContent from "./content/getting-started/IntroductionContent";
import FirstFlowContent from "./content/getting-started/FirstFlowContent";
import CanvasContent from "./content/getting-started/CanvasContent";
import NodesConnectionsContent from "./content/core-concepts/NodesConnectionsContent";
import TextNodeContent from "./content/core-concepts/TextNodeContent";
import { type chapters } from "./chapters";
import PageTitle from "../_components/docs/PageTitle";

type ChapterStructure = {
  [K in (typeof chapters)[number] as K["slug"]]: {
    [S in K["sections"][number] as S["slug"]]: React.ComponentType;
  };
};

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
