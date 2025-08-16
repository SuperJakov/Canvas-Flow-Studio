import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import RotatingWords from "./HeroSection/RotatingWords";
import DynamicAnimatedBackground from "./HeroSection/DynamicAnimatedBackground";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      <DynamicAnimatedBackground />
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(var(--chart-1-rgb, 59, 130, 246), 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(var(--chart-3-rgb, 34, 197, 94), 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(var(--chart-5-rgb, 168, 85, 247), 0.1) 0%, transparent 50%)
          `,
        }}
      />
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h1 className="mb-6 text-4xl font-bold sm:text-5xl md:text-6xl">
          <span className="bg-gradient-to-r from-[var(--chart-1)] via-[var(--chart-3)] to-[var(--chart-5)] bg-clip-text text-transparent">
            Drag. Drop. Build.
            <br />
            AI for <RotatingWords />
          </span>
        </h1>
        <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-xl">
          Create, visualize, and run complex AI workflows through an intuitive
          drag-and-drop interface. No coding required.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild size="xl">
            <Link href="/whiteboards" prefetch={true}>
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
  );
}
