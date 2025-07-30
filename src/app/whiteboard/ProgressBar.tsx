"use client";
import { useAtomValue } from "jotai";
import { executionProgressAtom } from "./atoms";
import { Progress } from "~/components/ui/progress";
import { AnimatePresence, motion } from "framer-motion";

export default function ProgressBar() {
  const { executedNodesCount, isExecuting, totalNodesForExecution } =
    useAtomValue(executionProgressAtom);

  const progress =
    totalNodesForExecution > 0
      ? (executedNodesCount / totalNodesForExecution) * 100
      : 0;

  return (
    <AnimatePresence>
      {isExecuting && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-muted fixed top-16 left-1/2 z-[99999999] w-[100px] max-w-md -translate-x-1/2 rounded-md px-4 py-2 shadow backdrop-blur sm:w-[100px] md:w-[150px] lg:w-[200px]"
        >
          <div className="text-muted-foreground mb-1 text-center text-xs">
            Executing Flow<span className="dots-animation"></span>
          </div>

          <Progress value={progress} className="h-1" />

          {/* Pure CSS animation */}
          <style jsx>{`
            .dots-animation::after {
              margin-left: 1px;
              content: "";
              display: inline-block;
              animation: dotCycle 2s steps(1, end) infinite;
            }

            @keyframes dotCycle {
              0% {
                content: ".";
              }
              33% {
                content: "..";
              }
              66% {
                content: "...";
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
