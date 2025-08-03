import { SignUpButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import AppLogo from "public/logo.png";

const Section = ({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => <section className={`mt-12 ${className}`.trim()}>{children}</section>;

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="border-border bg-card rounded-lg border p-5">{children}</div>
);

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

const EmLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    className="text-primary hover:text-primary/80 underline underline-offset-4"
  >
    {children}
  </Link>
);

/********************
 * Post sections
 ********************/
const LaunchHeader = () => (
  <header className="mb-12 flex items-center gap-4">
    <div className="ring-border relative h-12 w-12 overflow-hidden rounded-lg ring-1">
      <Image
        src={AppLogo}
        alt="Canvas Flow Studio logo"
        fill
        className="object-contain p-1"
      />
    </div>
    <div>
      <h1 className="text-foreground m-0 text-3xl font-bold tracking-tight">
        We launched Canvas Flow Studio! 🎉
      </h1>
      <p className="text-muted-foreground m-0 mt-1 text-sm">
        A new era of collaborative visual creation
      </p>
    </div>
  </header>
);

const Intro = () => (
  <section className="border-border bg-card rounded-xl border p-6 shadow-sm">
    <BodyP>
      We&apos;re excited to announce the official launch of Canvas Flow Studio -
      a fresh, intuitive way to build AI-powered workflows.
    </BodyP>
  </section>
);

const WhatIs = () => (
  <Section>
    <H2>What is Canvas Flow Studio?</H2>
    <BodyP className="mt-3">
      Canvas Flow Studio lets you design intelligent workflows through a visual,
      node-based interface. Connect nodes, automate steps, and ship smarter -
      without wrestling with glue code.
    </BodyP>
  </Section>
);

const FeatureItem = ({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) => (
  <Card>
    <h3 className="text-foreground text-lg font-bold">
      {index}. {title}
    </h3>
    <BodyP className="mt-2">{children}</BodyP>
  </Card>
);

const KeyFeatures = () => (
  <Section>
    <H2>Key Features</H2>
    <div className="mt-6 grid gap-6 md:grid-cols-2">
      <FeatureItem index={1} title="Whiteboards & Projects">
        Organize your work with projects and structure ideas on flexible
        whiteboards.
      </FeatureItem>
      <FeatureItem index={2} title="Nodes">
        Text, image, instruction, and comment nodes - all working together.
        Learn more in the{" "}
        <EmLink href="/docs/core-concepts/nodes-connections">
          documentation
        </EmLink>
        .
      </FeatureItem>
      <FeatureItem index={3} title="Sharing capabilities">
        Share whiteboards with anyone. Real-time collaboration is on the way.
      </FeatureItem>
    </div>
  </Section>
);

const WhatsNext = () => (
  <Section>
    <H2>What&apos;s Next?</H2>
    <BodyP className="mt-3">
      This is just the start. Here&apos;s what we&apos;re building next:
    </BodyP>
    <ul className="text-foreground mt-3 list-disc space-y-2 pl-6">
      <li>
        <strong>Website Node</strong> arriving in Q3 2025
      </li>
      <li>
        <strong>Andrew AI</strong>: Generate whiteboards using AI
      </li>
      <li>
        <strong>Enhanced team management & collaboration</strong>
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
        <a
          href="mailto:support@canvasflowstudio.org"
          className="text-foreground hover:text-foreground/80 font-medium underline underline-offset-4"
        >
          support@canvasflowstudio.org
        </a>{" "}
        .
      </em>
    </p>
  </footer>
);

const CanvasFlowStudioLaunchContent = () => (
  <article className="prose max-w-none">
    <LaunchHeader />
    <Intro />
    <WhatIs />
    <KeyFeatures />
    <WhatsNext />
    <GetStarted />
    <Thanks />
    <hr className="border-border my-10" />
    <PostFooter />
  </article>
);

export const blogs = [
  {
    slug: "canvas-flow-studio-launch",
    title: "We launched!",
    date: "2025-08-02T19:00:00.216Z",
    excerpt: "We launched our app for the first time",
    thumbnail: AppLogo,
    author: {
      name: "Jakov",
      avatar: null,
      role: "Founder",
    },
    readingTime: "5 min read",
    tags: ["announcement", "product", "launch"],
    content: CanvasFlowStudioLaunchContent,
  },
] as const;
