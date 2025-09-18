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

export function uppercaseFirstLetter(string?: string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function isMouseEvent(event: Event): event is MouseEvent {
  return event instanceof MouseEvent;
}

export function selectAll(element: HTMLInputElement | null) {
  element?.setSelectionRange(0, element?.value.length);
}

export function inferMimeFromFilename(filename: string): string {
  const extension = filename.toLowerCase().split(".").pop() ?? "";
  const map: Record<string, string> = {
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    bmp: "image/bmp",
    avif: "image/avif",
    mp4: "video/mp4",
    webm: "video/webm",
    ogg: "video/ogg",
    mov: "video/quicktime",
    mkv: "video/x-matroska",
    glb: "model/gltf-binary",
    json: "application/json",
    txt: "text/plain",
  };
  return map[extension] ?? "";
}

/**
 * Generates an intelligent name for a copied entity following standard conventions
 *
 * Examples:
 * - "Layer" → "Layer (copy)"
 * - "Layer (copy)" → "Layer (copy 2)"
 * - "Layer (copy 2)" → "Layer (copy 3)"
 * - "Layer (copy 1)" → "Layer (copy 2)"
 *
 * @param originalName - The name of the entity being copied
 * @returns A new name with appropriate copy numbering
 */
export function generateCopyName(originalName: string): string {
  // Matches both "Name (copy)" and "Name (copy N)" formats
  const copyPattern = /^(.*) \(copy(?: (\d+))?\)$/;
  const match = originalName.match(copyPattern);

  if (match) {
    const baseName = match[1];
    // If no number was captured (just "copy"), treat as 1
    const copyNumber = match[2] ? parseInt(match[2], 10) : 1;
    return `${baseName} (copy ${copyNumber + 1})`;
  }

  // Default case: first copy
  return `${originalName} (copy)`;
}
