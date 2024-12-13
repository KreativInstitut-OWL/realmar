import { GeneratedTarget } from "@/components/GeneratedTarget";
import { Asset, Item } from "@/store";
import saveAs from "file-saver";
import JSZip from "jszip";
import React from "react";
import { ArExperience } from "./ArExperience";
import {
  reactRenderToString,
  renderSvgReactNodeToBase64Src,
  renderSvgReactNodeToFile,
} from "./render";
import compileImageTargets from "./uploadAndCompile";

async function calculateImageValues(markers: Asset[], images: Asset[]) {
  if (markers.length !== images.length) return;
  const imageSizes = [];
  for (let i = 0; i < markers.length; i++) {
    const markerRatio = await getAspectRatio(markers[i]);
    const imageRatio = await getAspectRatio(images[i]);
    if (typeof markerRatio !== "number" || typeof imageRatio !== "number")
      return;

    if (markerRatio < 1) {
      // Tracker = Hochkant
      imageRatio == 1 // Image = Quadrat
        ? imageSizes.push({
            height: 1 + markerRatio,
            width: 1 + markerRatio,
          })
        : imageRatio > 1
        ? imageSizes.push({
            height: 1 / markerRatio,
            width: imageRatio / markerRatio,
          }) // Image = Quer
        : imageRatio <= markerRatio
        ? imageSizes.push({ height: 1 / imageRatio, width: 1 }) // Image = Hochkant
        : imageSizes.push({
            height: 1 / markerRatio,
            width: imageRatio * (1 / markerRatio),
          });
    }
    if (markerRatio > 1) {
      // Tracker = Breitformat Works
      imageRatio == 1
        ? imageSizes.push({ height: 1, width: 1 })
        : imageRatio < 1
        ? imageSizes.push({
            height: 1 / imageRatio,
            width: 1,
          })
        : imageRatio >= markerRatio
        ? imageSizes.push({
            height: 1 / markerRatio,
            width: imageRatio * (1 / markerRatio),
          })
        : imageSizes.push({
            height: 1 - (markerRatio - imageRatio),
            width: 1,
          });
    }
    if (markerRatio === 1) {
      //Tracker = Quadrat Works
      imageRatio == 1
        ? imageSizes.push({ height: 1, width: 1 })
        : imageRatio < 1
        ? imageSizes.push({ height: 1 + (1 - imageRatio), width: 1 })
        : imageSizes.push({ height: 1, width: imageRatio });
    }
  }
  return imageSizes;
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

async function bundleFiles(
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

    const targets = items.map(
      (item) =>
        item.marker?.src ??
        renderSvgReactNodeToBase64Src(
          React.createElement(GeneratedTarget, { id: item.id })
        )
    );
    const { exportedBuffer } = await compileImageTargets(targets, onProgress);
    zip.file("markers.mind", exportedBuffer);

    items.forEach((item, index) => {
      const file =
        item.marker?.file ??
        renderSvgReactNodeToFile(
          React.createElement(GeneratedTarget, { id: item.id })
        );
      zip.file(getFileName("marker", file, index), file);
    });

    items.forEach((item, index) => {
      item.entity.forEach((asset, assetIndex) => {
        if (!asset.file) return;
        zip.file(
          getFileName("asset", asset.file, index, assetIndex),
          asset.file
        );
      });
    });

    const imageSizeValues = await calculateImageValues(markers, images);
    if (!imageSizeValues) return;

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

const getAspectRatio = (file: Asset) => {
  return new Promise((resolve, reject) => {
    if (file.file?.type.includes("image")) {
      const img = new Image();
      img.src = file.id;
      img.onload = () => {
        resolve(img.width / img.height);
      };
      img.onerror = (err) => {
        reject(err);
      };
    }
    if (file.file?.type.includes("video")) {
      const vid = document.createElement("video");
      vid.src = file.id;
      vid.onloadedmetadata = () => {
        resolve(vid.videoWidth / vid.videoHeight);
      };
      vid.onerror = (err) => {
        reject(err);
      };
    }
  });
};
