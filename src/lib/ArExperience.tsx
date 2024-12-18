import { Item } from "@/store";
import React from "react";
import { ExportAppState, getFileName } from "./export";
import ArExperienceImport from "./ArExperienceImport";
import * as THREE from "three";

export const ArExperience = ({ state }: { state: ExportAppState }) => {
  const { items } = state;
  console.log(items);

  // return <div>hi, please implement me!</div>;

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <title>AR Experience</title>
        <script src="./aframe-master.min.js" />
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
          mindar-image="imageTargetSrc: ./targets.mind;"
          vr-mode-ui="enabled: false"
          device-orientation-permission-ui="enabled: false"
        >
          <a-assets>
            {items.map((item) => {
              return item.entities
                .map((entity) => {
                  if (!entity.asset) return null;
                  return <ArExperienceImport {...entity.asset} />;
                })
                .flat();
            })}
          </a-assets>
          <a-camera
            position="0 0 0"
            look-controls="enabled: false"
            cursor="fuse: false; rayOrigin: mouse;"
            raycaster="far: 10000; objects: .clickable"
            id="camera"
          />

          {items.map((item, targetIndex) => {
            return item.entities.map((entity, index) => {
              const matrix = new THREE.Matrix4().fromArray(entity.transform);
              const position = new THREE.Vector3();
              const quaternion = new THREE.Quaternion();
              const scale = new THREE.Vector3();
              matrix.decompose(position, quaternion, scale);
              const rotation = new THREE.Euler().setFromQuaternion(quaternion);
              // TODO: Nur erste entity als a-entity, die anderen in ein Objekt. Tausch der entites als JS-Galerie
              // TODO: Animation handling. (Was, wenn mehrere vorliegen? Autoplay?)
              return (
                <a-entity
                  mindar-image-target={`targetIndex: ${targetIndex}`}
                  id={`entity${index}`}
                  key={`entity${index}`}
                >
                  {entity.asset.fileType.includes("model") && (
                    <a-entity
                      position={`${position.x} ${position.y} ${position.z}`}
                      rotation={`${rotation.x} ${rotation.y} ${rotation.z}`}
                      scale={`${scale.x} ${scale.y} ${scale.z}`}
                      gltf-model={`#${entity.asset.id}`}
                    ></a-entity>
                  )}

                  {!entity.asset.fileType.includes("model") && (
                    <a-plane
                      position={`${position.x} ${position.y} ${position.z}`}
                      rotation={`${rotation.x} ${rotation.y} ${rotation.z}`}
                      scale={`${scale.x} ${scale.y} ${scale.z}`}
                      width={"1"}
                      height={"1"}
                      id={`plane${index}`}
                      color="#ffffff"
                      src={`#${entity.asset.id}`}
                      look-at={entity.lookAtCamera ? "camera" : undefined}
                      data-testid={`plane${index}`}
                    />
                  )}
                </a-entity>
              );
            });
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
      "a-asset-item": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          id: string;
          src: string;
        },
        HTMLElement
      >;
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
          "mindar-image-target"?: string;
          id?: string;
          position?: string;
          rotation?: string;
          scale?: string;
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
