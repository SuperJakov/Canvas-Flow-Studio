"use client";

import { useConvexQuery } from "~/helpers/convex";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

function ProjectBreadcrumbItem({
  projectId,
  isLast,
  projectIds,
}: {
  projectId: Id<"projects">;
  isLast: boolean;
  projectIds: Id<"projects">[];
}) {
  const project = useConvexQuery(api.projects.getProject, {
    projectId,
  });

  if (!project) return null; // Or some loading state

  return (
    <>
      <BreadcrumbSeparator />
      <BreadcrumbItem key={project._id}>
        {isLast ? (
          <BreadcrumbPage>{project.name}</BreadcrumbPage>
        ) : (
          <BreadcrumbLink
            href={`/whiteboards/${projectIds.slice(0, projectIds.indexOf(projectId) + 1).join("/")}`}
            prefetch={true}
          >
            {project.name}
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
    </>
  );
}

export default ProjectBreadcrumbItem;
