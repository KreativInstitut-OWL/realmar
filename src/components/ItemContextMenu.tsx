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
import { Item, useStore } from "@/store";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
} from "lucide-react";
import { forwardRef } from "react";

export const ItemContextMenu = forwardRef<
  HTMLSpanElement,
  React.ComponentProps<typeof ContextMenuTrigger> & {
    item: Item;
  }
>(({ item, ...props }, ref) => {
  const removeItem = useStore((state) => state.removeItem);
  const setItem = useStore((state) => state.setItem);
  const moveItem = useStore((state) => state.moveItem);
  const items = useStore((state) => state.items);

  const itemIndex = items.findIndex((i) => i.id === item.id);

  return (
    <ContextMenu>
      <ContextMenuTrigger ref={ref} {...props} />
      <ContextMenuContent className="w-48">
        <ContextMenuLabel>{getItemName(item, itemIndex)}</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem
          onSelect={() => {
            if (
              confirm(
                "Are you sure you want to delete this item and all its entities?"
              )
            ) {
              removeItem(item.id);
            }
          }}
        >
          Delete
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => {
            const oldName = item.name;
            const newName = prompt("Enter a new name", oldName || "");
            setItem(item.id, { name: newName || null });
          }}
        >
          Rename
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Move</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem
              disabled={itemIndex === 0}
              onSelect={() => {
                moveItem(itemIndex, 0);
              }}
            >
              <ArrowUpToLine className="size-4 mr-2" />
              To start
            </ContextMenuItem>
            <ContextMenuItem
              disabled={itemIndex === 0}
              onSelect={() => {
                moveItem(itemIndex, itemIndex - 1);
              }}
            >
              <ArrowUp className="size-4 mr-2" />
              Up
            </ContextMenuItem>
            <ContextMenuItem
              disabled={itemIndex === item.entities.length - 1}
              onSelect={() => {
                moveItem(itemIndex, itemIndex + 1);
              }}
            >
              <ArrowDown className="size-4 mr-2" />
              Down
            </ContextMenuItem>
            <ContextMenuItem
              disabled={itemIndex === item.entities.length - 1}
              onSelect={() => {
                moveItem(itemIndex, item.entities.length - 1);
              }}
            >
              <ArrowDownToLine className="size-4 mr-2" />
              To end
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
});
