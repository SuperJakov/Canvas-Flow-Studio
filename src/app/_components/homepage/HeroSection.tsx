"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useLayoutEffect } from "react";

// An array of words to cycle through in the h1 tag.
const rotatingWords = ["ideas.", "projects.", "people."];

export default function HeroSection() {
  // State to manage the currently displayed word from the `rotatingWords` array.
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // This is for preventing hydration mismatches.
  const [hasMounted, setHasMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // This effect handles the rotation of words in the hero title.
  // It runs only on the client side after the component mounts.
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex(
        (prevIndex) => (prevIndex + 1) % rotatingWords.length,
      );
    }, 2000); // Change word every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // To prevent hydration warnings and get window dimensions
  useLayoutEffect(() => {
    setHasMounted(true);

    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    updateDimensions(); // Set initial dimensions
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements Container */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/*
          We conditionally render these animated elements only when `hasMounted` is true.
          This ensures they are not part of the server-rendered HTML and are only added
          on the client, avoiding any hydration mismatch.
        */}
        {hasMounted && (
          <>
            {/* Floating Gradient Orbs */}
            <motion.div
              className="absolute h-96 w-96 rounded-full bg-gradient-to-r from-[var(--chart-1)] to-[var(--chart-3)] opacity-20"
              initial={{ x: -200, y: -100 }}
              animate={{
                x: [-200, -100, -150],
                y: [-100, -50, -80],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              style={{ filter: "blur(100px)" }}
            />
            <motion.div
              className="absolute h-80 w-80 rounded-full bg-gradient-to-r from-[var(--chart-3)] to-[var(--chart-5)] opacity-15"
              initial={{ x: "100vw", y: "50vh" }}
              animate={{
                x: ["100vw", "80vw", "90vw"],
                y: ["50vh", "30vh", "40vh"],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              style={{ filter: "blur(80px)" }}
            />
            <motion.div
              className="absolute h-64 w-64 rounded-full bg-gradient-to-r from-[var(--chart-5)] to-[var(--chart-1)] opacity-10"
              initial={{ x: "50vw", y: "100vh" }}
              animate={{
                x: ["50vw", "60vw", "40vw"],
                y: ["100vh", "70vh", "85vh"],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              style={{ filter: "blur(120px)" }}
            />

            {/* Floating Particles */}
            {dimensions.width > 0 &&
              Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-1 w-1 rounded-full bg-[var(--chart-3)] opacity-30"
                  initial={{
                    x: Math.random() * dimensions.width,
                    y: Math.random() * dimensions.height,
                  }}
                  animate={{
                    x: Math.random() * dimensions.width,
                    y: Math.random() * dimensions.height,
                  }}
                  transition={{
                    duration: Math.random() * 10 + 15,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear",
                  }}
                />
              ))}
          </>
        )}

        {/* Subtle Gradient Overlay (Safe for SSR) */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(var(--chart-1-rgb, 59, 130, 246), 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(var(--chart-3-rgb, 34, 197, 94), 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(var(--chart-5-rgb, 168, 85, 247), 0.1) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h1 className="mb-6 text-4xl font-bold sm:text-5xl md:text-6xl">
          <span className="bg-gradient-to-r from-[var(--chart-1)] via-[var(--chart-3)] to-[var(--chart-5)] bg-clip-text text-transparent">
            Drag. Drop. Build.
            <br />
            AI for{" "}
            <span className="relative inline-block w-[120px] text-left sm:w-[160px] md:w-[200px] lg:w-[240px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWordIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                  }}
                  className="inline-block bg-gradient-to-r from-[var(--chart-1)] via-[var(--chart-3)] to-[var(--chart-5)] bg-clip-text text-transparent"
                >
                  {rotatingWords[currentWordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
        </h1>
        <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-xl">
          Create, visualize, and run complex AI workflows through an intuitive
          drag-and-drop interface. No coding required.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild size="xl">
            <Link href="/whiteboards" prefetch={true}>
              Start Creating
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="xl" variant={"secondary"}>
            <Link href="#demo">Watch Demo</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
