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
import { MoreVertical, Plus, Grid3X3 } from "lucide-react";
import type { Doc } from "../../../convex/_generated/dataModel";
import UpgradeBanner from "../whiteboard/UpgradeBanner";
import { useConvexQuery } from "~/helpers/convex";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "~/components/ui/breadcrumb";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

const formatDate = (timestamp: bigint | undefined | null): string => {
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
              <Popover open={menuOpen} onOpenChange={setMenuOpen}>
                <PopoverTrigger asChild>
                  <Button
                    className="h-8 w-8 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="More options"
                    variant="ghost"
                    size="sm"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-36 rounded-lg border-none p-0"
                  align="end"
                  side="top"
                  sideOffset={8}
                >
                  <div className="py-0">
                    <Button
                      onClick={handleRenameClick}
                      className="hover:bg-accent hover:text-accent-foreground w-full justify-start rounded-none rounded-tl-lg rounded-tr-lg px-3 py-2 text-sm"
                      variant="ghost"
                    >
                      Rename
                    </Button>
                    <Button
                      onClick={handleDeleteClick}
                      className="hover:text-accent-foreground w-full justify-start rounded-none rounded-br-lg rounded-bl-lg px-3 py-2 text-sm"
                      disabled={deletingId === whiteboard._id}
                      variant="ghost"
                    >
                      {deletingId === whiteboard._id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
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

export default function WhiteboardsClient() {
  const whiteboards = useConvexQuery(api.whiteboards.listWhiteboards);
  const whiteboardCountLimit = useConvexQuery(
    api.whiteboards.getWhiteboardCountLimit,
  );

  const convexCreateWhiteboard = useMutation(api.whiteboards.createWhiteboard);
  const convexDeleteWhiteboard = useMutation(
    api.whiteboards.deleteWhiteboard,
  ).withOptimisticUpdate((localStore, args) => {
    const { id } = args;
    const currentWhiteboards = localStore.getQuery(
      api.whiteboards.listWhiteboards,
    );
    if (!currentWhiteboards) return;
    localStore.setQuery(
      api.whiteboards.listWhiteboards,
      {},
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
      {},
    );
    if (!currentWhiteboards) return;

    localStore.setQuery(
      api.whiteboards.listWhiteboards,
      {},
      currentWhiteboards.map((w) =>
        w._id === id ? { ...w, title: title } : w,
      ),
    );
  });

  const [newWhiteboardName, setNewWhiteboardName] = useState("");
  const [deletingId, setDeletingId] = useState<Id<"whiteboards"> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreatingWhiteboard, setIsCreatingWhiteboard] =
    useState<boolean>(false);
  const [editingId, setEditingId] = useState<Id<"whiteboards"> | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);

  const router = useRouter();

  // Check if limit is reached
  const isLimitReached = whiteboardCountLimit
    ? whiteboardCountLimit.currentWhiteboardCount >=
      whiteboardCountLimit.maxWhiteboardCount
    : false;

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
      const newWhiteboardId = await convexCreateWhiteboard({ title });
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
              <h2 className="text-xl font-semibold">Create New Whiteboard</h2>
            </div>

            <div className="space-y-4">
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
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="/whiteboards"
                      className="text-muted-foreground text-xl"
                    >
                      Whiteboards
                    </BreadcrumbLink>
                  </BreadcrumbItem>

                  {/* <BreadcrumbSeparator />

                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-xl text-muted-foreground">
                      Examples
                    </BreadcrumbPage>
                  </BreadcrumbItem> */}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            {whiteboards && whiteboards.length > 0 && (
              <p className="text-muted-foreground text-sm">
                {whiteboards.length} whiteboard
                {whiteboards.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {(whiteboards?.length ?? 0) === 0 ? (
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
              {whiteboards.map((whiteboard) => (
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
