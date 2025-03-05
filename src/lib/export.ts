import { GeneratedTarget } from "@/components/GeneratedTarget";
import { BaseAppState, Entity, Item, useStore } from "@/store";
import * as FileStore from "@/store/file-store";
import saveAs from "file-saver";
import JSZip from "jszip";
import React from "react";
import { ArExperience } from "./ArExperience";
import { getItemFolderName, padStart } from "./item";
import {
  createSquareAssetFromSrc,
  reactRenderToString,
  renderSvgReactNodeToBase64Src,
} from "./render";
import { prettifyHtml } from "./prettier";
import compileImageTargets from "./uploadAndCompile";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const getFileName = <T extends string>(
  type: T,
  file: File,
  index: number
) => {
  const fileExtension = file.name.split(".").pop() as string;
  return `${type}-${padStart(index, 4)}.${fileExtension}` as const;
};

export type ExportAsset = {
  id: string;
  fileType: string;
  path: string;
  width: number | null;
  height: number | null;
};

export type ExportEntity = Entity & {
  asset: ExportAsset;
};

export type ExportItem = Omit<Item, "entities"> & {
  index: number;
  folder: string;
  targetAsset: ExportAsset;
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
    artifacts.set("batchar.js", await fetchAsBlob("/js-includes/batchar.js"));
    artifacts.set("style.css", await fetchAsBlob("/js-includes/style.css"));
    artifacts.set("LICENSE", await fetchAsBlob("/LICENSE"));

    const { items } = state;

    const targetAssets = await Promise.all(
      items.map(async (item) => {
        const targetAsset = await FileStore.get(item.targetAssetId);
        if (targetAsset) {
          return createSquareAssetFromSrc({
            src: targetAsset.src,
            id: targetAsset.id,
            size: Math.max(
              targetAsset.originalWidth ?? 0,
              targetAsset.originalHeight ?? 0,
              2048
            ),
          });
        }

        const src = renderSvgReactNodeToBase64Src(
          React.createElement(GeneratedTarget, { id: item.id })
        );

        return createSquareAssetFromSrc({
          src,
          id: `${item.id}.generated`,
          size: 2048,
        });
      })
    );

    const { exportedBuffer } = await compileImageTargets(
      targetAssets.map((asset) => asset.src),
      (progress) => {
        // ignore progress update that resets the progress to 0 when the compile is done
        if (progress === 0) return;
        onCompileProgress(progress);
      }
    );
    artifacts.set("targets.mind", new Blob([exportedBuffer]));

    const exportItems: ExportItem[] = [];

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const itemFolderName = getItemFolderName(item, index);

      const targetAsset = targetAssets[index];
      const targetAssetPath = `markers/${itemFolderName}/target.png`;
      artifacts.set(targetAssetPath, targetAsset.file);

      const exportItem: ExportItem = {
        ...item,
        index,
        folder: itemFolderName,
        targetAsset: {
          id: targetAsset.id,
          fileType: targetAsset.file.type,
          path: targetAssetPath,
          width: targetAsset.width,
          height: targetAsset.height,
        },
        entities: [],
      };

      for (
        let entityIndex = 0;
        entityIndex < item.entities.length;
        entityIndex++
      ) {
        const entity = item.entities[entityIndex];
        if (!entity.assetId) continue; // Fixed: return -> continue
        const asset = await FileStore.get(entity.assetId);
        if (!asset) continue; // Fixed: return -> continue
        const entityAssetPath = `markers/${itemFolderName}/${getFileName(
          "entity",
          asset.file,
          entityIndex
        )}`;

        artifacts.set(entityAssetPath, asset.file);

        exportItem.entities.push({
          ...entity,
          asset: {
            id: asset.id,
            fileType: asset.file.type,
            path: entityAssetPath,
            width: asset.width,
            height: asset.height,
          },
        });
      }

      exportItems.push(exportItem);
    }

    const exportState: ExportAppState = {
      ...state,
      items: exportItems,
    };

    const urlMap = new Map<string, string>();
    for (const [key, value] of artifacts.entries()) {
      urlMap.set(key, URL.createObjectURL(value));
    }

    let html = `<!DOCTYPE html>${reactRenderToString(
      React.createElement(ArExperience, {
        state: exportState,
      })
    )}`;

    if (isPreview) {
      for (const [key, url] of urlMap.entries()) {
        html = html.replaceAll(key, url);
      }
    }

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

    // Step 3: Save the zip
    saveAs(bundle, "batchar-export.zip");
  } catch (error) {
    console.error("Error bundling files: ", error);
  }
}
