import { NumberInput as NumberInputPrimitive } from "@ark-ui/react/number-input";
import { forwardRef, useCallback, useRef, useState, FocusEvent } from "react";

import { cn } from "@/lib/utils";

import { inputVariants } from "./input";

type InputNumberProps = {
  onChange: (value: number | null) => void;
  value: number | null;
  formatOptions?: Intl.NumberFormatOptions;
} & Omit<
  NumberInputPrimitive.RootProps,
  "value" | "onChange" | "onValueChange"
>;

const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  ({ value, onChange, formatOptions, className, onBlur, ...rest }, ref) => {
    const locale = "en-US"; // i18n.language;
    const [stringValue, setStringValue] = useState<string>(
      numberToString(value, locale)
    );

    const [isFocused, setIsFocused] = useState(false);

    // sync the input value with the value prop
    if (
      value !== null &&
      stringValue !== numberToString(value, locale) &&
      !isFocused
    ) {
      setStringValue(numberToString(value, locale));
    }

    const isEmptyBlurRef = useRef(false);

    const handleValueChange = useCallback(
      ({ value: newStringValue }: NumberInputPrimitive.ValueChangeDetails) => {
        // ignore the first onValueChange call after the input is empty (see below)
        if (isEmptyBlurRef.current) {
          isEmptyBlurRef.current = false;
          return;
        }
        setStringValue(newStringValue);
        const number = stringToNumber(newStringValue, locale);
        if (number !== null && number !== value) {
          onChange(number);
        }
      },
      [locale, onChange, value]
    );

    const handleBlur = useCallback(
      (event: FocusEvent<HTMLDivElement>) => {
        // NumberInput will call onValueChange with the min value if the input is empty,
        // right after this onBlur event (because of clampValueOnBlur).
        // We want to ignore that call to allow the user to clear the input.

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((event.target as any).value === "") {
          isEmptyBlurRef.current = true;
        }

        setIsFocused(false);
        onBlur?.(event);
      },
      [onBlur]
    );

    return (
      <NumberInputPrimitive.Root
        allowMouseWheel={false}
        spinOnPress={false}
        clampValueOnBlur
        {...rest}
        ref={ref}
        className={cn("relative", className)}
        locale={locale}
        formatOptions={formatOptions}
        pattern=".*"
        onValueChange={handleValueChange}
        onFocus={(event) => {
          setIsFocused(true);
          rest.onFocus?.(event);
        }}
        onBlur={handleBlur}
        value={stringValue}
      >
        <NumberInputPrimitive.Input className={cn(inputVariants(), "w-full")} />
        <NumberInputPrimitive.Scrubber className="absolute h-2 bottom-0 w-full bg-gray-100 hover:bg-gray-200" />
      </NumberInputPrimitive.Root>
    );
  }
);

/**
 * Formats a number to a string using the given locale.
 * This is important because the NumberInput component expects a string value
 * and we want the number input to work with actual numbers.
 */
function numberToString(value: number | null, locale: string) {
  // Check if value is a number
  if (value === null) {
    return "";
  }

  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Parses a string to a number using the given locale.
 * This is important because the NumberInput component returns a string value
 * and we want to work with actual numbers.
 */
function stringToNumber(value: string, locale: string) {
  const formatter = new Intl.NumberFormat(locale);
  const parts = formatter.formatToParts(12345.6);
  const groupSeparator =
    parts.find((part) => part.type === "group")?.value || ",";
  const decimalSeparator =
    parts.find((part) => part.type === "decimal")?.value || ".";

  const normalizedValue = value
    .replace(new RegExp(`\\${groupSeparator}`, "g"), "")
    .replace(new RegExp(`\\${decimalSeparator}`), ".");

  const parsedValue = Number.parseFloat(normalizedValue);
  if (Number.isNaN(parsedValue)) {
    return null;
  }
  return parsedValue;
}

InputNumber.displayName = "InputNumber";

export { InputNumber };
