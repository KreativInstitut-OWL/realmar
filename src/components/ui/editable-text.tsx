import { cva } from "class-variance-authority";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { selectAll } from "@/lib/utils";

const inputVariants = cva(
  "font-inherit appearance-none border-none outline-none px-2 py-1 rounded-md -my-1 bg-transparent text-left w-full focus-visible:ring-2 hover:bg-gray-4",
  {
    variants: {
      variant: {
        input: "",
        text: "whitespace-nowrap overflow-clip text-ellipsis relative",
      },
    },
    defaultVariants: {
      variant: "input",
    },
  }
);

interface EditableTextProps {
  value: string | null;
  onChange?: (newValue: string) => void;
  placeholder?: string;
  tooltip?: React.ReactNode;
}

export const EditableText = forwardRef<HTMLButtonElement, EditableTextProps>(
  function EditableText(
    { value, onChange, placeholder, tooltip = "Click to edit" },
    ref
  ) {
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    function handleChange(
      event:
        | React.FormEvent<HTMLFormElement>
        | React.FocusEvent<HTMLInputElement>
    ) {
      event.preventDefault?.();
      const newValue = inputRef.current?.value;
      if (newValue) onChange?.(newValue);
      setIsEditing(false);
    }

    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        selectAll(inputRef.current);
      }
    }, [isEditing]);

    if (isEditing && onChange) {
      return (
        <form className="contents" onSubmit={handleChange}>
          <input
            className={inputVariants({ variant: "input" })}
            onBlur={handleChange}
            defaultValue={value ?? ""}
            key={value}
            placeholder={placeholder}
            ref={inputRef}
          />
          <button type="submit" hidden>
            Submit
          </button>
        </form>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={inputVariants({ variant: "text" })}
            onClick={() => {
              if (onChange) setIsEditing(true);
            }}
            ref={ref}
          >
            {value ?? placeholder}
          </button>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  }
);
