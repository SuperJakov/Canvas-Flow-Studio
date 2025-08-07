"use client";
import { ReactFlowProvider } from "@xyflow/react";
import { DnDProvider } from "./DnDContext";
import Sidebar from "./Sidebar";
import Whiteboard from "./Whiteboard";
import WhiteboardHeader from "./WhiteboardHeader";
import TitleChanger from "./TitleChanger";
import { Authenticated, AuthLoading } from "convex/react";
import { Suspense } from "react";
import Loading from "../loading";
import { useCopyWhiteboard } from "./utils";
import ProgressBar from "./ProgressBar";
import { usePreloadedQuery } from "convex/react";
import type { Preloaded } from "convex/react";
import type { api } from "../../../convex/_generated/api";

type Props = {
  preloadedWhiteboard: Preloaded<(typeof api)["whiteboards"]["getWhiteboard"]>;
};
export default function WhiteboardPage({ preloadedWhiteboard }: Props) {
  const { isCopying } = useCopyWhiteboard();
  const whiteboard = usePreloadedQuery(preloadedWhiteboard);

  if (whiteboard === null) {
    return <div>Whiteboard not found</div>;
  }

  return (
    <Suspense fallback={<Loading />}>
      <Authenticated>
        <DnDProvider>
          <ReactFlowProvider>
            <div className="h-screen w-full">
              <TitleChanger id={whiteboard._id} />
              {!isCopying && <WhiteboardHeader id={whiteboard._id} />}
              {!isCopying && <Sidebar />}
              <Whiteboard
                id={whiteboard._id}
                preloadedWhiteboard={preloadedWhiteboard}
              />
              <ProgressBar />
            </div>
          </ReactFlowProvider>
        </DnDProvider>
      </Authenticated>
      <AuthLoading>
        <Loading />
      </AuthLoading>
    </Suspense>
  );
}
