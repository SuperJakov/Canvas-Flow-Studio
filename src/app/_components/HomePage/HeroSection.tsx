import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function HeroSection() {
  return (
    <section className="container mx-auto px-4 pt-32 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mb-6 text-4xl font-bold sm:text-5xl md:text-6xl">
          <span className="from-accent via-primary bg-gradient-to-r to-[var(--chart-3)] bg-clip-text text-transparent">
            Your Visual Canvas for Building AI-Powered Automations
          </span>
        </h1>
        <p className="text-muted-foreground mb-10 text-xl">
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
  );
}
