"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import Loading from "../loading";
import Link from "next/link";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import Image from "next/image";
import { MoreVertical, Plus, Grid3X3, Folder } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { Doc } from "../../../convex/_generated/dataModel";
import UpgradeBanner from "../whiteboard/UpgradeBanner";
import { useConvexQuery } from "~/helpers/convex";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import ProjectBreadcrumb from "./_components/ProjectBreadcrumb";

const formatDate = (timestamp: bigint | number | undefined | null): string => {
  if (!timestamp) return "N/A";
  const date = new Date(Number(timestamp));
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return formatDistanceToNow(date, { addSuffix: true });
};

function WhiteboardCard({
  whiteboard,
  editingId,
  editingTitle,
  deletingId,
  onStartEditing,
  onSaveTitle,
  setEditingTitle,
  onDelete,
  onRedirect,
}: {
  whiteboard: Doc<"whiteboards">;
  editingId: Id<"whiteboards"> | null;
  editingTitle: string;
  deletingId: Id<"whiteboards"> | null;
  onStartEditing: (id: Id<"whiteboards"> | null, title: string) => void;
  onSaveTitle: (id: Id<"whiteboards">) => void;
  setEditingTitle: (title: string) => void;
  onDelete: (id: Id<"whiteboards">) => void;
  onRedirect: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const handleScroll = () => {
      setMenuOpen(false);
    };

    // Listen for scroll events on window and any scrollable parent
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [menuOpen]);

  const handleRenameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    onStartEditing(whiteboard._id, whiteboard.title ?? "Untitled");
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    onDelete(whiteboard._id);
  };

  return (
    <div className="group bg-card hover:border-accent relative overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md">
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
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="rounded-lg bg-white/90 px-4 py-2 shadow-lg backdrop-blur-sm">
              <p className="text-sm font-medium text-gray-900">Click to open</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {editingId === whiteboard._id ? (
                <Input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => onSaveTitle(whiteboard._id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSaveTitle(whiteboard._id);
                    if (e.key === "Escape") onStartEditing(null, "");
                  }}
                  className="no-link h-auto w-full cursor-text border-0 bg-transparent p-0 text-base font-semibold focus:border-0 focus:ring-0"
                  autoFocus
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  maxLength={30}
                />
              ) : (
                <h3 className="text-foreground truncate text-base font-semibold">
                  {whiteboard.title ?? "Untitled"}
                </h3>
              )}
            </div>
            <div className="no-link relative flex-shrink-0">
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="h-8 w-8 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="More options"
                    variant="ghost"
                    size="sm"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-36 rounded-lg p-1"
                  align="end"
                  sideOffset={8}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <DropdownMenuItem
                    onClick={handleRenameClick}
                    className="cursor-pointer"
                  >
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDeleteClick}
                    className="cursor-pointer text-red-500"
                    disabled={deletingId === whiteboard._id}
                  >
                    {deletingId === whiteboard._id ? "Deleting..." : "Delete"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="text-muted-foreground flex items-center gap-1 text-sm">
            <span className="bg-accent h-2 w-2 rounded-full"></span>
            Modified {formatDate(whiteboard.updatedAt)}
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
        currentProjects.map((p) => (p._id === projectId ? { ...p, name } : p)),
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

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(project.name);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleEdit = async () => {
    if (!editedTitle?.trim()) return;
    await convexEditProject({ projectId: project._id, name: editedTitle });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await convexDeleteProject({ projectId: project._id });
  };

  const currentPath = projectIds
    ? `/whiteboards/${projectIds.join("/")}`
    : "/whiteboards";
  const href = `${currentPath}/${project._id}`;

  return (
    <div className="group bg-card relative overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md">
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
          <div className="from-muted to-muted/50 relative aspect-[16/9] w-full bg-gradient-to-br">
            <div className="flex h-full w-full items-center justify-center">
              <Folder className="h-16 w-16 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={handleEdit}
                  onKeyDown={(e) => e.key === "Enter" && handleEdit()}
                  autoFocus
                  className="border-accent no-link bg-transparent text-base focus:ring-1"
                  maxLength={20}
                />
              ) : (
                <p className="truncate text-lg font-medium">
                  {project.name ?? "Untitled"}
                </p>
              )}
            </div>
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                onClick={(e) => e.stopPropagation()}
                sideOffset={5}
                align="end"
              >
                <DropdownMenuItem
                  onClick={() => {
                    setIsEditing(true);
                    setIsDropdownOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="cursor-pointer text-red-500"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
  projectIds?: Id<"projects">[]; // We need all projects we've ever seen  for the breadcrumb
};

export default function WhiteboardsClient({ projectIds }: Props) {
  const lastProjectId = projectIds
    ? projectIds[projectIds.length - 1]
    : undefined;
  const projects = useConvexQuery(api.projects.getProjects, {
    projectId: lastProjectId,
  });
  const whiteboards = useConvexQuery(api.whiteboards.listWhiteboards, {
    projectId: lastProjectId, // This is the project id we're currently viewing
  });

  const convexCreateProject = useMutation(api.projects.createProject);

  const convexCreateWhiteboard = useMutation(api.whiteboards.createWhiteboard);
  const convexDeleteWhiteboard = useMutation(
    api.whiteboards.deleteWhiteboard,
  ).withOptimisticUpdate((localStore, args) => {
    const { id } = args;
    const currentWhiteboards = localStore.getQuery(
      api.whiteboards.listWhiteboards,
      {
        projectId: lastProjectId, // This is the project id we're currently viewing
      },
    );
    if (!currentWhiteboards) return;
    localStore.setQuery(
      api.whiteboards.listWhiteboards,
      {
        projectId: lastProjectId,
      },
      currentWhiteboards.filter((whiteboard) => whiteboard._id !== id),
    );

    const currentWhiteboardLimit = localStore.getQuery(
      api.whiteboards.getWhiteboardCountLimit,
      {},
    );
    if (!currentWhiteboardLimit) return;
    localStore.setQuery(
      api.whiteboards.getWhiteboardCountLimit,
      {},
      {
        ...currentWhiteboardLimit,
        currentWhiteboardCount:
          currentWhiteboardLimit.currentWhiteboardCount - 1,
      },
    );
  });

  const convexEditWhiteboard = useMutation(
    api.whiteboards.editWhiteboard,
  ).withOptimisticUpdate((localStore, args) => {
    const { id, title } = args;
    if (typeof title !== "string") return;

    const currentWhiteboards = localStore.getQuery(
      api.whiteboards.listWhiteboards,
      {
        projectId: lastProjectId,
      },
    );
    if (!currentWhiteboards) return;

    localStore.setQuery(
      api.whiteboards.listWhiteboards,
      {
        projectId: lastProjectId,
      },
      currentWhiteboards.map((w) =>
        w._id === id ? { ...w, title: title } : w,
      ),
    );
  });

  const [newProjectName, setNewProjectName] = useState("");
  const [newWhiteboardName, setNewWhiteboardName] = useState("");
  const [deletingId, setDeletingId] = useState<Id<"whiteboards"> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);
  const [isCreatingWhiteboard, setIsCreatingWhiteboard] =
    useState<boolean>(false);
  const [editingId, setEditingId] = useState<Id<"whiteboards"> | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);

  const router = useRouter();

  // Check if limit is reached
  const whiteboardCountLimit = useConvexQuery(
    api.whiteboards.getWhiteboardCountLimit,
    {},
  );
  const isLimitReached = whiteboardCountLimit
    ? whiteboardCountLimit.currentWhiteboardCount >=
      whiteboardCountLimit.maxWhiteboardCount
    : false;

  const handleCreateProject = async () => {
    if (isCreatingProject) return;
    const name =
      newProjectName.trim() !== "" ? newProjectName.trim() : "Untitled";
    if (!name) return;

    setErrorMessage(null);
    try {
      setIsCreatingProject(true);
      const newProjectId = await convexCreateProject({
        name,
        parentProject: lastProjectId,
      });
      setNewProjectName("");
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
    if (isCreatingWhiteboard) return;

    // Check if limit is reached and show upgrade banner
    if (isLimitReached) {
      setShowUpgradeBanner(true);
      return;
    }

    setErrorMessage(null);
    const title = newWhiteboardName.trim();
    try {
      setIsCreatingWhiteboard(true);
      const newWhiteboardId = await convexCreateWhiteboard({
        title,
        projectId: lastProjectId,
      });
      setNewWhiteboardName("");
      if (!newWhiteboardId) {
        setErrorMessage(
          "Failed to create whiteboard: No whiteboard ID returned.",
        );
        return;
      }
      router.push(`/whiteboard/${newWhiteboardId}`);
    } catch (error) {
      console.error("Failed to create whiteboard:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "An unknown error occurred.",
      );
      setIsCreatingWhiteboard(false);
    }
  };

  const handleDeleteWhiteboard = async (id: Id<"whiteboards">) => {
    setErrorMessage(null);
    setDeletingId(id);
    try {
      await convexDeleteWhiteboard({ id });
    } catch (error) {
      console.error("Failed to delete whiteboard:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "An unknown error occurred.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartEditing = (
    id: Id<"whiteboards"> | null,
    currentTitle: string,
  ) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const handleSaveTitle = async (id: Id<"whiteboards">) => {
    const trimmedTitle = editingTitle.trim();
    const originalWhiteboard = whiteboards?.find((w) => w._id === id);

    if (!trimmedTitle || trimmedTitle === originalWhiteboard?.title) {
      setEditingId(null);
      return;
    }

    try {
      await convexEditWhiteboard({ id, title: trimmedTitle });
    } catch (error) {
      console.error("Failed to edit whiteboard title:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update title.",
      );
    } finally {
      setEditingId(null);
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
        {/* Hero section */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold tracking-tight">
                Your Whiteboards
              </h1>
              <p className="text-muted-foreground text-lg">
                Create, organize, and collaborate on your ideas
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-muted rounded-lg px-3 py-2">
                <span className="text-muted-foreground text-sm font-medium">
                  {whiteboardCountLimit.currentWhiteboardCount} of{" "}
                  {whiteboardCountLimit.maxWhiteboardCount === Infinity
                    ? "∞"
                    : whiteboardCountLimit.maxWhiteboardCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Create new whiteboard section */}
        <div className="mb-8">
          <div className="bg-card rounded-xl border p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Create New</h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleCreateProject();
                    }}
                    placeholder="Enter project name..."
                    className="bg-background focus:border-accent focus:ring-accent rounded-lg border py-3 pr-4 pl-4 text-base focus:ring-1"
                    maxLength={30}
                  />
                </div>
                <Button
                  onClick={handleCreateProject}
                  className="rounded-lg px-6 py-3 font-medium shadow-sm transition-all hover:shadow-md"
                  disabled={isCreatingProject}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    value={newWhiteboardName}
                    onChange={(e) => setNewWhiteboardName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleCreateWhiteboard();
                    }}
                    placeholder="Enter whiteboard name..."
                    className="bg-background focus:border-accent focus:ring-accent rounded-lg border py-3 pr-4 pl-4 text-base focus:ring-1"
                    maxLength={30}
                    disabled={isLimitReached}
                  />
                </div>
                <Button
                  onClick={handleCreateWhiteboard}
                  className="rounded-lg px-6 py-3 font-medium shadow-sm transition-all hover:shadow-md"
                  disabled={isLimitReached}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create
                </Button>
              </div>

              {isLimitReached && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">
                    <span className="font-medium">Limit reached:</span>{" "}
                    You&apos;ve created{" "}
                    {whiteboardCountLimit.maxWhiteboardCount} whiteboards.{" "}
                    <button
                      onClick={() => setShowUpgradeBanner(true)}
                      className="font-medium underline transition-colors hover:text-amber-900"
                    >
                      Upgrade your plan
                    </button>{" "}
                    to create more.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-red-800">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="font-medium">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Whiteboards grid */}
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div className="mb-4">
              <ProjectBreadcrumb projectIds={projectIds} />
            </div>
            {whiteboards &&
              projects &&
              whiteboards.length + projects.length > 0 && (
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
                No whiteboards yet
              </h3>
              <p className="text-muted-foreground mx-auto max-w-md">
                Create your first whiteboard to start brainstorming, sketching,
                and collaborating on ideas.
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
                  editingId={editingId}
                  editingTitle={editingTitle}
                  deletingId={deletingId}
                  onStartEditing={handleStartEditing}
                  onSaveTitle={handleSaveTitle}
                  setEditingTitle={setEditingTitle}
                  onDelete={handleDeleteWhiteboard}
                  onRedirect={() => setIsRedirecting(true)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Banner */}
      <UpgradeBanner
        isOpen={showUpgradeBanner}
        onCloseAction={() => setShowUpgradeBanner(false)}
        featureName="More Whiteboards"
      />
    </div>
  );
}
