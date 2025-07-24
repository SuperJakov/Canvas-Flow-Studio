import type { Metadata } from "next";
import { SidebarProvider } from "~/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Documentation | AI Flow Studio",
  description:
    "Learn how to create, manage, and optimize your AI workflows with AI Flow Studio.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto">{children}</div>
      </div>
    </SidebarProvider>
  );
}
