"use client";

import { Separator } from "~/components/ui/separator";
import PageTitle from "../../../_components/docs/PageTitle";

export default function IntroductionContent() {
  return (
    <main id="introduction" className="bg-background mb-16 scroll-mt-16">
      <PageTitle>Introduction</PageTitle>
      <div>
        <p>Welcome to Canvas Flow Studio documentation!</p>

        <Separator className="my-6" />

        <h2 className="pb-2 text-2xl font-bold">What is Canvas Flow Studio?</h2>

        <p>
          Canvas Flow Studio is an app which is used to create AI-powered
          workflows through a visual, node-based interface.
        </p>
        <p>
          It was made to simplify the process of building AI applications which
          help people:
        </p>
        <ul className="list-disc space-y-2 pt-4 pl-5">
          <li>
            <span className="text-primary font-bold">
              Build Complex Ideas from Simple Parts:
            </span>{" "}
            Users can mix and match different text nodes to see what happens,
            making experimentation fast and fun.
          </li>
          <li>
            <span className="text-primary font-bold">
              Visualize the AI Process:
            </span>{" "}
            The lines connecting nodes aren&apos;t just for the show. They help
            the mind think how AI models are connected
          </li>
          <li>
            <span className="text-primary font-bold">
              Iterate and Experiment Rapidly:
            </span>{" "}
            Want to change the dog to a cat? Just edit that one node and rerun
            it. Want to add a &quot;wearing a pirate hat&quot; node? Drag it on,
            connect it, and go. This is much faster than editing a 50-word text
            prompt.
          </li>
        </ul>
        <p className="pt-8 pb-4">
          We prioritize user experience above all else, with an intuitive
          interface that makes working with AI accessible to everyone. Our app
          features a clean, modern design with drag-and-drop functionality, high
          quality outputs, and helpful tooltips to guide you through each step
          of the process.
        </p>
      </div>
    </main>
  );
}
