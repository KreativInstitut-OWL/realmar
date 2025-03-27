import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { inputVariants } from "./input";
import { Tooltip, TooltipContent } from "./tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium cursor-pointer",
    "ring-offset-white ring-offset-4 ring-0 ring-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    // support for being a toggle button
    "data-[state=on]:!bg-blue-100 data-[state=on]:!text-blue-900",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary-400 text-black hover:bg-primary-500 dark:bg-primary-900 dark:text-white dark:hover:bg-primary-950",
        secondary:
          "bg-black text-white hover:bg-gray-800 dark:bg-grey-400 dark:text-black dark:hover:bg-grey-500",
        outline:
          "bg-white border-2 border-black text-black hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-50",
        ghost:
          "bg-transparent text-black ring-transparent ring-offset-transparent hover:bg-gray-100 hover:text-gray-900 dark:text-white dark:hover:bg-gray-800 dark:hover:text-gray-50",
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
