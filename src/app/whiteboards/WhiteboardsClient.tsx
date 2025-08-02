"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import type { Id } from "../../../convex/_generated/dataModel";
import { AlertCircle } from "lucide-react";
import Loading from "../loading";
import UpgradeBanner from "../whiteboard/UpgradeBanner";
import { useConvexQuery } from "~/helpers/convex";
import CreateNewSection from "./_components/CreateNewSection";
import { api } from "convex/_generated/api";
import EmptyFolder from "./_components/EmptyFolder";
import AllProjectsAndWhiteboards from "./_components/AllProjectsAndWhiteboards";
import WhiteboardsOverview from "./_components/WhiteboardsOverview";
import FolderBreadcrumb from "./_components/FolderBreadcrumb";
import dynamic from "next/dynamic";

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
  const projects = useConvexQuery(api.projects.getProjects, {
    projectId: lastProjectId,
  });

  const whiteboards = useConvexQuery(api.whiteboards.listWhiteboards, {
    projectId: lastProjectId,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
  const [featureName, setFeatureName] = useState("");

  if (whiteboards === undefined || projects === undefined) {
    return <Loading />;
  }

  if (whiteboards === null) redirect("/whiteboards");

  return (
    <div className="bg-background text-foreground min-h-screen pt-16">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <WhiteboardPreloader whiteboards={whiteboards} />

        <WhiteboardsOverview />

        <CreateNewSection
          lastProjectId={lastProjectId}
          setErrorMessage={setErrorMessage}
          setFeatureName={setFeatureName}
          setShowUpgradeBanner={setShowUpgradeBanner}
        />

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="font-medium">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div className="mb-4">
              <FolderBreadcrumb projectIds={projectIds} />
            </div>
            {whiteboards.length + projects.length > 0 && (
              <p className="text-muted-foreground text-sm">
                {whiteboards.length + projects.length} item
                {whiteboards.length + projects.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {(whiteboards?.length ?? 0) + (projects?.length ?? 0) === 0 ? (
            <EmptyFolder />
          ) : (
            <AllProjectsAndWhiteboards projectIds={projectIds} />
          )}
        </div>
      </div>

      <UpgradeBanner
        isOpen={showUpgradeBanner}
        onCloseAction={() => setShowUpgradeBanner(false)}
        featureName={featureName}
      />
    </div>
  );
}
