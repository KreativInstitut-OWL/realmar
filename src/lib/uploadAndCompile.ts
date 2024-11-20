import { Compiler } from "./image-target/compiler";

// Assuming window.MINDAR.IMAGE.Compiler exists and has compileImageTargets and exportData methods.
const compiler = new Compiler();

const loadImage = async (file: File) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

const compileImageTargets = async (
  files: File[],
  setProgress: (progress: number) => void
) => {
  const images: HTMLImageElement[] = [];
  for (let i = 0; i < files.length; i++) {
    images.push(await loadImage(files[i]));
  }
  const dataList = await compiler.compileImageTargets(
    images,
    (progress: number) => {
      setProgress(progress);
    }
  );
  const exportedBuffer = compiler.exportData();
  return { dataList, exportedBuffer };
};

export default compileImageTargets;
