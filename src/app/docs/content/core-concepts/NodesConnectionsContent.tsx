"use client";

import {
  Database,
  Share2,
  Image as ImageIcon,
  MessageSquare,
  Lightbulb,
  Type,
} from "lucide-react";
import PageTitle from "../../../_components/docs/PageTitle";

export default function NodesConnectionsContent() {
  return (
    <main id="nodes-connections" className="mb-16 scroll-mt-16">
      <PageTitle>Nodes & Connections</PageTitle>
      <div>
        <p className="mb-6">
          Canvas Flow Studio uses a simple node-based system. Each node has a
          specific purpose, and by connecting them together, you can create
          AI-powered workflows without any coding.
        </p>

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Node Types</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-blue-500/30 bg-blue-900/10 p-4">
              <div className="mb-3 flex items-center">
                <Type className="mr-2 h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-medium text-white">Text Node</h3>
              </div>
              <p className="mb-3">
                Text nodes are the starting point of most workflows. They let
                you input text that can be used to generate images or be
                processed by instruction nodes.
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <span className="font-semibold text-blue-400">Purpose:</span>{" "}
                  Write prompts or text for AI processing
                </li>
                <li>
                  <span className="font-semibold text-blue-400">Usage:</span>{" "}
                  Connect to Image Nodes to generate images or Instruction Nodes
                  for text processing
                </li>
                <li>
                  <span className="font-semibold text-blue-400">Features:</span>{" "}
                  Simple text editing, automatic creation in new whiteboards
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-purple-500/30 bg-purple-900/10 p-4">
              <div className="mb-3 flex items-center">
                <ImageIcon className="mr-2 h-5 w-5 text-purple-400" />
                <h4 className="text-lg font-medium text-white">Image Node</h4>
              </div>
              <p className="mb-3">
                Image nodes are used to generate AI images from text
                descriptions or display uploaded images.
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <span className="font-semibold text-purple-400">
                    Purpose:
                  </span>{" "}
                  Generate AI images or display uploaded images
                </li>
                <li>
                  <span className="font-semibold text-purple-400">Input:</span>{" "}
                  Text descriptions from Text Nodes
                </li>
                <li>
                  <span className="font-semibold text-purple-400">
                    Features:
                  </span>{" "}
                  AI image generation, image preview
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-yellow-500/30 bg-yellow-900/10 p-4">
              <div className="mb-3 flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-yellow-400" />
                <h3 className="text-lg font-medium text-white">
                  Instruction Node
                </h3>
              </div>
              <p className="mb-3">
                Instruction nodes modify and process content from other nodes
                using AI models.
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <span className="font-semibold text-yellow-400">
                    Purpose:
                  </span>{" "}
                  Process and transform content using AI
                </li>
                <li>
                  <span className="font-semibold text-yellow-400">Input:</span>{" "}
                  Text or images from other nodes
                </li>
                <li>
                  <span className="font-semibold text-yellow-400">Output:</span>{" "}
                  Modified text, images, or other content types
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-orange-500/30 bg-orange-900/10 p-4">
              <div className="mb-3 flex items-center">
                <Database className="mr-2 h-5 w-5 text-orange-400" />
                <h3 className="text-lg font-medium text-white">Comment Node</h3>
              </div>
              <p className="mb-3">
                Comment nodes help document your workflow. They don&apos;t
                process any data.
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <span className="font-semibold text-orange-400">
                    Purpose:
                  </span>{" "}
                  Add notes and documentation to your workflow
                </li>
                <li>
                  <span className="font-semibold text-orange-400">Usage:</span>{" "}
                  Cannot be connected to other nodes
                </li>
                <li>
                  <span className="font-semibold text-orange-400">
                    Features:
                  </span>{" "}
                  Customizable appearance for better organization
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">How Connections Work</h2>
          <p className="mb-4">
            Connections allow nodes to work together by passing data between
            them. You can create a connection by dragging the handle from the
            bottom one node to the handle top of another node.
          </p>
          <div className="my-5 rounded-lg outline-2 outline-white select-none">
            <video
              width="100%"
              muted
              autoPlay
              loop
              playsInline
              controls={false}
            >
              <source src="/connecting_nodes.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="mb-6 rounded-lg border border-gray-700 bg-gray-800/70 p-5">
            <div className="mb-4 flex items-center">
              <Share2 className="mr-2 h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-medium text-white">
                Basic Connections
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="mb-1 font-semibold text-blue-300">
                  Text to Image
                </h4>
                <p className="ml-4">
                  The most common connection: Connect a Text Node to an Image
                  Node to generate an AI image based on your text description.
                </p>
              </div>

              <div>
                <h4 className="mb-1 font-semibold text-purple-300">
                  Creating Connections
                </h4>
                <p className="ml-4">
                  Click and drag from an output handle (bottom) of one node to
                  an input handle (top) of another node.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 border-border-2 rounded-md border p-4">
          <div className="mb-3 flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-medium">Tips for Success</h3>
          </div>
          <ul className="list-disc space-y-2 pl-5">
            <li>Start with a simple Text Node to Image Node connection</li>
            <li>Test your connections one at a time</li>
            <li>
              Use Comment Nodes to document complex parts of your workflow
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
