"use client";

import Link from "next/link";
import { ArrowRight, Workflow, Zap, Layers, Book } from "lucide-react";
import { ReactFlow, Background, BackgroundVariant } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { previewNodeTypes } from "./preview-config";
import { Button } from "~/components/ui/button";
import TemplatesSection from "./_components/HomePage/TemplatesSection";
import DocumentationSection from "./_components/HomePage/DocumentationSection";

const previewImage1Url = "/preview1.png";

function DiscordIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612" />
    </svg>
  );
}

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

      {/* CTA Section - keep this "Get Started Now" button as it's the main CTA */}
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
            <Link
              href="/whiteboard"
              className="mx-auto flex cursor-pointer items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 font-medium text-white shadow-lg transition-all hover:from-blue-600 hover:to-purple-700 hover:shadow-xl"
            >
              Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-6 md:mb-0">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-2xl font-bold text-transparent">
                AI Flow Studio
              </span>
              <p className="mt-2 text-gray-400">
                Build AI-powered workflows visually.
              </p>
            </div>
            <div className="flex space-x-6">
              <Link
                href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ?? "#"}
                className="text-gray-400 transition hover:text-white"
              >
                <span className="sr-only">Discord</span>
                <DiscordIcon />
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 AI Flow Studio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
