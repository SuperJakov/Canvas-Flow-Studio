import { Background, BackgroundVariant, ReactFlow } from "@xyflow/react";
import { previewNodeTypes } from "~/app/preview-config";

const previewImage1Url = "/preview1.png";

export default function CanvasPreviewSection() {
  return (
    <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-xl border-2 shadow-2xl shadow-purple-900/20">
        <div className="pointer-events-none relative h-[500px] w-full overflow-hidden">
          <ReactFlow
            nodes={[
              {
                id: "1",
                type: "previewText",
                position: { x: 500, y: 600 },
                data: { text: "A dog" },
              },
              {
                id: "2",
                type: "previewText",
                position: { x: 100, y: 600 },
                data: {
                  text: "Swimming at the bottom of the ocean wearing goggles and playing with other fish",
                },
              },
              {
                id: "3",
                type: "previewImage",
                position: { x: 300, y: 1000 },
                data: { imageUrl: previewImage1Url },
              },
            ]}
            edges={[
              {
                id: "e1-3",
                source: "1",
                target: "3",
              },
              {
                id: "e2-3",
                source: "2",
                target: "3",
              },
            ]}
            nodeTypes={previewNodeTypes}
            fitView
            fitViewOptions={{ padding: 0.9 }}
            proOptions={{ hideAttribution: true }}
            colorMode="dark"
            draggable={false}
            connectOnClick={false}
            unselectable="on"
            preventScrolling={false}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          </ReactFlow>
        </div>
      </div>
    </section>
  );
}
