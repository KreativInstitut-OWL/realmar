import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const byteFormatter = Intl.NumberFormat("en", {
  notation: "compact",
  style: "unit",
  unit: "byte",
  unitDisplay: "narrow",
  maximumFractionDigits: 1,
});

export const dateFormatter = Intl.DateTimeFormat("en", {
  dateStyle: "short",
  timeStyle: "short",
  hourCycle: "h23",
  formatMatcher: "best fit",
});
