"use client";

import { Delete } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import PageTitle from "../../components/PageTitle";

export default function CanvasContent() {
  return (
    <main id="canvas" className="mb-16 w-full scroll-mt-16">
      <PageTitle>Understanding the Canvas</PageTitle>
      <div className="w-full">
        <p>
          The whiteboard canvas is your creative place for building AI
          whiteboards. Let&apos;s explore its key components:
        </p>

        <Separator className="my-6" />

        <div className="mb-8 grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="gap-2.5">
            <CardHeader>
              <div className="inline-flex items-center gap-1">
                <CardTitle>Sidebar</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="">The sidebar contains all available nodes:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  <strong className="text-blue-400">Text node</strong> - Mainly
                  used for input to other nodes, but can be used for output
                  sometimes
                </li>
                <li>
                  <strong className="text-purple-400">Image node</strong> -
                  Mainly used for generating images, but can be used to upload
                  your own image and use it as input
                </li>
                <li>
                  <strong className="text-yellow-400">Instruction node</strong>{" "}
                  - Modify other nodes and generate a new one. Edit speeches,
                  images, or text.
                </li>
                <li>
                  <strong className="text-orange-400">Comment node</strong> -
                  Leave comments to help you or others understand. Cannot be
                  connected to other nodes.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="gap-2.5">
            <CardHeader>
              <CardTitle>Canvas Area</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="">
                The main workspace where you&apos;ll place and connect nodes. It
                uses Figma-like navigation.
              </p>
              <ul className="mt-2 h-full list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-blue-400">Drag & Drop</strong> -
                  Easily position nodes
                </li>
                <li>
                  <strong className="text-purple-400">Pan</strong> - Move your
                  view across canvas
                </li>
                <li>
                  <strong className="text-yellow-400">Zoom</strong> - Adjust the
                  zoom level of your canvas
                </li>
                <li>
                  <strong className="text-orange-400">Selection</strong> -
                  Select a node by pressing with a mouse on it. When selected,
                  you can delete it using backspace.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="gap-2.5">
            <CardHeader>
              <CardTitle>Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="">
                Connections define how data flows through your workflow:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Click and drag from output handles to input handles</li>
                <li>Each connection transfers data from one node to another</li>
                <li>
                  Connections can be deleted by selecting and pressing Delete
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="gap-2.5">
          <CardHeader>
            <CardTitle>Canvas Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-lg font-medium text-white">
                  Navigation
                </h3>
                <ul className="space-y-2">
                  <li>
                    <strong className="text-blue-400">Pan</strong>: Click and
                    drag empty canvas area
                  </li>
                  <li>
                    <strong className="text-blue-400">Zoom</strong>: Mouse wheel
                    or pinch gesture
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-medium text-white">Editing</h3>
                <ul className="space-y-2">
                  <li>
                    <strong className="text-purple-400">Select</strong>: Click
                    on a node
                  </li>
                  <li>
                    <strong className="text-purple-400">Delete</strong>: Select
                    and press{" "}
                    <div className="inline-flex items-center gap-1">
                      Backspace <Delete className="h-4 w-4" />
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
