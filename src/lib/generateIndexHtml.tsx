import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { ArExperience } from "./ArExperience";

export type Size = {
  height: number;
  width: number;
};

export type Meta = {
  rotation: number;
  faceCam: boolean;
  spacing: number;
};

export default function generateIndexHtml(
  files: File[],
  sizes: Size[],
  meta: Meta[]
): string {
  const container = document.createElement("div");
  const root = createRoot(container);
  flushSync(() => {
    root.render(<ArExperience files={files} sizes={sizes} meta={meta} />);
  });
  return `<!DOCTYPE html>${container.innerHTML}`;
}
