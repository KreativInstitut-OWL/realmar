import { saveAs } from "file-saver";
import JSZip from "jszip";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightFromLine, ScanIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import ItemFieldArray from "./components/ItemFieldArray";
import { Button } from "./components/ui/button";
import { Form } from "./components/ui/form";
import generateIndexHtml from "./lib/generateIndexHtml";
import compileImageTargets from "./lib/uploadAndCompile";
import { AppState, appStateSchema, Asset, getDefaultAppState } from "./schema";

function App() {
  const [exportProgress, setExportProgress] = useState<number>(0);

  const form = useForm<AppState>({
    resolver: zodResolver(appStateSchema),
    defaultValues: getDefaultAppState(),
  });

  function onExport(appState: AppState) {
    console.log(appState);
    // bundleFiles(markers, setExportProgress, renameFile, images);
  }

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onExport)} className="contents">
        {/* <Header /> */}

        <header className="z-50 flex gap-8 px-8 h-14 items-center sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="text-lg bg-black text-white pt-[.1em] px-[.5em]">
            Batch<span className="text-primary">AR</span>
          </div>
          <Button type="submit" className="ml-auto">
            Export
            <ArrowRightFromLine />
          </Button>
        </header>

        <main className="flex flex-col min-h-lvh gap-8 m-8">
          {/* <aside className="prose prose-gray">
          <h2>{contentText.title}</h2>
          <div
            id="description"
            dangerouslySetInnerHTML={{ __html: contentText.description }}
          />
          <div className="bundle-area">
            <button
              className="btn btn-primary"
              onClick={handleBundleFiles}
              disabled={hasErrors || progress > 0}
            >
              {uiText.cta}!
            </button>

            {progress > 0 && (
              <ProgressToast progress={progress} uiText={uiText} />
            )}

            {Object.keys(errors).map((error, i) => (
              <div key={i} className="info info-attention fade-in">
                <p>{errors[error]}</p>
              </div>
            ))}
          </div>
        </aside> */}
          <section className="">
            <ItemFieldArray />
          </section>

          <section className=""></section>
        </main>

        {/* <Footer /> */}
      </form>
    </Form>
  );
}

export default App;

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

async function bundleFiles(
  markers: Asset[],
  setProgress: (progress: number) => void,
  renameFile: (file: File, index: number) => string,
  images: Asset[]
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

const getAspectRatio = (file: Asset) => {
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
