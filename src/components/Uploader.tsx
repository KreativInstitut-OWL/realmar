import { Dispatch, SetStateAction, useRef, useState, useEffect } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import DraggableInput from "./DraggableInput";
import Dropzone from "./Dropzone";
import { FileType } from "../../types/types";

function Uploader({
  files,
  setFiles,
  sectionName,
}: {
  files: FileType[];
  setFiles: Dispatch<SetStateAction<FileType[]>>;
  sectionName: string;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragStatus, setDragStatus] = useState<boolean>(false);

  const addFiles = (files: FileList | File[]) => {
    if (!files) return;
    const fileList = Array.from(files).map((file) => ({
      id: URL.createObjectURL(file),
      file,
    }));

    setFiles((prevFiles: FileType[]) => [...prevFiles, ...fileList]);
  };

  function moveFile(startIndex: number | null, finishIndex: number) {
    if (
      startIndex === null ||
      startIndex < 0 ||
      startIndex >= files.length ||
      finishIndex < 0 ||
      finishIndex >= files.length ||
      startIndex === finishIndex
    ) {
      return;
    }

    setFiles((prevFiles: FileType[]) => {
      const newFiles = [...prevFiles];
      const targetFile = newFiles.splice(startIndex, 1)[0];
      newFiles.splice(finishIndex, 0, targetFile);
      return newFiles;
    });
  }

  function removeFile(index: number) {
    setFiles((prevFiles: FileType[]) => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      return newFiles;
    });
  }

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
      <h2>{sectionName}</h2>
      {files != null &&
        files.map(({ id, file }, index) => (
          <DraggableInput
            key={id}
            index={index}
            lastIndex={files.length - 1}
            id={id}
            file={file}
            dragIndex={dragIndex}
            setDragIndex={setDragIndex}
            dragStatus={dragStatus}
            setDragStatus={setDragStatus}
            moveFile={moveFile}
            removeFile={removeFile}
            sectionName={sectionName}
          />
        ))}
      <Dropzone addFiles={addFiles} />
    </div>
  );
}

export default Uploader;
