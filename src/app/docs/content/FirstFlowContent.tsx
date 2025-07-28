"use client";

import Link from "next/link";
import { Delete, ImageIcon } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import type { ReactNode } from "react";
import { Card, CardContent, CardTitle } from "~/components/ui/card";

import screenshot from "public/firstflow_screenshot.png";
import Image from "next/image";

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string | ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="bg-accent flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
        <span className="accent-foreground text-sm font-bold select-none">
          {number}
        </span>
      </div>
      <div>
        <h4 className="mb-1 text-lg font-medium">{title}</h4>
        <p className="">{description}</p>
      </div>
    </div>
  );
}

export default function FirstFlowContent() {
  return (
    <section id="first-flow" className="bg-background mb-16 scroll-mt-16">
      <h2 className="mb-4 text-2xl font-bold">
        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Creating Your First Flow
        </span>
      </h2>
      <div>
        <div>
          <p>
            Let&apos;s walk through the process of creating your first AI
            workflow:
          </p>
        </div>
        <Separator className="my-6" />
        <div className="space-y-6 pb-8">
          <Step
            number={1}
            title="Access the Whiteboard"
            description={
              <>
                Navigate to the{" "}
                <Link
                  href="/whiteboards"
                  className="text-blue-500 underline hover:text-blue-600"
                >
                  Whiteboards page
                </Link>{" "}
                and create a new whiteboard. You&apos;ll be greeted with a blank
                canvas ready for your creativity.
              </>
            }
          />
          <Step
            number={2}
            title="Your First Node"
            description={
              <>
                A text node will appear automatically on your new whiteboard.
                While this node is added by default, you can also create one by
                dragging it from the left sidebar. If you need to remove a node,
                simply select it and press{" "}
                <span className="inline-flex items-center gap-1">
                  backspace <Delete className="h-4 w-4" />
                </span>
                .
              </>
            }
          />
          <Step
            number={3}
            title="Edit the text node"
            description={
              <>
                Edit the text inside a text node by clicking in the area where
                the text is. It should currently say &quot;This is a text
                node&quot;. Edit the text to say &quot;Gray tabby cat hugging an
                otter with an orange scarf&quot;
              </>
            }
          />
          <Step
            number={4}
            title="Add an Image Node"
            description={
              <>
                Now, drag an{" "}
                <span className="inline-flex items-center gap-1">
                  <span className="[color:color-mix(in_oklab,_theme(colors.purple.500)_40%,_theme(colors.foreground)_60%)]">
                    Image Node
                  </span>
                  <ImageIcon className="[color:color-mix(in_oklab,_theme(colors.purple.500)_40%,_theme(colors.foreground)_60%)] h-4 w-4" />
                </span>{" "}
                onto the canvas from the sidebar on the left. This node
                generates an image using AI.
              </>
            }
          />
          <Step
            number={5}
            title="Connect the Nodes"
            description="Click and drag from the output handle on the bottom of your Text Node and connect it to the input handle on top side of your Image Node to create a connection."
          />
          <Step
            number={6}
            title="Run Your Flow"
            description="Click the run button on either image node or text node. It will generate an image using AI."
          />
        </div>
        <Image
          src={screenshot}
          alt="Screenshot of results"
          width={1920}
          height={912}
          placeholder="blur"
          loading="eager"
          className="mb-5 rounded-lg outline-2 outline-white"
        />
        <Card>
          <CardContent className="flex flex-col gap-2">
            <CardTitle className="text-xl">Congratulations!</CardTitle>
            <p>
              You&apos;ve just created your first AI whiteboard! This simple
              example demonstrates the fundamental concept behind AI Flow
              Studio: visually connecting nodes to create powerful automations
              without coding.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
