"use client";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "~/components/ui/button";

const TOTAL_STEPS = 4;

const stepContent = [
  {
    title: "Step 1: Creating Nodes",
    video: "/creating_nodes.mp4",
    description: "Add new nodes to your whiteboard.",
  },
  {
    title: "Step 2: Connecting Nodes",
    video: "/connecting_text_with_image.mp4",
    description: "Connect text node to image node.",
  },
  {
    title: "Step 3: Generating an Image",
    video: "/generating_image.mp4",
    description: "Run the workflow to generate an image.",
  },
  {
    title: "Step 4: Changing the Style",
    video: "/changing_style.mp4",
    description: "Modify the style of your generated image.",
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const stepVariants = {
  enter: {
    opacity: 0,
    x: 50,
    scale: 0.95,
  },
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    x: -50,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
} as const;

const completionVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
} as const;

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
};

const progressVariants = {
  initial: { width: 0 },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      duration: 0.8,
      ease: "easeOut" as const,
    },
  }),
};

export default function OnBoardingPage() {
  const [step, setStep] = useState(1);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const handleStepChange = (newStep: number) => {
    if (newStep === step) return;
    setVideoLoaded(false);
    setStep(newStep);
  };

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  const isCompleted = step > TOTAL_STEPS;
  const currentStepData = stepContent[step - 1];
  const progress = (Math.min(step, TOTAL_STEPS) / TOTAL_STEPS) * 100;

  return (
    <div className="bg-background flex h-screen flex-col overflow-hidden">
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <motion.div
        className="container mx-auto flex max-w-4xl flex-1 flex-col px-4 pt-18 pb-8" // Added pb-8 for bottom padding
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="mb-4 text-center" variants={itemVariants}>
          <motion.h1
            className="text-foreground mb-2 text-3xl font-bold"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Onboarding Tutorial
          </motion.h1>
          <motion.p
            className="text-muted-foreground mx-auto max-w-2xl text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            A quick and easy to follow tutorial on how to use Canvas Flow
            Studio.
          </motion.p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div className="mb-4" variants={itemVariants}>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium">
              Progress
            </span>
            <motion.span
              className="text-muted-foreground text-xs font-medium"
              key={step}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {isCompleted ? TOTAL_STEPS : step} of {TOTAL_STEPS}
            </motion.span>
          </div>
          <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
            <motion.div
              className="bg-primary h-1.5 rounded-full"
              variants={progressVariants}
              initial="initial"
              animate="animate"
              custom={progress}
            />
          </div>
        </motion.div>

        {/* Content Container */}
        <div className="relative mb-6 flex-1">
          {" "}
          {/* Increased mb-4 to mb-6 */}
          <AnimatePresence mode="wait">
            {!isCompleted ? (
              <motion.div
                key={step}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="bg-card rounded-xl border p-2 shadow-lg"
              >
                {/* Step Header */}
                <div className="mb-3 text-center">
                  <motion.h2
                    className="text-card-foreground mb-1 text-lg font-semibold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {currentStepData?.title}
                  </motion.h2>

                  <motion.p
                    className="text-muted-foreground text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {currentStepData?.description}
                  </motion.p>
                </div>

                {/* Video Container */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <div className="bg-muted relative mx-auto aspect-video max-w-xl overflow-hidden rounded-lg shadow-md">
                    <AnimatePresence>
                      {!videoLoaded && (
                        <motion.div
                          className="absolute inset-0 z-10 flex items-center justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            className="border-primary h-6 w-6 rounded-full border-2 border-t-transparent"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.video
                      key={step}
                      src={currentStepData?.video}
                      className="h-full w-full object-contain" // Changed from object-cover to object-contain
                      autoPlay
                      loop
                      muted
                      playsInline
                      onLoadedData={handleVideoLoad}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: videoLoaded ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="completion"
                variants={completionVariants}
                initial="hidden"
                animate="visible"
                className="bg-card rounded-xl border p-4 text-center shadow-lg"
              >
                <motion.div className="mb-4" variants={itemVariants}>
                  <motion.div
                    className="bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.svg
                      className="text-primary h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                        damping: 10,
                      }}
                    >
                      <motion.path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                      />
                    </motion.svg>
                  </motion.div>

                  <motion.h2
                    className="text-card-foreground mb-2 text-xl font-bold"
                    variants={itemVariants}
                  >
                    Congratulations! 🎉
                  </motion.h2>

                  <motion.p
                    className="text-muted-foreground mb-4"
                    variants={itemVariants}
                  >
                    You now know how to generate images in Canvas Flow Studio.
                  </motion.p>
                </motion.div>

                <motion.div className="space-y-3" variants={itemVariants}>
                  <motion.p
                    className="text-muted-foreground text-sm"
                    variants={itemVariants}
                  >
                    Ready to dive deeper? Check out our{" "}
                    <Link
                      href="/docs"
                      className="text-primary font-medium transition-colors hover:underline"
                    >
                      comprehensive documentation
                    </Link>{" "}
                    to learn advanced features.
                  </motion.p>
                  <motion.p
                    className="text-muted-foreground text-sm font-medium"
                    variants={itemVariants}
                  >
                    Or jump right in and start creating
                  </motion.p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <motion.div
          className="mb-4 flex justify-center gap-3" // Added mb-4 for spacing
          variants={itemVariants}
        >
          {!isCompleted ? (
            <div className="flex gap-2">
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  disabled={step <= 1}
                  variant="outline"
                  onClick={() => handleStepChange(step - 1)}
                  className="min-w-[80px] px-3 py-1.5 text-sm"
                >
                  <svg
                    className="mr-1 h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back
                </Button>
              </motion.div>

              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  onClick={() => handleStepChange(step + 1)}
                  className="min-w-[80px] px-3 py-1.5 text-sm"
                >
                  {step === TOTAL_STEPS ? "Complete" : "Next"}
                  <svg
                    className="ml-1 h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>
              </motion.div>
            </div>
          ) : (
            <Link href="/whiteboards">
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button size="sm" className="px-6">
                  Start Creating
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Button>
              </motion.div>
            </Link>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
