import * as TogglePrimitive from "@radix-ui/react-toggle";
import { type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof buttonVariants> & {
      tooltip?: React.ReactNode;
    }
>(({ className, variant = "ghost", size, tooltip, ...props }, ref) => {
  const toggle = (
    <TogglePrimitive.Root
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );

  // trigger must not use asChild so that data-state does not fight with the tooltip
  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger tabIndex={-1} asChild>
          <span>{toggle}</span>
        </TooltipTrigger>
        <TooltipContent side="bottom">{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return toggle;
});

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle };
