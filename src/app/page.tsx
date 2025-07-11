"use client";

import Link from "next/link";
import { ArrowRight, Workflow, Zap, Layers } from "lucide-react";
import { ReactFlow, Background, BackgroundVariant } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { previewNodeTypes } from "./preview-config";
import { Button } from "~/components/ui/button";
import TemplatesSection from "./_components/HomePage/TemplatesSection";
import DocumentationSection from "./_components/HomePage/DocumentationSection";
import Footer from "./_components/HomePage/Footer";

const previewImage1Url = "/preview1.png";

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
      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl border-2 border-[var(--border)] shadow-2xl shadow-purple-900/20">
          <div className="pointer-events-none relative h-[500px] w-full overflow-hidden">
            <ReactFlow
              nodes={[
                {
                  id: "1",
                  type: "previewText",
                  position: { x: 500, y: 600 },
                  data: { text: "A dog" },
                },
                {
                  id: "2",
                  type: "previewText",
                  position: { x: 100, y: 600 },
                  data: {
                    text: "Swimming at the bottom of the ocean wearing goggles and playing with other fish",
                  },
                },
                {
                  id: "3",
                  type: "previewImage",
                  position: { x: 300, y: 1000 },
                  data: { imageUrl: previewImage1Url },
                },
              ]}
              edges={[
                {
                  id: "e1-3",
                  source: "1",
                  target: "3",
                },
                {
                  id: "e2-3",
                  source: "2",
                  target: "3",
                },
              ]}
              nodeTypes={previewNodeTypes}
              fitView
              fitViewOptions={{ padding: 0.9 }}
              proOptions={{ hideAttribution: true }}
              colorMode="dark"
              draggable={false}
              connectOnClick={false}
              unselectable="on"
              preventScrolling={false}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            </ReactFlow>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section
        id="demo"
        className="container mx-auto px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-3xl font-bold sm:text-4xl">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              See AI Flow Studio in Action
            </span>
          </h2>
          <p className="mb-10 text-center text-xl">
            Watch how easy it is to create and run AI-powered workflows with our
            visual canvas
          </p>

          <div className="overflow-hidden rounded-xl border-2 border-[var(--border)] bg-[var(--secondary)] shadow-2xl shadow-purple-900/20">
            <video className="w-full" autoPlay loop muted playsInline>
              <source src="/demo1.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="container mx-auto px-4 py-20 sm:px-6 lg:px-8"
      >
        <h2 className="mb-12 text-center text-3xl font-bold sm:text-4xl">
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Powerful Features
          </span>
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-md)] transition hover:border-purple-700/50 hover:shadow-purple-900/20">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
              <Workflow className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">
              Intuitive Visual Canvas
            </h3>
            <p>
              Drag and drop nodes onto the canvas and connect them to create
              complex AI workflows without writing code.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-md)] transition hover:border-purple-700/50 hover:shadow-purple-900/20">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">AI Model Integration</h3>
            <p>
              Connect to state-of-the-art AI models for text generation, image
              creation, analysis, and more.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-md)] transition hover:border-purple-700/50 hover:shadow-purple-900/20">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-pink-600 to-orange-600 shadow-lg">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Process Chaining</h3>
            <p>
              Chain together multiple AI processes to create sophisticated
              automations and workflows.
            </p>
          </div>
        </div>
      </section>

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
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-purple-500/30 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 p-8 shadow-xl">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Ready to Build Your AI Workflow?
            </h2>
            <p className="mb-8 text-xl text-gray-300">
              Start creating powerful AI automations in minutes, no coding
              required.
            </p>
            <Link href="/whiteboard">
              <Button
                className="mx-auto flex w-full items-center justify-center rounded-lg px-8 py-4 font-medium shadow-lg transition-all hover:shadow-xl"
                size="xl"
              >
                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
