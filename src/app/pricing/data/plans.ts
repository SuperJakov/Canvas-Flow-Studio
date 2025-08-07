import type { Plan } from "../types";

export const plans: Plan[] = [
  {
    name: "Free",
    price: "0",
    currency: "€",
    period: "forever",
    description: "Perfect for learning and experimenting with AI workflows",
    gradient: "from-gray-500 to-gray-600",
    borderGradient: "from-gray-600 to-gray-700",
    buttonStyle: "bg-gray-700 hover:bg-gray-600 text-white",
    popular: false,
    features: {
      account: [
        { name: "Whiteboards", value: "5" },
        { name: "Nodes per whiteboard", value: "10" },
      ],
      content: [
        { name: "Text Credits", value: "20/month" },
        { name: "Image Credits", value: "20/month" },
        { name: "Image Quality", value: "Low" },
        { name: "Instruction Use", value: "40/month" },
        { name: "Speech Credits", value: "5/month" },
      ],
      integrations: [
        { name: "Weather Use", value: "1/month" },
        { name: "Website Generation", value: "1/month" },
      ],
      premium: [
        { name: "Workflow History & Versioning", included: false },
        { name: "Priority Support", included: false },
        { name: "Beta Features", included: false },
      ],
    },
  },
  {
    name: "Plus",
    price: "4",
    currency: "€",
    period: "month",
    description: "Increased limits and additional features for regular users",
    gradient: "from-blue-500 to-purple-600",
    borderGradient: "from-blue-500 to-purple-600",
    buttonStyle:
      "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white",
    popular: true,
    features: {
      account: [
        { name: "Whiteboards", value: "50" },
        { name: "Nodes per whiteboard", value: "50" },
      ],
      content: [
        { name: "Text Credits", value: "250/month" },
        { name: "Image Credits", value: "250/month" },
        { name: "Image Quality", value: "Premium" },
        { name: "Instruction Use", value: "200/month" },
        { name: "Speech Credits", value: "35/month" },
      ],
      integrations: [
        { name: "Weather Use", value: "30/month" },
        { name: "Website Generation", value: "10/month" },
      ],
      premium: [
        { name: "Workflow History & Versioning", included: false },
        { name: "Priority Support", included: true },
        { name: "Beta Features", included: true },
      ],
    },
  },
  {
    name: "Pro",
    price: "10",
    currency: "€",
    period: "month",
    description: "Highest limits and full access to all premium features",
    gradient: "from-purple-500 to-pink-600",
    borderGradient: "from-purple-500 to-pink-600",
    buttonStyle:
      "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white",
    popular: false,
    features: {
      account: [
        { name: "Whiteboards", value: "Unlimited*" },
        { name: "Nodes per whiteboard", value: "100" },
      ],
      content: [
        { name: "Text Credits", value: "650/month" },
        { name: "Image Credits", value: "650/month" },
        { name: "Image Quality", value: "Premium" },
        { name: "Instruction Use", value: "500/month" },
        { name: "Speech Credits", value: "100/month" },
      ],
      integrations: [
        { name: "Weather Use", value: "60/month" },
        { name: "Website Generation", value: "40/month" },
      ],
      premium: [
        { name: "Workflow History & Versioning", included: true },
        { name: "Priority Support", included: true },
        { name: "Beta Features", included: true },
      ],
    },
  },
];

export const tierRanks: Record<string, number> = {
  Free: 0,
  Plus: 1,
  Pro: 2,
};
