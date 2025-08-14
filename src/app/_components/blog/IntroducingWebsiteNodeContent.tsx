import { SignUpButton } from "@clerk/nextjs";
import EmailContactDialogContent from "../EmailContactDialogContent";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { BodyP, H2, Section } from "./common";
import Link from "next/link";

function Intro() {
  return (
    <section className="border-border bg-card rounded-xl border p-6 shadow-sm">
      <BodyP>
        We are introducing a new feature: the <strong>Website Node</strong>.
      </BodyP>
    </section>
  );
}

function WebsiteNodeSection() {
  return (
    <Section>
      <H2>The New Website Node</H2>
      <BodyP className="mt-3">
        The Website Node is a new tool in the sidebar that generates a complete,
        functional website from a text description. To use it, connect text
        nodes to the Website Node and run it to generate the site.
      </BodyP>
      <BodyP className="mt-3">
        This feature is ideal for creating landing pages, portfolios, or simple
        blogs. You can export the generated code and host it on any platform.
      </BodyP>
    </Section>
  );
}

function TemplatesSection() {
  return (
    <Section>
      <H2>Website Templates</H2>
      <BodyP className="mt-3">
        To help you get started with the Website Node, we have added several
        pre-built templates. They provide a starting point for common use cases,
        including:
      </BodyP>
      <ul className="text-foreground mt-3 list-disc space-y-2 pl-6">
        <li>
          <strong>Blog Post Generator</strong>
        </li>
        <li>
          <strong>Social Media Campaign Planner</strong>
        </li>
        <li>
          <strong>Children&apos;s Story Writer</strong>
        </li>
      </ul>
      <BodyP className="mt-3">
        You can find these templates on the home page or the{" "}
        <Link
          href="/templates"
          className="text-primary hover:text-primary/80 cursor-pointer font-semibold underline underline-offset-4 transition-colors hover:no-underline"
        >
          templates page
        </Link>
        .
      </BodyP>
    </Section>
  );
}

function HowWebsiteNodeWorks() {
  return (
    <Section>
      <H2>How It Works</H2>
      <BodyP className="mt-3">
        The Website Node currently generates{" "}
        <strong>single-page websites</strong>. The AI handles the design,
        including placeholder images, icons, and fonts to create a polished
        look. Currently, placeholder images can only include text. In the
        future, it will be able to use any image from the internet.
      </BodyP>
      <BodyP className="mt-3">
        Generation takes between <strong>3 to 8 minutes</strong>. This time
        ensures a high-quality result, and we&apos;re actively working on making
        it faster.
      </BodyP>
      <BodyP className="mt-3">
        Once complete, you can open the website in a new tab to preview it.
      </BodyP>

      <blockquote className="border-border mt-6 border-l-4 pl-6">
        <BodyP>
          To learn more, check out the{" "}
          <Link
            href="/docs/core-concepts/website-node"
            className="text-primary hover:text-primary/80 cursor-pointer font-semibold underline underline-offset-4 transition-colors hover:no-underline"
          >
            documentation for website node
          </Link>
          .
        </BodyP>
      </blockquote>
    </Section>
  );
}

function FutureOfWebsiteNode() {
  return (
    <Section>
      <H2>Future of the Website Node</H2>{" "}
      <BodyP className="mt-3">
        We are actively developing the Website Node to expand its capabilities.
        Future updates will introduce a quality selector, allowing you to choose
        from different generation models at varying costs.{" "}
      </BodyP>{" "}
      <BodyP className="mt-3">
        Currently, each generation is set to <strong>Low</strong> quality and
        costs 1 website credit. A <strong>Medium</strong> quality option (4
        credits) will be available soon. We also plan to introduce a{" "}
        <strong>High</strong> quality tier capable of generating multi-page
        websites in a future release.{" "}
      </BodyP>{" "}
    </Section>
  );
}

function GetStarted() {
  return (
    <Section>
      <H2>Get Started</H2>
      <BodyP className="mt-3">
        To begin using these new features,{" "}
        <span className="inline-flex items-center gap-1">
          <SignUpButton mode="modal">
            <span className="text-primary hover:text-primary/80 cursor-pointer font-semibold underline underline-offset-4 transition-colors hover:no-underline">
              sign up for free
            </span>
          </SignUpButton>
          .
        </span>
      </BodyP>
    </Section>
  );
}

function PostFooter() {
  return (
    <footer className="bg-muted text-muted-foreground ring-border rounded-lg p-5 text-sm ring-1">
      <p>
        <em>
          For questions or support, contact{" "}
          <DialogTrigger>
            <span className="text-primary hover:text-primary/80 cursor-pointer font-semibold underline underline-offset-4 transition-colors hover:no-underline">
              support@canvasflowstudio.org
            </span>
          </DialogTrigger>
          .
        </em>
      </p>
    </footer>
  );
}

export default function IntroducingWebsiteNodeContent() {
  return (
    <article className="prose max-w-none">
      <Dialog>
        {/* <PostHeader /> */}
        <Intro />
        <WebsiteNodeSection />
        <TemplatesSection />
        <HowWebsiteNodeWorks />
        <FutureOfWebsiteNode />
        <GetStarted />
        <hr className="border-border my-10" />
        <PostFooter />
        <EmailContactDialogContent />
      </Dialog>
    </article>
  );
}
