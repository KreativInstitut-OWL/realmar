import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useRef, useState } from "react";
import { Item } from "../../types/types";
import DraggableInput from "./DraggableInput";
import Dropzone from "./Dropzone";

function Uploader({
  items,
  onAddItem,
  onMoveItem,
  onRemoveItem,
}: // sectionName,
// isAssetSection,
{
  items: Item[];
  onAddItem: (item: Item) => void;
  onMoveItem: (fromIndex: number | null, toIndex: number) => void;
  onRemoveItem: (index: number) => void;
  // sectionName: string;
  // isAssetSection: boolean;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragStatus, setDragStatus] = useState<boolean>(false);

  const updateFileMetadata = (
    id: string,
    metadata: { rotation: number; faceCam: boolean; spacing: number }
  ) => {
    // setFiles((prevFiles) => {
    //   return prevFiles.map((file) => {
    //     if (file.id === id) {
    //       return {
    //         ...file,
    //         meta: {
    //           ...file.meta,
    //           ...metadata,
    //         },
    //       };
    //     }
    //     return file;
    //   });
    // });
  };

  const ref = useRef(null);
  const [isDraggedOver, setIsDraggedOver] = useState<boolean>(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => {
        setIsDraggedOver(false);
      },
    });
  }, []);

  return (
    <div
      className={`markers upload-form ${isDraggedOver ? "isDraggedOver" : ""}`}
    >
      {/* <h2>{sectionName}</h2> */}
      {items.length > 0 &&
        items.map(({ id, asset, marker }, index) => (
          <DraggableInput
            key={id}
            index={index}
            lastIndex={items.length - 1}
            id={id}
            file={marker.file}
            dragIndex={dragIndex}
            setDragIndex={setDragIndex}
            dragStatus={dragStatus}
            setDragStatus={setDragStatus}
            moveFile={onMoveItem}
            updateFileMetadata={updateFileMetadata}
            removeFile={onRemoveItem}
            isAssetSection={false}
          />
        ))}
      <Dropzone
        addFiles={(files) => {
          console.log(files);
        }}
        isAssetSection={false}
      />
    </div>
  );
}

export default Uploader;
