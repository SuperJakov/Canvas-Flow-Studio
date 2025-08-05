import type { Id } from "../../../convex/_generated/dataModel";
import CreateNewSection from "./_components/CreateNewSection";
import WhiteboardsOverview from "./_components/WhiteboardsOverview";
import dynamic from "next/dynamic";
import FolderView from "./_components/FolderView";

const WhiteboardPreloader = dynamic(() =>
  import("./_components/WhiteboardPreloader").then((c) => c.default),
);

const ErrorMessage = dynamic(() =>
  import("./_components/ErrorMessage").then((c) => c.default),
);

const WhiteboardsUpgradeBanner = dynamic(() =>
  import("./_components/WhiteboardsUpgradeBanner").then((c) => c.default),
);

type Props = {
  projectIds?: Id<"projects">[];
};

export default function WhiteboardsClient({ projectIds }: Props) {
  const lastProjectId = projectIds
    ? projectIds[projectIds.length - 1]
    : undefined;

  return (
    <div className="bg-background text-foreground min-h-screen pt-16">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <WhiteboardPreloader lastProjectId={lastProjectId} />

        <WhiteboardsOverview />

        <CreateNewSection lastProjectId={lastProjectId} />

        <ErrorMessage />

        <FolderView projectIds={projectIds} />
      </div>

      <WhiteboardsUpgradeBanner />
    </div>
  );
}
