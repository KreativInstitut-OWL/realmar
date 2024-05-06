import { useRef, useState, useEffect } from "react";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

function DraggableInput({
  id,
  index,
  lastIndex,
  file,
  dragIndex,
  setDragIndex,
  removeFile,
  moveFile,
}: {
  id: string;
  index: number;
  lastIndex: number;
  file: File;
  dragIndex: number | null;
  setDragIndex: Function;
  dragStatus: boolean;
  setDragStatus: Function;
  removeFile: Function;
  moveFile: Function;
}) {
  const ref = useRef(null);
  const [dragging, setDragging] = useState<boolean>(false);
  const [isDraggedOver, setIsDraggedOver] = useState<boolean>(false);
  console.log(dragIndex);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return draggable({
      element: el,
      onDragStart: () => {
        setDragging(true);
        setDragIndex(index);
      },
      onDrop: () => {
        setDragging(false);
        setDragIndex(null);
        console.log("Dropped " + index);
      },
    });
  }, [dragIndex, index]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      onDragEnter: () => {
        setIsDraggedOver(true);
        console.log(dragIndex + " Dragged over " + index);
      },
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => {
        setIsDraggedOver(false);
        moveFile(dragIndex, index);
        console.log(dragIndex + " Dropped in " + index);
      },
    });
  }, [dragIndex, index]);

  return (
    <div
      className={`draggable-input ${dragging ? "dragging" : ""} ${
        isDraggedOver ? "isDraggedOver" : ""
      }`}
      ref={ref}
    >
      {index}
      <img src={id} alt={file.name} />
      <button onClick={() => moveFile(index, index - 1)} disabled={index === 0}>
        Up
      </button>
      <button
        onClick={() => moveFile(index, index + 1)}
        disabled={index === lastIndex}
      >
        Down
      </button>
      <button onClick={() => removeFile(index)}>Remove</button>
    </div>
  );
}

export default DraggableInput;
