import React, { Dispatch, SetStateAction } from "react";
import DraggableInput from "./DraggableInput";
import { FileType } from "../../types/types.ts";

function Uploader({
  files,
  setFiles,
}: {
  files: FileType[];
  setFiles: Dispatch<SetStateAction<FileType[]>>;
}) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files) return; // Properly handle the case where files is null

    const fileList = Array.from(files).map((file) => ({
      id: URL.createObjectURL(file),
      file,
    }));

    // Assuming 'setFiles' updates state, and 'files' is your state variable that tracks the file list
    setFiles((prevFiles: FileType[]) => [...prevFiles, ...fileList]);
  };

  function moveFile(direction: string, index: number) {
    setFiles((prevFiles: FileType[]) => {
      const newFiles = [...prevFiles];
      const positionChange = direction === "up" ? -1 : 1;
      const targetFile = newFiles.splice(index, 1)[0];
      newFiles.splice(index + positionChange, 0, targetFile);
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

  return (
    <>
      {files != null &&
        files.map(({ id, file }, index) => (
          <DraggableInput
            key={id}
            index={index}
            id={id}
            file={file}
            lastIndex={files.length - 1}
            moveFile={moveFile}
            removeFile={removeFile}
          />
        ))}
      <input type="file" multiple onChange={handleFileUpload} />
    </>
  );
}

export default Uploader;
