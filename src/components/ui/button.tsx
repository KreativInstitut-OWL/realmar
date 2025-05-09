import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { Tooltip, TooltipContent } from "./tooltip";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm cursor-pointer",
    "transition-colors outline-hidden focus-visible:ring-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    // support for being a toggle button
    "data-[state=on]:bg-azure-3! data-[state=on]:hover:bg-azure-4! data-[state=on]:active:bg-azure-5! data-[state=on]:text-azure-12!",
  ],
  {
    variants: {
      variant: {
        default: "bg-azure-9 text-black hover:bg-azure-10 active:bg-azure-9",
        secondary: "bg-gray-9 text-gray-1 hover:bg-gray-10 active:bg-gray-9",
        ghost: [
          "bg-transparent text-gray-12",
          "hover:bg-gray-4/70 hover:dark:bg-gray-4/60",
          "active:bg-gray-5/70 active:dark:bg-gray-5/60",
          "transition-all",
        ],
        input:
          "border border-transparent hover:border-gray-8 bg-gray-5 active:bg-gray-4",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-7 px-3 text-sm",
        icon: "size-10",
        "icon-sm": "size-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  tooltip?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, tooltip, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const button = (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );

    if (tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="bottom">{tooltip}</TooltipContent>
        </Tooltip>
      );
    }

    return button;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
