import { SignUpButton } from "@clerk/nextjs";
import EmailContactDialogContent from "../EmailContactDialogContent";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { BodyP, H2, Section } from "./common";

function Intro() {
  return (
    <section className="border-border bg-card rounded-xl border p-6 shadow-sm">
      <BodyP>
        We are thrilled to announce two major new features on Canvas Flow
        Studio: the <strong>Website Node</strong> and{" "}
        <strong>Project Templates</strong>. These additions are designed to
        supercharge your workflow and help you create amazing things even
        faster.
      </BodyP>
    </section>
  );
}

function WebsiteNodeSection() {
  return (
    <Section>
      <H2>The New Website Node</H2>
      <BodyP className="mt-3">
        The Website Node is a powerful new addition to our node library. It
        allows you to generate a complete, functional website from a text
        description. Simply describe the website you want to create, and our AI
        will generate the HTML, CSS, and JavaScript for you.
      </BodyP>
      <BodyP className="mt-3">
        This is perfect for creating landing pages, portfolios, or simple blogs
        in just a few minutes. You can then export the generated code and host
        it anywhere you like.
      </BodyP>
    </Section>
  );
}

function TemplatesSection() {
  return (
    <Section>
      <H2>Project Templates</H2>
      <BodyP className="mt-3">
        To help you get started with new projects more quickly, we have
        introduced a set of pre-built templates. These templates provide a
        starting point for common use cases, such as:
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
        You can find the new templates on the whiteboard selection page. More
        templates are on the way!
      </BodyP>
    </Section>
  );
}

function GetStarted() {
  return (
    <Section>
      <H2>Get Started Today</H2>
      <BodyP className="mt-3">
        Ready to try out the new features?{" "}
        <span className="inline-flex items-center gap-1">
          <SignUpButton mode="modal">
            <span className="text-primary hover:text-primary/80 cursor-pointer font-semibold underline underline-offset-4 transition-colors hover:no-underline">
              Sign up for free
            </span>
          </SignUpButton>
          <span className="text-muted-foreground">and start building!</span>
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
          Have questions? Reach out at{" "}
          <DialogTrigger>
            <span className="text-primary hover:text-primary/80 cursor-pointer font-semibold underline underline-offset-4 transition-colors hover:no-underline">
              support@canvasflowstudio.org
            </span>{" "}
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
        <GetStarted />
        <hr className="border-border my-10" />
        <PostFooter />
        <EmailContactDialogContent />
      </Dialog>
    </article>
  );
}
