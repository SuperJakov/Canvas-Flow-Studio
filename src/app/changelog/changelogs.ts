export type ChangeLog = {
  date: string;
  changes: string[];
};

export const changelogs: ChangeLog[] = [
  {
    date: "2025-08-12",
    changes: ["Improved Website Node response quality."],
  },
  {
    date: "2025-08-10",
    changes: [
      "Added new Website Node.",
      "Added 'Open in New Tab' button to Website Node.",
    ],
  },
  {
    date: "2025-08-07",
    changes: ["Increased free tier limits."],
  },
  {
    date: "2025-07-29",
    changes: [
      "Improved whiteboard performance.",
      "Launched new changelog page.",
    ],
  },
];
