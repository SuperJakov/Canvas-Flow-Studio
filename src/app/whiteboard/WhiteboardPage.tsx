"use client";
import { ReactFlowProvider } from "@xyflow/react";
import { DnDProvider } from "./DnDContext";
import Sidebar from "./Sidebar";
import Whiteboard from "./Whiteboard";
import type { Id } from "../../../convex/_generated/dataModel";
import WhiteboardHeader from "./WhiteboardHeader";
import TitleChanger from "./TitleChanger";
import { Authenticated } from "convex/react";
import { Suspense } from "react";
import Loading from "../loading";

type Props = {
  id: Id<"whiteboards">;
};
export default function WhiteboardPage({ id }: Props) {
  return (
    <Suspense fallback={<Loading />}>
      <Authenticated>
        <DnDProvider>
          <ReactFlowProvider>
            <div className="h-screen w-full">
              <TitleChanger id={id} />
              <WhiteboardHeader id={id} />
              <Sidebar />
              <Whiteboard id={id} />
            </div>
          </ReactFlowProvider>
        </DnDProvider>
      </Authenticated>
    </Suspense>
  );
}
