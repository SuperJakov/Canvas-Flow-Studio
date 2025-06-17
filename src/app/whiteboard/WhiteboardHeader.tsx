"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ChevronsLeft, Share2 } from "lucide-react";
import { Authenticated, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useCopyWhiteboard } from "./utils";
import toast from "react-hot-toast";

type Props = {
  id: Id<"whiteboards">;
};

export default function WhiteboardHeader({ id }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const whiteboard = useQuery(api.whiteboards.getWhiteboard, { id });
  const user = useQuery(api.users.current);
  const editWhiteboardMutation = useMutation(api.whiteboards.editWhiteboard);
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
        style: {
          background: "#1f2937",
          color: "#fff",
        },
      });
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <>
      <header className="fixed z-50 h-14 w-full bg-gray-900/80 text-white backdrop-blur-sm">
        <div className="container mx-auto h-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-full items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/whiteboards"
                className="flex items-center gap-1 hover:underline"
              >
                <ChevronsLeft />
                <span>Whiteboards</span>
              </Link>
            </div>
            <div>
              {whiteboard ? (
                <input
                  type="text"
                  value={isEditing ? title : (whiteboard?.title ?? "Untitled")}
                  onChange={handleTitleChange}
                  onBlur={handleTitleSubmit}
                  onKeyDown={handleKeyDown}
                  onClick={startEditing}
                  onFocus={startEditing}
                  className={`field-sizing-content max-w-[30vw] min-w-40 rounded bg-transparent px-2 text-center text-white ${
                    isEditing
                      ? "ring-2 ring-blue-500 outline-none"
                      : "cursor-pointer hover:text-white/80 hover:ring-2 hover:ring-gray-500"
                  }`}
                  readOnly={!isEditing}
                  autoFocus={isEditing}
                  maxLength={30}
                />
              ) : null}
            </div>
            <div className="flex items-center gap-4">
              <div className="min-w-[32px]">
                {whiteboard?.isPublic && (
                  <button
                    onClick={handleShare}
                    className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded transition-colors hover:bg-gray-700"
                    title="Share whiteboard"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                )}
              </div>
              {whiteboard?.isPublic &&
              user &&
              whiteboard.ownerId !== user.externalId ? (
                <button
                  onClick={() => copyWhiteboard(id)}
                  disabled={isCopying}
                  className="h-8 min-w-[110px] cursor-pointer rounded bg-blue-500 px-4 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Copy
                </button>
              ) : whiteboard?.isPublic ? (
                <button
                  onClick={handlePublishToggle}
                  className="h-8 min-w-[110px] cursor-pointer rounded bg-blue-500 px-4 text-white hover:bg-blue-600"
                >
                  Unpublish
                </button>
              ) : (
                <button
                  onClick={handlePublishToggle}
                  className="h-8 min-w-[110px] cursor-pointer rounded bg-blue-500 px-4 text-white hover:bg-blue-600"
                >
                  Publish
                </button>
              )}

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
