import Image from "next/image";
import { Popover, PopoverContent } from "~/components/ui/popover";
import { IMAGE_STYLES, type Style } from "./constants";

interface StyleSelectorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStyle?: Style;
  onStyleChange: (styleId: Style) => void;
}

export function StyleSelector({
  isOpen,
  onOpenChange,
  selectedStyle,
  onStyleChange,
}: StyleSelectorProps) {
  return (
    <PopoverContent
      side="top"
      align="center"
      sideOffset={10}
      className="nowheel nopan nodrag h-64 w-96 overflow-y-auto p-0"
    >
      <div className="grid grid-cols-3 gap-4 p-4">
        {IMAGE_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onStyleChange(style.id)}
            className={`flex cursor-pointer flex-col items-center rounded p-2 transition-colors ${
              selectedStyle === style.id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
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
              <div className="h-16 w-16 rounded-full bg-gray-300"></div>
            )}
            <span className="mt-2 text-sm">{style.name}</span>
          </button>
        ))}
      </div>
    </PopoverContent>
  );
}
