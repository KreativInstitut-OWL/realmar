import * as React from "react";

import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

export const inputVariants = cva(
  "flex h-7 w-full rounded-md border border-transparent hover:border-gray-8 bg-gray-5 px-3 items-center text-xs ring-offset-gray-1 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-11 placeholder:text-gray-11 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gray-11 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
);

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants(), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
