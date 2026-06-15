import { cn } from "@/lib/utils";
import { useItem, useStore } from "@/store";
import { GripHorizontal, Plus } from "lucide-react";
import * as React from "react";
import { ItemContextMenu } from "./ItemContextMenu";
import { ItemPreview } from "./ItemPreview";
import { ItemView } from "./ItemView";
import { SplashScreen } from "./SplashScreen";
import { Button } from "./ui/button";
import {
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "./ui/sidebar";
import { DragHandle, Sortable } from "./ui/sortable";
import { useLanguage } from "@/LanguageProvider";

export const ItemListList = React.forwardRef<
  React.ElementRef<typeof SidebarMenuSub>,
  Omit<React.ComponentPropsWithoutRef<typeof SidebarMenuSub>, "children">
>(({ className, ...props }, ref) => {
  const items = useStore((state) => state.items);
  const moveItem = useStore((state) => state.moveItem);

  return (
    <SidebarMenuSub
      className={cn("relative overflow-y-scroll", className)}
      ref={ref}
      {...props}
    >
      <Sortable
        items={items.map((item) => ({
          id: item.id,
          node: <ItemListTabsTrigger key={item.id} itemId={item.id} />,
        }))}
        onItemMove={(oldIndex, newIndex) => {
          moveItem(oldIndex, newIndex);
        }}
        withDragHandle
      />
    </SidebarMenuSub>
  );
});

ItemListList.displayName = "ItemListList";

const ItemListTabsTrigger = React.forwardRef<
  React.ElementRef<typeof SidebarMenuSubItem>,
  Omit<
    React.ComponentPropsWithoutRef<typeof SidebarMenuSubItem>,
    "children" | "value"
  > & { itemId: string }
>(({ className, itemId, ...props }, ref) => {
  const editorCurrentItemId = useStore((state) => state.editorCurrentItemId);
  const editorCurrentView = useStore((state) => state.editorCurrentView);
  const editorSetCurrentItemId = useStore(
    (state) => state.setEditorCurrentItemId
  );
  const editorSetCurrentView = useStore((state) => state.setEditorCurrentView);
  const item = useItem(itemId);
  const { t } = useLanguage();
  if (!item) return null;

  return (
    <SidebarMenuSubItem ref={ref} className={cn(className)} {...props}>
      <ItemContextMenu item={item} asChild>
        <SidebarMenuSubButton
          isActive={
            editorCurrentView === "items" && editorCurrentItemId === itemId
          }
          onClick={() => {
            editorSetCurrentView("items");
            editorSetCurrentItemId(itemId);
          }}
        >
          <ItemPreview id={item.id} />
          <DragHandle>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("dragItem")}
              className="ml-auto"
            >
              <GripHorizontal />
            </Button>
          </DragHandle>
        </SidebarMenuSubButton>
      </ItemContextMenu>
    </SidebarMenuSubItem>
  );
});

export const ItemListSelectedItemContent = () => {
  const editorCurrentItemId = useStore((state) => state.editorCurrentItemId);
  const itemCount = useStore((state) => state.items.length);
  const { t } = useLanguage();

  if (itemCount === 0) {
    return (
      <SplashScreen>
        <Button
          variant="secondary"
          onClick={() => {
            useStore.getState().addItem(true);
          }}
        >
          <Plus /> {t("addFirstMarker")}
        </Button>
      </SplashScreen>
    );
  }

  if (!editorCurrentItemId) {
    return (
      <div className="h-full w-full grid place-items-center">
        <div className="text-gray-11 text-center">
          {t("noItemSelected")}
          <br />
          {t("selectItemToEdit")}
        </div>
      </div>
    );
  }

  return <ItemView />;
};
