export default function HowItWorksSection() {
  return (
    <section
      id="workflow"
      className="container mx-auto px-4 py-20 sm:px-6 lg:px-8"
    >
      <h2 className="mb-12 text-center text-3xl font-bold sm:text-4xl">
        <span className="bg-gradient-to-r from-[var(--chart-1)] via-[var(--chart-3)] to-[var(--chart-5)] bg-clip-text text-transparent">
          How It Works
        </span>
      </h2>

      <div className="mx-auto max-w-3xl space-y-12">
        {/* Step 1 */}
        <div className="flex items-start gap-6">
          <div className="bg-primary mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full shadow-lg">
            <span className="text-primary-foreground font-bold select-none">
              1
            </span>
          </div>
          <div>
            <h3 className="text-foreground mb-2 text-xl font-semibold">
              Add Input Nodes
            </h3>
            <p className="text-muted-foreground">
              Start by dragging text or image input nodes onto the canvas. These
              will be the starting points of your workflow.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-6">
          <div className="bg-accent mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full shadow-lg">
            <span className="text-accent-foreground font-bold select-none">
              2
            </span>
          </div>
          <div>
            <h3 className="text-foreground mb-2 text-xl font-semibold">
              Connect to AI Nodes
            </h3>
            <p className="text-muted-foreground">
              Connect your inputs to AI instruction nodes that will process your
              data using powerful AI models. Configure instructions to specify
              exactly what you want the AI to do.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-6">
          <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--chart-3)] shadow-lg">
            <span className="text-background font-bold select-none">3</span>
          </div>
          <div>
            <h3 className="text-foreground mb-2 text-xl font-semibold">
              Chain Results
            </h3>
            <p className="text-muted-foreground">
              Use the outputs from one AI node as inputs to another. Chain
              multiple nodes together to create complex workflows that
              accomplish sophisticated tasks.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex items-start gap-6">
          <div className="bg-destructive mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full shadow-lg">
            <span className="text-destructive-foreground font-bold select-none">
              4
            </span>
          </div>
          <div>
            <h3 className="text-foreground mb-2 text-xl font-semibold">
              Run & Iterate
            </h3>
            <p className="text-muted-foreground">
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
