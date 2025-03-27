import { cn } from "@/lib/utils";
import { useAsset, useCurrentItem, useStore } from "@/store";
import { forwardRef, HTMLAttributes } from "react";
import { ItemArrangeControls } from "./ItemArrangeControls";
import { ItemArrangeEditor } from "./ItemArrangeEditor";
import { ItemEntityList } from "./ItemEntityList";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarProvider,
  SidebarSeparator,
} from "./ui/sidebar";

export const ItemArrange = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const setItem = useStore((state) => state.setItem);
  const setItemEntity = useStore((state) => state.setItemEntity);

  const item = useCurrentItem();
  const currentEntity = item?.entityNavigation?.current;
  const { data: currentEntityAsset } = useAsset(currentEntity?.assetId);

  const { data: targetAsset } = useAsset(item?.targetAssetId);

  if (!item) return null;

  if (!currentEntityAsset || !currentEntity) {
    return <div>Please add entities to this item.</div>;
  }

  return (
    <SidebarProvider
      className={cn(
        "h-[calc(100vh-var(--header-height))] min-h-0 w-full relative overflow-clip",
        className
      )}
      {...props}
      ref={ref}
    >
      <ItemArrangeEditor
        marker={targetAsset}
        id={item.id}
        cameraPosition={item.editorCameraPosition}
        onCameraPositionChange={(cameraPosition) => {
          setItem(item.id, { editorCameraPosition: cameraPosition });
        }}
        entities={item.entities}
        selectedEntityId={currentEntity.id}
        onTransformChange={(transform) => {
          setItemEntity(item.id, currentEntity.id, { transform });
        }}
        onSelectEntity={(id) => {
          setItem(item.id, {
            editorCurrentEntityId: id,
          });
        }}
        displayMode={item.displayMode}
      />

      <Sidebar
        side="right"
        // variant="floating"
        className="top-16 bottom-0 h-auto [--sidebar-width:320px]"
      >
        <SidebarHeader>Properties</SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0 -mx-2 w-[calc(100%+1rem)]">
              <SidebarGroupLabel>Entities</SidebarGroupLabel>
              <ItemEntityList
                variant="compact"
                onSelectedEntityIdsChange={(ids) => {
                  setItem(item.id, {
                    editorCurrentEntityId: ids[0],
                  });
                }}
                canSelectMultipleEntities={false}
                clearSelectedEntitiesOnOutsideClick={false}
                selectedEntityIds={[currentEntity.id]}
                className="max-h-96 overflow-y-scroll"
              />
            </SidebarGroupContent>
            <SidebarSeparator className="my-2" />
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarGroupLabel>Entity Properties</SidebarGroupLabel>
              <ItemArrangeControls />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>footer</SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
});
