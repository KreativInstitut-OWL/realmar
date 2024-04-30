import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Header from "./components/Header";
import Uploader from "./components/Uploader";
import { FileType } from "../types/types";
import generateIndexHtml from "./lib/generateIndexHtml";
import compileImageTargets from "./lib/uploadAndCompile";

function App() {
  const [markers, setMarkers] = useState<FileType[]>([]);
  const [images, setImages] = useState<FileType[]>([]);

  const renameFile = (file: File, index: number) => {
    const fileExtension = file.name.split(".").pop();
    return `target${index}.${fileExtension}`;
  };

  const bundleFiles = async () => {
    try {
      const zip = new JSZip();
      // const aframe = await fetch("/js-includes/aframe.min.js");
      // const aframeBlob = await aframe.blob();
      // const mindar = await fetch("/js-includes/mindar-image-aframe.prod.js");
      // const mindarBlob = await mindar.blob();
      // zip.file("aframe.min.js", aframeBlob);
      // zip.file("mindar-image-aframe.js", mindarBlob);

      const mindar = await fetch("/js-includes/mindar.prod.js");
      const mindarBlob = await mindar.blob();
      zip.file("mindar.prod.js", mindarBlob);

      const targets = markers.map((marker) => marker.file);
      const mind = await compileImageTargets(targets);
      console.log(mind);

      // const targets = await compileImageTargets(
      //   markers.map((marker) => marker.file),
      // );
      // zip.file("targets.mind", targets);
      //
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
        <p>
          Lade hier Deine AR-Tracking-Marker und die anzuzeigenden Bilder hoch.
        </p>
        <div className="upload">
          <div className="markers upload-form">
            <h2>Marker</h2>
            <Uploader files={markers} setFiles={setMarkers} />
          </div>
          <div className="images upload-form">
            <h2>Bilder</h2>
            <Uploader files={images} setFiles={setImages} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleBundleFiles}>
          Bundle!
        </button>
      </main>
    </>
  );
}

export default App;
