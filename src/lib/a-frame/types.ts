import * as React from "react";

// A-Frame property types
export type AFrameArray = string; // Comma-separated values
export type AFrameAsset = string; // URL or element ID selector
export type AFrameAudio = string; // URL or element ID selector
export type AFrameColor = string; // Hex code or color name
export type AFrameInt = number;
export type AFrameMap = string; // URL or element ID selector
export type AFrameModel = string; // URL or element ID selector
export type AFrameNumber = `${number}`;
export type AFrameSelector = string | null; // CSS selector
export type AFrameSelectorAll = string | null; // CSS selector
export type AFrameVec2 = `${number} ${number}`; // "x y"
export type AFrameVec3 = `${number} ${number} ${number}`; // "x y z"
export type AFrameVec4 = `${number} ${number} ${number} ${number}`; // "x y z w"

export interface AFrameComponent {
  anchored?: string; // TODO: Add more specific type if possible
  animation?: string; // Complex component, treat as string for now
  "ar-hit-test"?: string; // TODO: Add more specific type if possible
  background?: AFrameColor;
  camera?: string; // Complex component, treat as string for now
  cursor?: string; // Complex component, treat as string for now
  debug?: string; // Likely boolean or string, treat as string for now
  "device-orientation-permission-ui"?: string;
  embedded?: boolean;
  fog?: string; // Complex component, treat as string for now
  geometry?: string; // Complex component, treat as string for now
  "gltf-model"?: AFrameAsset;
  "hand-controls"?: string; // Complex component, treat as string for now
  "hand-tracking-controls"?: string; // Complex component, treat as string for now
  "hand-tracking-grab-controls"?: string; // Complex component, treat as string for now
  "hide-on-enter-ar"?: boolean;
  "hide-on-enter-vr"?: boolean;
  "keyboard-shortcuts"?: string; // Likely boolean, treat as string for now
  "laser-controls"?: string; // Complex component, treat as string for now
  layer?: string; // TODO: Add more specific type if possible
  light?: string; // Complex component, treat as string for now
  line?: string; // Complex component, treat as string for now
  link?: string; // Complex component, treat as string for now
  "loading-screen"?: string; // Likely boolean, treat as string for now
  "logiteck-mx-ink-controls"?: string; // Complex component, treat as string for now
  "look-controls"?: string; // Complex component, treat as string for now
  "magicleap-controls"?: string; // Complex component, treat as string for now
  material?: string; // Complex component, treat as string for now
  "meta-touch-controls"?: string; // Complex component, treat as string for now
  "obb-collider"?: string;
  "obj-model"?: string;
  pool?: string;
  position?: AFrameVec3;
  raycaster?: string;
  "real-world-meshing"?: string;
  reflection?: string;
  renderer?: string;
  rotation?: AFrameVec3;
  scale?: AFrameVec3;
  screenshot?: string;
  shadow?: string;
  sound?: AFrameAsset;
  stats?: boolean; //Or string
  text?: string;
  "tracked-controls"?: string;
  visible?: boolean;
  "vive-controls"?: string;
  "vive-focus-controls"?: string;
  "wasd-controls"?: string;
  webxr?: string;
  "windows-motion-controls"?: string;
  "xr-mode-ui"?: string;
}

export interface CustomComponent {
  quaternion?: AFrameVec4;
  "look-at"?: string;
  float?: AFrameMap;
  "mindar-image-target"?: string;
  "mindar-image"?: string;
  "realmar-display-mode"?: string;
}

export type AFrameEntityProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement> & AFrameComponent & CustomComponent,
  HTMLElement
>;
declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "a-entity": AFrameEntityProps;
      "a-scene": AFrameEntityProps;
      "a-assets": AFrameEntityProps;
      "a-asset-item": AFrameEntityProps & {
        src?: AFrameAsset;
      };
      "a-camera": AFrameEntityProps;
      "a-plane": AFrameEntityProps & {
        width?: AFrameNumber;
        height?: AFrameNumber;
        src?: AFrameAsset;
      };
    }
  }
}
