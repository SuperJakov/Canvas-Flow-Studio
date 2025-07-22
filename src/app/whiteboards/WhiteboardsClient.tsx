"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { MoreVertical, Plus, Grid3X3, Folder, AlertCircle } from "lucide-react";
import Loading from "../loading";
import UpgradeBanner from "../whiteboard/UpgradeBanner";
import ProjectBreadcrumb from "./_components/ProjectBreadcrumb";
import { useConvexQuery } from "~/helpers/convex";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const formatDate = (timestamp: bigint | number | undefined | null): string => {
  if (!timestamp) return "N/A";
  const date = new Date(Number(timestamp));
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return formatDistanceToNow(date, { addSuffix: true });
};

function WhiteboardCard({
  whiteboard,
  lastProjectId,
  onRedirect,
}: {
  whiteboard: Doc<"whiteboards">;
  lastProjectId?: Id<"projects">;
  onRedirect: () => void;
}) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(whiteboard.title ?? "");
  const [isDeleting, setIsDeleting] = useState(false);

  const convexEditWhiteboard = useMutation(
    api.whiteboards.editWhiteboard,
  ).withOptimisticUpdate((localStore, { id, title }) => {
    if (typeof title !== "string") return;
    const currentWhiteboards = localStore.getQuery(
      api.whiteboards.listWhiteboards,
      { projectId: lastProjectId },
    );
    if (!currentWhiteboards) return;
    localStore.setQuery(
      api.whiteboards.listWhiteboards,
      { projectId: lastProjectId },
      currentWhiteboards.map((w) =>
        w._id === id ? { ...w, title, updatedAt: BigInt(Date.now()) } : w,
      ),
    );
  });

  const convexDeleteWhiteboard = useMutation(
    api.whiteboards.deleteWhiteboard,
  ).withOptimisticUpdate((localStore, { id }) => {
    const currentWhiteboards = localStore.getQuery(
      api.whiteboards.listWhiteboards,
      { projectId: lastProjectId },
    );
    if (currentWhiteboards) {
      localStore.setQuery(
        api.whiteboards.listWhiteboards,
        { projectId: lastProjectId },
        currentWhiteboards.filter((w) => w._id !== id),
      );
    }
    const limit = localStore.getQuery(
      api.whiteboards.getWhiteboardCountLimit,
      {},
    );
    if (limit) {
      localStore.setQuery(
        api.whiteboards.getWhiteboardCountLimit,
        {},
        {
          ...limit,
          currentWhiteboardCount: limit.currentWhiteboardCount - 1,
        },
      );
    }
  });

  const handleSaveTitle = async () => {
    const newTitle = editedTitle.trim();
    setIsEditing(false);
    if (newTitle && newTitle !== whiteboard.title) {
      await convexEditWhiteboard({ id: whiteboard._id, title: newTitle });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await convexDeleteWhiteboard({ id: whiteboard._id });
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditedTitle(whiteboard.title ?? "");
    setIsEditing(true);
    setMenuOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    void handleDelete();
  };

  return (
    <div className="group bg-card hover:ring-accent relative overflow-hidden rounded-lg border shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:ring-2">
      <Link
        href={`/whiteboard/${whiteboard._id}`}
        onClick={(e) => {
          if ((e.target as Element).closest(".no-link")) {
            e.preventDefault();
          } else {
            onRedirect();
          }
        }}
        className="block h-full cursor-pointer"
        aria-label={`Open whiteboard: ${whiteboard.title ?? "Untitled"}`}
      >
        <div className="relative">
          <div className="from-muted to-muted/50 relative aspect-[16/9] w-full bg-gradient-to-br">
            {whiteboard.previewUrl ? (
              <Image
                src={whiteboard.previewUrl}
                alt={whiteboard.title ?? "Whiteboard preview"}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-all duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="from-muted to-muted/50 flex h-full w-full items-center justify-center bg-gradient-to-br">
                <div className="text-muted-foreground text-center">
                  <Grid3X3 className="mx-auto mb-2 h-12 w-12 opacity-50" />
                  <p className="text-sm">No preview available</p>
                </div>
              </div>
            )}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-900 shadow-lg backdrop-blur-sm">
              Open
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-2 flex items-start justify-between gap-3">
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
                  className="no-link h-auto w-full cursor-text rounded-md border-blue-500 bg-white/10 p-1 text-base font-semibold focus:ring-2 focus:ring-blue-500"
                  maxLength={30}
                />
              ) : (
                <h3 className="text-foreground truncate text-base font-semibold">
                  {whiteboard.title ?? "Untitled"}
                </h3>
              )}
            </div>
            <div className="no-link relative flex-shrink-0">
              <DropdownMenu open={isMenuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                    aria-label="More options"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-36 rounded-lg p-1 shadow-xl"
                  align="end"
                  sideOffset={8}
                  onClick={(e) => e.stopPropagation()}
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
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-green-400"></span>
            <span>Modified {formatDate(whiteboard.updatedAt)}</span>
          </p>
        </div>
      </Link>
    </div>
  );
}

function ProjectCard({
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
  const [isDeleting, setIsDeleting] = useState(false);

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
    setIsDeleting(true);
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
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
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
  const whiteboardCountLimit = useConvexQuery(
    api.whiteboards.getWhiteboardCountLimit,
    {},
  );

  const convexCreateProject = useMutation(api.projects.createProject);
  const convexCreateWhiteboard = useMutation(api.whiteboards.createWhiteboard);

  const [newItemName, setNewItemName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);
  const [isCreatingWhiteboard, setIsCreatingWhiteboard] =
    useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
  const router = useRouter();

  const isLimitReached = whiteboardCountLimit
    ? whiteboardCountLimit.currentWhiteboardCount >=
      whiteboardCountLimit.maxWhiteboardCount
    : false;

  const handleCreateProject = async () => {
    if (isCreatingProject) return;
    const name = newItemName.trim();
    if (!name) return;

    setErrorMessage(null);
    setIsCreatingProject(true);
    try {
      const newProjectId = await convexCreateProject({
        name,
        parentProject: lastProjectId,
      });
      setNewItemName("");
      router.push(`/whiteboards/${newProjectId}`);
    } catch (error) {
      console.error("Failed to create project:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "An unknown error occurred.",
      );
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleCreateWhiteboard = async () => {
    if (isCreatingWhiteboard || isLimitReached) {
      if (isLimitReached) setShowUpgradeBanner(true);
      return;
    }

    setErrorMessage(null);
    const title = newItemName.trim();
    setIsCreatingWhiteboard(true);
    try {
      const newWhiteboardId = await convexCreateWhiteboard({
        title,
        projectId: lastProjectId,
      });
      setNewItemName("");
      router.push(`/whiteboard/${newWhiteboardId}`);
    } catch (error) {
      console.error("Failed to create whiteboard:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "An unknown error occurred.",
      );
    } finally {
      setIsCreatingWhiteboard(false);
    }
  };

  if (
    whiteboards === undefined ||
    projects === undefined ||
    isCreatingWhiteboard ||
    isRedirecting ||
    !whiteboardCountLimit
  ) {
    return <Loading />;
  }

  return (
    <div className="bg-background text-foreground min-h-screen pt-16">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold tracking-tight">
                Your Workspace
              </h1>
              <p className="text-muted-foreground text-lg">
                Create, organize, and collaborate on your ideas.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-muted rounded-lg px-3 py-2">
                <span className="text-muted-foreground text-sm font-medium">
                  {whiteboardCountLimit.currentWhiteboardCount} of{" "}
                  {whiteboardCountLimit.maxWhiteboardCount === Infinity
                    ? "∞"
                    : whiteboardCountLimit.maxWhiteboardCount}{" "}
                  boards
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-card rounded-xl border p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Create New</h2>
            <div className="flex flex-col items-start gap-4 sm:flex-row">
              <div className="relative w-full flex-1">
                <Input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleCreateWhiteboard();
                  }}
                  placeholder="New project or whiteboard name..."
                  className="bg-background focus:border-accent focus:ring-accent rounded-lg border py-3 pr-4 pl-4 text-base focus:ring-1"
                  maxLength={30}
                />
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <Button
                  onClick={handleCreateProject}
                  disabled={isCreatingProject || !newItemName.trim()}
                  variant="outline"
                  className="flex-1 rounded-lg px-4 py-3 font-medium shadow-sm transition-all hover:shadow-md sm:flex-initial"
                >
                  <Folder className="mr-2 h-4 w-4" />
                  Project
                </Button>
                <Button
                  onClick={handleCreateWhiteboard}
                  disabled={
                    isCreatingWhiteboard ||
                    isLimitReached ||
                    !newItemName.trim()
                  }
                  className="flex-1 rounded-lg px-4 py-3 font-medium shadow-sm transition-all hover:shadow-md sm:flex-initial"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Whiteboard
                </Button>
              </div>
            </div>

            {isLimitReached && !newItemName && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-800">
                  <span className="font-medium">Limit reached.</span>{" "}
                  <button
                    onClick={() => setShowUpgradeBanner(true)}
                    className="font-medium underline transition-colors hover:text-amber-900"
                  >
                    Upgrade your plan
                  </button>{" "}
                  to create more whiteboards.
                </p>
              </div>
            )}
          </div>
        </div>

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
              <ProjectBreadcrumb projectIds={projectIds} />
            </div>
            {whiteboards.length + projects.length > 0 && (
              <p className="text-muted-foreground text-sm">
                {whiteboards.length + projects.length} item
                {whiteboards.length + projects.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {(whiteboards?.length ?? 0) + (projects?.length ?? 0) === 0 ? (
            <div className="py-12 text-center">
              <div className="bg-muted mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full">
                <Grid3X3 className="text-muted-foreground h-12 w-12" />
              </div>
              <h3 className="text-foreground mb-2 text-lg font-medium">
                This folder is empty
              </h3>
              <p className="text-muted-foreground mx-auto max-w-md">
                Create your first project or whiteboard to get started.
              </p>
            </div>
          ) : (
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
          )}
        </div>
      </div>

      <UpgradeBanner
        isOpen={showUpgradeBanner}
        onCloseAction={() => setShowUpgradeBanner(false)}
        featureName="More Whiteboards"
      />
    </div>
  );
}
