import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { getItemName } from "@/lib/item";
import { Entity, Item, useEntityAsset, useStore } from "@/store";
import * as FileStore from "@/store/file-store";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
} from "lucide-react";
import { forwardRef } from "react";
import { Badge } from "./ui/badge";

export const ItemEntityContextMenu = forwardRef<
  HTMLSpanElement,
  React.ComponentProps<typeof ContextMenuTrigger> & {
    item: Item;
    entityIndex: number;
    entity: Entity;
    selectedEntityIds: string[];
  }
>(({ item, entity, entityIndex, selectedEntityIds, ...props }, ref) => {
  const removeItemEntities = useStore((state) => state.removeItemEntities);
  const moveItemEntity = useStore((state) => state.moveItemEntity);
  const sendItemEntitiesToItem = useStore(
    (state) => state.sendItemEntitiesToItem
  );
  const items = useStore((state) => state.items);
  const { data: asset } = useEntityAsset(entity);

  const isMultipleSelected = selectedEntityIds.length > 1;

  return (
    <ContextMenu>
      <ContextMenuTrigger ref={ref} {...props} />
      <ContextMenuContent className="w-48">
        <ContextMenuLabel className="flex items-center gap-2">
          <div className="flex-1 truncate min-w-0">
            {asset?.file.name ?? "Unknown entity"}{" "}
          </div>
          {isMultipleSelected ? (
            <Badge>+{selectedEntityIds.length - 1}</Badge>
          ) : null}
        </ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem
          onSelect={() => {
            removeItemEntities(item.id, selectedEntityIds);
          }}
        >
          {isMultipleSelected
            ? `Delete ${selectedEntityIds.length} entities`
            : "Delete"}
        </ContextMenuItem>
        {!isMultipleSelected && (
          <ContextMenuItem
            disabled={isMultipleSelected}
            onSelect={() => {
              const oldName = asset?.file.name;
              const newName = prompt("Enter a new name", oldName);
              if (newName) {
                FileStore.rename(asset!.id, newName);
              }
            }}
          >
            Rename
          </ContextMenuItem>
        )}
        {!isMultipleSelected && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>Move</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem
                disabled={entityIndex === 0}
                onSelect={() => {
                  moveItemEntity(item.id, entityIndex, 0);
                }}
              >
                <ArrowUpToLine className="size-4 mr-2" />
                To start
              </ContextMenuItem>
              <ContextMenuItem
                disabled={entityIndex === 0}
                onSelect={() => {
                  moveItemEntity(item.id, entityIndex, entityIndex - 1);
                }}
              >
                <ArrowUp className="size-4 mr-2" />
                Up
              </ContextMenuItem>
              <ContextMenuItem
                disabled={entityIndex === item.entities.length - 1}
                onSelect={() => {
                  moveItemEntity(item.id, entityIndex, entityIndex + 1);
                }}
              >
                <ArrowDown className="size-4 mr-2" />
                Down
              </ContextMenuItem>
              <ContextMenuItem
                disabled={entityIndex === item.entities.length - 1}
                onSelect={() => {
                  moveItemEntity(
                    item.id,
                    entityIndex,
                    item.entities.length - 1
                  );
                }}
              >
                <ArrowDownToLine className="size-4 mr-2" />
                To end
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}
        <ContextMenuSub>
          <ContextMenuSubTrigger>Send to marker</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            {items.map((otherItem, itemIndex) => (
              <ContextMenuItem
                key={otherItem.id}
                disabled={otherItem.id === item.id}
                onSelect={() => {
                  sendItemEntitiesToItem(
                    item.id,
                    selectedEntityIds,
                    otherItem.id
                  );
                }}
              >
                {getItemName(otherItem, itemIndex)}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
});
