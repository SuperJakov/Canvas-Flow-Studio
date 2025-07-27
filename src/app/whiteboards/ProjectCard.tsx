import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import { MoreVertical, Folder } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { formatDate } from "~/helpers/formatDate";

export default function ProjectCard({
  project,
  projectIds,
  lastProjectId,
  onRedirect,
}: {
  project: Doc<"projects">;
  projectIds?: Id<"projects">[];
  lastProjectId?: Id<"projects">;
  onRedirect: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(project.name ?? "");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const convexEditProject = useMutation(
    api.projects.editProject,
  ).withOptimisticUpdate((localStore, { projectId, name }) => {
    const currentProjects = localStore.getQuery(api.projects.getProjects, {
      projectId: lastProjectId,
    });
    if (currentProjects) {
      localStore.setQuery(
        api.projects.getProjects,
        { projectId: lastProjectId },
        currentProjects.map((p) =>
          p._id === projectId ? { ...p, name, updatedAt: Date.now() } : p,
        ),
      );
    }
  });

  const convexDeleteProject = useMutation(
    api.projects.deleteProject,
  ).withOptimisticUpdate((localStore, { projectId }) => {
    const currentProjects = localStore.getQuery(api.projects.getProjects, {
      projectId: lastProjectId,
    });
    if (currentProjects) {
      localStore.setQuery(
        api.projects.getProjects,
        { projectId: lastProjectId },
        currentProjects.filter((p) => p._id !== projectId),
      );
    }
  });

  const handleSaveTitle = async () => {
    const newTitle = editedTitle.trim();
    setIsEditing(false);
    if (newTitle && newTitle !== project.name) {
      await convexEditProject({ projectId: project._id, name: newTitle });
    }
  };

  const handleDelete = async () => {
    await convexDeleteProject({ projectId: project._id });
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditedTitle(project.name ?? "");
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    void handleDelete();
  };

  const currentPath = projectIds
    ? `/whiteboards/${projectIds.join("/")}`
    : "/whiteboards";
  const href = `${currentPath}/${project._id}`;

  return (
    <div className="group bg-card hover:ring-accent relative overflow-hidden rounded-lg border shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:ring-2">
      <Link
        href={href}
        onClick={(e) => {
          if ((e.target as Element).closest(".no-link")) {
            e.preventDefault();
          } else {
            onRedirect();
          }
        }}
        className="block h-full cursor-pointer"
        aria-label={`Open project: ${project.name ?? "Untitled"}`}
        prefetch={true}
      >
        <div className="relative">
          <div className="from-muted to-muted/50 relative flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br">
            <Folder className="h-16 w-16 text-gray-400 transition-transform duration-300 group-hover:scale-110" />
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleSaveTitle();
                    if (e.key === "Escape") setIsEditing(false);
                  }}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  className="no-link h-auto w-full cursor-text rounded-md border-blue-500 bg-white/10 p-1 text-lg font-semibold focus:ring-2 focus:ring-blue-500"
                  maxLength={20}
                />
              ) : (
                <p className="truncate text-lg font-semibold">
                  {project.name ?? "Untitled"}
                </p>
              )}
            </div>
            <div className="no-link relative flex-shrink-0">
              <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  onClick={(e) => e.stopPropagation()}
                  sideOffset={5}
                  align="end"
                  className="w-36 rounded-lg p-1 shadow-xl"
                >
                  <DropdownMenuItem
                    onClick={handleRenameClick}
                    className="cursor-pointer rounded-md px-2 py-1.5 text-sm hover:bg-gray-100"
                  >
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDeleteClick}
                    className="cursor-pointer rounded-md px-2 py-1.5 text-sm text-red-500 hover:bg-red-50"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Created:{" "}
            <time dateTime={new Date(project._creationTime).toISOString()}>
              {formatDate(project._creationTime)}
            </time>
          </p>
        </div>
      </Link>
    </div>
  );
}
