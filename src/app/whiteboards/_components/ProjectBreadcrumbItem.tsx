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
    isLast 
}: { 
    projectId: Id<"projects">, 
    isLast: boolean 
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
            <BreadcrumbLink href={`/whiteboards?projectId=${project._id}`}>
              {project.name}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
      </>
    );
}

export default ProjectBreadcrumbItem;