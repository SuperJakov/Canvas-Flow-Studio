"use client";

import type { Id } from "../../../../convex/_generated/dataModel";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "~/components/ui/breadcrumb";
import ProjectBreadcrumbItem from "./ProjectBreadcrumbItem";

function ProjectBreadcrumb({ projectIds }: { projectIds?: Id<"projects">[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/whiteboards">Whiteboards</BreadcrumbLink>
        </BreadcrumbItem>
        {projectIds?.map((projectId, index) => (
          <ProjectBreadcrumbItem 
            key={projectId} 
            projectId={projectId} 
            isLast={index === projectIds.length - 1} />
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default ProjectBreadcrumb;