import { cn } from "@/lib/utils";
import { Entity } from "@/store";
import {
  Box,
  FileQuestion,
  Image,
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
  { entity: Entity } & LucideProps
>(({ entity, className, ...props }, ref) => {
  const type = entity.type;
  const Icon = entityIcon[type] || FileQuestion;
  return (
    <Icon
      ref={ref}
      className={cn(
        "size-4 text-gray-11 aria-selected:text-azure-11",
        className
      )}
      {...props}
    />
  );
});

EntityIcon.displayName = "EntityIcon";
