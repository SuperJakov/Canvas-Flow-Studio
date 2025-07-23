"use client";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Layers, Workflow, Zap, Bot } from "lucide-react";

// Register plugins
gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function FeaturesSection() {
  const containerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      const content = contentRef.current;

      if (!container || !content) return;

      // Get dimensions
      const containerWidth = container.offsetWidth;
      const contentWidth = content.scrollWidth;
      const scrollDistance = contentWidth - containerWidth;

      console.log("Container width:", containerWidth);
      console.log("Content width:", contentWidth);
      console.log("Scroll distance:", scrollDistance);

      if (scrollDistance > 0) {
        gsap.to(content, {
          x: -scrollDistance,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top top",
            // This is the key fix - make the scroll area longer to accommodate all cards
            end: () => `+=${scrollDistance * 2}`, // Increased multiplier for smoother scrolling
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              console.log("Scroll progress:", self.progress);
            },
          },
        });
      }
    },
    { scope: containerRef, dependencies: [] },
  );

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
    <section ref={containerRef} className="relative">
      <div className="bg-background h-screen overflow-hidden">
        <div className="flex h-full items-center">
          <div ref={contentRef} className="flex items-center gap-8">
            <div className="flex-shrink-0 px-8 lg:pr-16 lg:pl-36">
              <h2 className="text-4xl leading-tight font-bold whitespace-nowrap lg:text-5xl">
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
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${feature.gradient} shadow-lg`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </div>
                <div className="mb-4 h-48 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                  <div className="text-muted-foreground flex h-full items-center justify-center text-sm select-none">
                    Feature Image
                  </div>
                </div>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
            {/* Padding at the end to ensure last card is fully visible */}
            <div className="w-32 flex-shrink-0" />
          </div>
        </div>
      </div>
    </section>
  );
}
