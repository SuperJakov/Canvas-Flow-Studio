import { api } from "convex/_generated/api";
import { useConvexQuery } from "~/helpers/convex";
import FolderBreadcrumb from "./FolderBreadcrumb";
import type { Id } from "convex/_generated/dataModel";
import Loading from "~/app/loading";
import { redirect } from "next/navigation";
import EmptyFolder from "./EmptyFolder";
import AllProjectsAndWhiteboards from "./AllProjectsAndWhiteboards";

type Props = {
  projectIds?: Id<"projects">[];
};

export default function FolderView({ projectIds }: Props) {
  const lastProjectId = projectIds
    ? projectIds[projectIds.length - 1]
    : undefined;

  const projects = useConvexQuery(api.projects.getProjects, {
    projectId: lastProjectId,
  });

  const whiteboards = useConvexQuery(api.whiteboards.listWhiteboards, {
    projectId: lastProjectId,
  });

  if (projects === undefined || whiteboards === undefined) return <Loading />;
  if (!whiteboards) redirect("/whiteboards");

  return (
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
  );
}
