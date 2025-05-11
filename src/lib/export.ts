import { GeneratedTarget } from "@/components/GeneratedTarget";
import {
  Asset,
  BaseAppState,
  Entity,
  EntityWithAsset,
  EntityWithoutAsset,
  isEntityText,
  isEntityWithAsset,
  Item,
  useStore,
} from "@/store";
import * as FileStore from "@/store/file-store";
import { getProjectSlugWithDateTime } from "@/store/save";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import saveAs from "file-saver";
import JSZip from "jszip";
import React from "react";
import { ArExperience } from "./ArExperience";
import { autoPadStart, getItemFolderName } from "./item";
import { prettifyHtml } from "./prettier";
import {
  createSquareImageFileFromSrc,
  reactRenderToString,
  renderSvgReactNodeToBase64Src,
} from "./render";
import compileImageTargets from "./uploadAndCompile";

export const getFileName = ({
  name,
  originalBasename,
  originalExtension,
  index,
  count,
}: {
  name?: string;
  originalBasename: string;
  originalExtension: string;
  index: number;
  count: number;
}) => {
  return `${autoPadStart(index + 1, count)}-${name ?? originalBasename}.${originalExtension}` as const;
};

export type ExportAsset = Asset & {
  file: File;
  path: string;
};

export type ExportEntity =
  | (EntityWithAsset & {
      asset: ExportAsset;
    })
  | EntityWithoutAsset;

export function assertIsExportEntityWithAsset(
  entity: Entity
): asserts entity is EntityWithAsset & { asset: ExportAsset } {
  if (!("assetId" in entity) || !entity.assetId) {
    throw new Error("Entity does not have an asset");
  }
}

export type ExportItem = Omit<Item, "entities"> & {
  index: number;
  folder: string;
  // targetAsset: ExportAsset;
  entities: ExportEntity[];
};

export type ExportAppState = Omit<BaseAppState, "items"> & {
  items: ExportItem[];
};

async function fetchAsBlob(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch "${response.url}": HTTP ${response.status} - ${response.statusText}`
    );
  }

  return await response.blob();
}

export type ProgressUpdate = {
  stage: "compile" | "bundle";
  compileProgress: number;
  bundleProgress: number;
  progress: number;
  currentBundleFile?: string;
};

export const defaultProgress: ProgressUpdate = {
  stage: "compile",
  compileProgress: 0,
  bundleProgress: 0,
  progress: 0,
};

// Add this new type at the top with the other type definitions
export type ExportArtifactMap = Map<string, Blob>;

// New function to generate all export artifacts
export async function compileArtifacts(
  state: BaseAppState,
  onCompileProgress: (progress: number) => void,
  isPreview = false
) {
  const artifacts: ExportArtifactMap = new Map();

  try {
    // Add static files
    // artifacts.set(
    //   "aframe-master.min.js",
    //   await fetchAsBlob("/js/aframe-master.min.js")
    // );
    // artifacts.set(
    //   "mindar-image-aframe.prod.js",
    //   await fetchAsBlob("/js/mindar-image-aframe.prod.js")
    // );
    artifacts.set("realmar.js", await fetchAsBlob("/js-includes/realmar.js"));
    artifacts.set("style.css", await fetchAsBlob("/js-includes/style.css"));
    artifacts.set("LICENSE", await fetchAsBlob("/LICENSE"));

    const { items, assets } = state;

    const targetFiles = await Promise.all(
      items.map(async (item) => {
        if (item.targetAssetId) {
          const targetAsset = assets.find(
            (asset) => asset.id === item.targetAssetId
          );
          const file = await FileStore.get(targetAsset?.fileId);

          if (!file || !targetAsset) {
            throw new Error(
              `Target asset (assetId: ${item.targetAssetId}, fileId: ${targetAsset?.fileId}) not found for item ${item.id}.`
            );
          }

          const src = URL.createObjectURL(file);

          const squareTargetFile = await createSquareImageFileFromSrc({
            src,
            id: targetAsset.id,
            size: Math.max(
              targetAsset.originalWidth ?? 0,
              targetAsset.originalHeight ?? 0,
              2048
            ),
          });

          URL.revokeObjectURL(src);

          return squareTargetFile;
        }

        // If the target asset is not set, create a generated target
        return createSquareImageFileFromSrc({
          src: renderSvgReactNodeToBase64Src(
            React.createElement(GeneratedTarget, { id: item.id })
          ),
          id: `${item.id}.generated`,
          size: 2048,
        });
      })
    );

    const targetFileSources = targetFiles.map((file) =>
      URL.createObjectURL(file)
    );
    const { exportedBuffer } = await compileImageTargets(
      targetFileSources,
      (progress) => {
        // ignore progress update that resets the progress to 0 when the compile is done
        if (progress === 0) return;
        onCompileProgress(progress);
      }
    );
    targetFileSources.forEach((src) => URL.revokeObjectURL(src));

    artifacts.set("targets.mind", new Blob([exportedBuffer]));

    const exportItems: ExportItem[] = [];

    const fonts = new Set<string>();

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const itemFolderName = getItemFolderName(item, index, items.length);

      // const targetAsset = targetFiles[index];
      // const targetAssetPath = `markers/${itemFolderName}/target.png`;
      // artifacts.set(targetAssetPath, targetAsset.file);

      const exportItem: ExportItem = {
        ...item,
        index,
        folder: itemFolderName,
        // targetAsset: {
        //   id: targetAsset.id,
        //   fileType: targetAsset.file.type,
        //   path: targetAssetPath,
        //   width: targetAsset.width,
        //   height: targetAsset.height,
        // },
        entities: [],
      };

      for (
        let entityIndex = 0;
        entityIndex < item.entities.length;
        entityIndex++
      ) {
        const entity = item.entities[entityIndex];

        if (isEntityText(entity)) {
          if (entity.font) {
            fonts.add(entity.font.path);
          }
        }

        if (!isEntityWithAsset(entity)) {
          exportItem.entities.push(entity);
          continue;
        }

        assertIsExportEntityWithAsset(entity);

        const asset = assets.find((asset) => asset.id === entity.assetId);
        if (!asset) {
          throw new Error(
            `Asset (id: ${entity.assetId}) not found for entity ${entity.id} in item ${item.id}.`
          );
        }
        const file = await FileStore.get(asset.fileId);
        if (!file) {
          throw new Error(
            `File (id: ${asset.fileId}) not found for asset ${asset.id} in entity ${entity.id} of item ${item.id}.`
          );
        }

        const path = `markers/${itemFolderName}/${getFileName({
          name: asset.name,
          originalBasename: asset.originalBasename,
          originalExtension: asset.originalExtension,
          index: entityIndex,
          count: item.entities.length,
        })}` as const;

        artifacts.set(path, file);

        exportItem.entities.push({
          ...entity,
          asset: {
            ...asset,
            file,
            path,
          },
        });
      }

      exportItems.push(exportItem);
    }

    // download fonts
    for (const fontPath of fonts) {
      const fontFile = await fetchAsBlob(fontPath);
      artifacts.set(fontPath, fontFile);
    }

    const exportState: ExportAppState = {
      ...state,
      items: exportItems,
    };

    let html = `<!DOCTYPE html>${reactRenderToString(
      React.createElement(ArExperience, {
        state: exportState,
      })
    )}`;

    if (isPreview) {
      for (const [key, value] of artifacts.entries()) {
        // TODO: add cleanup for the URL.createObjectURL
        const url = URL.createObjectURL(value);
        html = html.replaceAll(key, url);
      }
    }

    console.log("HTML: ", await prettifyHtml(html));

    artifacts.set(
      "index.html",
      new Blob([await prettifyHtml(html)], { type: "text/html" })
    );

    return { artifacts, srcDoc: html } as const;
  } catch (error) {
    console.error("Error generating export artifacts: ", error);
    throw error;
  }
}

export const useCompiledPreviewArtifacts = () => {
  const [progress, setProgress] = React.useState(0);

  const appState = useStore();

  const result = useQuery({
    queryKey: ["compiled-preview-artifacts", appState],
    queryFn: async () => {
      setProgress(0);
      const artifacts = await compileArtifacts(
        appState,
        (progress) => {
          setProgress(progress);
        },
        true
      );
      return artifacts;
    },
    networkMode: "always",
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const queryClient = useQueryClient();

  const invalidate = React.useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["compiled-preview-artifacts", appState],
    });
  }, [queryClient, appState]);

  return {
    ...result,
    progress,
    invalidate,
  };
};

// Function to zip and save artifacts
export async function bundleArtifacts(
  artifacts: ExportArtifactMap,
  onBundleProgress: (progress: number, currentFile: string | null) => void
) {
  try {
    const zip = new JSZip();

    // Add all artifacts to the zip
    for (const [path, blob] of artifacts.entries()) {
      zip.file(path, blob);
    }
    // Generate and save the zip
    const content = await zip.generateAsync({ type: "blob" }, (meta) => {
      onBundleProgress(meta.percent / 100, meta.currentFile);
    });

    onBundleProgress(1, null);

    return content;
  } catch (error) {
    console.error("Error creating zip file: ", error);
    throw error;
  }
}

// Updated createExport function that uses the two new functions
export async function createExport(
  onProgress: (progress: ProgressUpdate) => void
) {
  let compileProgress = 0;
  let bundleProgress = 0;

  // Shared progress handler for both compile and bundle stages
  const handleProgress = (
    stage: "compile" | "bundle",
    progress: number,
    currentFile?: string | null
  ) => {
    if (stage === "compile") {
      compileProgress = progress;
    } else {
      bundleProgress = progress;
    }

    onProgress({
      stage,
      compileProgress,
      bundleProgress,
      progress: (compileProgress + bundleProgress) / 2,
      ...(currentFile != null && {
        currentBundleFile: currentFile,
      }),
    });
  };

  try {
    const appState = useStore.getState();

    // Step 1: Generate artifacts
    const { artifacts } = await compileArtifacts(appState, (progress) =>
      handleProgress("compile", progress)
    );

    // Step 2: Zip artifacts
    const bundle = await bundleArtifacts(artifacts, (progress, currentFile) =>
      handleProgress("bundle", progress, currentFile)
    );

    const projectSlugWithDateTime = getProjectSlugWithDateTime();

    // Step 3: Save the zip
    saveAs(bundle, `${projectSlugWithDateTime}.realmar-export.zip`);

    return `${projectSlugWithDateTime}.realmar-export.zip`;
  } catch (error) {
    console.error("Error bundling files: ", error);
  }
}
