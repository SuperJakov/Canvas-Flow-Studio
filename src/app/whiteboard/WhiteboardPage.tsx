"use client";
import { ReactFlowProvider } from "@xyflow/react";
import { DnDProvider } from "./DnDContext";
import Sidebar from "./Sidebar";
import Whiteboard from "./Whiteboard";
import type { Id } from "../../../convex/_generated/dataModel";
import WhiteboardHeader from "./WhiteboardHeader";
import TitleChanger from "./TitleChanger";
import { Authenticated, AuthLoading } from "convex/react";
import { Suspense } from "react";
import Loading from "../loading";
import { useCopyWhiteboard } from "./utils";

type Props = {
  id: Id<"whiteboards">;
};
export default function WhiteboardPage({ id }: Props) {
  const { isCopying } = useCopyWhiteboard();

  return (
    <Suspense fallback={<Loading />}>
      <Authenticated>
        <DnDProvider>
          <ReactFlowProvider>
            <div className="h-screen w-full">
              <TitleChanger id={id} />
              {!isCopying && <WhiteboardHeader id={id} />}
              {!isCopying && <Sidebar />}
              <Whiteboard id={id} />
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
