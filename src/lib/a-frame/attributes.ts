import * as THREE from "three";
import { AFrameNumber, AFrameVec3, AFrameVec4 } from "./types";

export function precisionRound(value: number) {
  return Math.round(value * 1e10) / 1e10;
}

export function toNumber(value: number) {
  return precisionRound(value).toString() as AFrameNumber;
}

export function toVec3({ x, y, z }: THREE.Vector3Like) {
  return [x, y, z].map(precisionRound).join(" ") as AFrameVec3;
}

export function toVec4({ x, y, z, w }: THREE.Vector4Like) {
  return [x, y, z, w].map(precisionRound).join(" ") as AFrameVec4;
}

export function toAttrs(obj: Record<string, unknown>) {
  return (
    Object.entries(obj)
      .map(
        ([key, value]) =>
          `${key}: ${typeof value === "number" ? precisionRound(value) : value}`
      )
      .join("; ") + ";"
  );
}
