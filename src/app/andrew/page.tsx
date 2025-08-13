import { type Metadata } from "next";
import AndrewClient from "./AndrewClient";

export const metadata: Metadata = {
  title: "Andrew AI | Canvas Flow Studio",
  description:
    "Andrew AI is a tool that helps you generate whiteboards for Canvas Flow Studio.",
};

export default async function AndrewPage() {
  return <AndrewClient />;
}
