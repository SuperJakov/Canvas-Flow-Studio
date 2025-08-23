import Image from "next/image";
import { Separator } from "~/components/ui/separator";
import TheLuminousDeep from "public/the_luminous_deep.png";
import StarlightCinema from "public/starlight_cinema.png";
import PageTitle from "../../../_components/docs/PageTitle";

import WebsiteNodeUsage from "public/website_node_usage.png";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function WebsiteNodeContent() {
  return (
    <main id="first-flow" className="bg-background mb-16 scroll-mt-16">
      <PageTitle>Website Node</PageTitle>

      <div className="space-y-2.5">
        <p>
          The Website Node provides functionality for website generation using
          AI within Canvas Flow Studio.
        </p>
        <p>
          The node is currently configured to generate single-page websites. The
          AI manages the design process by selecting fonts and icons,
          structuring the layout, and inserting text-based placeholders for
          images. The final output can be previewed by opening the generated
          site in a new browser tab.
        </p>
        <p>
          The full generation process requires 3 to 8 minutes to complete. We
          are working to optimize this duration. Future development will expand
          the node&apos;s capabilities, including support for web-based images.
        </p>
        <p>A more detailed prompt will produce better and faster results.</p>
      </div>
      <Separator className="my-4" />

      <h2 className="pb-1 text-lg font-bold">Usage</h2>
      <p>Simply connect text nodes to a website node and run it!</p>
      <Image
        src={WebsiteNodeUsage}
        alt="Website Node Usage"
        placeholder="blur"
        className="my-5 rounded-lg outline-2 outline-white select-none"
      />

      <h2 className="pb-1 text-lg font-bold">The Luminous Deep</h2>
      <p>
        This example showcases how a text prompt describing the desired content,
        layout, and theme in this case, the world of bioluminescence, can be
        transformed by the AI into a visually compelling and well-structured
        website. We were very detailed in our prompts, but it tends to be good
        with less detailed ones too.
      </p>
      <Image
        src={TheLuminousDeep}
        alt="The Luminous Deep"
        placeholder="blur"
        className="mt-5 rounded-lg outline-2 outline-white select-none"
      />
      <div className="flex justify-center">
        <Button asChild className="my-2 mb-5">
          <Link href="/template/the-luminous-deep">
            Try out The Luminous Deep
          </Link>
        </Button>
      </div>

      <h2 className="pb-1 text-lg font-bold">Starlight Cinema</h2>
      <p>
        This example demonstrates a fun, informative, single-purpose website for
        an event.
      </p>
      <Image
        src={StarlightCinema}
        alt="Starlight Cinema"
        placeholder="blur"
        className="mt-5 rounded-lg outline-2 outline-white select-none"
      />
      <div className="flex justify-center">
        <Button asChild className="my-2 mb-5">
          <Link href="/template/local-event">Try out The Starlight Cinema</Link>
        </Button>
      </div>
    </main>
  );
}
