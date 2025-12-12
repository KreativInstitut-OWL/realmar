/**
 * Utilities for detecting animated images (GIF/APNG) at upload time
 */

// Note: The npm gif.js package types don't match the decoder API we need
// We'll use a type assertion to bypass the type check
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import GIF from "gif.js";
import UPNG from "upng-js";

export async function detectAnimatedImage(
  file: File
): Promise<{ isAnimated: boolean; frameCount: number }> {
  try {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    // Check if it's a GIF
    if (fileType === "image/gif" || fileName.endsWith(".gif")) {
      return await detectAnimatedGif(file);
    }

    // Check if it's a PNG (potentially APNG)
    if (fileType === "image/png" || fileName.endsWith(".png")) {
      return await detectAnimatedPng(file);
    }

    // Not a supported animated format
    return { isAnimated: false, frameCount: 1 };
  } catch (error) {
    console.warn("Failed to detect animation in file:", file.name, error);
    // Default to non-animated if detection fails
    return { isAnimated: false, frameCount: 1 };
  }
}

async function detectAnimatedGif(
  file: File
): Promise<{ isAnimated: boolean; frameCount: number }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        // The npm gif.js types don't match the decoder API we need
        // Use type assertion since the runtime library accepts ArrayBuffer
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call
        const gif = new (GIF as any)(arrayBuffer);
        const frames = gif.decompressFrames(true);
        const frameCount = frames.length;
        resolve({
          isAnimated: frameCount > 1,
          frameCount,
        });
      } catch (error) {
        console.warn("Failed to parse GIF:", error);
        resolve({ isAnimated: false, frameCount: 1 });
      }
    };
    reader.onerror = () => resolve({ isAnimated: false, frameCount: 1 });
    reader.readAsArrayBuffer(file);
  });
}

async function detectAnimatedPng(
  file: File
): Promise<{ isAnimated: boolean; frameCount: number }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const png = UPNG.decode(arrayBuffer);
        const frameCount = png.frames?.length || 1;
        resolve({
          isAnimated: frameCount > 1,
          frameCount,
        });
      } catch (error) {
        console.warn("Failed to parse PNG:", error);
        resolve({ isAnimated: false, frameCount: 1 });
      }
    };
    reader.onerror = () => resolve({ isAnimated: false, frameCount: 1 });
    reader.readAsArrayBuffer(file);
  });
}
