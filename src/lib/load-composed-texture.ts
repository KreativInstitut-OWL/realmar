/**
 * Ensures THREE is on window and loads ComposedTexture.js
 * ComposedTexture.js is an IIFE that expects window.THREE to exist
 */

let loaded = false;

export async function loadComposedTexture(): Promise<void> {
  if (loaded) return;

  // Expose THREE to window - ComposedTexture.js expects window.THREE
  // We need to create a mutable copy because ES modules are read-only
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(window as any).THREE) {
      const THREE = await import("three");
      // Create a mutable copy of THREE so ComposedTexture.js can add properties
      // Use Object.assign to copy all properties to a new mutable object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).THREE = Object.assign({}, THREE);
    }
  }

  // Import ComposedTexture.js - the IIFE will execute and register ComposedTexture
  // @ts-expect-error - ComposedTexture.js is a script file, not an ES module
  await import("../lib/composed-texture/ComposedTexture.js");

  loaded = true;
}
