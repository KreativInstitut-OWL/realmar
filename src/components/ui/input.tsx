import * as React from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import TextareaAutosize from "react-textarea-autosize";
import { Slot } from "@radix-ui/react-slot";

export const inputVariants = cva(
  "flex h-7 w-full rounded-md border border-transparent hover:border-gray-8 bg-gray-5 px-3 items-center text-xs file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-11 placeholder:text-gray-11 outline-hidden focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
);

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & {
    asChild?: boolean;
  }
>(({ className, type, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "input";
  return (
    <Comp
      type={type}
      className={cn(inputVariants(), className)}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<typeof TextareaAutosize>
>(({ className, ...props }, ref) => {
  return (
    <TextareaAutosize
      className={cn(inputVariants(), "resize-none py-1.5", className)}
      ref={ref}
      minRows={2}
      maxRows={10}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Input, Textarea };
