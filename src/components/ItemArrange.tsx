import { cn } from "@/lib/utils";
import { createEntity, useAsset, useCurrentItem, useStore } from "@/store";
import { FileStack, Images, Plus, Scan, Text } from "lucide-react";
import { forwardRef, HTMLAttributes } from "react";
import { EntityIcon } from "./EntityIcon";
import { EntityProperties } from "./EntityProperties";
import ItemAddAssetEntitiesDialog from "./ItemAddAssetEntitiesDialog";
import { ItemArrangeEditor } from "./ItemArrangeEditor";
import { ItemEntityList } from "./ItemEntityList";
import { ItemMarker } from "./ItemMarker";
import { Button } from "./ui/button";
import { ControlGroup, ControlLabel } from "./ui/control";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarProvider,
} from "./ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AppBreadcrumbPortal } from "./AppBreadcrumb";
import { ItemComboboxEditorCurrentItem } from "./ItemCombobox";
import { BreadcrumbSeparator, BreadcrumbItem } from "./ui/breadcrumb";

export const ItemArrange = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => {
  const setItem = useStore((state) => state.setItem);
  const setItemEntity = useStore((state) => state.setItemEntity);
  const addItemEntity = useStore((state) => state.addItemEntity);

  const item = useCurrentItem();
  const currentEntity = item?.entityNavigation?.current;

  const targetAsset = useAsset(item?.targetAssetId);

  if (!item) return null;

  return (
    <SidebarProvider
      className={cn("min-h-0 w-full relative overflow-clip", className)}
      style={{ "--sidebar-width": "340px", ...style } as React.CSSProperties}
      {...props}
      ref={ref}
    >
      <AppBreadcrumbPortal>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <ItemComboboxEditorCurrentItem />
        </BreadcrumbItem>
      </AppBreadcrumbPortal>
      <ItemArrangeEditor
        marker={targetAsset}
        id={item.id}
        entities={item.entities}
        selectedEntityId={currentEntity?.id ?? null}
        onTransformChange={(transform) => {
          if (!currentEntity) return;
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
        className="top-0 bottom-0 h-auto"
      >
        <Tabs
          defaultValue="arrange"
          value={item.editorCurrentTab}
          onValueChange={(value) =>
            setItem(item.id, {
              editorCurrentTab: value as "entities" | "target",
            })
          }
        >
          <SidebarHeader>
            <TabsList className="w-fit">
              <TabsTrigger value="entities">
                <Images />
                Entities
              </TabsTrigger>
              <TabsTrigger value="target">
                <Scan />
                Marker
              </TabsTrigger>
            </TabsList>
            <Separator />
          </SidebarHeader>
          <SidebarContent>
            <TabsContent value="entities">
              <SidebarGroup>
                <SidebarGroupContent>
                  <ControlGroup>
                    <ControlLabel
                      end={
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              tooltip="Add entity"
                            >
                              <Plus />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <ItemAddAssetEntitiesDialog item={item}>
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                }}
                              >
                                <FileStack />
                                Asset(s)
                              </DropdownMenuItem>
                            </ItemAddAssetEntitiesDialog>
                            <DropdownMenuItem
                              onClick={() => {
                                addItemEntity(
                                  item.id,
                                  createEntity({ type: "text" })
                                );
                              }}
                            >
                              <Text />
                              Text
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem
                          onClick={() => {
                            addItemEntity(
                              item.id,
                              createEntity({ type: "null" })
                            );
                          }}
                        >
                          <Parentheses />
                          Null
                        </DropdownMenuItem> */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      }
                    >
                      Entities ({item.entities.length})
                    </ControlLabel>
                    <ItemEntityList
                      variant="compact"
                      onSelectedEntityIdsChange={(ids) => {
                        setItem(item.id, {
                          editorCurrentEntityId: ids[0],
                        });
                      }}
                      canSelectMultipleEntities={false}
                      clearSelectedEntitiesOnOutsideClick={false}
                      selectedEntityIds={
                        currentEntity ? [currentEntity.id] : []
                      }
                      className="max-h-96 overflow-y-scroll -mx-2"
                    />
                  </ControlGroup>
                </SidebarGroupContent>
                <Separator className="my-2" />
                <SidebarGroupContent>
                  <ControlGroup>
                    <ControlLabel
                      end={
                        currentEntity ? (
                          <EntityIcon entity={currentEntity} />
                        ) : null
                      }
                    >
                      Entity: {currentEntity?.name ?? "None"}
                    </ControlLabel>
                    <EntityProperties item={item} entity={currentEntity} />
                  </ControlGroup>
                </SidebarGroupContent>
              </SidebarGroup>
            </TabsContent>
            <TabsContent value="target">
              <ItemMarker />
            </TabsContent>
          </SidebarContent>
          {/* <SidebarFooter>footer</SidebarFooter> */}
        </Tabs>
      </Sidebar>
    </SidebarProvider>
  );
});
