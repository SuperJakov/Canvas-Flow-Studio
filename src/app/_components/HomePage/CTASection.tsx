import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function CTASection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="border-primary/30 from-primary/10 via-accent/10 to-chart-5/10 mx-auto max-w-4xl rounded-2xl border bg-gradient-to-r p-8 shadow-xl backdrop-blur-sm">
        <div className="text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold">
            Ready to Build Your AI Workflow?
          </h2>
          <p className="text-muted-foreground mb-8 text-xl">
            Start creating powerful AI automations in minutes, no coding
            required.
          </p>
          <Link href="/whiteboard" prefetch={true}>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 mx-auto flex w-full items-center justify-center rounded-lg px-8 py-4 font-medium shadow-lg transition-all hover:shadow-xl"
              size="xl"
            >
              Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
