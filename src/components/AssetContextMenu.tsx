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
import { Asset, DeleteReferenceError, useStore } from "@/store";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
} from "lucide-react";
import { forwardRef } from "react";
import { Badge } from "./ui/badge";
import { useLanguage } from "@/LanguageProvider";

export const AssetContextMenu = forwardRef<
  HTMLSpanElement,
  React.ComponentProps<typeof ContextMenuTrigger> & {
    assetIndex: number;
    asset: Asset;
    selectedIds: string[];
  }
>(({ asset, assetIndex, selectedIds, ...props }, ref) => {
  const deleteAssets = useStore((state) => state.deleteAssets);
  const moveAsset = useStore((state) => state.moveAsset);
  const setAsset = useStore((state) => state.setAsset);
  const assetsLength = useStore((state) => state.assets.length);
  const { t } = useLanguage();

  const isMultipleSelected = selectedIds.length > 1;

  return (
    <ContextMenu>
      <ContextMenuTrigger ref={ref} {...props} />
      <ContextMenuContent className="w-48">
        <ContextMenuLabel className="flex items-center gap-2">
          <div className="flex-1 truncate min-w-0">
            {asset?.name ?? t("unknownAsset")}{" "}
          </div>
          {isMultipleSelected ? <Badge>+{selectedIds.length - 1}</Badge> : null}
        </ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem
          onSelect={async () => {
            try {
              await deleteAssets(selectedIds, "restrict");
            } catch (error) {
              if (error instanceof DeleteReferenceError) {
                alert(error.message);
              }
            }
          }}
        >
          {isMultipleSelected
            ? t("deleteMultipleAssets", selectedIds.length)
            : t("delete")}
        </ContextMenuItem>
        {!isMultipleSelected && (
          <ContextMenuItem
            disabled={isMultipleSelected}
            onSelect={() => {
              const oldName = asset.name;
              const newName = prompt(t("enterNewName"), oldName);
              if (newName) {
                setAsset(asset.id, { name: newName });
              }
            }}
          >
            {t("rename")}
          </ContextMenuItem>
        )}
        {!isMultipleSelected && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>{t("move")}</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem
                disabled={assetIndex === 0}
                onSelect={() => {
                  moveAsset(assetIndex, 0);
                }}
              >
                <ArrowUpToLine />
                {t("toStart")}
              </ContextMenuItem>
              <ContextMenuItem
                disabled={assetIndex === 0}
                onSelect={() => {
                  moveAsset(assetIndex, assetIndex - 1);
                }}
              >
                <ArrowUp />
                {t("up")}
              </ContextMenuItem>
              <ContextMenuItem
                disabled={assetIndex === assetsLength - 1}
                onSelect={() => {
                  moveAsset(assetIndex, assetIndex + 1);
                }}
              >
                <ArrowDown />
                {t("down")}
              </ContextMenuItem>
              <ContextMenuItem
                disabled={assetIndex === assetsLength - 1}
                onSelect={() => {
                  moveAsset(assetIndex, assetsLength - 1);
                }}
              >
                <ArrowDownToLine />
                {t("toEnd")}
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
});
