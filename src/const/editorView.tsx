import { Archive, Cog, Images, ScanEye } from "lucide-react";

export type EditorView = "items" | "assets" | "settings" | "preview";

export const editorView = {
  items: "Markers",
  assets: "Assets",
  settings: "Settings",
  preview: "Preview",
} as const satisfies Record<EditorView, string>;

export const editorViewIcon = {
  items: <Images />,
  assets: <Archive />,
  settings: <Cog />,
  preview: <ScanEye />,
} as const satisfies Record<EditorView, React.ReactNode>;
