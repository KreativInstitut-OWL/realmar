import { byteFormatter, cn, dateFormatter } from "@/lib/utils";
import { Asset, useEntityAsset, useItem } from "@/store";
import { FileAxis3d, FileIcon, FileVideo, GripHorizontal } from "lucide-react";
import { forwardRef, useMemo } from "react";
import { ItemEntityContextMenu } from "./ItemEntityContextMenu";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { DragHandle } from "./ui/sortable";

export const ItemEntity = forwardRef<
  HTMLDivElement,
  {
    itemId: string;
    entityId: string;
    isEntitySelected: boolean;
    selectedEntityIds: string[];
    isDragging: boolean;
    variant?: "default" | "compact";
  } & React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      itemId,
      entityId,
      className,
      onClick,
      isEntitySelected,
      selectedEntityIds,
      isDragging,
      variant = "default",
      ...rest
    },
    ref
  ) => {
    const item = useItem(itemId);

    const entityIndex = useMemo(() => {
      return item?.entities.findIndex((entity) => entity.id === entityId);
    }, [item?.entities, entityId]);

    const entity = useMemo(() => {
      return item?.entities.find((entity) => entity.id === entityId);
    }, [item?.entities, entityId]);

    const { data: entityAsset } = useEntityAsset(entity);

    if (!item || !entity || !entityAsset || entityIndex === -1) return null;

    return (
      <ItemEntityContextMenu
        item={item}
        entity={entity}
        entityIndex={entityIndex!}
        selectedEntityIds={selectedEntityIds}
        asChild
      >
        <div
          className={cn(
            "flex gap-4 items-center h-14 bg-gray-1 even:bg-gray-2 px-4 transition-colors",
            {
              "bg-azure-3 even:bg-azure-4": isEntitySelected,
              "h-7 text-sm gap-2": variant === "compact",
            },
            className,
            { invisible: isDragging && isEntitySelected }
          )}
          ref={ref}
          onClick={onClick}
          {...rest}
        >
          <div
            className={cn("size-8 grid place-items-center shrink-0", {
              "size-6": variant === "compact",
            })}
          >
            <AssetTypeIcon asset={entityAsset} />
          </div>
          <div className="grow min-w-0 truncate">
            {entityAsset.file.name}
            {variant !== "compact" &&
            entityAsset.originalHeight &&
            entityAsset.originalWidth ? (
              <>
                {" "}
                <Badge variant="primary">
                  {entityAsset.originalWidth}×{entityAsset.originalHeight}
                </Badge>
              </>
            ) : null}
          </div>
          {variant !== "compact" && (
            <>
              <div className="w-24 truncate text-gray-11">
                {getAssetTypeName(entityAsset)}
              </div>
              <div className="w-24 truncate text-gray-11">
                {byteFormatter.format(entityAsset.file.size)}
              </div>
              <div className="w-42 truncate text-gray-11 text-right">
                {dateFormatter.format(entityAsset.updatedAt)}
              </div>
            </>
          )}
          <DragHandle>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Drag entity"
              className="shrink-0"
            >
              <GripHorizontal />
            </Button>
          </DragHandle>
        </div>
      </ItemEntityContextMenu>
    );
  }
);

export const ItemEntityDragOverlay = forwardRef<
  HTMLDivElement,
  {
    itemId: string;
    entityId: string;
    entitySelectCount: number;
    variant?: "default" | "compact";
  } & React.HTMLAttributes<HTMLDivElement>
>(
  (
    { itemId, entityId, className, entitySelectCount, variant, ...rest },
    ref
  ) => {
    const item = useItem(itemId);

    const entity = useMemo(() => {
      return item?.entities.find((entity) => entity.id === entityId);
    }, [item?.entities, entityId]);

    const { data: entityAsset } = useEntityAsset(entity);

    if (!item || !entity || !entityAsset) return null;

    return (
      <div
        className={cn(
          "flex gap-4 items-center h-14 w-full bg-azure-3 px-4 cursor-grabbing",
          {
            "h-7 text-sm gap-2": variant === "compact",
          },
          className
        )}
        ref={ref}
        {...rest}
      >
        <div
          className={cn("size-8 grid place-items-center shrink-0", {
            "size-6": variant === "compact",
          })}
        >
          <AssetTypeIcon asset={entityAsset} />
        </div>
        <div className="min-w-0 truncate">{entityAsset.file.name}</div>
        {entitySelectCount > 1 ? <Badge>+{entitySelectCount - 1}</Badge> : null}
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
  }
);

function AssetTypeIcon({ asset }: { asset: Asset }) {
  if (asset.file.type.startsWith("image/")) {
    return (
      <img src={asset.src} alt="" className="size-full p-1 object-contain" />
    );
  }

  if (asset.file.type.startsWith("model/")) {
    return <FileAxis3d className="size-full p-1" />;
  }

  if (asset.file.type.startsWith("video/")) {
    return <FileVideo className="size-full p-1" />;
  }

  return <FileIcon className="size-full p-1" />;
}

function getAssetTypeName(asset: Asset) {
  if (asset.file.type.startsWith("image/")) {
    return "Image";
  }

  if (asset.file.type.startsWith("model/")) {
    return "3D Model";
  }

  if (asset.file.type.startsWith("video/")) {
    return "Video";
  }

  return "File";
}
