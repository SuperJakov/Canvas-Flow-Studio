export default function DemoVideoSection() {
  return (
    <section id="demo" className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
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
  );
}
