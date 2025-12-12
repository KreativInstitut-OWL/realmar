import { cn } from "@/lib/utils";
import { Entity, isEntityWithAsset, useAsset } from "@/store";
import {
  Box,
  EyeOff,
  FileQuestion,
  Image,
  ImagePlay,
  LucideProps,
  Parentheses,
  SquarePlay,
  Text,
} from "lucide-react";
import { forwardRef } from "react";

const entityIcon = {
  image: Image,
  model: Box,
  video: SquarePlay,
  text: Text,
  null: Parentheses,
} as const satisfies Record<Entity["type"], React.ComponentType>;

export const EntityIcon = forwardRef<
  SVGSVGElement,
  { entity: Entity; showHiddenIcon?: boolean } & LucideProps
>(({ entity, className, showHiddenIcon = true, ...props }, ref) => {
  const type = entity.type;
  const Icon = entityIcon[type] || FileQuestion;
  const editorHidden = entity.editorHidden;
  const asset = useAsset(isEntityWithAsset(entity) ? entity.assetId : null);

  if (editorHidden && showHiddenIcon) {
    return (
      <EyeOff
        ref={ref}
        className={cn(
          "size-4 text-gray-11 aria-selected:text-azure-11 shrink-0",
          className
        )}
        {...props}
      />
    );
  }

  if (asset?.isAnimated) {
    return (
      <ImagePlay
        className={cn(
          "size-4 text-gray-11 aria-selected:text-azure-11 shrink-0",
          className
        )}
        {...props}
      />
    );
  }

  return (
    <Icon
      ref={ref}
      className={cn(
        "size-4 text-gray-11 aria-selected:text-azure-11 shrink-0",
        className
      )}
      {...props}
    />
  );
});

EntityIcon.displayName = "EntityIcon";
