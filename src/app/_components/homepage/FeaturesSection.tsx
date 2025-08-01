"use client";
import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { features } from "./features";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const tween = gsap.to(inner, {
      x: () => {
        const baseDistance = inner.scrollWidth - container.offsetWidth;
        const extra = container.offsetWidth * 0.1; // show 10% of viewport after last card
        return -(baseDistance + extra);
      },
      ease: "none",
      scrollTrigger: {
        trigger: container,
        pin: true,
        scrub: true,
        end: () => {
          const baseDistance = inner.scrollWidth - container.offsetWidth;
          const extra = container.offsetWidth * 0.1;
          return `+=${baseDistance + extra}`;
        },
        invalidateOnRefresh: true,
      },
    });

    // ensure ScrollTrigger recalculates on window resize
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    // cleanup on unmount
    return () => {
      window.removeEventListener("resize", onResize);
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <section ref={containerRef} className="relative">
      <div className="bg-background h-screen overflow-hidden">
        <div
          ref={innerRef}
          className="flex h-full items-center gap-8 whitespace-nowrap"
        >
          {/* Heading panel */}
          <div className="flex-shrink-0 px-8 md:pl-16 lg:pr-16 lg:pl-36">
            <h2 className="text-4xl leading-tight font-bold whitespace-nowrap lg:text-5xl">
              <span className="block">What you&rsquo;ll unlock with</span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Canvas Flow Studio
              </span>
            </h2>
          </div>

          {/* Feature cards */}
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

              <p className="text-muted-foreground break-words whitespace-normal">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
