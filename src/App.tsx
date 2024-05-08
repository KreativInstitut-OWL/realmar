import { useState, useEffect } from "react";
import { useLanguage } from "./LanguageProvider";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Header from "./components/Header";
import Uploader from "./components/Uploader";
import { FileType } from "../types/types";
import generateIndexHtml from "./lib/generateIndexHtml";
import compileImageTargets from "./lib/uploadAndCompile";
import ui from "./content/ui";
import content from "./content/content";

function App() {
  const [markers, setMarkers] = useState<FileType[]>([]);
  const [images, setImages] = useState<FileType[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [noBundle, setNoBundle] = useState<boolean>(false);
  const [errors, setErrors] = useState<String[]>([]);

  const { language } = useLanguage();
  const uiText = language === "en" ? ui.en : ui.de;
  const contentText = language === "en" ? content.en : content.de;

  const renameFile = (file: File, index: number) => {
    const fileExtension = file.name.split(".").pop();
    return `target${index}.${fileExtension}`;
  };

  useEffect(() => {
    const description = document.querySelector("#description");
    if (description) {
      description.innerHTML = contentText.description;
    }
  }, [language]);

  useEffect(() => {
    if (markers.length > 0 && images.length > 0) {
      setNoBundle(false);
      setErrors((prevErrors) =>
        prevErrors.filter((error) => error !== uiText.errors.notEnough),
      );
    } else {
      setNoBundle(true);
      setErrors((prevErrors) => [...prevErrors, uiText.errors.notEnough]);
    }
    if (markers.length !== images.length) {
      setNoBundle(true);
      setErrors((prevErrors) => [...prevErrors, uiText.errors.notEqual]);
    } else {
      setNoBundle(false);
      setErrors((prevErrors) =>
        prevErrors.filter((error) => error !== uiText.errors.notEqual),
      );
    }
  }, [markers, images]);

  const bundleFiles = async () => {
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
      const { dataList, exportedBuffer } = await compileImageTargets(
        targets,
        setProgress,
      );
      console.log("dataList", dataList);
      zip.file("targets.mind", exportedBuffer);

      markers.forEach((marker, index) => {
        const targetName = renameFile(marker.file, index);
        zip.file(targetName, marker.file);
      });
      images.forEach((image, index) => {
        const fileExtension = image.file.name.split(".").pop();
        const imageName = `image${index}.${fileExtension}`;
        zip.file(imageName, image.file);
      });
      const indexHtml = generateIndexHtml(images.map((image) => image.file));
      zip.file("index.html", indexHtml);

      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, "ARbundle.zip");
      });
    } catch (error) {
      console.error("Error bundling files: ", error);
    }
    setTimeout(() => setProgress(0), 1000);
  };

  function handleBundleFiles() {
    if (markers.length === 0 || images.length === 0) {
      alert("Bitte lade mindestens einen Marker und ein Bild hoch.");
      return;
    }

    bundleFiles();
  }

  return (
    <>
      <Header />

      <main className="container">
        <section className="info-area">
          <h2>{contentText.title}</h2>
          <div id="description"></div>
          <div className="bundle-area">
            <button
              className="btn btn-primary"
              onClick={handleBundleFiles}
              disabled={noBundle || progress > 0}
            >
              {uiText.cta}!
            </button>

            {progress > 0 && (
              <div
                className={`info info-progress ${
                  progress > 99 ? "fade-out" : "fade-in"
                }`}
              >
                <p>
                  {progress < 50
                    ? uiText.calculatingMarkers
                    : uiText.bundleFiles}
                  {progress.toFixed(2)}%
                </p>

                <progress value={progress} max={100}></progress>
              </div>
            )}

            {noBundle && (
              <div className="info info-attention">
                {errors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>
        </section>
        <section className="upload">
          <Uploader
            files={markers}
            setFiles={setMarkers}
            sectionName={uiText.markers}
          />
          <Uploader
            files={images}
            setFiles={setImages}
            sectionName={uiText.images}
          />
        </section>
      </main>
    </>
  );
}

export default App;
