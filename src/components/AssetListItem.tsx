import { byteFormatter, cn, dateFormatter } from "@/lib/utils";
import { Asset } from "@/store";
import { GripHorizontal } from "lucide-react";
import { forwardRef } from "react";
import { AssetContextMenu } from "./AssetContextMenu";
import { AssetIcon } from "./AssetIcon";
import { AssetPreviewHoverCard } from "./AssetPreviewHoverCard";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { DragHandle } from "./ui/sortable";

export const AssetListItem = forwardRef<
  HTMLButtonElement,
  {
    asset: Asset;
    assetIndex: number;
    isSelected: boolean;
    selectedIds: string[];
    isDragging?: boolean;
    isDraggable?: boolean;
  } & React.HTMLAttributes<HTMLButtonElement>
>(
  (
    {
      asset,
      assetIndex,
      className,
      onClick,
      isSelected,
      selectedIds,
      isDragging,
      isDraggable = true,
      ...rest
    },
    ref
  ) => {
    return (
      <AssetPreviewHoverCard asset={asset}>
        <AssetContextMenu
          asset={asset}
          assetIndex={assetIndex!}
          selectedIds={selectedIds}
          asChild
        >
          <button
            type="button"
            aria-selected={isSelected ? "true" : undefined}
            className={cn(
              "group/asset flex w-full text-left text-sm gap-4 items-center h-11 px-4 transition-colors outline-hidden focus:inset-ring-2 focus:inset-ring-azure-8",
              // using where to make sure the even style has no special specificity
              {
                "bg-gray-1": assetIndex % 2 === 0,
                "bg-gray-2": assetIndex % 2 === 1,
              },
              "hover:bg-gray-4",
              "aria-selected:bg-azure-4 aria-selected:hover:bg-azure-5",
              className,
              { invisible: isDragging && isSelected }
            )}
            ref={ref}
            onClick={onClick}
            {...rest}
          >
            <div className={cn("size-8 grid place-items-center shrink-0")}>
              <AssetIcon
                asset={asset}
                aria-selected={isSelected ? "true" : undefined}
              />
            </div>
            <div className="grow min-w-0 truncate">
              {asset.name}
              {asset?.originalHeight && asset?.originalWidth ? (
                <>
                  {" "}
                  <Badge size="sm" variant="primary">
                    {asset.originalWidth}×{asset.originalHeight}
                  </Badge>
                </>
              ) : null}
              {asset.isAnimated ? (
                <>
                  {" "}
                  <Badge size="sm" variant="secondary">
                    Animated
                  </Badge>
                </>
              ) : null}
            </div>

            <div className="truncate text-gray-11">{asset.type}</div>
            {asset ? (
              <div className="min-w-[6ch] truncate text-gray-11">
                {byteFormatter.format(asset.size)}
              </div>
            ) : null}
            {asset ? (
              <div className="min-w-[15ch] truncate text-gray-11 text-right">
                {dateFormatter.format(new Date(asset.updatedAt))}
              </div>
            ) : null}
            {isDraggable ? (
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
            ) : null}
          </button>
        </AssetContextMenu>
      </AssetPreviewHoverCard>
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
        "group/asset flex gap-4 items-center text-sm h-11 w-full bg-azure-5 px-4 cursor-grabbing",
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
