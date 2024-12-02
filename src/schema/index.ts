import { nanoid } from "nanoid";
import { z } from "zod";

const NANOID_LENGTH = 5;

export const assetSchema = z.object({
  id: z.string().default(() => nanoid(NANOID_LENGTH)),
  file: z.instanceof(File),
});

export type Asset = z.infer<typeof assetSchema>;

export const vector3Schema = z
  .object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  })
  .default({ x: 0, y: 0, z: 0 });

export type Vector3 = z.infer<typeof vector3Schema>;

export const itemSchema = z.object({
  id: z.string().default(() => nanoid(NANOID_LENGTH)),
  assets: z.array(assetSchema).default([]),
  marker: z.instanceof(File).nullable().default(null),

  // transforms:
  position: vector3Schema,
  rotation: vector3Schema,
  scale: vector3Schema.default({ x: 1, y: 1, z: 1 }),

  lookAt: z.enum(["camera"]).nullable().default(null),
});

export const getDefaultItem = () => itemSchema.parse({});

export type Item = z.infer<typeof itemSchema>;

export const appStateSchema = z.object({
  items: z.array(itemSchema).default(() => [getDefaultItem()]),
});

export type AppState = z.infer<typeof appStateSchema>;

export const getDefaultAppState = () => appStateSchema.parse({});
