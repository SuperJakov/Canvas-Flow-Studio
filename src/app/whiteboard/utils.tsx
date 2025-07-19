import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Loading from "../loading";
import { createPortal } from "react-dom";

export function useCopyWhiteboard() {
  const copyMutation = useMutation(api.whiteboards.copyPublicWhiteboard);
  const [isCopying, setIsCopying] = useState(false);
  const router = useRouter();

  const copyWhiteboard = async (sourceId: string) => {
    try {
      setIsCopying(true);
      const newWhiteboardId = await copyMutation({ sourceId });
      if (newWhiteboardId) {
        router.push(`/whiteboard/${newWhiteboardId}`);
      }
    } catch (error) {
      console.error("Failed to copy whiteboard:", error);
      setIsCopying(false);
    }
  };

  return {
    copyWhiteboard,
    isCopying,
    CopyingOverlay: () => {
      if (!isCopying) return null;
      if (typeof window === "undefined") return null;
      return createPortal(<Loading />, document.body);
    },
  };
}
