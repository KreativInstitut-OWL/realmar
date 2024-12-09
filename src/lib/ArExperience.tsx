import { Item } from "@/store";
import React from "react";
// import { getPositions } from "./getPositions";
import { getFileName } from "./export";
import * as THREE from "three";

export const ArExperience = ({ items }: { items: Item[] }) => {
  // const positions = getPositions(meta);

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <title>AR Experience</title>
        <script src="./aframe.min.js" />
        <script src="./mindar-image-aframe.prod.js" />
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
        />
      </head>
      <body>
        <a-scene
          mindar-image="imageTargetSrc: ./markers.mind;"
          vr-mode-ui="enabled: false"
          device-orientation-permission-ui="enabled: false"
        >
          <a-assets>
            {items
              .map((item, index) => {
                return item.assets.map((asset, assetIndex) => {
                  if (!asset.file) return null;
                  const src = getFileName(
                    "asset",
                    asset.file,
                    index,
                    assetIndex
                  );
                  if (asset.file.type.includes("image")) {
                    return (
                      <img
                        key={asset.id}
                        id={asset.id}
                        data-testid={asset.id}
                        src={`./${src}`}
                      />
                    );
                  }
                  if (asset.file.type.includes("video")) {
                    return (
                      <video
                        key={asset.id}
                        id={asset.id}
                        data-testid={asset.id}
                        src={`./${src}`}
                        loop
                        autoPlay
                        muted
                      />
                    );
                  }
                });
              })
              .flat()}
          </a-assets>
          <a-camera
            position="0 0 0"
            look-controls="enabled: false"
            cursor="fuse: false; rayOrigin: mouse;"
            raycaster="far: 10000; objects: .clickable"
            id="camera"
          />
          {items.map((item, index) => {
            const matrix = new THREE.Matrix4().fromArray(item.transform);
            const position = new THREE.Vector3();
            const quaternion = new THREE.Quaternion();
            const scale = new THREE.Vector3();
            matrix.decompose(position, quaternion, scale);
            const rotation = new THREE.Euler().setFromQuaternion(quaternion);

            return (
              <a-entity
                mindar-image-target={`targetIndex: ${index}`}
                id={`entity${index}`}
                key={`entity${index}`}
              >
                <a-plane
                  position={`${position.x} ${position.y} ${position.z}`}
                  rotation={`${rotation.x} ${rotation.y} ${rotation.z}`}
                  scale={`${scale.x} ${scale.y} ${scale.z}`}
                  width={"1"}
                  height={"1"}
                  id={`plane${index}`}
                  color="#ffffff"
                  src={`#${item.assets[0].id}`}
                  look-at={item.lookAtCamera ? "camera" : undefined}
                  data-testid={`plane${index}`}
                />
              </a-entity>
            );
          })}
        </a-scene>
      </body>
    </html>
  );
};

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
          scale: string;
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
