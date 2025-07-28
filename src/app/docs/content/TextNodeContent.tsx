import Image from "next/image";
import { Separator } from "~/components/ui/separator";

import TextToTextExample from "public/text_to_text_example.png";
import TextToImageExample from "public/text_to_image_example.png";
import ModifyingTextExample from "public/modifying_text_example.png";
import ModifyingText2Example from "public/modifying_text_2_example.png";
import GeneratingSpeech from "public/speech_generation.png";
import PageTitle from "../components/PageTitle";

export default function TextNodeContent() {
  return (
    <section id="first-flow" className="bg-background mb-16 scroll-mt-16">
      <PageTitle>Mastering the Text Node</PageTitle>
      <p>
        The Text Node is a fundamental building block in AI Flow Studio. This
        guide will walk you through its various interactions with other nodes.
      </p>

      <Separator className="my-4" />

      <h3 className="pb-1 text-lg font-semibold">Text to Text Connection</h3>
      <p>
        Connecting two Text Nodes results in the content of the source node
        being copied to the target node. While not a frequent use case, it can
        be handy for duplicating text prompts.
      </p>
      <Image
        src={TextToTextExample}
        alt="Text to Text node"
        placeholder="blur"
        className="my-5 rounded-lg outline-2 outline-white select-none"
      />

      <h3 className="pb-1 text-lg font-semibold">Text to Image Generation</h3>
      <p>
        This is where the magic happens. Connecting a Text Node to an Image Node
        allows you to generate images using AI. You can even connect multiple
        Text Nodes to a single Image Node to create more detailed and
        descriptive prompts for your desired image.
      </p>
      <Image
        src={TextToImageExample}
        alt="Text to Image node"
        placeholder="blur"
        className="my-5 rounded-lg outline-2 outline-white select-none"
      />

      <h3 className="pb-1 text-lg font-semibold">
        Modifying Text with an Instruction
      </h3>
      <p>
        Connect a Text Node to an Instruction Node to modify its content. This
        is useful for refining prompts or making adjustments based on new
        instructions.
      </p>
      <Image
        src={ModifyingTextExample}
        alt="Modifying Text Node using Instruction"
        placeholder="blur"
        className="my-5 rounded-lg outline-2 outline-white select-none"
      />
      <h3 className="pb-1 text-lg font-semibold">
        Instruction-driven Image Generation
      </h3>
      <p>
        First, modify a Text Node using an Instruction Node. Then, connect the
        modified Text Node to an Image Node to generate an image from the
        updated prompt.
      </p>
      <Image
        src={ModifyingText2Example}
        alt="Modifying Text Node & Generate Image"
        placeholder="blur"
        className="my-5 rounded-lg outline-2 outline-white select-none"
      />
      <h3 className="pb-1 text-lg font-semibold">Generating a Speech</h3>
      <p>
        Drop a text node onto the canvas. Write something you want to hear
        speech about (e.g. why education should be free). Then, connect it to a
        Speech Node. Run the text node or the speech node, and wait. It can take
        a long time for longer speeches. You can connect multiple text nodes to
        a single speech if you want.
      </p>
      <Image
        src={GeneratingSpeech}
        alt="Generating Speech"
        placeholder="blur"
        className="my-5 rounded-lg outline-2 outline-white select-none"
      />
    </section>
  );
}
