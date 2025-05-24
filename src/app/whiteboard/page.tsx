"use client";
import { ReactFlowProvider } from "@xyflow/react";
import Whiteboard from "./Whiteboard";
import { DnDProvider } from "./DnDContext";
import Sidebar from "./Sidebar";

export default function WhiteboardPage() {
  return (
    <DnDProvider>
      <ReactFlowProvider>
        <div className="h-screen w-full">
          <Sidebar />
          <Whiteboard />
        </div>
      </ReactFlowProvider>
    </DnDProvider>
  );
}
