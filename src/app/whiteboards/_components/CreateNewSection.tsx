"use client";

import { api } from "convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Plus, Folder } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useConvexQuery } from "~/helpers/convex";
import Loading from "~/app/loading";
import { useAtom } from "jotai";
import { errorMessageAtom, upgradeBannerAtom } from "../atoms";
import type { Route } from "next";

type Props = {
  lastProjectId: Id<"projects"> | undefined;
};

export default function CreateNewSection({ lastProjectId }: Props) {
  const [, setUpgradeBanner] = useAtom(upgradeBannerAtom);
  const [, setErrorMessage] = useAtom(errorMessageAtom);
  const projectCountLimit = useConvexQuery(api.projects.getProjectCountLimit);
  const isProjectLimitReached = projectCountLimit
    ? projectCountLimit.currentProjectCount >= projectCountLimit.maxProjectCount
    : false;
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
  const [isProjectPopoverOpen, setProjectPopoverOpen] = useState(false);
  const [isWhiteboardPopoverOpen, setWhiteboardPopoverOpen] = useState(false);

  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);
  const [isCreatingWhiteboard, setIsCreatingWhiteboard] =
    useState<boolean>(false);

  const router = useRouter();

  function showUpgradeBannerFn(featureName: string) {
    setProjectPopoverOpen(false);
    setWhiteboardPopoverOpen(false);

    setUpgradeBanner({
      featureName,
      isOpen: true,
    });
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
      const newPath = `${currentUrl.pathname}/${newProjectId}` as Route;

      void router.push(newPath);
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
      void router.push(`/whiteboard/${newWhiteboardId}`);
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

  if (!whiteboardCountLimit || isCreatingWhiteboard || isCreatingProject)
    return <Loading />;

  return (
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
                        onClick={() => showUpgradeBannerFn("More Whiteboards")}
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
  );
}
