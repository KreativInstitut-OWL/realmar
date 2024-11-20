import React from "react";
import { Size, Meta } from "./generateIndexHtml";

export const ArExperience = ({
  files,
  sizes,
  meta,
}: {
  files: File[];
  sizes: Size[];
  meta: Meta[];
}) => {
  const positions = getPositions(meta);

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <title>AR Experience</title>
        <script src="./aframe.min.js" />
        <script src="./mindar-image-aframe.prod.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: /* js */ `
              AFRAME.registerComponent('look-at', {
                schema: { type: 'selector' },
              
                init: function () {},
              
                tick: function () {
                  this.el.object3D.lookAt(this.data.object3D.position)
                }
              });
            `
              .replace(/\n/g, "")
              .replace(/\s+/g, " "),
          }}
        ></script>
      </head>
      <body>
        <a-scene
          mindar-image="imageTargetSrc: ./targets.mind;"
          vr-mode-ui="enabled: false"
          device-orientation-permission-ui="enabled: false"
        >
          <a-assets>
            {files.map((file, index) => {
              const id = `asset${index}`;
              const src = `${id}.${file.name.split(".").pop()}`;
              if (file.type.includes("image")) {
                return <img key={id} id={id} src={`./${src}`} alt={src} />;
              }
              if (file.type.includes("video")) {
                return (
                  <video
                    key={id}
                    id={id}
                    src={`./${src}`}
                    loop
                    autoPlay
                    muted
                  />
                );
              }
            })}
          </a-assets>
          <a-camera
            position="0 0 0"
            look-controls="enabled: false"
            cursor="fuse: false; rayOrigin: mouse;"
            raycaster="far: 10000; objects: .clickable"
            id="camera"
          />
          {files.map((_, index) => {
            return (
              <a-entity
                mindar-image-target={`targetIndex: ${index}`}
                id={`entity${index}`}
              >
                <a-plane
                  position={`0 0 ${positions[index]}`}
                  rotation={`${meta[index].rotation} 0 0`}
                  width={`${sizes[index].width}`}
                  height={`${sizes[index].height}`}
                  id={`plane${index}`}
                  color="#ffffff"
                  src={`#asset${index}`}
                  look-at={meta[index].faceCam ? "camera" : undefined}
                />
              </a-entity>
            );
          })}
        </a-scene>
      </body>
    </html>
  );
};

function getPositions(meta: Meta[]): number[] {
  const flatOffset = 0;
  const diagonalOffset = 0.5;
  const perpendicularOffset = 0.75;

  const newPositions: number[] = meta.map((entry) => {
    const rotation = entry.rotation;
    const spacing = entry.spacing / 100;
    if (rotation == 0) {
      return flatOffset + spacing;
    }
    if (rotation === 45) {
      return diagonalOffset + spacing;
    }
    if (rotation === 90) {
      return perpendicularOffset + spacing;
    }
    return 0;
  });
  return newPositions;
}

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "a-scene": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          "mindar-image": string;
          "vr-mode-ui": string;
          "device-orientation-permission-ui": string;
        },
        HTMLElement
      >;
      "a-assets": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      "a-camera": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          position: string;
          "look-controls": string;
          cursor: string;
          raycaster: string;
          id: string;
        },
        HTMLElement
      >;
      "a-entity": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          "mindar-image-target": string;
          id: string;
        },
        HTMLElement
      >;
      "a-plane": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          position: string;
          rotation: string;
          width: string;
          height: string;
          id: string;
          color: string;
          src: string;
          "look-at"?: string;
        },
        HTMLElement
      >;
    }
  }
}
