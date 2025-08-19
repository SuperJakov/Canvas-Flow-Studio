export const theLuminousDeepTemplate = {
  title: "The Luminous Deep",
  nodes: [
    {
      data: {
        isLocked: false,
        text: "Generate a single-page website about the wonders of bioluminescence. The visual theme should be dark, mysterious, and feel like the deep ocean, with glowing text and elements.\n\nHeader:\nThe Luminous Deep\nSubtitle: A Journey into the World of Living Light\n\nSection 1: What is Bioluminescence?\nAn engaging introduction explaining that it's light produced by living organisms. Mention it's most common in the deep sea where sunlight can't reach. Use an icon of a glowing jellyfish.\n\nSection 2: The Firefly Squid of Toyama Bay\nDescribe the incredible light show created by these squid in the waters of Japan. Include a beautiful placeholder image of glowing squid in the ocean.\n\nSection 3: Why Do Creatures Glow?\nUse a three-column layout to list the main purposes.\n- Column 1: To Attract a Mate. Use an icon of two glowing fish swimming together.\n- Column 2: To Find Food. Use an icon of an anglerfish with its glowing lure.\n- Column 3: To Defend Themselves. Use an icon of a shrimp that spews glowing liquid.\n\nSection 4: The Anglerfish: Master of the Abyss\nA dramatic description of how this iconic hunter uses its glowing lure to hunt in the pitch-black darkness. Include a large, impressive placeholder image of an anglerfish. \n\nSection 5: Bioluminescence in Your World\nBriefly mention common examples people might know, like fireflies or glowing fungi (foxfire). Include a placeholder image of fireflies at dusk.\n\nFooter:\nA simple footer with the text \"Explore more wonders of the deep. Created with Canvas Flow Studio.\"",
      },

      id: "92aee22f-b23b-4a3e-35af-640bc22b151f",
      position: { x: 0, y: 0 },
      type: "textEditor",
      width: 280,
      height: 180,
      selected: false,
      zIndex: 1,
    },
    {
      id: "80d7a3d6-8e4a-4bd1-8318-2fca8dc7da4a",
      type: "website",
      position: { x: -135, y: 285 },
      data: { isLocked: false, srcDoc: null },
      width: 600,
      height: 400,
      zIndex: 2,
    },
  ],
  edges: [
    {
      source: "92aee22f-b23b-4a3e-35af-640bc22b151f",
      target: "80d7a3d6-8e4a-4bd1-8318-2fca8dc7da4a",
      id: "7eae1cea-2273-4008-9ce5-893940b9cc85",
      type: "default",
    },
  ],
} as const;
