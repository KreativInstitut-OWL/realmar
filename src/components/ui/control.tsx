import { cn } from "@/lib/utils";
import * as React from "react";

export const ControlGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("grid grid-cols-1 gap-2", className)}
      {...props}
    />
  );
});

ControlGroup.displayName = "ControlGroup";

export const ControlRow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    columns?: number;
    end?: React.ReactNode;
  }
>(({ className, columns = 1, children, end, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-[repeat(var(--form-row-columns),minmax(0,1fr))] gap-2 pe-9 relative items-start",
        className
      )}
      style={{ "--form-row-columns": columns } as React.CSSProperties}
      {...props}
    >
      {children}
      {end ? (
        <div
          data-form-row-end=""
          className="absolute end-0 w-7 h-full grid place-items-center"
        >
          {end}
        </div>
      ) : null}
    </div>
  );
});

ControlRow.displayName = "ControlRow";

export const ControlLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    end?: React.ReactNode;
    level?: 1 | 2;
  }
>(({ className, children, end, level = 1, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex gap-4 h-7 items-center text-sm pe-9 relative",
        {
          "text-gray-12 font-semibold": level === 1,
          "text-gray-11 font-medium": level === 2,
        },
        className
      )}
      {...props}
    >
      {children}
      {end ? (
        <div
          data-form-title-end=""
          className="absolute end-0 w-7 h-full grid place-items-center"
        >
          {end}
        </div>
      ) : null}
    </div>
  );
});

ControlLabel.displayName = "ControlLabel";
