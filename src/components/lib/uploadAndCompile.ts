import { useCallback, useState } from "react";
import { Compiler } from "mind-ar/src/image-target/compiler.js";

// Assuming window.MINDAR.IMAGE.Compiler exists and has compileImageTargets and exportData methods.
const compiler = new Compiler();

const loadImage = async (file) => {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

const compileImageTargets = async (files) => {
  const images = [];
  for (let i = 0; i < files.length; i++) {
    images.push(await loadImage(files[i]));
  }
  console.log("Images loaded");
  const dataList = await compiler.compileImageTargets(images, (progress) => {
    console.log(`Progress: ${progress.toFixed(2)} %`);
  });
  console.log("Compilation done");
  const exportedBuffer = await compiler.exportData();
  return { dataList, exportedBuffer };
};

export default compileImageTargets;
