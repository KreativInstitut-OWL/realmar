import { Compiler } from "./image-target/compiler";

const compiler = new Compiler();

const loadImage = async (src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const compileImageTargets = async (
  sources: string[],
  setProgress: (progress: number) => void
) => {
  const images: HTMLImageElement[] = [];
  for (const src of sources) {
    images.push(await loadImage(src));
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
