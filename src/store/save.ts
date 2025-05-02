import saveAs from "file-saver";
import { get } from "idb-keyval";
import JSZip from "jszip";
import slugify from "slugify";
import { APP_STATE_STORAGE_NAME, appStateStore, useStore } from ".";
import * as FileStore from "./file-store";

const FILE_ID_NAME_DELIMITER = "___";

export async function save() {
  const projectName =
    useStore.getState().projectName ?? "Untitled Batchar Project";
  const projectNameSlug = slugify(projectName, { lower: true });

  const appStateString = await get<string>(
    APP_STATE_STORAGE_NAME,
    appStateStore
  );

  if (!appStateString) return;

  const zip = new JSZip();

  zip.file("BATCHAR", `batchar@2\n\n${projectNameSlug}`);

  zip.file("state.json", appStateString);

  // Add files
  for (const [id, file] of (await FileStore.getAll()).entries()) {
    zip.file(`files/${id}${FILE_ID_NAME_DELIMITER}${file.name}`, file);
  }

  const content = await zip.generateAsync(
    { type: "blob", comment: "batchar" },
    (meta) => {
      console.log(meta.percent.toFixed(2) + "%");
      console.log(meta);
    }
  );
  saveAs(content, `${projectNameSlug}.batchar`);
}

export function load(file: File) {
  const reader = new FileReader();

  reader.onload = async () => {
    const zip = await JSZip.loadAsync(reader.result as ArrayBuffer);

    const batchar = await zip.file("BATCHAR")?.async("text");

    if (!batchar?.startsWith("batchar@2")) {
      throw new Error("Invalid file format");
    }

    const state = await zip.file("state.json")?.async("text");

    if (!state) {
      throw new Error("Invalid file format");
    }

    FileStore.clear();

    const filesFolder = zip.folder("files");
    if (filesFolder) {
      const filePromises: Promise<void>[] = [];

      filesFolder.forEach((relativePath, file) => {
        // Skip directory entries
        if (relativePath.endsWith("/")) return;

        const fileName = relativePath;
        const promise = file.async("blob").then((fileBlob) => {
          const fileType = fileBlob.type;
          const fileId = relativePath.split(FILE_ID_NAME_DELIMITER)[0];
          FileStore.add(
            fileId,
            new File([fileBlob], fileName, { type: fileType })
          );
        });

        filePromises.push(promise);
      });

      await Promise.all(filePromises);
    }

    useStore.setState(JSON.parse(state).state);
  };

  reader.readAsArrayBuffer(file);
}

export function loadFromFile() {
  // ask for file
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".batchar";
  input.onchange = () => {
    const files = input.files;
    if (files && files.length > 0) {
      load(files[0]);
    }
  };
  input.click();
}
