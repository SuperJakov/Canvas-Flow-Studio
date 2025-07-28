"use client";

import { Button } from "~/components/ui/button";
import { PanelRight } from "lucide-react";
import { useSidebar } from "~/components/ui/sidebar";

export function MobileMenuButton() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="mb-4 md:hidden">
      <Button
        onClick={toggleSidebar}
        className="flex w-full items-center justify-start gap-2"
        variant="outline"
      >
        <PanelRight className="h-4 w-4 rotate-180" />
        <span>Documentation Menu</span>
      </Button>
    </div>
  );
}
