"use client";

import { Book } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import posthog from "posthog-js";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function DocumentationSection() {
  const pathname = usePathname();
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    let sent = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !sent) {
          sent = true;
          posthog.capture("documentation section viewed", {
            current_path: pathname,
          });
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, [pathname]);

  return (
    <section
      ref={sectionRef}
      className="w-full px-4 py-16 shadow-lg sm:px-6 lg:px-8"
    >
      <div className="p-8">
        <h3 className="mb-4 text-center text-3xl font-extrabold">
          <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
            Comprehensive Documentation
          </span>
        </h3>

        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            Explore our detailed guides, tutorials, and reference materials to
            master Canvas Flow Studio and create powerful workflows. Dive deep
            into features, best practices, and advanced configurations to unlock
            your full potential.
          </p>
        </div>

        <div className="flex items-center justify-center">
          <Link href="/docs">
            <Button
              className="flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold shadow-xl transition-all duration-300 hover:shadow-2xl"
              variant="default"
              size="xl"
              onClick={() =>
                posthog.capture("documentation browse click", {
                  current_path: pathname,
                })
              }
            >
              <Book className="h-6 w-6" />
              Browse Documentation
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
