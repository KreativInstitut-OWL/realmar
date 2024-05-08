import { Compiler } from "./image-target/compiler";

// Assuming window.MINDAR.IMAGE.Compiler exists and has compileImageTargets and exportData methods.
const compiler = new Compiler();

const loadImage = async (file: File) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

const compileImageTargets = async (files: File[], setProgress: Function) => {
  const images: HTMLImageElement[] = [];
  for (let i = 0; i < files.length; i++) {
    images.push(await loadImage(files[i]));
  }
  console.log("Images loaded");
  const dataList = await compiler.compileImageTargets(
    images,
    (progress: number) => {
      console.log(`Progress: ${progress.toFixed(2)} %`);
      setProgress(progress);
    },
  );
  console.log("Compilation done");
  const exportedBuffer = await compiler.exportData();
  return { dataList, exportedBuffer };
};

export default compileImageTargets;
