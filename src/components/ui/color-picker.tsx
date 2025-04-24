"use client";

import { Button } from "@/components/ui/button";
import { inputVariants } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  RovingFocusGroup,
  RovingFocusGroupItem,
} from "@radix-ui/react-roving-focus";
import { PaintBucket } from "lucide-react";
import { useCallback, useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";

const colors = [
  "#000000",
  "#222034",
  "#45283c",
  "#663931",
  "#8f563b",
  "#df7126",
  "#d9a066",
  "#eec39a",
  "#fbf236",
  "#99e550",
  "#6abe30",
  "#37946e",
  "#4b692f",
  "#524b24",
  "#323c39",
  "#3f3f74",
  "#306082",
  "#5b6ee1",
  "#639bff",
  "#5fcde4",
  "#cbdbfc",
  "#ffffff",
  "#9badb7",
  "#847e87",
  "#696a6a",
  "#595652",
  "#76428a",
  "#ac3232",
  "#d95763",
  "#d77bba",
  "#8f974a",
  "#8a6f30",
];

export function ColorPicker({
  color,
  onColorChange,
  label,
}: {
  color: string;
  onColorChange: (color: string) => void;
  label: string;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleColorChange = useCallback(
    (color: string) => {
      onColorChange(color);
    },
    [onColorChange]
  );

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <div className="relative">
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute top-0 left-0 h-full w-7 z-10"
            tooltip={label}
          >
            {color ? (
              <ColorPickerColorPreview color={color} />
            ) : (
              <PaintBucket className="text-gray-11" />
            )}
          </Button>
        </PopoverTrigger>
        <HexColorInput
          color={color}
          className={cn(inputVariants(), "ps-7")}
          onChange={(color) => handleColorChange(color)}
          prefixed
          placeholder="Choose Color"
          aria-label={label}
        />
      </div>
      <PopoverContent
        className="w-64 grid gap-2"
        side="left"
        align="start"
        sideOffset={7}
      >
        <HexColorPicker color={color} onChange={handleColorChange} />
        <RovingFocusGroup
          className="grid grid-cols-8 gap-0.5"
          orientation="horizontal"
          defaultCurrentTabStopId={colors[0]}
        >
          {colors.map((color) => (
            <RovingFocusGroupItem
              asChild
              key={color}
              tabStopId={color}
              onKeyDown={(event) => {
                if (event.key !== "ArrowDown" && event.key !== "ArrowUp")
                  return;

                const direction = event.key === "ArrowDown" ? 1 : -1;

                event.preventDefault();
                const group = event.currentTarget.parentElement;
                const items = group?.childNodes;
                if (items) {
                  const index = Array.from(items).indexOf(event.currentTarget);
                  const nextIndex = index + 8 * direction;
                  if (nextIndex < items.length && nextIndex >= 0) {
                    (items[nextIndex] as HTMLElement).focus();
                  }
                }
              }}
            >
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  handleColorChange(color);
                  setPopoverOpen(false);
                }}
              >
                <ColorPickerColorPreview color={color} />
              </Button>
            </RovingFocusGroupItem>
          ))}
        </RovingFocusGroup>
      </PopoverContent>
    </Popover>
  );
}

function ColorPickerColorPreview({ color }: { color: string }) {
  return (
    <div
      style={{ "--color-picker-color": color } as React.CSSProperties}
      className="size-4 cursor-pointer border rounded-sm bg-(--color-picker-color)"
    />
  );
}
