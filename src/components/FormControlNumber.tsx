import { forwardRef, ReactNode } from "react";
import { FormControl, FormItem, FormLabel } from "./ui/form";
import {
  InputNumber,
  InputNumberProps,
  InputNumberScrubber,
} from "./ui/input-number";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export const FormControlNumber = forwardRef<
  HTMLInputElement,
  InputNumberProps & { label: ReactNode; description: string }
>(({ label, description, className, ...props }, ref) => {
  return (
    <Tooltip delayDuration={1000}>
      <FormItem className="flex flex-col space-y-0 gap-1 items-start">
        <FormControl>
          <InputNumber
            {...props}
            ref={ref}
            className={cn("[&>input]:ps-7", className)}
          >
            <InputNumberScrubber asChild>
              <TooltipTrigger asChild>
                <FormLabel
                  className="w-6.5 grid items-center justify-center absolute top-0 bottom-0 text-xs text-gray-11"
                  aria-description={description}
                >
                  {label}
                </FormLabel>
              </TooltipTrigger>
            </InputNumberScrubber>
          </InputNumber>
        </FormControl>
      </FormItem>
      <TooltipContent side="bottom" align="start">
        {description}
      </TooltipContent>
    </Tooltip>
  );
});
