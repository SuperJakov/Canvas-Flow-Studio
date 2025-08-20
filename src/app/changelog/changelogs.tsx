import Link from "next/link";

export type ChangeLog = {
  date: string;
  changes: React.ReactNode[];
};

export const changelogs: ChangeLog[] = [
  {
    date: "2025-08-19",
    changes: [
      "Updated documentation for Website Node.",
      "Added 3 new templates for Website Node.",
    ],
  },
  {
    date: "2025-08-15",
    changes: ["Added new template: Content Creation."],
  },
  {
    date: "2025-08-12",
    changes: ["Improved Website Node response quality."],
  },
  {
    date: "2025-08-10",
    changes: [
      <Link
        href="/blog/introducing-website-node"
        className="text-primary hover:text-primary/80 cursor-pointer underline underline-offset-4 transition-colors hover:no-underline"
        key={0}
      >
        Added new Website Node.
      </Link>,
      "Added 'Open in New Tab' button to Website Node.",
    ],
  },
  {
    date: "2025-08-07",
    changes: [
      <Link
        href="/blog/increasing-free-tier-limits"
        className="text-primary hover:text-primary/80 cursor-pointer underline underline-offset-4 transition-colors hover:no-underline"
        key={0}
      >
        Increased free tier limits.
      </Link>,
    ],
  },
  {
    date: "2025-07-29",
    changes: [
      "Improved whiteboard performance.",
      "Launched new changelog page.",
    ],
  },
];
