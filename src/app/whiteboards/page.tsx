"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { usePopper } from "react-popper";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import Loading from "../loading";
import Link from "next/link";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import Image from "next/image";
import { MoreVertical } from "lucide-react";
import type { Doc } from "../../../convex/_generated/dataModel";

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
  const [referenceElement, setReferenceElement] =
    useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null,
  );
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-end",
    modifiers: [{ name: "offset", options: { offset: [0, 8] } }],
  });

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        menuOpen &&
        popperElement &&
        !popperElement.contains(event.target as Node) &&
        referenceElement &&
        !referenceElement.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen, popperElement, referenceElement]);

  const handleRenameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    onStartEditing(whiteboard._id, whiteboard.title ?? "Untitled");
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    onDelete(whiteboard._id);
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen((prev) => !prev);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-gray-700 shadow-lg">
      <Link
        href={`/whiteboard/${whiteboard._id}`}
        onClick={(e) => {
          if ((e.target as Element).closest(".no-link")) {
            e.preventDefault();
          } else {
            onRedirect();
          }
        }}
        className="group flex h-full cursor-pointer flex-col"
        aria-label={`Open whiteboard: ${whiteboard.title ?? "Untitled"}`}
      >
        <div className="relative block">
          <div className="relative h-40 w-full bg-gray-600">
            {whiteboard.previewUrl ? (
              <Image
                src={whiteboard.previewUrl}
                alt={whiteboard.title ?? "Whiteboard preview"}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-all duration-300 group-hover:blur-sm"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <p className="text-gray-400">Preview does not exist.</p>
              </div>
            )}
          </div>
          <div className="bg-opacity-40 absolute inset-0 flex items-center justify-center bg-gray-900 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <p className="text-lg font-semibold">Press to open</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between p-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {editingId === whiteboard._id ? (
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => onSaveTitle(whiteboard._id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSaveTitle(whiteboard._id);
                    if (e.key === "Escape") onStartEditing(null, "");
                  }}
                  className="no-link w-full cursor-text rounded bg-gray-600 px-2 py-0.5 text-base font-medium text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <h3 className="truncate py-0.5 text-base font-medium">
                  {whiteboard.title ?? "Untitled"}
                </h3>
              )}
            </div>
            <div className="no-link relative flex-shrink-0">
              <button
                ref={setReferenceElement}
                onClick={handleMenuToggle}
                className="cursor-pointer rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-600 hover:text-white"
                aria-label="More options"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              {menuOpen && (
                <div
                  ref={setPopperElement}
                  style={styles.popper}
                  {...attributes.popper}
                  className="ring-opacity-5 z-10 w-32 rounded-md bg-gray-800 shadow-lg ring-1 ring-black focus:outline-none"
                >
                  <div className="py-1">
                    <button
                      onClick={handleRenameClick}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      Rename
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 hover:text-red-300"
                      disabled={deletingId === whiteboard._id}
                    >
                      {deletingId === whiteboard._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400">
            {formatDate(whiteboard.updatedAt)}
          </p>
        </div>
      </Link>
    </div>
  );
}

export default function WhiteboardsClient() {
  const whiteboards = useQuery(api.whiteboards.listWhiteboards);
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

  const router = useRouter();

  const handleCreateWhiteboard = async () => {
    if (isCreatingWhiteboard) return;
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

  if (whiteboards === undefined || isCreatingWhiteboard || isRedirecting) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-16 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Whiteboards</h1>
        </div>

        <div className="mb-8 rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">Create New Whiteboard</h2>
          <div className="flex">
            <input
              type="text"
              value={newWhiteboardName}
              onChange={(e) => setNewWhiteboardName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleCreateWhiteboard();
              }}
              placeholder="Whiteboard Name"
              className="mr-2 flex-grow rounded bg-gray-700 px-4 py-2 text-white"
              maxLength={30}
            />
            <button
              onClick={handleCreateWhiteboard}
              className="cursor-pointer rounded bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-500"
            >
              Create
            </button>
          </div>
        </div>

        <div className="rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">Your Whiteboards</h2>
          {errorMessage && (
            <div className="mb-4 rounded-md border border-red-600 bg-red-100 p-3 text-sm text-red-800">
              <p className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                {errorMessage}
              </p>
            </div>
          )}
          {(whiteboards?.length ?? 0) === 0 ? (
            <p className="text-gray-400">
              No whiteboards found. Create one to get started!
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}
