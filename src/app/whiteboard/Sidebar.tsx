import { Wand2, Type, Image as ImageIcon, MessageSquare } from "lucide-react";
import { useDnD } from "./DnDContext";

export default function Sidebar() {
  const [, setType] = useDnD();

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string,
  ) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
    setType(nodeType);
  };

  const onDragEnd = () => {
    setType(null);
  };

  return (
    <aside className="fixed top-1/2 left-0 z-50 flex h-[80vh] w-16 -translate-y-1/2 flex-col rounded-r-lg bg-gray-900 p-2 shadow-[2px_0_15px_rgba(255,255,255,0.05)]">
      <div className="flex flex-1 flex-col items-center justify-center space-y-3">
        {/* Text Node */}
        <div className="group relative">
          <div
            className="flex h-10 w-10 cursor-grab items-center justify-center rounded border border-gray-700 bg-blue-900/50 p-2 text-white hover:bg-blue-800/50"
            draggable
            onDragStart={(e) => onDragStart(e, "textEditor")}
            onDragEnd={onDragEnd}
            title="Text Node"
          >
            <Type size={16} />
          </div>
          <div className="pointer-events-none absolute top-0 left-full z-50 ml-2 w-48 scale-95 rounded bg-gray-800 p-2 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
            <p className="text-xs text-gray-300">
              <span className="font-semibold">Text</span>: Create text inputs
              for your flow or display text outputs.
            </p>
          </div>
        </div>

        {/* Image Node */}
        <div className="group relative">
          <div
            className="flex h-10 w-10 cursor-grab items-center justify-center rounded border border-gray-700 bg-purple-900/50 p-2 text-white hover:bg-purple-800/50"
            draggable
            onDragStart={(e) => onDragStart(e, "imageNode")}
            onDragEnd={onDragEnd}
            title="Image Node"
          >
            <ImageIcon size={16} />
          </div>
          <div className="pointer-events-none absolute top-0 left-full z-50 ml-2 w-48 scale-95 rounded bg-gray-800 p-2 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
            <p className="text-xs text-gray-300">
              <span className="font-semibold">Image</span>: Upload images or
              generate them from text inputs.
            </p>
          </div>
        </div>

        {/* Instruction Node */}
        <div className="group relative">
          <div
            className="flex h-10 w-10 cursor-grab items-center justify-center rounded border border-gray-700 bg-yellow-900/50 p-2 text-white hover:bg-yellow-800/50"
            draggable
            onDragStart={(e) => onDragStart(e, "instruction")}
            onDragEnd={onDragEnd}
            title="Instruction Node"
          >
            <Wand2 size={16} />
          </div>
          <div className="pointer-events-none absolute top-0 left-full z-50 ml-2 w-48 scale-95 rounded bg-gray-800 p-2 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
            <p className="text-xs text-gray-300">
              <span className="font-semibold">Instruction</span>: Generate
              content, analyze data, or modify outputs using AI.
            </p>
          </div>
        </div>

        {/* Comment Node */}
        <div className="group relative">
          <div
            className="flex h-10 w-10 cursor-grab items-center justify-center rounded border border-gray-700 bg-orange-900/50 p-2 text-white hover:bg-orange-800/50"
            draggable
            onDragStart={(e) => onDragStart(e, "comment")}
            onDragEnd={onDragEnd}
            title="Comment Node"
          >
            <MessageSquare size={16} />
          </div>
          <div className="pointer-events-none absolute top-0 left-full z-50 ml-2 w-48 scale-95 rounded bg-gray-800 p-2 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
            <p className="text-xs text-gray-300">
              <span className="font-semibold">Comment</span>: Add notes,
              explanations, or documentation to your flow.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
