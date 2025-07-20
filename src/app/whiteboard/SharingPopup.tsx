import { Button } from "~/components/ui/button";
import { api } from "../../../convex/_generated/api";
import { useCopyWhiteboard } from "./utils";
import { useConvexQuery } from "~/helpers/convex";

type Props = {
  id: string;
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
      <div className="bg-background fixed right-4 bottom-4 z-50 rounded-lg p-6 shadow-lg">
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
