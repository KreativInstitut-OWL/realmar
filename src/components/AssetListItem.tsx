import { byteFormatter, cn, dateFormatter } from "@/lib/utils";
import { Asset } from "@/store";
import { GripHorizontal } from "lucide-react";
import { forwardRef } from "react";
import { AssetContextMenu } from "./AssetContextMenu";
import { AssetIcon } from "./AssetIcon";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { DragHandle } from "./ui/sortable";

export const AssetListItem = forwardRef<
  HTMLButtonElement,
  {
    asset: Asset;
    assetIndex: number;
    isAssetSelected: boolean;
    selectedAssetIds: string[];
    isDragging: boolean;
  } & React.HTMLAttributes<HTMLButtonElement>
>(
  (
    {
      asset,
      assetIndex,
      className,
      onClick,
      isAssetSelected,
      selectedAssetIds,
      isDragging,
      ...rest
    },
    ref
  ) => {
    return (
      <AssetContextMenu
        asset={asset}
        assetIndex={assetIndex!}
        selectedAssetIds={selectedAssetIds}
        asChild
      >
        <button
          type="button"
          aria-selected={isAssetSelected ? "true" : undefined}
          className={cn(
            "group/asset flex w-full text-left gap-4 items-center h-14 px-4 transition-colors outline-hidden focus:inset-ring-2 focus:inset-ring-azure-8",
            // using where to make sure the even style has no special specificity
            "bg-gray-1 [&:where(:nth-child(even))]:bg-gray-2",
            "hover:bg-gray-4",
            "aria-selected:bg-azure-4 aria-selected:hover:bg-azure-5",
            className,
            { invisible: isDragging && isAssetSelected }
          )}
          ref={ref}
          onClick={onClick}
          {...rest}
        >
          <div className={cn("size-8 grid place-items-center shrink-0")}>
            <AssetIcon
              asset={asset}
              aria-selected={isAssetSelected ? "true" : undefined}
            />
          </div>
          <div className="grow min-w-0 truncate">
            {asset.name}
            {asset?.originalHeight && asset?.originalWidth ? (
              <>
                {" "}
                <Badge variant="primary">
                  {asset.originalWidth}×{asset.originalHeight}
                </Badge>
              </>
            ) : null}
          </div>

          <div className="w-24 truncate text-gray-11">{asset.type}</div>
          {asset ? (
            <div className="w-24 truncate text-gray-11">
              {byteFormatter.format(asset.size)}
            </div>
          ) : null}
          {asset ? (
            <div className="w-42 truncate text-gray-11 text-right">
              {dateFormatter.format(asset.updatedAt)}
            </div>
          ) : null}
          <DragHandle>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Drag asset"
              className="shrink-0"
              tabIndex={-1}
              asChild
              role="button"
            >
              <span>
                <GripHorizontal />
              </span>
            </Button>
          </DragHandle>
        </button>
      </AssetContextMenu>
    );
  }
);

export const AssetListItemDragOverlay = forwardRef<
  HTMLDivElement,
  {
    asset: Asset;
    assetSelectCount: number;
  } & React.HTMLAttributes<HTMLDivElement>
>(({ asset, className, assetSelectCount, ...rest }, ref) => {
  return (
    <div
      aria-selected="true"
      className={cn(
        "group/asset flex gap-4 items-center h-14 w-full bg-azure-5 px-4 cursor-grabbing",
        className
      )}
      ref={ref}
      {...rest}
    >
      <div className={cn("size-8 grid place-items-center shrink-0")}>
        <AssetIcon asset={asset} aria-selected="true" />
      </div>
      <div className="min-w-0 truncate">{asset.name}</div>
      {assetSelectCount > 1 ? <Badge>+{assetSelectCount - 1}</Badge> : null}
      <Button
        className="ml-auto shrink-0"
        variant="ghost"
        size="icon-sm"
        disabled
      >
        <GripHorizontal />
      </Button>
    </div>
  );
});
