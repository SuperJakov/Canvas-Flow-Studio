"use client";
import { useAtom } from "jotai";
import { api } from "../../../convex/_generated/api";
import { useEffect } from "react";
import { currentWhiteboardIdAtom } from "./atoms";
import { useConvexQuery } from "~/helpers/convex";

type Props = {
  id: string;
};
export default function TitleChanger({ id }: Props) {
  const whiteboard = useConvexQuery(api.whiteboards.getWhiteboard, {
    id: id,
  });
  const rawTitle = whiteboard?.title ?? "Untitled";
  const title = rawTitle.length > 15 ? rawTitle.slice(0, 15) + "..." : rawTitle;
  useEffect(() => {
    if (title) {
      document.title = `${title} | Canvas Flow Studio`;
      return;
    }
    document.title = "Canvas Flow Studio";
  }, [title]);
  const [, setCurrentWhiteboardId] = useAtom(currentWhiteboardIdAtom);

  useEffect(() => {
    setCurrentWhiteboardId(id);
  }, [id, setCurrentWhiteboardId]);

  return null;
}
