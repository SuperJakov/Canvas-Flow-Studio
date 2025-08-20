export const localEventTemplate = {
  title: "Local Event",
  nodes: [
    {
      data: {
        isLocked: false,
        text: 'A single-page website for a local event called "Starlight Cinema". The theme should be fun and slightly retro, with a dark blue (night sky) background and playful, friendly fonts. Use icons related to stars, film, and popcorn.\n\nHeader:\nStarlight Cinema\nSubtitle: Movies Under the Stars at Willow Creek Park\n\nSection 1: Event Details\nUse a three-column layout to show the essential info.\n- Column 1: What. A family-friendly outdoor movie series. (Use a film reel icon)\n- Column 2: When. Every Saturday in August. Gates open at 7 PM. (Use a calendar icon)\n- Column 3: Where. The Great Lawn at Willow Creek Park. (Use a map pin icon)\n\nSection 2: This Weekend\'s Feature\nA section to highlight the upcoming movie.\nTitle: Showing This Saturday: The Goonies\nInclude a short description of the movie and a large placeholder for the movie poster.\n\nSection 3: What to Bring\nA simple checklist for attendees.\n- Blankets & Lawn Chairs\n- Snacks & Drinks (Popcorn will be for sale!)\n- Cozy Sweaters\n\nFooter:\nStarlight Cinema is a free community event. See you there!',
      },
      height: 180,
      id: "fc80afdf-71c0-430c-5447-c263a0164a72",
      position: { x: 0, y: 0 },
      type: "textEditor",
      width: 280,
      zIndex: 3,
    },
    {
      data: { isLocked: false, srcDoc: null },
      height: 400,
      id: "f80b3267-5664-4f55-a78b-08e7bd3f4904",
      position: { x: -110, y: 290 },
      type: "website",
      width: 600,
      zIndex: 2,
    },
  ],
  edges: [
    {
      id: "8237d119-b058-473e-81a9-8322727ef708",
      source: "fc80afdf-71c0-430c-5447-c263a0164a72",
      target: "f80b3267-5664-4f55-a78b-08e7bd3f4904",
      type: "default",
    },
  ],
} as const;
