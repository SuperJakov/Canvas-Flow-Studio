import { Button } from "~/components/ui/button";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useCopyWhiteboard } from "./utils";
import { useConvexQuery } from "~/helpers/convex";

type Props = {
  id: Id<"whiteboards">;
};

export default function SharingPopup({ id }: Props) {
  const whiteboardData = useConvexQuery(api.whiteboards.getWhiteboard, { id });
  const user = useConvexQuery(api.users.current);
  const { copyWhiteboard, isCopying, CopyingOverlay } = useCopyWhiteboard();

  if (!whiteboardData || !user) return null;

  const isShared =
    whiteboardData.isPublic && whiteboardData.ownerId !== user.externalId;

  if (!isShared) return null;

  return (
    <>
      <div className="fixed right-4 bottom-4 z-50 rounded-lg bg-[var(--background)] p-6 shadow-lg">
        <div className="mb-3 text-base">This is a shared whiteboard</div>
        <Button
          onClick={() => copyWhiteboard(id)}
          disabled={isCopying}
          size="xl"
        >
          Copy to My Whiteboards
        </Button>
      </div>
      <CopyingOverlay />
    </>
  );
}
