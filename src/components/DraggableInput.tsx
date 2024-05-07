import { useRef, useState, useEffect } from "react";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  extractClosestEdge,
  Edge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";

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
  const [edge, setEdge] = useState<Edge | null>(null);
  const [menu, setMenu] = useState<boolean>(false);
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
      getData: ({ input, element }) => {
        const data = {};
        return attachClosestEdge(data, {
          input,
          element,
          allowedEdges: ["top", "bottom"],
        });
      },
      onDrag: (args) => {
        const thisEdge = extractClosestEdge(args.self.data);
        setEdge(thisEdge);
      },
      onDragEnter: (args) => {
        setIsDraggedOver(true);
        const thisEdge = extractClosestEdge(args.self.data);
        setEdge(thisEdge);
      },
      onDragLeave: () => {
        setIsDraggedOver(false);
        setEdge(null);
      },
      onDrop: (args) => {
        setIsDraggedOver(false);
        const thisEdge = extractClosestEdge(args.self.data);
        const dropIndex = () => {
          if (index === lastIndex && thisEdge === "top") {
            return index - 1;
          }
          if (index === lastIndex && thisEdge === "bottom") {
            return index;
          }
          if (thisEdge === "top") {
            return index;
          }
          if (thisEdge === "bottom") {
            return index + 1;
          }
        };

        moveFile(dragIndex, dropIndex());
        console.log(dragIndex + " Dropped in " + index);
        setEdge(null);
      },
    });
  }, [dragIndex, index]);

  return (
    <div
      className={`draggable-input ${dragging ? "dragging" : ""} ${
        isDraggedOver ? "isDraggedOver" : ""
      } ${edge ? "edge-" + edge : ""}`}
      ref={ref}
    >
      {index}
      <button
        className={`draggable-input-toggle-options ${menu ? "active" : ""}`}
        onClick={() => setMenu(!menu)}
      >
        ...
      </button>
      <img src={id} alt={file.name} />
      {menu && (
        <div className="draggable-input-options">
          <button
            onClick={() => {
              moveFile(index, index - 1);
              setMenu(false);
            }}
            disabled={index === 0}
          >
            Up
          </button>
          <button
            onClick={() => {
              moveFile(index, index + 1);
              setMenu(false);
            }}
            disabled={index === lastIndex}
          >
            Down
          </button>
          <button onClick={() => removeFile(index)}>Remove</button>
        </div>
      )}
    </div>
  );
}

export default DraggableInput;
