import type { Metadata } from "next";
import { SidebarProvider } from "~/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Documentation | Canvas Flow Studio",
  description:
    "Learn how to create, manage, and optimize your AI workflows with Canvas Flow Studio.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="bg-background min-h-screen">
        <div className="container mx-auto">{children}</div>
      </div>
    </SidebarProvider>
  );
}
