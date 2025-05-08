import { createEntity, Item, useStore } from "@/store";
import { FileStack, Text } from "lucide-react";
import ItemAddAssetEntitiesDialog from "./ItemAddAssetEntitiesDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function ItemAddEntityDropdownMenu({
  children,
  item,
}: {
  children: React.ReactNode;
  item: Item;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
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
            useStore
              .getState()
              .addItemEntity(item.id, createEntity({ type: "text" }));
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
  );
}
