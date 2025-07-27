"use client";

import { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Plus, Grid3X3, Folder, AlertCircle } from "lucide-react";
import Loading from "../loading";
import UpgradeBanner from "../whiteboard/UpgradeBanner";
import ProjectBreadcrumb from "./_components/ProjectBreadcrumb";
import { useConvexQuery } from "~/helpers/convex";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import WhiteboardCard from "./WhiteboardCard";
import ProjectCard from "./ProjectCard";

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
  const projectCountLimit = useConvexQuery(api.projects.getProjectCountLimit);
  const isProjectLimitReached = projectCountLimit
    ? projectCountLimit.currentProjectCount >= projectCountLimit.maxProjectCount
    : false;

  const whiteboards = useConvexQuery(api.whiteboards.listWhiteboards, {
    projectId: lastProjectId,
  });
  const whiteboardCountLimit = useConvexQuery(
    api.whiteboards.getWhiteboardCountLimit,
    {},
  );
  const isWhiteboardLimitReached = whiteboardCountLimit
    ? whiteboardCountLimit.currentWhiteboardCount >=
      whiteboardCountLimit.maxWhiteboardCount
    : false;

  const convexCreateProject = useMutation(api.projects.createProject);
  const convexCreateWhiteboard = useMutation(api.whiteboards.createWhiteboard);

  const [newItemName, setNewItemName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);
  const [isCreatingWhiteboard, setIsCreatingWhiteboard] =
    useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [isProjectPopoverOpen, setProjectPopoverOpen] = useState(false);
  const [isWhiteboardPopoverOpen, setWhiteboardPopoverOpen] = useState(false);

  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
  const [featureName, setFeatureName] = useState("");

  const router = useRouter();

  function showUpgradeBannerFn(featureName: string) {
    setProjectPopoverOpen(false);
    setWhiteboardPopoverOpen(false);

    setFeatureName(featureName);
    setShowUpgradeBanner(true);
  }

  const handleCreateProject = async () => {
    if (isCreatingProject) return;
    if (isProjectLimitReached) return showUpgradeBannerFn("More Projects");
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
      const currentUrl = new URL(window.location.href);
      const newPath = `${currentUrl.pathname}/${newProjectId}`;

      router.push(newPath);
    } catch (error) {
      console.error("Failed to create project:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "An unknown error occurred.",
      );
    } finally {
      // Don't set this because redirect will unset this
      // setIsCreatingProject(false);
    }
  };

  const handleCreateWhiteboard = async () => {
    if (isCreatingWhiteboard) return;
    if (isWhiteboardLimitReached)
      return showUpgradeBannerFn("More Whiteboards");

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
      // Don't set this because redirect will unset this
      // setIsCreatingWhiteboard(false);
    }
  };

  if (
    whiteboards === undefined ||
    projects === undefined ||
    isCreatingWhiteboard ||
    isCreatingProject ||
    isRedirecting ||
    !whiteboardCountLimit
  ) {
    return <Loading />;
  }

  if (whiteboards === null) redirect("/whiteboards");

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
              <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                {isProjectLimitReached ? (
                  <Popover
                    open={isProjectPopoverOpen}
                    onOpenChange={setProjectPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <span className="inline-block flex-1 sm:flex-initial">
                        <Button
                          disabled
                          variant="outline"
                          className="w-full rounded-lg px-4 py-3 font-medium shadow-sm transition-all"
                        >
                          <Folder className="mr-2 h-4 w-4" />
                          Project
                        </Button>
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-content-available-width)] max-w-sm border-none bg-transparent p-0 shadow-none">
                      <div className="bg-destructive/90 text-destructive-foreground border-border rounded-lg border-2 p-3">
                        <p className="text-sm">
                          <span className="font-medium">
                            Project limit reached.
                          </span>{" "}
                          <button
                            onClick={() => showUpgradeBannerFn("More Projects")}
                            className="hover:text-destructive-foreground/70 cursor-pointer underline transition-colors"
                          >
                            Upgrade your plan
                          </button>{" "}
                          to create more projects.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Button
                    onClick={handleCreateProject}
                    disabled={isCreatingProject || !newItemName.trim()}
                    variant="outline"
                    className="flex-1 rounded-lg px-4 py-3 font-medium shadow-sm transition-all hover:shadow-md sm:flex-initial"
                  >
                    <Folder className="mr-2 h-4 w-4" />
                    Project
                  </Button>
                )}
                {isWhiteboardLimitReached ? (
                  <Popover
                    open={isWhiteboardPopoverOpen}
                    onOpenChange={setWhiteboardPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <span className="inline-block flex-1 sm:flex-initial">
                        <Button
                          disabled
                          className="w-full rounded-lg px-4 py-3 font-medium shadow-sm transition-all"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Whiteboard
                        </Button>
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-content-available-width)] max-w-sm border-none bg-transparent p-0 shadow-none">
                      <div className="bg-destructive/90 text-destructive-foreground border-border rounded-lg border-2 p-3">
                        <p className="text-sm">
                          <span className="font-medium">
                            Whiteboard limit reached.
                          </span>{" "}
                          <button
                            onClick={() =>
                              showUpgradeBannerFn("More Whiteboards")
                            }
                            className="hover:text-destructive-foreground/70 cursor-pointer underline transition-colors"
                          >
                            Upgrade your plan
                          </button>{" "}
                          to create more whiteboards.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Button
                    onClick={handleCreateWhiteboard}
                    disabled={isCreatingWhiteboard || !newItemName.trim()}
                    className="flex-1 rounded-lg px-4 py-3 font-medium shadow-sm transition-all hover:shadow-md sm:flex-initial"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Whiteboard
                  </Button>
                )}
              </div>
            </div>
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
        featureName={featureName}
      />
    </div>
  );
}
