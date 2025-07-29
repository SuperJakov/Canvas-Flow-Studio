import type { Id } from "convex/_generated/dataModel";
import ProjectCard from "./ProjectCard";
import WhiteboardCard from "./WhiteboardCard";
import { useConvexQuery } from "~/helpers/convex";
import { api } from "convex/_generated/api";
import Loading from "~/app/loading";
import { useState } from "react";

type Props = {
  projectIds: Id<"projects">[] | undefined;
};

export default function AllProjectsAndWhiteboards({ projectIds }: Props) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const lastProjectId = projectIds
    ? projectIds[projectIds.length - 1]
    : undefined;
  const projects = useConvexQuery(api.projects.getProjects, {
    projectId: lastProjectId,
  });
  const whiteboards = useConvexQuery(api.whiteboards.listWhiteboards, {
    projectId: lastProjectId,
  });
  if (isRedirecting) return <Loading />;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {projects?.map((project) => (
        <ProjectCard
          key={project._id}
          project={project}
          projectIds={projectIds}
          lastProjectId={lastProjectId}
          onRedirect={() => setIsRedirecting(true)}
        />
      ))}
      {whiteboards?.map((whiteboard) => (
        <WhiteboardCard
          key={whiteboard._id}
          whiteboard={whiteboard}
          lastProjectId={lastProjectId}
          onRedirect={() => setIsRedirecting(true)}
        />
      ))}
    </div>
  );
}
