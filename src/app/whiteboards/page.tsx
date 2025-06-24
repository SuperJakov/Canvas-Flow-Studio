"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import Loading from "../loading";
import Link from "next/link";

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

  // Add optimistic update for editing the title
  const convexEditWhiteboard = useMutation(
    api.whiteboards.editWhiteboard,
  ).withOptimisticUpdate((localStore, args) => {
    const { id, title } = args;
    // Only apply optimistic update if title is being changed
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

  // State for in-place title editing
  const [editingId, setEditingId] = useState<Id<"whiteboards"> | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const router = useRouter();

  const handleCreateWhiteboard = async () => {
    if (isCreatingWhiteboard) {
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
        error instanceof Error
          ? error.message
          : "An unknown error occurred while creating the whiteboard.",
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
        error instanceof Error
          ? error.message
          : "An unknown error occurred while deleting the whiteboard.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartEditing = (id: Id<"whiteboards">, currentTitle: string) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const handleSaveTitle = async (id: Id<"whiteboards">) => {
    const trimmedTitle = editingTitle.trim();
    const originalWhiteboard = whiteboards?.find((w) => w._id === id);

    // Don't save if title is empty or unchanged
    if (!trimmedTitle || trimmedTitle === originalWhiteboard?.title) {
      setEditingId(null);
      return;
    }

    try {
      void convexEditWhiteboard({ id, title: trimmedTitle });
    } catch (error) {
      console.error("Failed to edit whiteboard title:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update title.",
      );
    } finally {
      setEditingId(null);
    }
  };

  const formatDate = (timestamp: bigint | undefined | null): string => {
    if (!timestamp) return "N/A";
    return new Date(Number(timestamp)).toLocaleString();
  };

  if (whiteboards === undefined || isCreatingWhiteboard || isRedirecting) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-16 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold">Your Whiteboards</h1>
          </div>
        </div>

        <div className="mb-8 rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">Create New Whiteboard</h2>
          <div className="flex">
            <input
              type="text"
              value={newWhiteboardName}
              onChange={(e) => setNewWhiteboardName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleCreateWhiteboard();
                }
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
                <div
                  key={whiteboard._id}
                  className="flex flex-col justify-between rounded-lg bg-gray-700 p-4 shadow-lg"
                >
                  <div>
                    {editingId === whiteboard._id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => handleSaveTitle(whiteboard._id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            void handleSaveTitle(whiteboard._id);
                          }
                          if (e.key === "Escape") {
                            setEditingId(null);
                          }
                        }}
                        className="mb-1 w-full rounded bg-gray-600 px-2 py-1 text-lg font-medium text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="group flex cursor-pointer items-center"
                        onClick={() =>
                          handleStartEditing(
                            whiteboard._id,
                            whiteboard.title ?? "Untitled",
                          )
                        }
                      >
                        <h3 className="text-lg font-medium">
                          {whiteboard.title ?? "Untitled"}
                        </h3>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="ml-2 hidden h-4 w-4 text-gray-400 group-hover:block"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"
                          />
                        </svg>
                      </div>
                    )}
                    <p className="text-sm text-gray-400">
                      Last updated: {formatDate(whiteboard.updatedAt)}
                    </p>
                    <p className="text-sm text-gray-400">
                      Created: {formatDate(whiteboard.createdAt)}
                    </p>
                    <p className="mt-2 text-sm text-gray-300">
                      {whiteboard.nodes.length} nodes
                    </p>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <Link href={`/whiteboard/${whiteboard._id}`}>
                      <button
                        className="cursor-pointer rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-500"
                        onClick={() => setIsRedirecting(true)}
                      >
                        Open
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDeleteWhiteboard(whiteboard._id)}
                      className="cursor-pointer rounded bg-red-600 px-3 py-1 text-white hover:bg-red-500"
                      disabled={deletingId === whiteboard._id}
                    >
                      {deletingId === whiteboard._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
