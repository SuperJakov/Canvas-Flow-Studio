"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import "@xyflow/react/dist/style.css";
import { Button } from "~/components/ui/button";
import TemplatesSection from "./_components/HomePage/TemplatesSection";
import DocumentationSection from "./_components/HomePage/DocumentationSection";
import Footer from "./_components/HomePage/Footer";
import CanvasPreviewSection from "./_components/HomePage/CanvasPreviewSection";
import DemoVideoSection from "./_components/HomePage/DemoVideoSection";
import FeaturesSection from "./_components/HomePage/FeaturesSection";
import CTASection from "./_components/HomePage/CTASection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] bg-gradient-to-b text-[var(--foreground)]">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold sm:text-5xl md:text-6xl">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Your Visual Canvas for Building AI-Powered Automations
            </span>
          </h1>
          <p className="mb-10 text-xl">
            Create, visualize, and run complex AI workflows through an intuitive
            drag-and-drop interface. No coding required.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="xl">
              <Link href="/whiteboard">
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

      {/* Canvas Preview Section */}
      <CanvasPreviewSection />

      {/* Demo Video Section */}
      <DemoVideoSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works Section */}
      <section
        id="workflow"
        className="container mx-auto px-4 py-20 sm:px-6 lg:px-8"
      >
        <h2 className="mb-12 text-center text-3xl font-bold sm:text-4xl">
          <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            How It Works
          </span>
        </h2>

        <div className="mx-auto max-w-3xl space-y-12">
          {/* Step 1 */}
          <div className="flex items-start gap-6">
            <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
              <span className="font-bold text-white select-none">1</span>
            </div>
            <div>
              <h3 className="mb-2 text-xl font-semibold">Add Input Nodes</h3>
              <p>
                Start by dragging text or image input nodes onto the canvas.
                These will be the starting points of your workflow.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-6">
            <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
              <span className="font-bold text-white select-none">2</span>
            </div>
            <div>
              <h3 className="mb-2 text-xl font-semibold">
                Connect to AI Nodes
              </h3>
              <p>
                Connect your inputs to AI instruction nodes that will process
                your data using powerful AI models. Configure instructions to
                specify exactly what you want the AI to do.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-6">
            <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-pink-600 to-orange-600 shadow-lg">
              <span className="font-bold text-white select-none">3</span>
            </div>
            <div>
              <h3 className="mb-2 text-xl font-semibold">Chain Results</h3>
              <p>
                Use the outputs from one AI node as inputs to another. Chain
                multiple nodes together to create complex workflows that
                accomplish sophisticated tasks.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-6">
            <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-red-600 shadow-lg">
              <span className="font-bold text-white select-none">4</span>
            </div>
            <div>
              <h3 className="mb-2 text-xl font-semibold">Run & Iterate</h3>
              <p>
                Execute your flow with a single click, see the results in
                real-time, and make adjustments to improve your process. Save
                your flows for future use.
              </p>
            </div>
          </div>
        </div>
      </section>

      <TemplatesSection />

      {/* Documentation Section */}
      <DocumentationSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
