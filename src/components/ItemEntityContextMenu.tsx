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
import { createEntity, Entity, Item, useStore } from "@/store";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpDown,
  ArrowUpToLine,
  CopyPlus,
  Eye,
  EyeOff,
  Forward,
  Pencil,
  Trash2,
} from "lucide-react";
import { forwardRef } from "react";
import { Badge } from "./ui/badge";
import { generateCopyName } from "@/lib/utils";

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
  const setItemEntity = useStore((state) => state.setItemEntity);
  const addItemEntity = useStore((state) => state.addItemEntity);
  const sendItemEntitiesToItem = useStore(
    (state) => state.sendItemEntitiesToItem
  );
  const items = useStore((state) => state.items);

  const isMultipleSelected = selectedEntityIds.length > 1;

  return (
    <ContextMenu>
      <ContextMenuTrigger ref={ref} {...props} />
      <ContextMenuContent className="w-48">
        <ContextMenuLabel className="flex items-center gap-2">
          <div className="flex-1 truncate min-w-0">
            {entity?.name ?? "Unknown entity"}{" "}
          </div>
          {isMultipleSelected ? (
            <Badge>+{selectedEntityIds.length - 1}</Badge>
          ) : null}
        </ContextMenuLabel>
        <ContextMenuSeparator />
        {!isMultipleSelected ? (
          <ContextMenuItem
            onSelect={() => {
              useStore.getState().setItemEntity(item.id, entity.id, {
                editorHidden: !entity.editorHidden,
              });
            }}
          >
            {entity.editorHidden ? <Eye /> : <EyeOff />}
            {entity.editorHidden ? "Show in editor" : "Hide in editor"}
          </ContextMenuItem>
        ) : null}
        <ContextMenuItem
          onSelect={() => {
            removeItemEntities(item.id, selectedEntityIds);
          }}
        >
          <Trash2 />
          {isMultipleSelected
            ? `Remove ${selectedEntityIds.length} entities`
            : "Remove"}
        </ContextMenuItem>
        {!isMultipleSelected && (
          <ContextMenuItem
            disabled={isMultipleSelected}
            onSelect={() => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { id, name, ...rest } = entity;
              const duplicateEntity = createEntity({
                name: generateCopyName(name),
                ...rest,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any);
              addItemEntity(item.id, duplicateEntity, entityIndex);
            }}
          >
            <CopyPlus />
            Duplicate
          </ContextMenuItem>
        )}
        {!isMultipleSelected && (
          <ContextMenuItem
            disabled={isMultipleSelected}
            onSelect={() => {
              const oldName = entity.name;
              const newName = prompt("Enter a new name", oldName);
              if (newName) {
                setItemEntity(item.id, entity.id, { name: newName });
              }
            }}
          >
            <Pencil />
            Rename
          </ContextMenuItem>
        )}
        {!isMultipleSelected && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <ArrowUpDown />
              Move
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem
                disabled={entityIndex === 0}
                onSelect={() => {
                  moveItemEntity(item.id, entityIndex, 0);
                }}
              >
                <ArrowUpToLine />
                To start
              </ContextMenuItem>
              <ContextMenuItem
                disabled={entityIndex === 0}
                onSelect={() => {
                  moveItemEntity(item.id, entityIndex, entityIndex - 1);
                }}
              >
                <ArrowUp />
                Up
              </ContextMenuItem>
              <ContextMenuItem
                disabled={entityIndex === item.entities.length - 1}
                onSelect={() => {
                  moveItemEntity(item.id, entityIndex, entityIndex + 1);
                }}
              >
                <ArrowDown />
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
                <ArrowDownToLine />
                To end
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Forward />
            Send to marker
          </ContextMenuSubTrigger>
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
