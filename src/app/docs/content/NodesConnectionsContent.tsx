"use client";

import {
  Database,
  Share2,
  BookText,
  Image as ImageIcon,
  MessageSquare,
  ArrowDownUp,
  Lightbulb,
  Mail,
  Globe,
  Server,
} from "lucide-react";

export default function NodesConnectionsContent() {
  return (
    <section id="nodes-connections" className="mb-16 scroll-mt-16">
      <h2 className="mb-4 text-2xl font-bold text-white">
        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Nodes & Connections
        </span>
      </h2>
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
        <p className="mb-6 text-gray-300">
          The power of AI Flow Studio comes from its modular node system and the
          connections between them. Understanding how different nodes work and
          interact is essential for building effective workflows.
        </p>

        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold text-white">Node Types</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-blue-500/30 bg-blue-900/10 p-4">
              <div className="mb-3 flex items-center">
                <BookText className="mr-2 h-5 w-5 text-blue-400" />
                <h4 className="text-lg font-medium text-white">Text Node</h4>
              </div>
              <p className="mb-3 text-gray-300">
                Text nodes are the primary way to input textual data into your
                workflows.
              </p>
              <ul className="list-disc space-y-2 pl-5 text-gray-300">
                <li>
                  <span className="font-semibold text-blue-400">Purpose:</span>{" "}
                  Enter prompts, instructions, or any text-based content
                </li>
                <li>
                  <span className="font-semibold text-blue-400">Output:</span>{" "}
                  Raw text that can be connected to instruction nodes or other
                  processing nodes
                </li>
                <li>
                  <span className="font-semibold text-blue-400">Features:</span>{" "}
                  Rich text editor, formatting options, variable length
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-purple-500/30 bg-purple-900/10 p-4">
              <div className="mb-3 flex items-center">
                <ImageIcon className="mr-2 h-5 w-5 text-purple-400" />
                <h4 className="text-lg font-medium text-white">Image Node</h4>
              </div>
              <p className="mb-3 text-gray-300">
                Image nodes allow you to incorporate visual elements into your
                workflows.
              </p>
              <ul className="list-disc space-y-2 pl-5 text-gray-300">
                <li>
                  <span className="font-semibold text-purple-400">
                    Purpose:
                  </span>{" "}
                  Upload images or display generated visuals
                </li>
                <li>
                  <span className="font-semibold text-purple-400">Output:</span>{" "}
                  Image data that can be further processed or analyzed
                </li>
                <li>
                  <span className="font-semibold text-purple-400">
                    Features:
                  </span>{" "}
                  Preview, resize options, metadata display
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-pink-500/30 bg-pink-900/10 p-4">
              <div className="mb-3 flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-pink-400" />
                <h4 className="text-lg font-medium text-white">
                  Instruction Node
                </h4>
              </div>
              <p className="mb-3 text-gray-300">
                The powerhouse of AI Flow Studio, instruction nodes process
                inputs using AI models.
              </p>
              <ul className="list-disc space-y-2 pl-5 text-gray-300">
                <li>
                  <span className="font-semibold text-pink-400">Purpose:</span>{" "}
                  Apply AI transformations based on your chosen model and
                  instructions
                </li>
                <li>
                  <span className="font-semibold text-pink-400">Input:</span>{" "}
                  Can accept text, images, or outputs from other nodes
                </li>
                <li>
                  <span className="font-semibold text-pink-400">Output:</span>{" "}
                  Generated text, images, or analysis results
                </li>
                <li>
                  <span className="font-semibold text-pink-400">Features:</span>{" "}
                  Model selection, parameter tuning, instruction templates
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-yellow-500/30 bg-yellow-900/10 p-4">
              <div className="mb-3 flex items-center">
                <Database className="mr-2 h-5 w-5 text-yellow-400" />
                <h4 className="text-lg font-medium text-white">Comment Node</h4>
              </div>
              <p className="mb-3 text-gray-300">
                Comment nodes help document and organize your workflows.
              </p>
              <ul className="list-disc space-y-2 pl-5 text-gray-300">
                <li>
                  <span className="font-semibold text-yellow-400">
                    Purpose:
                  </span>{" "}
                  Add notes, explanations, or section labels to your workflow
                </li>
                <li>
                  <span className="font-semibold text-yellow-400">
                    Behavior:
                  </span>{" "}
                  Do not process data; purely for documentation
                </li>
                <li>
                  <span className="font-semibold text-yellow-400">
                    Features:
                  </span>{" "}
                  Customizable colors, sizes, and styles for better organization
                </li>
              </ul>
            </div>

            <div className="relative rounded-lg border border-green-500/30 bg-green-900/10 p-4">
              <div className="absolute -top-3 right-3 rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                Coming Soon
              </div>
              <div className="mb-3 flex items-center">
                <Mail className="mr-2 h-5 w-5 text-green-400" />
                <h4 className="text-lg font-medium text-white">Email Node</h4>
              </div>
              <p className="mb-3 text-gray-300">
                Email nodes will enable your workflows to send automated emails
                based on your data.
              </p>
              <ul className="list-disc space-y-2 pl-5 text-gray-300">
                <li>
                  <span className="font-semibold text-green-400">Purpose:</span>{" "}
                  Send emails with content from connected nodes
                </li>
                <li>
                  <span className="font-semibold text-green-400">Input:</span>{" "}
                  Subject, body content, recipient information
                </li>
                <li>
                  <span className="font-semibold text-green-400">
                    Features:
                  </span>{" "}
                  Templates, scheduling, attachment support
                </li>
              </ul>
            </div>

            <div className="relative rounded-lg border border-indigo-500/30 bg-indigo-900/10 p-4">
              <div className="absolute -top-3 right-3 rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                Coming Soon
              </div>
              <div className="mb-3 flex items-center">
                <Globe className="mr-2 h-5 w-5 text-indigo-400" />
                <h4 className="text-lg font-medium text-white">Website Node</h4>
              </div>
              <p className="mb-3 text-gray-300">
                Website nodes will transform your workflow outputs into
                shareable web pages.
              </p>
              <ul className="list-disc space-y-2 pl-5 text-gray-300">
                <li>
                  <span className="font-semibold text-indigo-400">
                    Purpose:
                  </span>{" "}
                  Create a webpage displaying data from connected nodes
                </li>
                <li>
                  <span className="font-semibold text-indigo-400">Input:</span>{" "}
                  Content from any connected node type
                </li>
                <li>
                  <span className="font-semibold text-indigo-400">
                    Features:
                  </span>{" "}
                  Custom themes, layouts, public/private sharing options
                </li>
              </ul>
            </div>

            <div className="relative rounded-lg border border-orange-500/30 bg-orange-900/10 p-4">
              <div className="absolute -top-3 right-3 rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                Coming Soon
              </div>
              <div className="mb-3 flex items-center">
                <Server className="mr-2 h-5 w-5 text-orange-400" />
                <h4 className="text-lg font-medium text-white">
                  Data Fetching Node
                </h4>
              </div>
              <p className="mb-3 text-gray-300">
                Advanced nodes for retrieving data from external sources across
                the internet.
              </p>
              <ul className="list-disc space-y-2 pl-5 text-gray-300">
                <li>
                  <span className="font-semibold text-orange-400">
                    Purpose:
                  </span>{" "}
                  Fetch data from APIs, websites, and other online sources
                </li>
                <li>
                  <span className="font-semibold text-orange-400">Output:</span>{" "}
                  Structured data that can be processed by other nodes
                </li>
                <li>
                  <span className="font-semibold text-orange-400">
                    Features:
                  </span>{" "}
                  Request configuration, data parsing, error handling
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold text-white">
            Connection Behavior
          </h3>
          <p className="mb-4 text-gray-300">
            Connections define the flow of data between nodes, determining how
            information travels through your workflow.
          </p>

          <div className="mb-6 rounded-lg border border-gray-700 bg-gray-800/70 p-5">
            <div className="mb-4 flex items-center">
              <Share2 className="mr-2 h-5 w-5 text-blue-400" />
              <h4 className="text-lg font-medium text-white">
                Connection Types
              </h4>
            </div>
            <div className="space-y-4">
              <div>
                <h5 className="mb-1 font-semibold text-blue-300">
                  Text to Instruction
                </h5>
                <p className="ml-4 text-gray-300">
                  When connecting a Text Node to an Instruction Node, the text
                  content serves as the input prompt or context for the AI
                  model. The instruction node will process this text according
                  to its configuration.
                </p>
              </div>

              <div>
                <h5 className="mb-1 font-semibold text-purple-300">
                  Image to Instruction
                </h5>
                <p className="ml-4 text-gray-300">
                  When an Image Node connects to an Instruction Node, the image
                  is analyzed or modified by the selected AI model. This can be
                  used for image analysis, captioning, or combined with text for
                  image manipulation.
                </p>
              </div>

              <div>
                <h5 className="mb-1 font-semibold text-pink-300">
                  Instruction to Image
                </h5>
                <p className="ml-4 text-gray-300">
                  Text-to-image generation occurs when an Instruction Node is
                  configured to generate an image and is connected to an Image
                  Node. The output will be displayed in the Image Node.
                </p>
              </div>

              <div>
                <h5 className="mb-1 font-semibold text-green-300">
                  Chained Instructions
                </h5>
                <p className="ml-4 text-gray-300">
                  Multiple Instruction Nodes can be chained together to perform
                  sequential operations, with each node processing the output of
                  the previous one to create complex transformations.
                </p>
              </div>

              <div className="rounded-lg bg-gray-700/30 p-3">
                <h5 className="mb-1 font-semibold text-blue-300">
                  Coming Soon: Advanced Connection Types
                </h5>
                <p className="ml-4 text-gray-300">
                  With our upcoming nodes, you&apos;ll be able to create even
                  more powerful workflows:
                </p>
                <ul className="mt-2 ml-8 list-disc space-y-2 text-gray-300">
                  <li>
                    <span className="font-semibold text-green-300">
                      Content to Email:
                    </span>{" "}
                    Connect any content node to an Email Node to send its data
                    automatically
                  </li>
                  <li>
                    <span className="font-semibold text-indigo-300">
                      Flow to Website:
                    </span>{" "}
                    Export entire workflow results to shareable web pages
                  </li>
                  <li>
                    <span className="font-semibold text-orange-300">
                      Data Fetch to Processing:
                    </span>{" "}
                    Retrieve external data and feed it directly into your AI
                    processing pipeline
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-4 text-xl font-semibold text-white">
            Data Flow Principles
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <ArrowDownUp className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
              <div>
                <h4 className="mb-1 font-medium text-white">
                  Directional Flow
                </h4>
                <p className="text-gray-300">
                  Data in AI Flow Studio always flows from left to right.
                  Outputs from nodes on the left become inputs for nodes on the
                  right, creating a clear visual representation of your
                  processing pipeline.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ArrowDownUp className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-400" />
              <div>
                <h4 className="mb-1 font-medium text-white">
                  One-to-Many Connections
                </h4>
                <p className="text-gray-300">
                  A single node&apos;s output can connect to multiple
                  destination nodes, allowing you to process the same data in
                  different ways simultaneously.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ArrowDownUp className="mt-0.5 h-5 w-5 flex-shrink-0 text-pink-400" />
              <div>
                <h4 className="mb-1 font-medium text-white">
                  Many-to-One Connections
                </h4>
                <p className="text-gray-300">
                  Some nodes can accept multiple inputs, combining data from
                  different sources. For example, an Instruction Node might take
                  2 text nodes to generate an image based on the combined
                  content, using all elements and descriptions from both text
                  inputs to create a comprehensive visual that incorporates all
                  specified details.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-blue-500/30 bg-blue-900/20 p-4">
          <div className="mb-3 flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-yellow-400" />
            <h4 className="text-lg font-medium text-white">Best Practices</h4>
          </div>
          <ul className="list-disc space-y-2 pl-5 text-gray-300">
            <li>Start simple and gradually add complexity to your workflows</li>
            <li>
              Use Comment Nodes to document your thought process and node
              configurations
            </li>
            <li>
              Organize your nodes in logical groups based on functionality
            </li>
            <li>
              Test connections individually before running the entire workflow
            </li>
            <li>
              Stay tuned for our upcoming node types to extend your workflow
              capabilities
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
