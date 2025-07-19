import { Layers, Workflow, Zap } from "lucide-react";

export default function FeaturesSection() {
  return (
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
        <div className="bg-card rounded-xl border p-6 shadow-md transition hover:border-purple-700/50 hover:shadow-purple-900/20">
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
        <div className="bg-card rounded-xl border p-6 shadow-md transition hover:border-purple-700/50 hover:shadow-purple-900/20">
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
        <div className="bg-card rounded-xl border p-6 shadow-md transition hover:border-purple-700/50 hover:shadow-purple-900/20">
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
  );
}
