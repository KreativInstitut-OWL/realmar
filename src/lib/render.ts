import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import * as THREE from "three";

export function reactRenderToString(node: React.ReactNode) {
  const container = document.createElement("div");
  const root = createRoot(container);
  flushSync(() => root.render(node));
  return container.innerHTML;
}

export function renderSvgReactNodeToBase64Src(node: React.ReactNode) {
  return "data:image/svg+xml;base64," + btoa(reactRenderToString(node));
}

export function renderSvgReactNodeToFile(
  node: React.ReactNode,
  name: string = "image.svg"
) {
  const svg = reactRenderToString(node);
  return new File([svg], name, { type: "image/svg+xml" });
}

export function createFileFromImageElement(img: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.width = img.width;
  canvas.height = img.height;

  ctx.drawImage(img, 0, 0, img.width, img.height);

  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob!], "image.png", { type: "image/png" }));
    });
  });
}

export function createFileFromCanvas(canvas: HTMLCanvasElement, name: string) {
  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob!], `${name}.png`, { type: "image/png" }));
    });
  });
}

const FALLBACK_IMG_SIZE = 512;

export function createSquareCanvasFromImageElement({
  img,
  size: _size,
}: {
  img: HTMLImageElement;
  size?: number;
}): HTMLCanvasElement {
  // Create canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  if (!img.width || !img.height) {
    img.width = _size ?? FALLBACK_IMG_SIZE;
    img.height = _size ?? FALLBACK_IMG_SIZE;
  }

  // Calculate dimensions
  const size = _size ?? Math.max(img.width, img.height);
  canvas.width = size;
  canvas.height = size;

  // clear canvas
  ctx.clearRect(0, 0, size, size);

  // make canvas background to checkerboard pattern
  drawCheckerboardPattern(ctx, size, size);

  const scale = Math.min(size / img.width, size / img.height);

  // Calculate new dimensions
  const scaledWidth = img.width * scale;
  const scaledHeight = img.height * scale;

  // Calculate position to center image
  const x = (size - scaledWidth) / 2;
  const y = (size - scaledHeight) / 2;

  // Draw scaled image centered
  ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

  return canvas;
}

export function createImgElementFromCanvas(canvas: HTMLCanvasElement) {
  const img = document.createElement("img");
  img.src = canvas.toDataURL();
  return img;
}

function drawCheckerboardPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const checkerboardSize = 16;
  const checkerboardColor1 = "#f7f7f7";
  const checkerboardColor2 = "#e6e6e6";
  for (let x = 0; x < width; x += checkerboardSize) {
    for (let y = 0; y < height; y += checkerboardSize) {
      ctx.fillStyle =
        (x + y) % (checkerboardSize * 2) === 0
          ? checkerboardColor1
          : checkerboardColor2;
      ctx.fillRect(x, y, checkerboardSize, checkerboardSize);
    }
  }
}

export function createSquareCanvasFromSrc({
  src,
  size,
}: {
  src: string;
  size?: number;
}) {
  return new Promise<HTMLCanvasElement>((resolve) => {
    const img = document.createElement("img");
    img.setAttribute("src", src);

    img.onload = function () {
      resolve(createSquareCanvasFromImageElement({ img, size }));
    };
  });
}

export async function createSquareThreeTextureFromSrc({
  src,
  size,
}: {
  src: string;
  size?: number;
}) {
  const canvas = await createSquareCanvasFromSrc({ src, size });
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}
