export default function HowItWorksSection() {
  return (
    <section
      id="workflow"
      className="container mx-auto px-4 py-20 sm:px-6 lg:px-8"
    >
      <h2 className="mb-12 text-center text-3xl font-bold sm:text-4xl">
        <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
          How It Works
        </span>
      </h2>

      <div className="mx-auto max-w-3xl space-y-12">
        {/* Step 1 */}
        <div className="flex items-start gap-6">
          <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--primary)] shadow-lg">
            <span className="font-bold text-[var(--primary-foreground)] select-none">
              1
            </span>
          </div>
          <div>
            <h3 className="mb-2 text-xl font-semibold text-[var(--foreground)]">
              Add Input Nodes
            </h3>
            <p className="text-[var(--muted-foreground)]">
              Start by dragging text or image input nodes onto the canvas. These
              will be the starting points of your workflow.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-6">
          <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)] shadow-lg">
            <span className="font-bold text-[var(--accent-foreground)] select-none">
              2
            </span>
          </div>
          <div>
            <h3 className="mb-2 text-xl font-semibold text-[var(--foreground)]">
              Connect to AI Nodes
            </h3>
            <p className="text-[var(--muted-foreground)]">
              Connect your inputs to AI instruction nodes that will process your
              data using powerful AI models. Configure instructions to specify
              exactly what you want the AI to do.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-6">
          <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--chart-3)] shadow-lg">
            <span className="font-bold text-[var(--background)] select-none">
              3
            </span>
          </div>
          <div>
            <h3 className="mb-2 text-xl font-semibold text-[var(--foreground)]">
              Chain Results
            </h3>
            <p className="text-[var(--muted-foreground)]">
              Use the outputs from one AI node as inputs to another. Chain
              multiple nodes together to create complex workflows that
              accomplish sophisticated tasks.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex items-start gap-6">
          <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--destructive)] shadow-lg">
            <span className="font-bold text-[var(--destructive-foreground)] select-none">
              4
            </span>
          </div>
          <div>
            <h3 className="mb-2 text-xl font-semibold text-[var(--foreground)]">
              Run & Iterate
            </h3>
            <p className="text-[var(--muted-foreground)]">
              Execute your flow with a single click, see the results in
              real-time, and make adjustments to improve your process. Save your
              flows for future use.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
