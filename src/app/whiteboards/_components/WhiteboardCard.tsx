"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import Link from "next/link";
import Image from "next/image";
import { MoreVertical, Grid3X3 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { formatDate } from "~/helpers/formatDate";

export default function WhiteboardCard({
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          inputRef.current?.focus();
          inputRef.current?.select();
        });
      });
    }
  }, [isEditing]);

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
    await convexDeleteWhiteboard({ id: whiteboard._id });
  };

  const handleRenameClick = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    requestAnimationFrame(() => {
      setEditedTitle(whiteboard.title ?? "");
      setIsEditing(true);
    });
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
                  ref={inputRef}
                  onClick={(e) => {
                    e.preventDefault(); // Prevent link redirecting
                    e.stopPropagation();
                  }}
                  className="no-link h-auto w-full cursor-text rounded-md bg-white/10 p-1 text-base font-semibold"
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
                    className={`h-8 w-8 rounded-full p-0 transition-opacity ${isMenuOpen ? "opacity-100" : "pointer-fine:opacity-0"} group-hover:opacity-100 focus:opacity-100`}
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
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <DropdownMenuItem
                    onSelect={handleRenameClick}
                    className="cursor-pointer"
                  >
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDeleteClick}
                    className="cursor-pointer"
                    variant="destructive"
                  >
                    Delete
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
