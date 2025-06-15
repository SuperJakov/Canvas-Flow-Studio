import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useCopyWhiteboard } from "./utils";

type Props = {
  id: Id<"whiteboards">;
};

export default function SharingPopup({ id }: Props) {
  const whiteboardData = useQuery(api.whiteboards.getWhiteboard, { id });
  const user = useQuery(api.users.current);
  const { copyWhiteboard, isCopying, CopyingOverlay } = useCopyWhiteboard();

  if (!whiteboardData || !user) return null;

  const isShared =
    whiteboardData.isPublic && whiteboardData.ownerId !== user.externalId;

  if (!isShared) return null;

  return (
    <>
      <div className="fixed right-4 bottom-4 z-50 rounded-lg bg-gray-800 p-6 shadow-lg">
        <div className="mb-3 text-base text-gray-300">
          This is a shared whiteboard
        </div>
        <button
          className="cursor-pointer rounded bg-blue-500 px-5 py-2.5 text-base text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => copyWhiteboard(id)}
          disabled={isCopying}
        >
          Copy to My Whiteboards
        </button>
      </div>
      <CopyingOverlay />
    </>
  );
}
