import { GeneratedTarget } from "@/components/GeneratedTarget";
import { BaseAppState, Entity, Item, useStore } from "@/store";
import * as FileStore from "@/store/file-store";
import saveAs from "file-saver";
import JSZip from "jszip";
import React from "react";
import { ArExperience } from "./ArExperience";
import {
  createSquareAssetFromSrc,
  reactRenderToString,
  renderSvgReactNodeToBase64Src,
} from "./render";
import compileImageTargets from "./uploadAndCompile";
import { getItemFolderName, padStart } from "./item";

export const getFileName = <T extends string>(
  type: T,
  file: File,
  index: number,
) => {
  const fileExtension = file.name.split(".").pop() as string;
  return `${type}-${padStart(index, 4)}.${fileExtension}` as const;
};

export type ExportAsset = {
  id: string;
  fileType: string;
  path: string;
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

export async function createExport(
  onProgress: (progress: ProgressUpdate) => void,
) {
  let compileProgress = 0;
  let bundleProgress = 0;

  const setCompileProgress = (progress: number) => {
    compileProgress = progress;
    onProgress({
      stage: "compile",
      compileProgress,
      bundleProgress,
      progress: (compileProgress + bundleProgress) / 2,
    });
  };

  const setBundleProgress = (progress: number, currentFile: string | null) => {
    bundleProgress = progress;
    onProgress({
      stage: "bundle",
      compileProgress,
      bundleProgress,
      progress: (compileProgress + bundleProgress) / 2,
      currentBundleFile: currentFile || undefined,
    });
  };

  setCompileProgress(0);

  try {
    const state = useStore.getState();
    const { items } = state;

    const zip = new JSZip();

    const targetAssets = await Promise.all(
      items.map(async (item) => {
        const targetAsset = await FileStore.get(item.targetAssetId);
        if (targetAsset) {
          return createSquareAssetFromSrc(targetAsset);
        }

        const src = renderSvgReactNodeToBase64Src(
          React.createElement(GeneratedTarget, { id: item.id }),
        );
        return createSquareAssetFromSrc({ src, id: `${item.id}.generated` });
      }),
    );

    const { exportedBuffer } = await compileImageTargets(
      targetAssets.map((asset) => asset.src),
      (progress) => {
        // ignore progress update that reset the progress to 0 when the compile is done
        if (compileProgress > 0 && progress === 0) return;
        setCompileProgress(progress);
      },
    );
    zip.file("targets.mind", exportedBuffer);

    setBundleProgress(0, null);

    const exportItems: ExportItem[] = [];

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const itemFolderName = getItemFolderName(item, index);

      const targetAsset = targetAssets[index];
      const targetAssetPath = `markers/${itemFolderName}/target.png`;
      zip.file(targetAssetPath, targetAsset.file);

      const exportItem: ExportItem = {
        ...item,
        index,
        folder: itemFolderName,
        targetAsset: {
          id: targetAsset.id,
          fileType: targetAsset.file.type,
          path: targetAssetPath,
        },
        entities: [],
      };

      for (
        let entityIndex = 0;
        entityIndex < item.entities.length;
        entityIndex++
      ) {
        const entity = item.entities[entityIndex];
        if (!entity.assetId) return;
        const asset = await FileStore.get(entity.assetId);
        if (!asset) return;
        const entityAssetPath = `/markers/${itemFolderName}/${getFileName(
          "entity",
          asset.file,
          entityIndex,
        )}`;

        zip.file(entityAssetPath, asset.file);

        exportItem.entities.push({
          ...entity,
          asset: {
            id: asset.id,
            fileType: asset.file.type,
            path: entityAssetPath,
          },
        });
      }

      exportItems.push(exportItem);
    }

    const exportState: ExportAppState = {
      ...state,
      items: exportItems,
    };

    zip.file(
      "index.html",
      `<!DOCTYPE html>${reactRenderToString(
        React.createElement(ArExperience, { state: exportState }),
      )}`,
    );

    zip.file(
      "aframe-master.min.js",
      await fetchAsBlob("/js/aframe-master.min.js"),
    );
    zip.file(
      "mindar-image-aframe.prod.js",
      await fetchAsBlob("/js/mindar-image-aframe.prod.js"),
    );

    const license = await fetch("/LICENSE");
    const licenseText = await license.text();
    zip.file("LICENSE", licenseText);

    const content = await zip.generateAsync({ type: "blob" }, (meta) => {
      setBundleProgress(bundleProgress, meta.currentFile);
    });

    setBundleProgress(100, null);

    saveAs(content, "ARbatch.zip");
  } catch (error) {
    console.error("Error bundling files: ", error);
  }
}
