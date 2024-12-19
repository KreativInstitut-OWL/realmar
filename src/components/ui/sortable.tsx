import { cn } from "@/lib/utils";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

const SortableItemContext = React.createContext<Pick<
  ReturnType<typeof useSortable>,
  "listeners" | "attributes" | "setActivatorNodeRef"
> | null>(null);

function SortableItem({
  id,
  children,
  className,
  withDragHandle,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  withDragHandle?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <SortableItemContext.Provider
      value={
        withDragHandle ? { listeners, attributes, setActivatorNodeRef } : null
      }
    >
      <Slot
        ref={setNodeRef}
        style={style}
        className={cn("data-[is-dragging]:opacity-0", className)}
        data-is-dragging={isDragging ? "" : undefined}
        {...(withDragHandle ? {} : attributes)}
        {...(withDragHandle ? {} : listeners)}
      >
        {children}
      </Slot>
    </SortableItemContext.Provider>
  );
}

export function DragHandle(props: React.ComponentProps<typeof Slot>) {
  const context = React.useContext(SortableItemContext);

  return (
    <Slot
      {...props}
      ref={context?.setActivatorNodeRef}
      {...context?.listeners}
      {...context?.attributes}
      className="cursor-grab"
    />
  );
}

export function Sortable({
  items,
  onItemMove,
  withDragHandle,
  onDragStart,
  onDragEnd,
  ...props
}: {
  items: { id: string; node: React.ReactNode; dragOverlay?: React.ReactNode }[];
  onItemMove: (oldIndex: number, newIndex: number) => void;
  withDragHandle?: boolean;
} & React.ComponentProps<typeof DndContext>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);

  const handleDragStart = React.useCallback(
    (event: DragStartEvent) => {
      onDragStart?.(event);

      const { active } = event;
      if (active?.id) {
        setActiveId(active.id);
      }
    },
    [onDragStart]
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      onDragEnd?.(event);

      const { active, over } = event;

      if (over?.id && active.id !== over.id) {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        onItemMove(oldIndex, newIndex);
      }

      setActiveId(null);
    },
    [items, onDragEnd, onItemMove]
  );

  const activeItem = React.useMemo(
    () => items.find((item) => item.id === activeId),
    [items, activeId]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      {...props}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map(({ id, node }) => (
          <SortableItem key={id} id={id} withDragHandle={withDragHandle}>
            {node}
          </SortableItem>
        ))}
      </SortableContext>
      <DragOverlay modifiers={[restrictToFirstScrollableAncestor]}>
        {activeItem?.dragOverlay ?? activeItem?.node ?? null}
      </DragOverlay>
    </DndContext>
  );
}
