import {
  Wand2,
  Image as ImageIcon,
  MessageSquare,
  Volume2,
  Globe,
  Cloud,
  Timer,
  ArrowDownUp,
  Type,
} from "lucide-react";
import { useDnD } from "./DnDContext";
import React from "react";
import { Badge } from "~/components/ui/badge";

const NODE_CONFIGS = [
  {
    key: "textEditor",
    icon: Type,
    color: "bg-blue-900/50 hover:bg-blue-800/50 border",
    title: "Text Node",
    beta: false,
    disabled: false,
    tooltip: (
      <>
        <span className="font-semibold">Text</span>: Create and edit text
        content, perfect for crafting prompts or displaying generated results.
      </>
    ),
  },
  {
    key: "image",
    icon: ImageIcon,
    color: "bg-purple-900/50 hover:bg-purple-800/50 border",
    title: "Image Node",
    beta: false,
    disabled: false,
    tooltip: (
      <>
        <span className="font-semibold">Image</span>: Import, generate, or
        manipulate images using AI-powered tools.
      </>
    ),
  },
  {
    key: "instruction",
    icon: Wand2,
    color: "bg-yellow-900/50 hover:bg-yellow-800/50 border",
    title: "Instruction Node",
    beta: false,
    disabled: false,
    tooltip: (
      <>
        <span className="font-semibold">Instruction</span>: Create AI-powered
        transformations and automate content generation tasks.{" "}
        <span className="text-muted-foreground">Beta version</span>
      </>
    ),
  },
  {
    key: "comment",
    icon: MessageSquare,
    color: "bg-orange-900/50 hover:bg-orange-800/50 border",
    title: "Comment Node",
    beta: false,
    disabled: false,
    tooltip: (
      <>
        <span className="font-semibold">Comment</span>: Document your flow with
        notes, explanations, and collaborative feedback.
      </>
    ),
  },
  {
    key: "speech",
    icon: Volume2,
    color: "bg-green-900/50 hover:bg-green-800/50 border",
    title: "Speech Node",
    beta: false,
    disabled: false,
    tooltip: (
      <>
        <span className="font-semibold">Speech</span>: Generate natural-sounding
        speech, with support for up to 1-minute audio clips.
      </>
    ),
  },
  {
    key: "websiteNode",
    icon: Globe,
    color: "bg-pink-900/50 hover:bg-pink-800/50 border",
    title: "Website Node",
    beta: false,
    disabled: false,
    tooltip: (
      <>
        <span className="font-semibold">Website</span>: Generate complete web
        pages from descriptions, with customizable styles and layouts.
      </>
    ),
  },
  {
    key: "weatherNode",
    icon: Cloud,
    color: "bg-cyan-900/50 hover:bg-cyan-800/50 border",
    title: "Weather Node",
    beta: false,
    disabled: true,
    tooltip: (
      <>
        <span className="font-semibold">Weather</span>: Fetch real-time weather
        data for any location to use in your flow.
      </>
    ),
  },
  {
    key: "timerNode",
    icon: Timer,
    color: "bg-indigo-900/50 hover:bg-indigo-800/50 border",
    title: "Timer Node",
    beta: false,
    disabled: true,
    tooltip: (
      <>
        <span className="font-semibold">Timer</span>: Schedule node execution
        with customizable delays and intervals.
      </>
    ),
  },
  {
    key: "dataFetchNode",
    icon: ArrowDownUp,
    color: "bg-rose-900/50 hover:bg-rose-800/50 border",
    title: "Data Fetch Node",
    beta: false,
    disabled: true,
    tooltip: (
      <>
        <span className="font-semibold">Data Fetch</span>: Import data from APIs
        into your workflow or search the web for information.
      </>
    ),
  },
];

type SidebarItemProps = {
  nodeType: string;
  icon: React.ComponentType<{ size: number }>;
  color: string;
  title: string;
  tooltip: React.ReactNode;
  beta: boolean;
  disabled: boolean;
  onDragStart: (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string,
  ) => void;
  onDragEnd: () => void;
};

function SidebarItem({
  nodeType,
  icon: Icon,
  color,
  title,
  tooltip,
  beta,
  disabled,
  onDragStart,
  onDragEnd,
}: SidebarItemProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    onDragStart(e, nodeType);
  };

  return (
    <div className="group relative flex flex-col items-center">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded border p-2 text-white ${
          disabled
            ? "cursor-not-allowed border bg-gray-500/50"
            : `${color} cursor-grab`
        }`}
        draggable={!disabled}
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        title={title}
      >
        <Icon size={16} />
      </div>
      {beta && (
        <Badge
          variant="secondary"
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-500/50 px-1.5 py-0 text-xs text-white select-none"
        >
          Beta
        </Badge>
      )}
      <div className="bg-popover pointer-events-none absolute top-0 left-full z-50 ml-2 w-48 scale-95 rounded p-2 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
        <p className="text-popover-foreground text-xs">{tooltip}</p>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [, setType] = useDnD();

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string,
  ) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
    setType(nodeType);
  };

  const handleDragEnd = () => {
    setType(null);
  };

  return (
    <aside className="bg-background fixed top-1/2 left-0 z-40 flex h-[80vh] w-16 -translate-y-1/2 flex-col rounded-r-lg p-2 shadow-[var(--shadow-2xl)]">
      <div className="flex flex-1 flex-col items-center justify-center space-y-3">
        {NODE_CONFIGS.map((node) => (
          <SidebarItem
            key={node.key}
            nodeType={node.key}
            icon={node.icon}
            color={node.color}
            title={node.title}
            tooltip={node.tooltip}
            beta={node.beta}
            disabled={node.disabled}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>
    </aside>
  );
}
