"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import type { JSX } from "react";
import TextToImageExample from "public/text_to_image_example.png";
import ModifyingTextExample from "public/modifying_text_example.png";
import ModifyingText2Example from "public/modifying_text_2_example.png";
import GeneratingSpeech from "public/speech_generation.png";
import CompanyMeeting from "public/company_meeting.png";
import { Progress } from "~/components/ui/progress";

interface DemoImage {
  src: StaticImageData;
  alt: string;
}

const demoImages: DemoImage[] = [
  { src: TextToImageExample, alt: "Node Connection Interface" },
  { src: ModifyingTextExample, alt: "Workflow Execution View" },
  { src: ModifyingText2Example, alt: "AI Model Configuration" },
  { src: GeneratingSpeech, alt: "Results Dashboard" },
  { src: CompanyMeeting, alt: "Company Meeting" },
];

const slideshowImageQuality = 85; // Has to be the same for preloaded and loaded images so it doesn't refetch

export default function DemoImageSection(): JSX.Element {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [imagesLoaded, setImagesLoaded] = useState<number>(0);
  const allImagesLoaded = imagesLoaded === demoImages.length;

  useEffect(() => {
    // Only start the slideshow after all images are loaded
    if (!allImagesLoaded) return;

    const interval: NodeJS.Timeout = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex: number) => (prevIndex + 1) % demoImages.length,
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [allImagesLoaded]);

  const slideVariants: Variants = {
    enter: {
      x: 1000,
      opacity: 0,
      scale: 0.8,
      rotateY: 45,
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: {
      zIndex: 0,
      x: -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: -45,
    },
  };

  const handleImageLoad = () => {
    setImagesLoaded((prev) => prev + 1);
  };

  return (
    <section id="demo" className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-10 max-w-2xl space-y-4 text-center">
          <motion.h2
            className="text-3xl font-bold sm:text-4xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary">
              See Canvas Flow Studio in Action
            </span>
          </motion.h2>

          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Watch how easy it is to create and run AI-powered workflows with our
            visual canvas
          </motion.p>
        </div>

        <motion.div
          className="bg-secondary relative overflow-hidden rounded-xl border-2 shadow-2xl shadow-purple-900/20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ perspective: 1000 }}
        >
          <div className="relative aspect-video w-full">
            {/* Show loading state while images are preloading */}
            {!allImagesLoaded && (
              <div className="bg-background absolute inset-0 z-10 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
                  <span className="text-sm">
                    Loading demo images... ({imagesLoaded}/{demoImages.length})
                  </span>
                </div>
              </div>
            )}

            {/* Hidden preload images using Next.js Image component */}
            <div
              className="pointer-events-none absolute -left-[9999px] opacity-0"
              aria-hidden="true"
            >
              {demoImages.map((demoImage, index) => (
                <Image
                  key={`preload-${index}`}
                  src={demoImage.src}
                  alt={demoImage.alt}
                  priority={true}
                  loading="eager"
                  onLoad={handleImageLoad}
                  quality={slideshowImageQuality}
                />
              ))}
            </div>

            {/* Main slideshow */}
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={currentImageIndex}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.4 },
                  rotateY: { duration: 0.6 },
                }}
                className="absolute inset-0"
              >
                <Image
                  src={demoImages[currentImageIndex]?.src ?? "/placeholder.png"}
                  alt={demoImages[currentImageIndex]?.alt ?? "Demo image"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
                  priority={currentImageIndex === 0}
                  quality={slideshowImageQuality}
                />

                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Progress indicator */}
        {allImagesLoaded && (
          <Progress
            className="mx-auto mt-6 h-1 w-32"
            value={((currentImageIndex + 1) / demoImages.length) * 100}
            aria-label="Demo slideshow progress"
          />
        )}
      </div>
    </section>
  );
}
