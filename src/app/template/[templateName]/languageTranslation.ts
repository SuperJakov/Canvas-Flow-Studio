export const languageTranslationTemplate = {
  title: "Language Translation",
  nodes: [
    {
      data: {
        isLocked: false,
        text: "Thank you for joining today's meeting. We'll be discussing the upcoming product launch, reviewing the final checklist, and assigning remaining tasks. If you have any questions, feel free to speak up at any time.\n",
      },
      height: 250,
      id: "e5926b9f-0b13-4aad-6b6a-79eac84795f0",
      position: { x: 383.69126652135776, y: -190.97013840798445 },
      type: "textEditor",
      width: 430,
      zIndex: 18,
    },
    {
      data: {
        isLocked: false,
        text: "Translate this text to Spanish. Maintain original meaning and fluency.",
      },
      id: "cbe03083-3045-401b-acb0-4f943aa65ca9",
      position: { x: 3.835232615608845, y: 272.6161576156799 },
      type: "instruction",
      zIndex: 6,
    },
    {
      data: {
        isLocked: false,
        text: "Make it more casual",
      },
      id: "1801bf49-69fd-4502-9fdb-afbf2daa0b83",
      position: { x: 449.49373478583027, y: 276.4386870987988 },
      type: "instruction",
      zIndex: 12,
    },
    {
      id: "a9fc524f-adc8-433c-ab3e-78a62b4a3b02",
      type: "instruction",
      position: { x: 1032.370336184782, y: 261.9381353658908 },
      data: {
        isLocked: false,
        text: "Rewrite this text to use a more formal tone suitable for business communication.",
      },
      zIndex: 16,
    },
    {
      id: "721ab730-ea08-4737-88db-0411b748c494",
      type: "comment",
      position: { x: 92.3286920469354, y: -140.8207384511671 },
      data: { isLocked: true, text: "Example text, you can modify it!" },
      zIndex: 19,
    },
  ] as const,
  edges: [
    {
      id: "67f97e3a-0f6a-4db9-b537-473b4b683557",
      source: "e5926b9f-0b13-4aad-6b6a-79eac84795f0",
      target: "cbe03083-3045-401b-acb0-4f943aa65ca9",
      type: "default",
    },
    {
      id: "3acaaac1-68d5-42c5-b375-afcd49b8fc19",
      source: "e5926b9f-0b13-4aad-6b6a-79eac84795f0",
      target: "1801bf49-69fd-4502-9fdb-afbf2daa0b83",
      type: "default",
    },
    {
      source: "e5926b9f-0b13-4aad-6b6a-79eac84795f0",
      target: "a9fc524f-adc8-433c-ab3e-78a62b4a3b02",
      id: "ee544cf7-7954-45df-bb81-43b1eaa84120",
      type: "default",
    },
  ] as const,
};
