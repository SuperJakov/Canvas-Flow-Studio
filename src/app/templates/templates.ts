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

export const templates = [
  {
    href: "/template/describe-and-generate",
    title: "Describe and Generate",
    description:
      "Learn the basics of Canvas Flow Studio by describing images and generating content with AI models.",
    icon: Users,
    hoverClasses: "hover:border-orange-500/50 hover:shadow-orange-900/20",
    hoverColorClass: "group-hover:text-orange-400",
    workInProgress: false,
  },
  {
    href: "/template/company-meeting",
    title: "Company Meeting",
    description:
      "Generate meeting minutes, action items, and follow-ups from meeting transcripts.",
    icon: Calendar,
    hoverClasses: "hover:border-blue-500/50 hover:shadow-blue-900/20",
    hoverColorClass: "group-hover:text-blue-400",
    workInProgress: false,
  },
  {
    href: "/template/content-creation",
    title: "Content Creation",
    description:
      "Create anything you want from a single topic using the website node.",
    icon: FileText,
    hoverClasses: "hover:border-purple-500/50 hover:shadow-purple-900/20",
    hoverColorClass: "group-hover:text-purple-400",
    workInProgress: false,
  },
  {
    href: "/template/image-generation",
    title: "Image Generation",
    description:
      "Generate and refine images based on text descriptions and use different styles.",
    icon: ImageIcon,
    hoverClasses: "hover:border-pink-500/50 hover:shadow-pink-900/20",
    hoverColorClass: "group-hover:text-pink-400",
    workInProgress: false,
  },
  {
    href: "/template/language-translation",
    title: "Language Translation",
    description:
      "Translate and localize content between multiple languages while preserving context.",
    icon: MessageSquare,
    hoverClasses: "hover:border-green-500/50 hover:shadow-green-900/20",
    hoverColorClass: "group-hover:text-green-400",
    workInProgress: false,
  },
  {
    href: "/template/data-analysis",
    title: "Data Analysis",
    description:
      "Extract insights, generate visualizations, and create reports from your data.",
    icon: PieChart,
    hoverClasses: "hover:border-teal-500/50 hover:shadow-teal-900/20",
    hoverColorClass: "group-hover:text-teal-400",
    workInProgress: true,
  },
  {
    href: "/template/the-luminous-deep",
    title: "The Luminous Deep",
    description: "A journey into the world of living light.",
    icon: Sparkles,
    hoverClasses: "hover:border-cyan-500/50 hover:shadow-cyan-900/20",
    hoverColorClass: "group-hover:text-cyan-400",
    unlisted: true,
  },
  {
    href: "/template/local-event",
    title: "Local Event",
    description: "Create a webpage for a local event.",
    icon: Ticket,
    hoverClasses: "hover:border-lime-500/50 hover:shadow-lime-900/20",
    hoverColorClass: "group-hover:text-lime-400",
    unlisted: true,
  },
];
