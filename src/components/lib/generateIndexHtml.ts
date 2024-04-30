export default function generateIndexHTML(files: File[]) {
  const htmlContent = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>AR Experience</title>
<script src="./mindar.prod.js"></script>
    </head>
    <body>
${files
  .map((file, index) => {
    const id = `image${index}`;
    const src = `${id}.${file.name.split(".").pop()}`;
    return `<img id="${id}" src="./${src}" alt="${src}" />`;
  })
  .join("\n")}
<a-scene
      mindar-image="imageTargetSrc: ./img/targets.mind;"
      vr-mode-ui="enabled: false"
      device-orientation-permission-ui="enabled: false"
    >
      <a-assets>
${files
  .map((file, index) => {
    const id = `image${index}`;
    const src = `${id}.${file.name.split(".").pop()}`;
    return `<img id="${id}" src="./${src}" alt="${src}" />`;
  })
  .join("\n")}
      </a-assets>
      <a-camera
        position="0 0 0"
        look-controls="enabled: false"
        cursor="fuse: false; rayOrigin: mouse;"
        raycaster="far: 10000; objects: .clickable"
      ></a-camera>
${files
  .map((file, index) => {
    const id = `image${index}`;
    const src = `${id}.${file.name.split(".").pop()}`;
    return `<img id="${id}" src="./${src}" alt="${src}" />
<a-entity mindar-image-target="targetIndex: ${index}" id="entity${index}">
<a-plane
          position="0 0 0"
          width="1"
          height="1"
          id="plane${index}"
          color="#ffffff"
          src="#image${index}"
        ></a-plane>
</a-entity>
`;
  })
  .join("\n")}
</a-scene>
    </body>
    </html>
  `;
  return htmlContent;
}
