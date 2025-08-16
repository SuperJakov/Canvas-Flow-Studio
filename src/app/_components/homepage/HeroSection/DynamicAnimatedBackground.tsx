"use client";

import dynamic from "next/dynamic";

const DynamicAnimatedBackground = dynamic(
  () => import("./AnimatedBackground"),
  {
    ssr: false,
  },
);

export default DynamicAnimatedBackground;
