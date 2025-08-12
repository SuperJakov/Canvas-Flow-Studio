"use client";

import { Button } from "~/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

type Props = {
  nodeId: string;
};

export default function WebsiteNodeFooter({ nodeId }: Props) {
  return (
    <div className="flex items-center justify-end gap-2 bg-gray-800 px-2 py-2">
      <Link href={`/website/${nodeId}`} target="_blank">
        <Button variant="secondary" size="sm">
          <span className="inline-flex items-center gap-1">
            <span>Open in new tab</span>
            <ExternalLink className="h-4 w-4" />
          </span>
        </Button>
      </Link>
    </div>
  );
}
