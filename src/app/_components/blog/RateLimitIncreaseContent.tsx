import { SignUpButton } from "@clerk/nextjs";
import EmailContactDialogContent from "../EmailContactDialogContent";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { BodyP, H2, Section } from "./common";

function Intro() {
  return (
    <section className="border-border bg-card rounded-xl border p-6 shadow-sm">
      <BodyP>
        We&apos;re excited to announce that we are increasing the rate limits
        for our free users. We want to make sure that everyone has the
        opportunity to experience the full power of Canvas Flow Studio.
      </BodyP>
    </section>
  );
}

function NewLimits() {
  return (
    <Section>
      <H2>New Free Tier Limits</H2>
      <BodyP className="mt-3">
        We are happy to announce the following new limits for our free tier:
      </BodyP>
      <ul className="text-foreground mt-3 list-disc space-y-2 pl-6">
        <li>
          <strong>Text Credits</strong>: 20/month (previously 10)
        </li>
        <li>
          <strong>Image Credits</strong>: 20/month (previously 10)
        </li>
        <li>
          <strong>Instruction Use</strong>: 40/month (previously 20)
        </li>
        <li>
          <strong>Speech Credits</strong>: 5/month (previously 3)
        </li>
      </ul>
    </Section>
  );
}

function ContinuousImprovements() {
  return (
    <Section>
      <H2>Always Improving</H2>
      <BodyP className="mt-3">
        We recently added streaming image generation, which lets you see your
        creations come to life in real-time. We&apos;re always working on
        improving Canvas Flow Studio and will have more updates to share soon!
      </BodyP>
    </Section>
  );
}

function GetStarted() {
  return (
    <Section>
      <H2>Get Started Today</H2>
      <BodyP className="mt-3">
        Ready to transform your workflow?{" "}
        <span className="inline-flex items-center gap-1">
          <SignUpButton mode="modal">
            <span className="text-primary hover:text-primary/80 cursor-pointer font-semibold underline underline-offset-4 transition-colors hover:no-underline">
              Sign up for free
            </span>
          </SignUpButton>
          <span className="text-muted-foreground">
            - no credit card required.
          </span>
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

export default function RateLimitIncreaseContent() {
  return (
    <article className="prose max-w-none">
      <Dialog>
        <Intro />
        <NewLimits />
        <ContinuousImprovements />
        <GetStarted />
        <hr className="border-border my-10" />
        <PostFooter />
        <EmailContactDialogContent />
      </Dialog>
    </article>
  );
}
