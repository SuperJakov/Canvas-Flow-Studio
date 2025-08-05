"use client";

import type { Id } from "../../../convex/_generated/dataModel";
import UpgradeBanner from "../whiteboard/UpgradeBanner";
import CreateNewSection from "./_components/CreateNewSection";
import WhiteboardsOverview from "./_components/WhiteboardsOverview";
import dynamic from "next/dynamic";
import FolderView from "./_components/FolderView";
import ErrorMessage from "./_components/ErrorMessage";
import { useAtom } from "jotai";
import { upgradeBannerAtom } from "./atoms";

const WhiteboardPreloader = dynamic(
  () => import("./_components/WhiteboardPreloader").then((c) => c.default),
  { ssr: false },
);

type Props = {
  projectIds?: Id<"projects">[];
};

export default function WhiteboardsClient({ projectIds }: Props) {
  const lastProjectId = projectIds
    ? projectIds[projectIds.length - 1]
    : undefined;

  const [upgradeBanner, setUpgradeBanner] = useAtom(upgradeBannerAtom);

  return (
    <div className="bg-background text-foreground min-h-screen pt-16">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <WhiteboardPreloader lastProjectId={lastProjectId} />

        <WhiteboardsOverview />

        <CreateNewSection lastProjectId={lastProjectId} />

        <ErrorMessage />

        <FolderView projectIds={projectIds} />
      </div>

      <UpgradeBanner
        isOpen={upgradeBanner.isOpen}
        onCloseAction={() =>
          setUpgradeBanner((prev) => ({ ...prev, isOpen: false }))
        }
        featureName={upgradeBanner.featureName}
      />
    </div>
  );
}
