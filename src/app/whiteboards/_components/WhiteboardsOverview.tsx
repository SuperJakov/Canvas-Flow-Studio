import { api } from "convex/_generated/api";
import Loading from "~/app/loading";
import { useConvexQuery } from "~/helpers/convex";

export default function WhiteboardsOverview() {
  const whiteboardCountLimit = useConvexQuery(
    api.whiteboards.getWhiteboardCountLimit,
    {},
  );
  if (!whiteboardCountLimit) return <Loading />;

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight">
            Your Workspace
          </h1>
          <p className="text-muted-foreground text-lg">
            Create, organize, and collaborate on your ideas.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-muted rounded-lg px-3 py-2">
            <span className="text-muted-foreground text-sm font-medium">
              {whiteboardCountLimit.currentWhiteboardCount} of{" "}
              {whiteboardCountLimit.maxWhiteboardCount === Infinity
                ? "∞"
                : whiteboardCountLimit.maxWhiteboardCount}{" "}
              boards
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
