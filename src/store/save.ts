import saveAs from "file-saver";
import { get } from "idb-keyval";
import JSZip from "jszip";
import slugify from "slugify";
import {
  APP_STATE_STORAGE_NAME,
  appStateStore,
  BaseAppState,
  useStore,
} from ".";
import * as FileStore from "./file-store";
import { toast } from "sonner";
import { inferMimeFromFilename } from "@/lib/utils";

const FILE_ID_NAME_DELIMITER = "___";

export function getProjectSlugWithDateTime() {
  const projectName = useStore.getState().projectName ?? "Untitled Project";
  const projectNameSlug = slugify(projectName, { lower: true });
  const saveDateTime = slugify(
    // Canadian English uses YYYY-MM-DD format
    new Date().toLocaleString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
    {
      lower: true,
      strict: true,
    }
  );
  return `${projectNameSlug}-${saveDateTime}`;
}

export async function save(onProgress?: (progress: number) => void) {
  const projectSlugWithDateTime = getProjectSlugWithDateTime();
  const saveFileName = `${projectSlugWithDateTime}.realmar`;

  const appStateString = await get<string>(
    APP_STATE_STORAGE_NAME,
    appStateStore
  );

  if (!appStateString) return;

  const zip = new JSZip();

  zip.file("REALMAR", `realmar@2\n\n${projectSlugWithDateTime}`);

  zip.file("state.json", appStateString);

  // Add files
  for (const [id, file] of (await FileStore.getAll()).entries()) {
    zip.file(`files/${id}${FILE_ID_NAME_DELIMITER}${file.name}`, file);
  }

  const content = await zip.generateAsync(
    { type: "blob", comment: "realmar" },
    (meta) => {
      if (onProgress) {
        const progress = meta.percent / 100;
        onProgress(progress);
      }
    }
  );
  saveAs(content, saveFileName);

  return saveFileName;
}

export function loadFromFile() {
  // ask for file
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".realmar";
  input.onchange = () => {
    const files = input.files;
    if (files && files.length > 0) {
      load(files[0]);
    }
  };
  input.click();
}

export function mergeFromFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".realmar";
  input.onchange = () => {
    const files = input.files;
    if (files && files.length > 0) {
      mergeIntoCurrentProject(files[0]);
    }
  };
  input.click();
}

// Extract the common file parsing logic
interface ParsedRealmArFile {
  projectName: string;
  state: BaseAppState;
  files: Map<string, File>;
}

async function parseRealmArFile(file: File): Promise<ParsedRealmArFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const zip = await JSZip.loadAsync(reader.result as ArrayBuffer);

        // Validate file format
        const realmar = await zip.file("REALMAR")?.async("text");
        if (!realmar?.startsWith("realmar@2")) {
          throw new Error("Invalid file format");
        }

        const stateJson = await zip.file("state.json")?.async("text");
        if (!stateJson) {
          throw new Error("Invalid file format");
        }

        // Parse state
        const parsedState = JSON.parse(stateJson).state as BaseAppState;

        // Parse files
        const parsedFiles = new Map<string, File>();
        const filesFolder = zip.folder("files");

        if (filesFolder) {
          const filePromises: Promise<void>[] = [];

          filesFolder.forEach((relativePath, zipFile) => {
            // Skip directory entries
            if (relativePath.endsWith("/")) return;

            const promise = zipFile.async("blob").then((fileBlob) => {
              const fileId = relativePath.split(FILE_ID_NAME_DELIMITER)[0];
              const fileName = relativePath.split(FILE_ID_NAME_DELIMITER)[1];

              console.log(
                `Parsed file: ${fileId} - ${fileName} (${fileBlob.size} bytes)`
              );

              // Create File object directly
              const type = fileBlob.type || inferMimeFromFilename(fileName);
              parsedFiles.set(fileId, new File([fileBlob], fileName, { type }));
            });

            filePromises.push(promise);
          });

          await Promise.all(filePromises);
        }

        resolve({
          projectName: file.name,
          state: parsedState,
          files: parsedFiles,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Error reading file"));
    reader.readAsArrayBuffer(file);
  });
}

// Update load function to use the parser
export async function load(file: File) {
  try {
    const { projectName, state, files } = await parseRealmArFile(file);

    // Clear existing files
    await FileStore.clear();

    // Add all parsed files
    const filePromises: Promise<void>[] = [];

    files.forEach((fileObject, id) => {
      filePromises.push(FileStore.add(id, fileObject));
    });

    await Promise.all(filePromises);

    // Replace state
    useStore.setState(state);

    toast.success(`Project ${projectName} loaded successfully`);
  } catch (error) {
    toast.error(
      `Error loading project: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// Update merge function to use the parser
export async function mergeIntoCurrentProject(file: File) {
  try {
    const { projectName, state, files } = await parseRealmArFile(file);

    // Get current state
    const currentState = useStore.getState();

    // Merge items (only add items that don't already exist)
    const currentItemIds = new Set(
      currentState.items?.map((item) => item.id) || []
    );
    const newItems =
      state.items?.filter((item) => !currentItemIds.has(item.id)) || [];

    // Merge assets (only add assets that don't already exist)
    const currentAssetIds = new Set(
      currentState.assets?.map((asset) => asset.id) || []
    );
    const newAssets =
      state.assets?.filter((asset) => !currentAssetIds.has(asset.id)) || [];

    // Update state with merged arrays
    useStore.setState({
      ...currentState,
      items: [...(currentState.items || []), ...newItems],
      assets: [...(currentState.assets || []), ...newAssets],
    });

    // Add only files that don't already exist
    const currentFileIds = new Set(await FileStore.getAllIds());
    const filePromises: Promise<void>[] = [];

    files.forEach((fileObject, id) => {
      if (!currentFileIds.has(id)) {
        filePromises.push(FileStore.add(id, fileObject));
      }
    });

    await Promise.all(filePromises);

    toast.success(`Project ${projectName} merged successfully`);
  } catch (error) {
    toast.error(
      `Error merging project: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
