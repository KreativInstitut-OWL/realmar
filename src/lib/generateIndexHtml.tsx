import { renderToStaticMarkup } from "react-dom/server";
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
  return `<!DOCTYPE html>${renderToStaticMarkup(
    <ArExperience files={files} sizes={sizes} meta={meta} />
  )}`;
}
