import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";

export function reactRenderToString(node: React.ReactNode) {
  const container = document.createElement("div");
  const root = createRoot(container);
  flushSync(() => root.render(node));
  return container.innerHTML;
}

export function renderSvgReactNodeToBase64(node: React.ReactNode) {
  return "data:image/svg+xml;base64," + btoa(reactRenderToString(node));
}

export function renderSvgReactNodeToFile(
  node: React.ReactNode,
  name: string = "image.svg"
) {
  const svg = reactRenderToString(node);
  return new File([svg], name, { type: "image/svg+xml" });
}
