/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Utilities for detecting animated images (GIF/APNG) at upload time
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { parseGIF } from "gifuct-js";
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

        // Check if this is actually a valid GIF file
        const view = new Uint8Array(arrayBuffer);
        const header = String.fromCharCode(...view.slice(0, 6));

        if (!header.startsWith("GIF8")) {
          console.warn(`Invalid GIF header: ${header}`);
          resolve({ isAnimated: false, frameCount: 1 });
          return;
        }

        let gifData: any;
        try {
          gifData = parseGIF(arrayBuffer);
        } catch (parseError) {
          console.error(`Failed to parse GIF:`, parseError);
          resolve({ isAnimated: false, frameCount: 1 });
          return;
        }

        // Get frame count from parsed GIF data
        const frameCount = gifData.frames?.length || 0;

        const result = {
          isAnimated: frameCount > 1,
          frameCount: frameCount || 1,
        };
        resolve(result);
      } catch (error) {
        console.warn("Failed to parse GIF:", error);
        resolve({ isAnimated: false, frameCount: 1 });
      }
    };
    reader.onerror = (error) => {
      console.warn("FileReader error:", error);
      resolve({ isAnimated: false, frameCount: 1 });
    };
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
        const result = {
          isAnimated: frameCount > 1,
          frameCount,
        };
        resolve(result);
      } catch (error) {
        console.warn("Failed to parse PNG:", error);
        resolve({ isAnimated: false, frameCount: 1 });
      }
    };
    reader.onerror = (error) => {
      console.warn("FileReader error:", error);
      resolve({ isAnimated: false, frameCount: 1 });
    };
    reader.readAsArrayBuffer(file);
  });
}
