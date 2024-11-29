import React, { useRef, useEffect, useState, useCallback, useId } from "react";
import { useLanguage } from "../LanguageProvider";
import ui from "../content/ui";
import {
  containsFiles,
  getFiles,
} from "@atlaskit/pragmatic-drag-and-drop/external/file";
import { dropTargetForExternal } from "@atlaskit/pragmatic-drag-and-drop/external/adapter";
import { acceptedUploadMedia } from "../content/supported-upload-media";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

function Dropzone({
  addFiles,
  isAssetSection,
}: {
  addFiles: (files: FileList | File[]) => void;
  isAssetSection: boolean;
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

  const handleFileDrop = useCallback(
    (files: File[]) => {
      addFiles(files);
    },
    [addFiles]
  );

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
        const validFiles = files.filter((file) => {
          const validAsset = acceptedUploadMedia.includes(file.type);
          const noValidMarker = !isAssetSection && !file.type.includes("image");
          const valid = validAsset && !noValidMarker;
          if (!valid) {
            notValid.push(file.name);
          }
          return valid;
        });

        handleFileDrop(validFiles);
        setIsDraggedOver(false);
        notValid.length != 0 &&
          alert(uiText.errors.notValid + notValid.join(", "));
      },
    });
  }, [isAssetSection, uiText.errors.notValid, handleFileDrop]);

  /*
  
  .dropzone {
    border: 4px dashed var(--primary);
    background-color: white;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    transition: background-color 0.3s;
    padding: 0.75rem 0.5rem 0.5rem;
    margin: 0.5rem 0.5rem;
    border-radius: 0.5rem;
    position: sticky;
    top: calc(var(--_sticky-top) * 3);
    min-height: 10rem;
    &.has-file-over-it {
      background-color: var(--kiogrey-dark);
    }
    p {
      text-align: center;
      padding: 0.5rem 1rem;
    }
    input[type="file"] {
      display: none;
    }
  }
  
  */

  const id = useId();

  return (
    <div
      className={cn(
        "border-4 border-dashed border-primary bg-white flex flex-col items-center justify-center gap-4 transition-colors p-3 m-2 rounded-lg min-h-[10rem]",
        { "bg-gray-100": isDraggedOver }
      )}
      ref={ref}
    >
      <p>{uiText.dropzone}</p>
      <Button asChild variant="secondary">
        <label htmlFor={id}>{uiText.select}</label>
      </Button>
      <input
        id={id}
        className="hidden"
        type="file"
        multiple
        accept={acceptedUploadMedia
          .map((item) => {
            return item;
          })
          .join(",")}
        onChange={handleFileUpload}
      />
    </div>
  );
}

export default Dropzone;
