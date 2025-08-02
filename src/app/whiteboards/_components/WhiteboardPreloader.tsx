import type { Id } from "convex/_generated/dataModel";
import { useConvexQuery } from "~/helpers/convex";
import { api } from "convex/_generated/api";

type Props = {
  whiteboards: {
    _id: Id<"whiteboards">;
  }[];
};

// Child component that preloads a single whiteboard
function PreloadWhiteboard({ id }: { id: Id<"whiteboards"> }) {
  const preloadedWhiteboard = useConvexQuery(api.whiteboards.getWhiteboard, {
    id,
  });
  if (!preloadedWhiteboard) return null;
  console.log("Preloaded whiteboard with ID:", id);
  return null;
}

export default function WhiteboardPreloader({ whiteboards }: Props) {
  const preloadAmount = 5;

  return (
    <>
      {whiteboards.slice(0, preloadAmount).map((w) => (
        <PreloadWhiteboard key={w._id} id={w._id} />
      ))}
    </>
  );
}
