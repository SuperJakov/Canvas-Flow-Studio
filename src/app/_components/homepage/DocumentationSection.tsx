import { Book } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function DocumentationSection() {
  return (
    <section className="w-full px-4 py-16 shadow-lg sm:px-6 lg:px-8">
      <div className="p-8">
        <h3 className="mb-4 text-center text-3xl font-extrabold">
          <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
            Comprehensive Documentation
          </span>
        </h3>

        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="text-lg leading-relaxed">
            Explore our detailed guides, tutorials, and reference materials to
            master Canvas Flow Studio and create powerful workflows. Dive deep
            into features, best practices, and advanced configurations to unlock
            your full potential.
          </p>
        </div>

        <div className="flex items-center justify-center">
          <Link href="/docs">
            <Button
              className="flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold shadow-xl transition-all duration-300 hover:shadow-2xl"
              variant="default"
              size="xl"
            >
              <Book className="h-6 w-6" />
              Browse Documentation
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
