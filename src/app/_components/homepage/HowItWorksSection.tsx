export default function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: "Create Your Foundation",
      description:
        "Start by dragging input nodes onto the canvas. These are the building blocks for your AI workflow.",
      color: "bg-primary",
      textColor: "text-primary-foreground",
    },
    {
      number: 2,
      title: "Build Connections",
      description:
        "Connect nodes to build your workflow. Link different types of nodes and experiment to see what you can create.",
      color: "bg-chart-4",
      textColor: "text-primary-foreground",
    },
    {
      number: 3,
      title: "Chain & Transform",
      description:
        "Use the output of one node as the input for another to create more powerful and complex workflows.",
      color: "bg-chart-3",
      textColor: "text-background",
    },
    {
      number: 4,
      title: "Execute & Refine",
      description:
        "Run your entire workflow with one click and see the results instantly. You can easily make changes, and all your work is saved automatically.",
      color: "bg-destructive",
      textColor: "text-destructive-foreground",
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
          <span className="bg-gradient-to-r from-[var(--chart-1)] via-[var(--chart-3)] to-[var(--chart-5)] bg-clip-text text-transparent">
            How It Works
          </span>
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          Build powerful AI workflows in four simple steps
        </p>
      </div>

      {/* Steps */}
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="group relative flex items-start gap-6 md:gap-8"
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="bg-border absolute top-12 left-5 z-0 h-full w-0.5 md:left-6" />
              )}

              {/* Step Number Circle */}
              <div
                className={`${step.color} relative z-10 mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl md:h-12 md:w-12`}
              >
                <span
                  className={`${step.textColor} text-sm font-bold select-none md:text-base`}
                >
                  {step.number}
                </span>
              </div>

              {/* Step Content */}
              <div className="flex-1 pb-2">
                <h3 className="text-foreground group-hover:text-primary mb-3 text-xl font-semibold transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
