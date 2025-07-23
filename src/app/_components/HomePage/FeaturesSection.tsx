"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Layers, Workflow, Zap, Bot } from "lucide-react";

export default function FeaturesSection() {
  const containerRef = useRef(null);

  // Track scroll progress of this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Transform scroll progress to horizontal movement
  // Adjust the range based on your content width
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  const features = [
    {
      icon: Workflow,
      title: "Intuitive Visual Canvas",
      description:
        "Drag and drop nodes onto the canvas and connect them to create complex AI workflows without writing code.",
      gradient: "from-blue-600 to-purple-600",
    },
    {
      icon: Zap,
      title: "AI Model Integration",
      description:
        "Connect to state-of-the-art AI models for text generation, image creation, analysis, and more.",
      gradient: "from-purple-600 to-pink-600",
    },
    {
      icon: Layers,
      title: "Process Chaining",
      description:
        "Chain together multiple AI processes to create sophisticated automations and workflows.",
      gradient: "from-pink-600 to-orange-600",
    },
    {
      icon: Bot,
      title: "Smart Automation",
      description:
        "Automate complex tasks with intelligent decision-making and adaptive AI responses.",
      gradient: "from-orange-600 to-red-600",
    },
  ];

  return (
    <section
      ref={containerRef}
      className="relative h-[300vh]" // Make section tall to create scroll distance
    >
      {/* Sticky container that pins the content */}
      <div className="bg-background sticky top-0 h-screen overflow-hidden">
        <div className="flex h-full items-center">
          {/* Horizontally scrolling content including text and cards */}
          <motion.div style={{ x }} className="flex items-center gap-8">
            {/* Left side text */}
            <div className="flex-shrink-0 px-8 lg:px-16">
              <h2 className="text-4xl leading-tight font-bold lg:text-5xl">
                <span className="block">What you&apos;ll unlock with</span>
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  AI Flow Studio
                </span>
              </h2>
            </div>
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card w-80 flex-shrink-0 rounded-xl border p-6 shadow-md transition hover:border-purple-700/50 hover:shadow-purple-900/20"
              >
                {/* Icon and Title */}
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${feature.gradient} shadow-lg`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </div>

                {/* Image placeholder */}
                <div className="mb-4 h-48 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                  <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                    Feature Image
                  </div>
                </div>

                {/* Description */}
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
            {/* Add some padding at the end */}
            <div className="w-16 flex-shrink-0" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
