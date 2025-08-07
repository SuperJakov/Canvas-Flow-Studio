import { SignUpButton } from "@clerk/nextjs";
import EmailContactDialogContent from "../EmailContactDialogContent";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";

const Section = ({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => <section className={`mt-12 ${className}`.trim()}>{children}</section>;

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-foreground text-2xl font-bold tracking-tight">
    {children}
  </h2>
);

const BodyP = ({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => <p className={`text-foreground ${className}`.trim()}>{children}</p>;

const RateLimitHeader = () => (
  <header className="mb-12 flex items-center gap-4">
    <div>
      <h1 className="text-foreground m-0 text-3xl font-bold tracking-tight">
        We are increasing rate limits for free users! 🎉
      </h1>
      <p className="text-muted-foreground m-0 mt-1 text-sm">
        More creative power for everyone
      </p>
    </div>
  </header>
);

const Intro = () => (
  <section className="border-border bg-card rounded-xl border p-6 shadow-sm">
    <BodyP>
      We&apos;re excited to announce that we are increasing the rate limits for our
      free users. We want to make sure that everyone has the opportunity to
      experience the full power of Canvas Flow Studio.
    </BodyP>
  </section>
);

const NewLimits = () => (
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

const GetStarted = () => (
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

const Thanks = () => (
  <Section>
    <H2>Thank You</H2>
    <BodyP className="mt-3">
      Huge thanks to our beta testers and early supporters. Your feedback has
      been invaluable in shaping Canvas Flow Studio.
    </BodyP>
  </Section>
);

const PostFooter = () => (
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

const RateLimitIncreaseContent = () => (
  <article className="prose max-w-none">
    <Dialog>
      <RateLimitHeader />
      <Intro />
      <NewLimits />
      <GetStarted />
      <Thanks />
      <hr className="border-border my-10" />
      <PostFooter />
      <EmailContactDialogContent />
    </Dialog>
  </article>
);

export default RateLimitIncreaseContent;
