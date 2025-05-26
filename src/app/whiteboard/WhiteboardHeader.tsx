"use client";

import { useState } from "react";
import Link from "next/link";
import { UserButton, SignedIn } from "@clerk/nextjs";
import { ChevronsLeft } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

type Props = {
  id: string;
};

export default function WhiteboardHeader({ id }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const whiteboard = useQuery(api.whiteboards.getWhiteboard, {
    id: id as Id<"whiteboards">,
  });
  const editWhiteboardMutation = useMutation(api.whiteboards.editWhiteboard);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleSubmit = async () => {
    if (title.trim()) {
      await editWhiteboardMutation({
        id: id as Id<"whiteboards">,
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

  return (
    <header className="fixed z-50 h-14 w-full bg-gray-900/80 backdrop-blur-sm">
      <div className="container mx-auto h-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-full items-center justify-between">
          <div className="flex items-center text-white">
            <Link href="/whiteboards" className="flex items-center gap-1">
              <ChevronsLeft />
              <span>Whiteboards</span>
            </Link>
          </div>{" "}
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
                className={`field-sizing-content min-w-40 rounded bg-transparent px-2 text-center text-white ${
                  isEditing
                    ? "ring-2 ring-blue-500 outline-none"
                    : "cursor-pointer hover:text-white/80 hover:ring-2 hover:ring-gray-500"
                }`}
                readOnly={!isEditing}
                autoFocus={isEditing}
              />
            ) : null}
          </div>
          <div className="flex items-center space-x-4">
            <button className="h-8 cursor-pointer rounded bg-blue-500 px-4 text-white">
              Publish
            </button>
            <div className="flex items-center space-x-4">
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
