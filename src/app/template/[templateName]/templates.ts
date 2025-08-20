import type { AppEdge, AppNode } from "~/Types/nodes";
import { v4 as uuidv4 } from "uuid";
import { imageGenerationTemplate } from "./imageGeneration";
import { describeAndGenerateTemplate } from "./describeAndGenerate";
import { companyMeetingTemplate } from "./companyMeeting";
import { languageTranslationTemplate } from "./languageTranslation";
import {
  Calendar,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  PieChart,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import { contentCreationTemplate } from "./contentCreation";
import { theLuminousDeepTemplate } from "./theLuminousDeep";
import { localEventTemplate } from "./localEvent";

export type Template = {
  title: string;
  description?: string;
  icon?: React.ElementType;
  iconBg?: string;
  hoverClasses?: string;
  titleClasses?: string;
  workInProgress?: boolean;
  nodes: readonly AppNode[];
  edges: readonly AppEdge[];
};

type TemplateMap = Record<string, Template>;

const templates: TemplateMap = {
  "describe-and-generate": {
    ...describeAndGenerateTemplate,
    description:
      "Learn the basics of Canvas Flow Studio by describing images and generating content with AI models.",
    icon: Users,
    iconBg: "bg-gradient-to-r from-orange-600 to-amber-600",
    hoverClasses: "hover:border-orange-500/50 hover:shadow-orange-900/20",
    titleClasses: "group-hover:text-orange-400",
  },
  "company-meeting": {
    ...companyMeetingTemplate,
    description:
      "Generate meeting minutes, action items, and follow-ups from meeting transcripts.",
    icon: Calendar,
    iconBg: "bg-gradient-to-r from-blue-600 to-cyan-600",
    hoverClasses: "hover:border-blue-500/50 hover:shadow-blue-900/20",
    titleClasses: "group-hover:text-blue-400",
  },
  "content-creation": {
    title: "Content Creation",
    description:
      "Create anything you want from a single topic using the website node.",
    icon: FileText,
    iconBg: "bg-gradient-to-r from-purple-600 to-pink-600",
    hoverClasses: "hover:border-purple-500/50 hover:shadow-purple-900/20",
    titleClasses: "group-hover:text-purple-400",
    workInProgress: false,
    ...contentCreationTemplate,
  },
  "image-generation": {
    ...imageGenerationTemplate,
    description:
      "Generate and refine images based on text descriptions and use different styles.",
    icon: ImageIcon,
    iconBg: "bg-gradient-to-r from-pink-600 to-red-600",
    hoverClasses: "hover:border-pink-500/50 hover:shadow-pink-900/20",
    titleClasses: "group-hover:text-pink-400",
  },
  "language-translation": {
    ...languageTranslationTemplate,
    description:
      "Translate and localize content between multiple languages while preserving context.",
    icon: MessageSquare,
    iconBg: "bg-gradient-to-r from-green-600 to-emerald-600",
    hoverClasses: "hover:border-green-500/50 hover:shadow-green-900/20",
    titleClasses: "group-hover:text-green-400",
  },
  "data-analysis": {
    title: "Data Analysis",
    description:
      "Extract insights, generate visualizations, and create reports from your data.",
    icon: PieChart,
    iconBg: "bg-gradient-to-r from-teal-600 to-cyan-600",
    hoverClasses: "hover:border-teal-500/50 hover:shadow-teal-900/20",
    titleClasses: "group-hover:text-teal-400",
    workInProgress: true,
    nodes: [],
    edges: [],
  },
  "the-luminous-deep": {
    ...theLuminousDeepTemplate,
    description: "A journey into the world of living light.",
    icon: Sparkles,
    iconBg: "bg-gradient-to-r from-cyan-600 to-blue-600",
    hoverClasses: "hover:border-cyan-500/50 hover:shadow-cyan-900/20",
    titleClasses: "group-hover:text-cyan-400",
  },
  "local-event": {
    ...localEventTemplate,
    description: "Create a webpage for a local event.",
    icon: Ticket,
    iconBg: "bg-gradient-to-r from-lime-600 to-green-600",
    hoverClasses: "hover:border-lime-500/50 hover:shadow-lime-900/20",
    titleClasses: "group-hover:text-lime-400",
  },
};

// This function will expose all templates, then switch out the node id's to new random one's and modify edges accordingly.
export function getTemplate(name: string): Template | undefined {
  const template = templates[name];

  if (!template) return undefined;

  // Create a mapping of old node IDs to new random IDs
  const idMapping: Record<string, string> = {};

  // Create a deep copy of the template and update node IDs
  const nodes = template.nodes.map((node) => {
    const newId = uuidv4();
    idMapping[node.id] = newId;
    return { ...node, id: newId };
  });

  // Update edge connections using the new node IDs
  const edges = template.edges.map((edge) => ({
    ...edge,
    id: uuidv4(),
    source: idMapping[edge.source]!,
    target: idMapping[edge.target]!,
  }));

  return {
    ...template,
    nodes,
    edges,
  };
}

export function getAllTemplates() {
  return Object.entries(templates).map(([name, template]) => ({
    name,
    ...template,
  }));
}
