import { type Metadata } from "next";
import PricingPageClient from "./PricingPageClient";

export const metadata: Metadata = {
  title: "Pricing | Canvas Flow Studio",
  description:
    "Learn more about the pricing plans for Canvas Flow Studio. Get started for free and scale as you grow.",
};

export default function Pricing() {
  return <PricingPageClient />;
}
