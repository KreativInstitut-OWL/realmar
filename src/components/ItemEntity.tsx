import {
  byteFormatter,
  cn,
  dateFormatter,
  uppercaseFirstLetter,
} from "@/lib/utils";
import { isEntityWithAsset, useAsset, useItem } from "@/store";
import { GripHorizontal } from "lucide-react";
import { forwardRef, useMemo } from "react";
import { EntityIcon } from "./EntityIcon";
import { ItemEntityContextMenu } from "./ItemEntityContextMenu";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { DragHandle } from "./ui/sortable";

export const ItemEntity = forwardRef<
  HTMLButtonElement,
  {
    itemId: string;
    entityId: string;
    isEntitySelected: boolean;
    selectedEntityIds: string[];
    isDragging: boolean;
    variant?: "default" | "compact";
  } & React.HTMLAttributes<HTMLButtonElement>
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

    const asset = useAsset(isEntityWithAsset(entity) ? entity.assetId : null);

    if (!item || !entity || entityIndex === -1) return null;

    return (
      <ItemEntityContextMenu
        item={item}
        entity={entity}
        entityIndex={entityIndex!}
        selectedEntityIds={selectedEntityIds}
        asChild
      >
        <button
          type="button"
          aria-selected={isEntitySelected ? "true" : undefined}
          className={cn(
            "group/entity flex w-full text-left gap-4 items-center h-14 px-4 transition-colors outline-hidden focus:inset-ring-2 focus:inset-ring-azure-8",
            // using where to make sure the even style has no special specificity
            "bg-gray-1 [&:where(:nth-child(even))]:bg-gray-2",
            "hover:bg-gray-4",
            "aria-selected:bg-azure-4 aria-selected:hover:bg-azure-5",
            {
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
            <EntityIcon
              entity={entity}
              aria-selected={isEntitySelected ? "true" : undefined}
            />
          </div>
          <div className="grow min-w-0 truncate">
            {entity.name}
            {variant !== "compact" &&
            asset?.originalHeight &&
            asset?.originalWidth ? (
              <>
                {" "}
                <Badge variant="primary">
                  {asset.originalWidth}×{asset.originalHeight}
                </Badge>
              </>
            ) : null}
          </div>
          {variant !== "compact" && (
            <>
              <div className="w-24 truncate text-gray-11">
                {uppercaseFirstLetter(entity.type)}
              </div>
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
            </>
          )}
          <DragHandle>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Drag entity"
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

    if (!item || !entity) return null;

    return (
      <div
        aria-selected="true"
        className={cn(
          "group/entity flex gap-4 items-center h-14 w-full bg-azure-5 px-4 cursor-grabbing",
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
          <EntityIcon entity={entity} aria-selected="true" />
        </div>
        <div className="min-w-0 truncate">{entity.name}</div>
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
