import Link from "next/link";

export const Section = ({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => <section className={`mt-12 ${className}`.trim()}>{children}</section>;

export const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="border-border bg-card rounded-lg border p-5">{children}</div>
);

export const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-foreground text-2xl font-bold tracking-tight">
    {children}
  </h2>
);

export const BodyP = ({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => <p className={`text-foreground ${className}`.trim()}>{children}</p>;

export const EmLink = ({
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
