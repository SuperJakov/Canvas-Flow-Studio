// WhiteboardHeader.tsx
"use client";

import { Suspense, useState, useEffect, useRef } from "react";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";

type ShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function ShareDialog({ open, onOpenChange }: ShareDialogProps) {
  const shareInput = useRef<HTMLInputElement>(null);

  const selectShareInput = () => shareInput.current?.select();

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Copied to clipboard!", {
        duration: 2000,
        position: "top-center",
      });
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy to clipboard");
    } finally {
      onOpenChange(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    selectShareInput();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this whiteboard</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2">
          <Input
            id="share-url-input"
            value={typeof window !== "undefined" ? window.location.href : ""}
            readOnly
            className="flex-1"
            onFocus={selectShareInput}
            onClick={selectShareInput}
            ref={shareInput}
          />
          <Button size="sm" onClick={copyLink}>
            Copy
          </Button>
        </div>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type EditableTitleProps = {
  isEditing: boolean;
  title: string;
  whiteboardTitle: string | null | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClick: () => void;
  onFocus: () => void;
};

function EditableTitle({
  isEditing,
  title,
  whiteboardTitle,
  onChange,
  onBlur,
  onKeyDown,
  onClick,
  onFocus,
}: EditableTitleProps) {
  return (
    <Input
      value={isEditing ? title : (whiteboardTitle ?? "Untitled")}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onClick={onClick}
      onFocus={onFocus}
      className={cn(
        "field-sizing-content h-auto w-auto min-w-[100px] px-2 py-0.5 text-center",
        isEditing
          ? "border-transparent"
          : "cursor-pointer hover:ring-2 hover:ring-gray-500",
      )}
      readOnly={!isEditing}
      autoFocus={isEditing}
      maxLength={30}
    />
  );
}

type Props = { id: Id<"whiteboards"> };

export default function WhiteboardHeader({ id }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
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
      { ...currentWhiteboard, title },
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
      { ...currentWhiteboard, isPublic },
    );
  });

  const { copyWhiteboard, isCopying, CopyingOverlay } = useCopyWhiteboard();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTitle(e.target.value);

  const handleTitleSubmit = async () => {
    if (title.trim()) {
      await editWhiteboardMutation({ id, title: title.trim() });
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
    await setPublicStatusMutation({ id, isPublic: !whiteboard.isPublic });
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
          <div className="grid h-full grid-cols-3 items-center gap-4">
            {/* Left */}
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

            {/* Centre */}
            <div className="flex justify-center">
              {whiteboard && (
                <EditableTitle
                  isEditing={isEditing}
                  title={title}
                  whiteboardTitle={whiteboard.title}
                  onChange={handleTitleChange}
                  onBlur={handleTitleSubmit}
                  onKeyDown={handleKeyDown}
                  onClick={startEditing}
                  onFocus={startEditing}
                />
              )}
            </div>

            {/* Right */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 md:gap-4">
              <div className="flex w-8 justify-center">
                {whiteboard?.isPublic && (
                  <Button
                    onClick={() => setShareOpen(true)}
                    title="Share whiteboard"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

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

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} />
      <CopyingOverlay />
    </>
  );
}
