import generateIndexHTML from "./generateIndexHtml";

describe("generateIndexHTML", () => {
  it("should generate correct HTML content for given files", () => {
    const files = [
      { name: "file1.jpg" } as File,
      { name: "file2.png" } as File,
    ];

    const expectedResult = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>AR Experience</title>
<script src="./mindar.prod.js"></script>
    </head>
    <body>
<img id="image0" src="./image0.jpg" alt="image0.jpg" />
<img id="image1" src="./image1.png" alt="image1.png" />
<a-scene
      mindar-image="imageTargetSrc: ./img/targets.mind;"
      vr-mode-ui="enabled: false"
      device-orientation-permission-ui="enabled: false"
    >
      <a-assets>
<img id="image0" src="./image0.jpg" alt="image0.jpg" />
<img id="image1" src="./image1.png" alt="image1.png" />
      </a-assets>
      <a-camera
        position="0 0 0"
        look-controls="enabled: false"
        cursor="fuse: false; rayOrigin: mouse;"
        raycaster="far: 10000; objects: .clickable"
      ></a-camera>
<img id="image0" src="./image0.jpg" alt="image0.jpg" />
<a-entity mindar-image-target="targetIndex: 0" id="entity0">
<a-plane
          position="0 0 0"
          width="1"
          height="1"
          id="plane0"
          color="#ffffff"
          src="#image0"
        ></a-plane>
</a-entity>
<img id="image1" src="./image1.png" alt="image1.png" />
<a-entity mindar-image-target="targetIndex: 1" id="entity1">
<a-plane
          position="0 0 0"
          width="1"
          height="1"
          id="plane1"
          color="#ffffff"
          src="#image1"
        ></a-plane>
</a-entity>

</a-scene>
    </body>
    </html>
  `;

    const result = generateIndexHTML(files);
    expect(result).toBe(expectedResult);
  });
});
