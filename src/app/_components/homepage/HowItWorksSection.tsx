export default function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: "Create Your Foundation",
      description: "Start by dragging input nodes onto the canvas.",
      color: "border-primary text-primary",
      hoverColor: "group-hover:bg-primary group-hover:text-primary-foreground",
    },
    {
      number: 2,
      title: "Build Connections",
      description:
        "Connect nodes to build your workflow. Link different types of nodes and experiment to see what you can create.",
      color: "border-chart-4 text-chart-4",
      hoverColor: "group-hover:bg-chart-4 group-hover:text-primary-foreground",
    },
    {
      number: 3,
      title: "Chain & Transform",
      description:
        "Use the output of one node as the input for another to create more powerful and complex workflows.",
      color: "border-chart-3 text-chart-3",
      hoverColor: "group-hover:bg-chart-3 group-hover:text-background",
    },
    {
      number: 4,
      title: "Execute & Refine",
      description:
        "Run your entire workflow with one click and see the results. You can easily make changes, and all your work is saved automatically.",
      color: "border-destructive text-destructive",
      hoverColor:
        "group-hover:bg-destructive group-hover:text-destructive-foreground",
    },
  ];

  return (
    <section
      id="workflow"
      className="container mx-auto px-4 py-20 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="mb-16 text-center">
        <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
          <span className="text-primary">How It Works</span>
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          Build powerful AI workflows in four simple steps
        </p>
      </div>

      {/* Steps with Single-Sided Layout */}
      <div className="relative mx-auto max-w-4xl">
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="group relative flex items-start gap-6 md:gap-8"
            >
              {/* Conditionally render the connecting line */}
              {index < steps.length - 1 && (
                <div className="bg-border absolute top-12 left-6 z-0 h-full w-0.5 -translate-x-1/2" />
              )}

              {/* Step Number Circle */}
              <div className="bg-background relative z-10 mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 shadow-lg transition-all duration-300 ease-in-out group-hover:scale-110">
                <div
                  className={`flex h-full w-full items-center justify-center rounded-full ${step.color} ${step.hoverColor}`}
                >
                  <span className="text-lg font-bold select-none">
                    {step.number}
                  </span>
                </div>
              </div>

              {/* Step Content Card */}
              <div className="flex-1">
                <div className="bg-card/60 border-border/60 hover:border-primary/80 transform-gpu rounded-lg border p-6 shadow-md backdrop-blur-sm transition-all duration-300 ease-in-out group-hover:-translate-y-1">
                  <h3 className="text-foreground mb-2 text-xl font-semibold">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
