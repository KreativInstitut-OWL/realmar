import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { inputVariants } from "./input";
import { Tooltip, TooltipContent } from "./tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium cursor-pointer",
    "ring-offset-gray-1 ring-offset-4 ring-0 ring-gray-1 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gray-12",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    // support for being a toggle button
    "data-[state=on]:bg-azure-3! data-[state=on]:text-azure-12!",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-lime-9 text-gray-12 hover:bg-lime-10 dark:bg-lime-12 dark:text-gray-1 dark:hover:bg-lime-12",
        secondary:
          "bg-gray-12 text-gray-1 hover:bg-gray-10 dark:bg-gray-11 dark:text-gray-12 dark:hover:bg-gray-11",
        outline:
          "bg-gray-1 border-2 border-gray-12 text-gray-12 hover:bg-gray-3 hover:text-gray-11 dark:border-gray-10 dark:bg-gray-10 dark:hover:bg-gray-10 dark:hover:text-gray-2",
        ghost:
          "bg-transparent text-gray-12 ring-transparent ring-offset-transparent hover:bg-gray-3 hover:text-gray-11 dark:text-gray-1 dark:hover:bg-gray-10 dark:hover:text-gray-2",
        input: inputVariants(),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-7 px-3",
        lg: "h-11 px-8",
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
