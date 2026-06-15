import { createEntity, Item, useStore } from "@/store";
import { FileStack, Text } from "lucide-react";
import ItemAddAssetEntitiesDialog from "./ItemAddAssetEntitiesDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useLanguage } from "@/LanguageProvider";

export function ItemAddEntityDropdownMenu({
  children,
  item,
}: {
  children: React.ReactNode;
  item: Item;
}) {
  const { t } = useLanguage();
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
            {t("assets")}
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
          {t("text")}
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
