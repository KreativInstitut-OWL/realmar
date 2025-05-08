/* eslint-disable @typescript-eslint/no-explicit-any */

import { Suspense } from "react";
import { ItemListSelectedItemContent } from "./ItemList";
import { useStore } from "@/store";
import { EditorView } from "@/const/editorView";
import { PreviewArExperienceWrapper } from "./PreviewArExperience";
import { MainViewAssets } from "./MainViewAssets";

const components = {
  items: ItemListSelectedItemContent,
  assets: MainViewAssets,
  preview: PreviewArExperienceWrapper,
} as const satisfies Record<EditorView, React.ComponentType<any>>;

export function MainView() {
  const editorCurrentView = useStore((state) => state.editorCurrentView);
  const Component = components[editorCurrentView];

  if (!Component) {
    return null;
  }

  return (
    <Suspense fallback="loading...">
      <Component />
    </Suspense>
  );
}
