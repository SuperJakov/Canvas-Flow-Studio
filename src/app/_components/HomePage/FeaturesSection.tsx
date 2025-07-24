"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Feature images
import Image from "next/image";
import IntuitiveCanvas from "public/intuitive_canvas.png";
import AIIntegration from "public/ai_model_integration.png";
import ProcessChaining from "public/process_chaining.png";
import SmartAutomation from "public/smart_automations.png";

// Register plugins
gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function FeaturesSection() {
  const containerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const createAnimation = () => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content) return;

    // Clear any existing ScrollTriggers
    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.trigger === container) {
        trigger.kill();
      }
    });

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
          end: () => `+=${scrollDistance * 2}`,
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
  };

  useGSAP(
    () => {
      createAnimation();
    },
    { scope: containerRef, dependencies: [] },
  );

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Use a small delay to ensure DOM has updated
      setTimeout(() => {
        createAnimation();
      }, 100);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const container = containerRef.current;

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === container) {
          trigger.kill();
        }
      });
    };
  }, []);

  const features = [
    {
      title: "Intuitive Visual Canvas",
      description:
        "Drag and drop nodes onto the canvas and connect them to create complex AI workflows without writing code.",

      src: IntuitiveCanvas,
    },
    {
      title: "AI Model Integration",
      description:
        "Connect to state-of-the-art AI models for text generation, image creation, analysis, and more.",
      src: AIIntegration,
    },
    {
      title: "Process Chaining",
      description:
        "Chain together multiple AI processes to create sophisticated automations and workflows.",
      src: ProcessChaining,
    },
    {
      title: "Smart Automation",
      description:
        "Automate complex tasks with intelligent decision-making and adaptive AI responses.",
      src: SmartAutomation,
    },
  ];

  return (
    <section ref={containerRef} className="relative">
      <div className="bg-background h-screen overflow-hidden">
        <div className="flex h-full items-center">
          <div ref={contentRef} className="flex items-center gap-8">
            <div className="flex-shrink-0 px-8 md:pl-16 lg:pr-16 lg:pl-36">
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
                <div className="mb-4">
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </div>

                {feature.src ? (
                  <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                    <Image
                      src={feature.src}
                      alt={feature.title}
                      placeholder="blur"
                      loading="eager"
                      className="h-full w-full object-cover"
                      width={270}
                      height={270}
                    />
                  </div>
                ) : (
                  <div className="mb-4 aspect-square rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                    <div className="text-muted-foreground flex h-full items-center justify-center text-sm select-none">
                      Feature Image
                    </div>
                  </div>
                )}
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
