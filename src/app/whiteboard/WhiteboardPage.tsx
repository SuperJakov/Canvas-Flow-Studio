"use client";

import dynamic from "next/dynamic";
import { ReactFlowProvider } from "@xyflow/react";
import { DnDProvider } from "./DnDContext";
import Whiteboard from "./Whiteboard";
import TitleChanger from "./TitleChanger";
import { Authenticated, AuthLoading } from "convex/react";
import Loading from "../loading";
import { useCopyWhiteboard } from "./utils";
import { usePreloadedQuery } from "convex/react";
import type { Preloaded } from "convex/react";
import type { api } from "../../../convex/_generated/api";
import ProgressBarSkeleton from "./skeletons/ProgressBarSkeleton";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import WhiteboardHeaderSkeleton from "./skeletons/WhiteboardHeaderSkeleton";

const WhiteboardHeader = dynamic(
  () => import("./WhiteboardHeader").then((c) => c.default),
  { ssr: false, loading: () => <WhiteboardHeaderSkeleton /> },
);
const Sidebar = dynamic(() => import("./Sidebar").then((c) => c.default), {
  ssr: false,
  loading: () => <SidebarSkeleton />,
});
const ProgressBar = dynamic(
  () => import("./ProgressBar").then((c) => c.default),
  { ssr: false, loading: () => <ProgressBarSkeleton /> },
);

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
    <>
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
    </>
  );
}
