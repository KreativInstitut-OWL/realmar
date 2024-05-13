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
        console.log("an external file over the dropzone");
        setIsDraggedOver(true);
      },
      onDragLeave: () => {
        setIsDraggedOver(false);
      },
      onDrop: (source) => {
        handleFileDrop(getFiles(source));
        setIsDraggedOver(false);
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
        <input type="file" multiple onChange={handleFileUpload} />
      </label>
    </div>
  );
}

export default Dropzone;
