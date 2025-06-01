"use client";
import { useAtom } from "jotai";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { currentWhiteboardIdAtom } from "./atoms";

type Props = {
  id: string;
};
export default function TitleChanger({ id }: Props) {
  const whiteboard = useQuery(api.whiteboards.getWhiteboard, {
    id: id as Id<"whiteboards">,
  });
  const rawTitle = whiteboard?.title ?? "Untitled";
  const title = rawTitle.length > 15 ? rawTitle.slice(0, 15) + "..." : rawTitle;
  useEffect(() => {
    if (title) {
      document.title = `${title} | AI Flow Studio`;
      return;
    }
    document.title = "AI Flow Studio";
  }, [title]);
  const [, setCurrentWhiteboardId] = useAtom(currentWhiteboardIdAtom);

  useEffect(() => {
    setCurrentWhiteboardId(id);
  }, [id, setCurrentWhiteboardId]);

  return null;
}
