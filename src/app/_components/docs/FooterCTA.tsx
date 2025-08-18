"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function FooterCTA() {
  return (
    <div className="mt-16 rounded-xl border border-purple-500/30 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20 p-8">
      <h3 className="mb-4 text-xl font-bold text-white">
        Ready to start building?
      </h3>
      <p className="mb-6 text-gray-300">
        Put your new knowledge to use by creating your own AI workflow.
      </p>
      <Link
        href="/whiteboard"
        className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl"
      >
        Open Canvas
        <ChevronRight className="ml-2 h-4 w-4" />
      </Link>
    </div>
  );
}
