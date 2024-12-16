import { GeneratedTarget } from "@/components/GeneratedTarget";
import { Asset, createAsset, Item } from "@/store";
import * as FileStore from "@/store/file-store";
import saveAs from "file-saver";
import JSZip from "jszip";
import { nanoid } from "nanoid";
import React from "react";
import {
  createFileFromCanvas,
  createSquareCanvasFromSrc,
  reactRenderToString,
  renderSvgReactNodeToBase64Src,
} from "./render";
import compileImageTargets from "./uploadAndCompile";
import { ArExperience } from "./ArExperience";

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export const getFileName = <T extends string>(
  type: T,
  file: File,
  ...indices: number[]
) => {
  const fileExtension = file.name.split(".").pop() as string;
  return `${type}_${indices.join("-")}.${fileExtension}` as const;
};

async function fetchAsBlob(url: string) {
  const response = await fetch(url);
  return await response.blob();
}

export async function bundleFiles(
  items: Item[],
  onProgress: (progress: number) => void
) {
  try {
    const zip = new JSZip();

    zip.file(
      "aframe-master.min.js",
      await fetchAsBlob("/js/aframe-master.min.js")
    );
    zip.file(
      "mindar-image-aframe.prod.js",
      await fetchAsBlob("/js/mindar-image-aframe.prod.js")
    );

    const license = await fetch("/LICENSE");
    const licenseText = await license.text();
    zip.file("LICENSE", licenseText);

    const targetAssetPromises = items.map(async (item) => {
      if (item.targetAssetId) {
        const targetAsset = await FileStore.get(item.targetAssetId);
        if (!targetAsset) return;
        const src = targetAsset.src;
        const canvas = await createSquareCanvasFromSrc({
          src: src,
          size: 1024,
        });
        const file = await createFileFromCanvas(canvas, targetAsset.id);
        return createAsset({ file, id: targetAsset.id });
      } else {
        const src = renderSvgReactNodeToBase64Src(
          React.createElement(GeneratedTarget, { id: item.id })
        );
        const canvas = await createSquareCanvasFromSrc({
          src: src,
          size: 1024,
        });
        const newId = nanoid(5);
        const file = await createFileFromCanvas(canvas, newId);
        return createAsset({ file, id: newId });
      }
    });

    const targetAssets = (await Promise.all(targetAssetPromises)) as Asset[];
    targetAssets.forEach((target): asserts target is Asset => {
      if (!target) throw new Error("No target asset found");
    });

    const { exportedBuffer } = await compileImageTargets(
      targetAssets.map((asset) => asset.src),
      onProgress
    );
    zip.file("targets.mind", exportedBuffer);

    targetAssets.forEach((targetAsset, index) => {
      const item = items[index];
      const itemName = item.editorName ?? `Marker ${index + 1}`;
      const itemFolderName = slugify(itemName);
      zip.file(`markers/${itemFolderName}/target.png`, targetAsset.file);
    });

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const itemName = item.editorName ?? `Marker ${index + 1}`;
      const itemFolderName = slugify(itemName);

      for (
        let entityIndex = 0;
        entityIndex < item.entities.length;
        entityIndex++
      ) {
        const entity = item.entities[entityIndex];
        if (!entity.assetId) return;
        const asset = await FileStore.get(entity.assetId);
        if (!asset) return;
        zip.file(
          `/markers/${itemFolderName}/${getFileName(
            "entity",
            asset.file,
            entityIndex
          )}`,
          asset.file
        );
      }
    }

    zip.file(
      "index.html",
      `<!DOCTYPE html>${reactRenderToString(
        React.createElement(ArExperience, { items })
      )}`
    );

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "ARbatch.zip");
  } catch (error) {
    console.error("Error bundling files: ", error);
  }
}
