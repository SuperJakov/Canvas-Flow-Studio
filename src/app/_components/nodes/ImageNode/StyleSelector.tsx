import Image from "next/image";
import { PopoverContent } from "~/components/ui/popover";
import { IMAGE_STYLES, type Style } from "./constants";
import { useEffect, useRef } from "react";
import { ScrollArea } from "~/components/ui/scroll-area";

type StyleSelectorProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStyle?: Style;
  onStyleChange: (styleId: Style) => void;
};

export function StyleSelector({
  isOpen,
  selectedStyle,
  onStyleChange,
}: StyleSelectorProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Scroll selected item into view whenever the popover opens
  useEffect(() => {
    if (!isOpen || !selectedStyle) return;

    // Wait one tick for the popover to be fully painted
    const timer = requestAnimationFrame(() => {
      const selectedEl = popoverRef.current?.querySelector(
        `[data-style-id="${selectedStyle}"]`,
      );
      selectedEl?.scrollIntoView({ behavior: "instant", block: "center" });
    });

    return () => cancelAnimationFrame(timer);
  }, [isOpen, selectedStyle]);

  return (
    <PopoverContent
      side="top"
      align="center"
      sideOffset={10}
      className="nowheel nopan nodrag h-64 w-96 overflow-y-auto p-0"
    >
      <ScrollArea className="h-full w-full">
        <div ref={popoverRef} className="grid grid-cols-3 gap-4 p-4">
          {IMAGE_STYLES.map((style) => (
            <button
              key={style.id}
              data-style-id={style.id}
              onClick={(e) => {
                e.stopPropagation(); // Add this line
                onStyleChange(style.id);
              }}
              className={`flex cursor-pointer flex-col items-center rounded p-2 transition-colors ${
                selectedStyle === style.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              {style.imageUrl ? (
                <Image
                  src={style.imageUrl}
                  className="h-16 w-16 rounded-full"
                  alt={style.name}
                  width={64}
                  height={64}
                  placeholder="blur"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-300" />
              )}
              <span className="mt-2 text-sm">{style.name}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </PopoverContent>
  );
}
