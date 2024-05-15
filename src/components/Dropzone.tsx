import React, { useRef, useEffect, useState } from "react";
import { useLanguage } from "../LanguageProvider";
import ui from "../content/ui";
import {
  containsFiles,
  getFiles,
} from "@atlaskit/pragmatic-drag-and-drop/external/file";
import { dropTargetForExternal } from "@atlaskit/pragmatic-drag-and-drop/external/adapter";

function Dropzone({
  addFiles,
}: {
  addFiles: (files: FileList | File[]) => void;
}) {
  const { language } = useLanguage();
  const uiText = language === "en" ? ui.en : ui.de;

  const ref = useRef(null);
  const [isDraggedOver, setIsDraggedOver] = useState<boolean>(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files) return; // Properly handle the case where files is null
    addFiles(files);
  };

  const handleFileDrop = (files: File[]) => {
    addFiles(files);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return dropTargetForExternal({
      element: el,
      canDrop: containsFiles,
      onDragEnter: () => {
        setIsDraggedOver(true);
      },
      onDragLeave: () => {
        setIsDraggedOver(false);
      },
      onDrop: (source) => {
        const files = getFiles(source);
        const notValid: string[] = [];
        files.filter((file) => {
          const valid = file.type.includes("image");
          if (!valid) {
            console.error(`File ${file.name} is not an image`);
            notValid.push(file.name);
          }
          return valid;
        });

        handleFileDrop(files);
        setIsDraggedOver(false);
        notValid.length != 0 &&
          alert(uiText.errors.notValid + notValid.join(", "));
      },
    });
  }, []);

  return (
    <div
      className={`dropzone  ${isDraggedOver ? "has-file-over-it" : ""}`}
      ref={ref}
    >
      <p>{uiText.dropzone}</p>
      <label>
        {uiText.select}
        <input
          type="file"
          multiple
          accept="image/png, image/jpg, image/jpeg, image/webp"
          onChange={handleFileUpload}
        />
      </label>
    </div>
  );
}

export default Dropzone;
