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
  const convexDeleteWhiteboard = useMutation(api.whiteboards.deleteWhiteboard);

  const [newWhiteboardName, setNewWhiteboardName] = useState("");
  const [deletingId, setDeletingId] = useState<Id<"whiteboards"> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleCreateWhiteboard = async () => {
    setErrorMessage(null);
    const title = newWhiteboardName.trim() || "Untitled Whiteboard";
    try {
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

  const formatDate = (timestamp: bigint | undefined | null): string => {
    if (!timestamp) return "N/A";
    return new Date(Number(timestamp)).toLocaleString();
  };

  if (whiteboards === undefined) {
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
                    {" "}
                    <h3 className="text-lg font-medium">
                      {whiteboard.title ?? "Untitled"}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Last updated: {formatDate(whiteboard.updatedAt)}
                    </p>
                    <p className="text-sm text-gray-400">
                      Created: {formatDate(whiteboard.createdAt)}
                    </p>
                    <p className="mt-2 text-sm text-gray-300">
                      {whiteboard.nodes.length} nodes ·{" "}
                      {whiteboard.edges.length} connections
                    </p>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <Link href={`/whiteboard/${whiteboard._id}`}>
                      <button className="cursor-pointer rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-500">
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
