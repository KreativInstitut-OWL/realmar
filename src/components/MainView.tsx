/* eslint-disable @typescript-eslint/no-explicit-any */

import { Suspense } from "react";
import { ItemListSelectedItemContent } from "./ItemList";
import { useStore } from "@/store";
import { EditorView } from "@/const/editorView";
import { PreviewArExperience } from "./PreviewArExperience";

const components = {
  items: ItemListSelectedItemContent,
  settings: ItemListSelectedItemContent,
  preview: PreviewArExperience,
} as const satisfies Record<EditorView, React.ComponentType<any>>;

export function MainView({ itemHeader }: { itemHeader: HTMLLIElement | null }) {
  const editorCurrentView = useStore((state) => state.editorCurrentView);
  const Component = components[editorCurrentView];

  if (!Component) {
    return null;
  }

  return (
    <Suspense fallback="loading...">
      <Component itemHeader={itemHeader} />
    </Suspense>
  );
}
