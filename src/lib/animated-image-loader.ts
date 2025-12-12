/**
 * Utilities for loading animated images (GIF/APNG) into ComposedTexture containers
 */

// Note: The npm gif.js package types don't match the decoder API we need
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import GIF from "gif.js";
import UPNG from "upng-js";

// Type definition for UPNG frame structure
interface UPNGFrame {
  rect: { x: number; y: number; width: number; height: number };
  data: Uint8Array;
  blend: number;
  delay: number;
  dispose: number;
}

export async function loadGifContainer(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call
        const gif = new (GIF as any)(arrayBuffer);

        const container = {
          downscale: false,
          width: gif.raw.lsd.width,
          height: gif.raw.lsd.height,
          frames: gif.decompressFrames(true), // This gives us the frame data ComposedTexture expects
        };

        resolve(container);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read GIF file"));
    reader.readAsArrayBuffer(file);
  });
}

export async function loadApngContainer(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const png = UPNG.decode(arrayBuffer);

        const frames = [];
        for (let src of png.frames as UPNGFrame[]) {
          if (!src.data) continue;

          frames.push({
            dims: {
              left: src.rect.x,
              top: src.rect.y,
              width: src.rect.width,
              height: src.rect.height,
            },
            patch: src.data, // Uncompressed frame data
            blend: src.blend,
            delay: src.delay,
            disposalType: src.dispose,
          });
        }

        const container = {
          downscale: false,
          width: png.width,
          height: png.height,
          frames: frames,
        };

        resolve(container);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read PNG file"));
    reader.readAsArrayBuffer(file);
  });
}

export async function loadAnimatedImageContainer(file: File): Promise<any> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  if (fileType === "image/gif" || fileName.endsWith(".gif")) {
    return await loadGifContainer(file);
  }

  if (fileType === "image/png" || fileName.endsWith(".png")) {
    return await loadApngContainer(file);
  }

  throw new Error(`Unsupported animated image format: ${file.type}`);
}
