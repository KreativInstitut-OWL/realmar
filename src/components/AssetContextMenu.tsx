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
import { Asset, useStore } from "@/store";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
} from "lucide-react";
import { forwardRef } from "react";
import { Badge } from "./ui/badge";

export const AssetContextMenu = forwardRef<
  HTMLSpanElement,
  React.ComponentProps<typeof ContextMenuTrigger> & {
    assetIndex: number;
    asset: Asset;
    selectedIds: string[];
  }
>(({ asset, assetIndex, selectedIds, ...props }, ref) => {
  const removeAssets = useStore((state) => state.removeAssets);
  const moveAsset = useStore((state) => state.moveAsset);
  const setAsset = useStore((state) => state.setAsset);
  const assetsLength = useStore((state) => state.assets.length);

  const isMultipleSelected = selectedIds.length > 1;

  return (
    <ContextMenu>
      <ContextMenuTrigger ref={ref} {...props} />
      <ContextMenuContent className="w-48">
        <ContextMenuLabel className="flex items-center gap-2">
          <div className="flex-1 truncate min-w-0">
            {asset?.name ?? "Unknown asset"}{" "}
          </div>
          {isMultipleSelected ? <Badge>+{selectedIds.length - 1}</Badge> : null}
        </ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem
          onSelect={() => {
            removeAssets(selectedIds);
          }}
        >
          {isMultipleSelected
            ? `Delete ${selectedIds.length} assets`
            : "Delete"}
        </ContextMenuItem>
        {!isMultipleSelected && (
          <ContextMenuItem
            disabled={isMultipleSelected}
            onSelect={() => {
              const oldName = asset.name;
              const newName = prompt("Enter a new name", oldName);
              if (newName) {
                setAsset(asset.id, { name: newName });
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
                disabled={assetIndex === 0}
                onSelect={() => {
                  moveAsset(assetIndex, 0);
                }}
              >
                <ArrowUpToLine />
                To start
              </ContextMenuItem>
              <ContextMenuItem
                disabled={assetIndex === 0}
                onSelect={() => {
                  moveAsset(assetIndex, assetIndex - 1);
                }}
              >
                <ArrowUp />
                Up
              </ContextMenuItem>
              <ContextMenuItem
                disabled={assetIndex === assetsLength - 1}
                onSelect={() => {
                  moveAsset(assetIndex, assetIndex + 1);
                }}
              >
                <ArrowDown />
                Down
              </ContextMenuItem>
              <ContextMenuItem
                disabled={assetIndex === assetsLength - 1}
                onSelect={() => {
                  moveAsset(assetIndex, assetsLength - 1);
                }}
              >
                <ArrowDownToLine />
                To end
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
});
