"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ChevronsLeft, Share2 } from "lucide-react";
import { Authenticated, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useCopyWhiteboard } from "./utils";
import { toast } from "sonner";
import { useConvexQuery } from "~/helpers/convex";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

type Props = {
  id: Id<"whiteboards">;
};

export default function WhiteboardHeader({ id }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const whiteboard = useConvexQuery(api.whiteboards.getWhiteboard, { id });
  const user = useConvexQuery(api.users.current);

  const editWhiteboardMutation = useMutation(
    api.whiteboards.editWhiteboard,
  ).withOptimisticUpdate((localStore, args) => {
    const { id, title } = args;
    const currentWhiteboard = localStore.getQuery(
      api.whiteboards.getWhiteboard,
      { id },
    );
    if (!currentWhiteboard) return;
    localStore.setQuery(
      api.whiteboards.getWhiteboard,
      { id },
      {
        ...currentWhiteboard,
        title,
      },
    );
  });

  const setPublicStatusMutation = useMutation(
    api.whiteboards.setPublicStatus,
  ).withOptimisticUpdate((localStore, args) => {
    const { id, isPublic } = args;
    const currentWhiteboard = localStore.getQuery(
      api.whiteboards.getWhiteboard,
      { id },
    );
    if (!currentWhiteboard) return;
    localStore.setQuery(
      api.whiteboards.getWhiteboard,
      { id },
      {
        ...currentWhiteboard,
        isPublic,
      },
    );
  });

  const { copyWhiteboard, isCopying, CopyingOverlay } = useCopyWhiteboard();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleSubmit = async () => {
    if (title.trim()) {
      await editWhiteboardMutation({
        id,
        title: title.trim(),
      });
    }
    setIsEditing(false);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
      await handleTitleSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setTitle(whiteboard?.title ?? "");
    }
  };

  const startEditing = () => {
    setTitle(whiteboard?.title ?? "");
    setIsEditing(true);
  };

  const handlePublishToggle = async () => {
    if (!whiteboard) return;
    await setPublicStatusMutation({
      id,
      isPublic: !whiteboard.isPublic,
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Copied to clipboard!", {
        duration: 2000,
        position: "top-center",
      });
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <>
      <header
        className="fixed z-50 h-14 w-full backdrop-blur-sm"
        style={{
          backgroundColor: `color-mix(in oklch, var(--background) 80%, transparent)`,
        }}
      >
        <div className="mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Grid layout for consistent spacing */}
          <div className="grid h-full grid-cols-3 items-center gap-4">
            {/* Left section - Navigation */}
            <div className="flex justify-start">
              <Link
                href="/whiteboards"
                className="flex items-center gap-1 hover:underline"
              >
                <ChevronsLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Whiteboards</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </div>

            {/* Center section - Title */}
            <div className="flex justify-center">
              {whiteboard ? (
                <Input
                  value={isEditing ? title : (whiteboard?.title ?? "Untitled")}
                  onChange={handleTitleChange}
                  onBlur={handleTitleSubmit}
                  onKeyDown={handleKeyDown}
                  onClick={startEditing}
                  onFocus={startEditing}
                  className={cn(
                    "h-auto w-auto min-w-[100px] px-2 py-0.5 text-center",
                    isEditing
                      ? "border-transparent"
                      : "cursor-pointer hover:ring-2 hover:ring-gray-500",
                  )}
                  style={{
                    width: isEditing
                      ? `${Math.max(100, Math.min(300, (title.length || 1) * 8.5))}px`
                      : `${Math.max(100, Math.min(300, (whiteboard?.title ?? "Untitled").length * 8.5))}px`,
                  }}
                  readOnly={!isEditing}
                  autoFocus={isEditing}
                  maxLength={30}
                />
              ) : (
                <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
              )}
            </div>

            {/* Right section - Actions */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 md:gap-4">
              {/* Share button with consistent width */}
              <div className="flex w-8 justify-center">
                {whiteboard?.isPublic && (
                  <Button
                    onClick={handleShare}
                    title="Share whiteboard"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Publish/Copy button */}
              <Button
                onClick={
                  whiteboard?.isPublic &&
                  user &&
                  whiteboard.ownerId !== user.externalId
                    ? () => copyWhiteboard(id)
                    : handlePublishToggle
                }
                disabled={Boolean(
                  whiteboard?.isPublic &&
                    user &&
                    whiteboard.ownerId !== user.externalId &&
                    isCopying,
                )}
                className="min-w-[110px]"
                size="sm"
              >
                {whiteboard?.isPublic &&
                user &&
                whiteboard.ownerId !== user.externalId
                  ? "Copy"
                  : whiteboard?.isPublic
                    ? "Unpublish"
                    : "Publish"}
              </Button>

              {/* User button */}
              <Suspense
                fallback={
                  <div
                    className="h-7 w-7 animate-pulse rounded-full bg-gray-400"
                    style={{ animationDuration: "0.5s" }}
                  />
                }
              >
                <Authenticated>
                  <UserButton />
                </Authenticated>
              </Suspense>
            </div>
          </div>
        </div>
      </header>
      <CopyingOverlay />
    </>
  );
}
