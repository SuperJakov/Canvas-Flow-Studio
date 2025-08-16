"use client";

import { motion } from "framer-motion";
import { useState, useLayoutEffect } from "react";

export default function AnimatedBackground() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  if (dimensions.width === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Floating Gradient Orbs */}
      <motion.div
        className="absolute h-96 w-96 rounded-full bg-gradient-to-r from-[var(--chart-1)] to-[var(--chart-3)] opacity-20"
        initial={{ x: -200, y: -100 }}
        animate={{ x: [-200, -100, -150], y: [-100, -50, -80] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        style={{ filter: "blur(100px)" }}
      />
      <motion.div
        className="absolute h-80 w-80 rounded-full bg-gradient-to-r from-[var(--chart-3)] to-[var(--chart-5)] opacity-15"
        initial={{ x: "100vw", y: "50vh" }}
        animate={{ x: ["100vw", "80vw", "90vw"], y: ["50vh", "30vh", "40vh"] }}
        transition={{ duration: 25, repeat: Infinity, repeatType: "reverse" }}
        style={{ filter: "blur(80px)" }}
      />
      <motion.div
        className="absolute h-64 w-64 rounded-full bg-gradient-to-r from-[var(--chart-5)] to-[var(--chart-1)] opacity-10"
        initial={{ x: "50vw", y: "100vh" }}
        animate={{ x: ["50vw", "60vw", "40vw"], y: ["100vh", "70vh", "85vh"] }}
        transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
        style={{ filter: "blur(120px)" }}
      />

      {/* Floating Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
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
          }}
        />
      ))}
    </div>
  );
}
