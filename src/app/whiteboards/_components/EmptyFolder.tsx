import { Grid3X3 } from "lucide-react";

export default function EmptyFolder() {
  return (
    <div className="py-12 text-center">
      <div className="bg-muted mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full">
        <Grid3X3 className="text-muted-foreground h-12 w-12" />
      </div>
      <h3 className="text-foreground mb-2 text-lg font-medium">
        This folder is empty
      </h3>
      <p className="text-muted-foreground mx-auto max-w-md">
        Create your first project or whiteboard to get started.
      </p>
    </div>
  );
}
