import {
  Wand2,
  Type,
  Image as ImageIcon,
  MessageSquare,
  Volume2,
  Globe,
  Cloud,
  Timer,
  ArrowDownUp,
} from "lucide-react";
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
              <span className="font-semibold">Text</span>: Create and edit text
              content, perfect for crafting prompts or displaying generated
              results.
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
              <span className="font-semibold">Image</span>: Import, generate, or
              manipulate images using AI-powered tools.
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
              <span className="font-semibold">Instruction</span>: Create
              AI-powered transformations and automate content generation tasks.
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
              <span className="font-semibold">Comment</span>: Document your flow
              with notes, explanations, and collaborative feedback.
            </p>
          </div>
        </div>

        {/* Speech Node */}
        <div className="group relative">
          <div
            className="flex h-10 w-10 cursor-grab items-center justify-center rounded border border-gray-700 bg-green-900/50 p-2 text-white hover:bg-green-800/50"
            draggable
            onDragStart={(e) => onDragStart(e, "speechNode")}
            onDragEnd={onDragEnd}
            title="Speech Node"
          >
            <Volume2 size={16} />
          </div>
          <div className="pointer-events-none absolute top-0 left-full z-50 ml-2 w-48 scale-95 rounded bg-gray-800 p-2 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
            <p className="text-xs text-gray-300">
              <span className="font-semibold">Speech</span>: Convert text to
              natural-sounding speech, with support for up to 1-minute audio
              clips.
            </p>
          </div>
        </div>

        {/* Website Node */}
        <div className="group relative">
          <div
            className="flex h-10 w-10 cursor-grab items-center justify-center rounded border border-gray-700 bg-pink-900/50 p-2 text-white hover:bg-pink-800/50"
            draggable
            onDragStart={(e) => onDragStart(e, "websiteNode")}
            onDragEnd={onDragEnd}
            title="Website Node"
          >
            <Globe size={16} />
          </div>
          <div className="pointer-events-none absolute top-0 left-full z-50 ml-2 w-48 scale-95 rounded bg-gray-800 p-2 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
            <p className="text-xs text-gray-300">
              <span className="font-semibold">Website</span>: Generate complete
              web pages from descriptions, with customizable styles and layouts.
            </p>
          </div>
        </div>

        {/* Weather Node */}
        <div className="group relative">
          <div
            className="flex h-10 w-10 cursor-grab items-center justify-center rounded border border-gray-700 bg-cyan-900/50 p-2 text-white hover:bg-cyan-800/50"
            draggable
            onDragStart={(e) => onDragStart(e, "weatherNode")}
            onDragEnd={onDragEnd}
            title="Weather Node"
          >
            <Cloud size={16} />
          </div>
          <div className="pointer-events-none absolute top-0 left-full z-50 ml-2 w-48 scale-95 rounded bg-gray-800 p-2 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
            <p className="text-xs text-gray-300">
              <span className="font-semibold">Weather</span>: Fetch real-time
              weather data for any location to use in your flow.
            </p>
          </div>
        </div>

        {/* Timer Node */}
        <div className="group relative">
          <div
            className="flex h-10 w-10 cursor-grab items-center justify-center rounded border border-gray-700 bg-indigo-900/50 p-2 text-white hover:bg-indigo-800/50"
            draggable
            onDragStart={(e) => onDragStart(e, "timerNode")}
            onDragEnd={onDragEnd}
            title="Timer Node"
          >
            <Timer size={16} />
          </div>
          <div className="pointer-events-none absolute top-0 left-full z-50 ml-2 w-48 scale-95 rounded bg-gray-800 p-2 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
            <p className="text-xs text-gray-300">
              <span className="font-semibold">Timer</span>: Schedule node
              execution with customizable delays and intervals.
            </p>
          </div>
        </div>

        {/* Data Fetching Node */}
        <div className="group relative">
          <div
            className="flex h-10 w-10 cursor-grab items-center justify-center rounded border border-gray-700 bg-rose-900/50 p-2 text-white hover:bg-rose-800/50"
            draggable
            onDragStart={(e) => onDragStart(e, "dataFetchNode")}
            onDragEnd={onDragEnd}
            title="Data Fetch Node"
          >
            <ArrowDownUp size={16} />
          </div>
          <div className="pointer-events-none absolute top-0 left-full z-50 ml-2 w-48 scale-95 rounded bg-gray-800 p-2 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
            <p className="text-xs text-gray-300">
              <span className="font-semibold">Data Fetch</span>: Import data
              from APIs into your workflow.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
