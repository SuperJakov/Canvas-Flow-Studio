"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const rotatingWords = ["ideas.", "projects.", "people."];

export default function RotatingWords() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex(
        (prevIndex) => (prevIndex + 1) % rotatingWords.length,
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block w-[120px] text-left sm:w-[160px] md:w-[200px] lg:w-[240px]">
      <AnimatePresence mode="wait">
        <motion.span
          key={currentWordIndex}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="inline-block bg-gradient-to-r from-[var(--chart-1)] via-[var(--chart-3)] to-[var(--chart-5)] bg-clip-text text-transparent"
        >
          {rotatingWords[currentWordIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
