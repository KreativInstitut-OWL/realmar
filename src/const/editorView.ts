export type EditorView = "items" | "settings" | "preview";

export const editorView = {
  items: "Markers",
  settings: "Settings",
  preview: "Preview",
} as const;
