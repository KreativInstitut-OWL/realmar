import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { checkboxItemIndicatorVariants } from "./styles/menu";

type ComboboxContextValue = {
  value: string | number | null;
  options: {
    label: React.ReactNode;
    value: string | number | null;
  }[];
  open: boolean;
  setOpen: (open: boolean) => void;
};

const ComboboxContext = React.createContext<ComboboxContextValue | undefined>(
  undefined
);

function useCombobox() {
  const context = React.useContext(ComboboxContext);

  if (!context) {
    throw new Error("useCombobox must be used within a ComboboxProvider");
  }

  return context;
}

export const ComboboxTrigger = PopoverTrigger;

export function ComboboxTriggerButton({
  noValue = "Select option...",
  className,
  ...props
}: {
  noValue?: React.ReactNode;
} & ButtonProps) {
  const { value, options, open } = useCombobox();
  return (
    <ComboboxTrigger asChild>
      <Button
        variant="ghost"
        role="combobox"
        size="sm"
        aria-expanded={open}
        className={cn("max-w-xs truncate pe-2", className)}
        {...props}
      >
        {value
          ? options.find((option) => option.value === value)?.label
          : noValue}
        <ChevronsUpDown className="text-gray-11" />
      </Button>
    </ComboboxTrigger>
  );
}

export function Combobox<
  TOptions extends {
    label: React.ReactNode;
    value: string | number | null;
    disabled?: boolean;
  }[],
>({
  options,
  value,
  onSelect,
  children,
  commandListChildren,
  empty = "No option found.",
  inputPlaceholder = "Search option…",
}: {
  options: TOptions;
  value?: NoInfer<TOptions[number]["value"]>;
  onSelect: (
    value: NoInfer<TOptions[number]["value"]>,
    close: () => void
  ) => void;
  children?:
    | React.ReactNode
    | ((context: ComboboxContextValue) => React.ReactNode);
  commandListChildren?:
    | React.ReactNode
    | ((context: ComboboxContextValue) => React.ReactNode);
  empty?: React.ReactNode;
  inputPlaceholder?: string;
}) {
  const [open, setOpen] = React.useState(false);

  const close = () => setOpen(false);

  const contextValue = React.useMemo(
    () => ({ value: value ?? null, options, open, setOpen }),
    [value, options, open]
  );

  return (
    <ComboboxContext.Provider value={contextValue}>
      <Popover open={open} onOpenChange={setOpen}>
        {typeof children === "function" ? children(contextValue) : children}
        <PopoverContent className="p-0 w-max min-w-(--radix-popover-trigger-width)">
          <Command>
            <CommandInput placeholder={inputPlaceholder} />
            <CommandEmpty>{empty}</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      onSelect(option.value, close);
                    }}
                    className="justify-between truncate"
                    disabled={option.disabled}
                  >
                    <div className="flex items-center">{option.label}</div>
                    <span
                      className={checkboxItemIndicatorVariants({
                        position: "right",
                      })}
                    >
                      <Check
                        className={cn(
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
              {typeof commandListChildren === "function"
                ? commandListChildren(contextValue)
                : commandListChildren}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </ComboboxContext.Provider>
  );
}
