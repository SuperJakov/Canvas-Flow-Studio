import { type Metadata } from "next";
import ConstructionPage from "../_components/ConstructionPage";

export const metadata: Metadata = {
  title: "Templates | Canvas Flow Studio",
  description: "Get started quickly with one of our templates.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function Templates() {
  return <ConstructionPage />;
}
