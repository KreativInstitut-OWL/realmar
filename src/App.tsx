import { saveAs } from "file-saver";
import JSZip from "jszip";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import AppLayout from "./components/AppLayout";
import generateIndexHtml from "./lib/generateIndexHtml";
import compileImageTargets from "./lib/uploadAndCompile";
import { queryClient } from "./store/query-client";
import { AssetWithFile } from "./store";

function App() {
  const [exportProgress, setExportProgress] = useState<number>(0);

  // const { language } = useLanguage();
  // const uiText = language === "en" ? ui.en : ui.de;
  // const contentText = language === "en" ? content.en : content.de;

  // const renameFile = (file: File, index: number) => {
  //   const fileExtension = file.name.split(".").pop();
  //   return `target${index}.${fileExtension}`;
  // };

  // const errors: ErrorState = {};
  // if (markers.length <= 0 && images.length <= 0) {
  //   errors.noInput = uiText.errors.noInput;
  // }
  // if (markers.length !== images.length) {
  //   errors.missingPair = uiText.errors.missingPair;
  // }

  // const hasErrors = Object.keys(errors).length > 0;

  // function handleBundleFiles() {
  // if (markers.length === 0 || images.length === 0) {
  //   alert(uiText.errors.missingPair);
  //   return;
  // }

  // }

  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout />
    </QueryClientProvider>
  );
}

export default App;

async function calculateImageValues(
  markers: AssetWithFile[],
  images: AssetWithFile[]
) {
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

async function bundleFiles(
  markers: AssetWithFile[],
  setProgress: (progress: number) => void,
  renameFile: (file: File, index: number) => string,
  images: AssetWithFile[]
) {
  try {
    const zip = new JSZip();
    const aframe = await fetch("/js-includes/aframe.min.js");
    const aframeBlob = await aframe.blob();
    const mindar = await fetch("/js-includes/mindar-image-aframe.prod.js");
    const mindarBlob = await mindar.blob();
    zip.file("aframe.min.js", aframeBlob);
    zip.file("mindar-image-aframe.prod.js", mindarBlob);

    const license = await fetch("/LICENSE");
    const licenseText = await license.text();
    zip.file("LICENSE", licenseText);

    const targets = markers.map((marker) => marker.file);
    const { exportedBuffer } = await compileImageTargets(targets, setProgress);
    zip.file("targets.mind", exportedBuffer);
    markers.forEach((marker, index) => {
      const targetName = renameFile(marker.file, index);
      zip.file(targetName, marker.file);
    });
    images.forEach((image, index) => {
      const fileExtension = image.file.name.split(".").pop();
      const imageName = `asset${index}.${fileExtension}`;
      zip.file(imageName, image.file);
    });

    const imageSizeValues = await calculateImageValues(markers, images);
    if (!imageSizeValues) return;
    const meta = images.map((image) => {
      return image.meta ?? { rotation: 0, faceCam: false, spacing: 0 };
    });
    if (typeof meta === "undefined") return;
    const indexHtml = generateIndexHtml(
      images.map((image) => image.file),
      imageSizeValues,
      meta
    );
    zip.file("index.html", indexHtml);

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "ARbatch.zip");
    });
  } catch (error) {
    console.error("Error bundling files: ", error);
  }
  setTimeout(() => setProgress(0), 1000);
}

const getAspectRatio = (file: AssetWithFile) => {
  return new Promise((resolve, reject) => {
    if (file.file.type.includes("image")) {
      const img = new Image();
      img.src = file.id;
      img.onload = () => {
        resolve(img.width / img.height);
      };
      img.onerror = (err) => {
        reject(err);
      };
    }
    if (file.file.type.includes("video")) {
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
