export const contentCreationTemplate = {
  nodes: [
    {
      data: { isLocked: false, text: "A beginner's guide to growing tomatoes" },
      id: "2ee5f29b-fbf1-45b0-a9c1-fb7999c78b01",
      position: { x: 195.80009876904924, y: 410.6601459655936 },
      type: "textEditor",
      zIndex: 15,
      width: 270,
      height: 170,
    },
    {
      data: {
        isLocked: false,
        text: "What's your website about?\n\nExamples:\n- A travel blog about Italy\n- A portfolio for a graphic designer\n- A recipe site for vegan desserts",
      },
      id: "cf26df64-98be-43c7-b660-779cab2ef302",
      position: { x: -161.08391547196197, y: 395.69253073091096 },
      type: "comment",
      zIndex: 34,
    },
    {
      data: {
        isLocked: false,
        text: "Create a prompt for generating a website with this topic.\nList out the requirements for a website showcasing this topic. In the prompt you will generate, you're only allowed to use markdown for format, not style. (Only in the prompt) Don't say anything else except the prompt.",
      },
      id: "951f0654-c497-42d2-b95f-432cba0be822",
      position: { x: -69.18968638780007, y: 684.7470854183949 },
      type: "instruction",
      zIndex: 37,
    },
    {
      data: {
        isLocked: false,
        text: "",
      },
      id: "1ceb92bb-d4e5-4df4-acec-9e0652637f17",
      position: { x: -114.04243920428067, y: 945.760017956215 },
      type: "textEditor",
      zIndex: 39,
      width: 270,
      height: 170,
    },
    {
      data: { isLocked: false, srcDoc: null },
      id: "26a44fad-a3df-41cf-a7b9-abcdb487d362",
      position: { x: -381.72667865476, y: 1194.3786252135617 },
      type: "website",
      zIndex: 38,
      width: 716,
      height: 576,
    },
  ],
  edges: [
    {
      id: "f6c1e3e7-269a-4811-9a56-19a892068f6a",
      source: "2ee5f29b-fbf1-45b0-a9c1-fb7999c78b01",
      target: "951f0654-c497-42d2-b95f-432cba0be822",
      type: "default",
    },
    {
      id: "edge-951f0654-c497-42d2-b95f-432cba0be822-1ceb92bb-d4e5-4df4-acec-9e0652637f17",
      source: "951f0654-c497-42d2-b95f-432cba0be822",
      target: "1ceb92bb-d4e5-4df4-acec-9e0652637f17",
      type: "default",
    },
    {
      id: "852dd636-fbaf-496b-ba93-de3ea078b243",
      source: "1ceb92bb-d4e5-4df4-acec-9e0652637f17",
      target: "26a44fad-a3df-41cf-a7b9-abcdb487d362",
      type: "default",
    },
  ],
} as const;
