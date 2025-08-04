"use client";

import { useState, useRef, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  IMAGE_STYLES,
  type ImageQuality,
  type Style,
  imageQualities,
} from "./constants";
import { capitalize } from "lodash";
import { Button } from "~/components/ui/button";
import { ChevronDown } from "lucide-react";

type Props = {
  selectedStyle?: Style;
  onOpenStyleSelector?: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
  isStyleDropDownOpen: boolean;
};

export default function ImageNodeFooter({
  selectedStyle,
  onOpenStyleSelector,
  isStyleDropDownOpen,
}: Props) {
  const [quality, setQuality] = useState<ImageQuality>("medium");
  const [isQualityDropDownOpen, setIsQualityDropDownOpen] = useState(false);
  const [qualityButtonWidth, setQualityButtonWidth] = useState<
    number | undefined
  >();
  const [styleButtonWidth, setStyleButtonWidth] = useState<
    number | undefined
  >();

  const qualityButtonRef = useRef<HTMLButtonElement>(null);
  const styleButtonRef = useRef<HTMLButtonElement>(null);
  const qualityMeasureRef = useRef<HTMLSpanElement>(null);
  const styleMeasureRef = useRef<HTMLSpanElement>(null);

  const selectedImageStyle = IMAGE_STYLES.find((s) => s.id === selectedStyle);

  const handleQualityChange = (q: ImageQuality) => {
    setQuality(q);
    setIsQualityDropDownOpen(false);
  };

  // Measure and update quality button width
  useEffect(() => {
    if (qualityMeasureRef.current) {
      const newWidth = qualityMeasureRef.current.offsetWidth + 40; // Add padding for icon
      setQualityButtonWidth(newWidth);
    }
  }, [quality]);

  // Measure and update style button width
  useEffect(() => {
    if (styleMeasureRef.current) {
      const newWidth = styleMeasureRef.current.offsetWidth + 40; // Add padding for icon
      setStyleButtonWidth(newWidth);
    }
  }, [selectedImageStyle]);

  const qualityText =
    quality === "low" ? "Low" : quality === "medium" ? "Medium" : "High";
  const styleText = selectedImageStyle?.name ?? "Select style";

  return (
    <div className="flex items-center justify-between gap-2 pt-1">
      <div className="flex items-center gap-2">
        {/* Hidden measurement spans */}
        <span
          ref={qualityMeasureRef}
          className="invisible absolute text-sm whitespace-nowrap"
          aria-hidden="true"
        >
          {qualityText}
        </span>
        <span
          ref={styleMeasureRef}
          className="invisible absolute text-sm whitespace-nowrap"
          aria-hidden="true"
        >
          {styleText}
        </span>

        {/* Quality dropdown on the left */}
        <Popover open={isQualityDropDownOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={qualityButtonRef}
              type="button"
              disabled={true}
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ width: qualityButtonWidth ?? "auto" }}
              onClick={(e) => {
                e.stopPropagation();
                setIsQualityDropDownOpen((prev) => !prev);
              }}
              variant="secondary"
              size="sm"
            >
              <span className="inline-flex items-center gap-1">
                <span>{qualityText}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isQualityDropDownOpen ? "rotate-180" : ""
                  }`}
                />
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-32 p-0" side="top" align="start">
            <div className="flex flex-col">
              {imageQualities.map((q) => (
                <Button
                  key={q}
                  className="rounded-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQualityChange(q);
                  }}
                  variant="outline"
                >
                  {capitalize(q)}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <PopoverTrigger
        onClick={(e) => {
          e.stopPropagation();
          onOpenStyleSelector?.(e);
        }}
      >
        <Button
          ref={styleButtonRef}
          variant="secondary"
          type="button"
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ width: styleButtonWidth ?? "auto", minWidth: "100px" }}
          size="sm"
          aria-expanded={isStyleDropDownOpen}
          aria-haspopup="true"
        >
          <div className="inline-flex w-full items-center justify-between gap-1">
            <span>{styleText}</span>
            <div>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isStyleDropDownOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </Button>
      </PopoverTrigger>
    </div>
  );
}
