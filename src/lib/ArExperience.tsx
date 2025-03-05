import * as THREE from "three";
import { toAttrs, toNumber, toVec3, toVec4 } from "./a-frame/attributes";
import "./a-frame/types";
import { AFrameEntityProps } from "./a-frame/types";
import ArExperienceImport from "./ArExperienceImport";
import { ExportAppState, ExportEntity } from "./export";

export const ArExperience = ({ state }: { state: ExportAppState }) => {
  const { items } = state;

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <title>AR Experience</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="style.css" rel="stylesheet" />
        <script src="batchar.js" type="module" />
      </head>
      <body>
        <ArExperienceScene items={items} />
        <div className="button-wrapper">
          <div className="button-container invisible" id="gallery-buttons">
            <button id="prev">Zurück</button>
            <button id="next">Weiter</button>
          </div>
          <div className="button-container invisible" id="video-controls">
            <button id="play" className="invisible">
              Video Abspielen
            </button>
            <button id="play-from-start" className="invisible">
              Video vom Anfang abspielen
            </button>
            <button id="pause" className="invisible">
              Video pausieren
            </button>
          </div>
        </div>
      </body>
    </html>
  );
};

function ArExperienceScene({ items }: { items: ExportAppState["items"] }) {
  return (
    <a-scene
      mindar-image={toAttrs({ imageTargetSrc: "targets.mind" })}
      vr-mode-ui={toAttrs({ enabled: false })}
      device-orientation-permission-ui={toAttrs({ enabled: false })}
    >
      <a-assets>
        {items.map((item) => {
          return item.entities
            .map((entity) => {
              if (!entity.asset) return null;
              return <ArExperienceImport key={entity.id} {...entity.asset} />;
            })
            .flat();
        })}
      </a-assets>
      <a-camera
        position="0 0 0"
        look-controls={toAttrs({ enabled: false })}
        cursor={toAttrs({ fuse: false, rayOrigin: "mouse" })}
        raycaster={toAttrs({ far: 10000, objects: ".clickable" })}
        id="camera"
      />

      {items.map((item, itemIndex) => (
        <a-entity
          key={item.id}
          mindar-image-target={toAttrs({ targetIndex: itemIndex })}
          id={item.id}
          {...(item.displayMode === "gallery"
            ? { "batchar-gallery": toAttrs({ startIndex: 0 }) }
            : {})}
        >
          {item.entities.map((entity, entityIndex) => (
            <ArExperienceEntity
              entity={entity}
              key={entity.id}
              {...(item.displayMode === "gallery"
                ? { "batchar-gallery-item": toAttrs({ index: entityIndex }) }
                : {})}
            />
          ))}
        </a-entity>
      ))}
    </a-scene>
  );
}

function ArExperienceEntity(
  props: { entity: ExportEntity } & AFrameEntityProps
) {
  if (props.entity.asset.fileType.includes("model")) {
    return <ArExperienceEntityModel {...props} />;
  } else {
    return <ArExperienceEntityPlane {...props} />;
  }
}

function ArExperienceEntityModel({
  entity,
  ...props
}: {
  entity: ExportEntity;
} & AFrameEntityProps) {
  const { position, scale, quaternion } = decomposeTransform(entity.transform);
  return (
    <a-entity
      {...props}
      position={toVec3(position)}
      quaternion={toVec4(quaternion)}
      scale={toVec3(scale)}
      gltf-model={`#${entity.asset.id}`}
      id={entity.id}
      data-entity-id={entity.id}
      look-at={entity.lookAtCamera ? "camera" : undefined}
      animation-mixer
    />
  );
}

function ArExperienceEntityPlane({
  entity,
  ...props
}: {
  entity: ExportEntity;
} & AFrameEntityProps) {
  const { position, scale, quaternion } = decomposeTransform(entity.transform);
  return (
    <a-plane
      {...props}
      position={toVec3(position)}
      quaternion={toVec4(quaternion)}
      scale={toVec3(scale)}
      width={toNumber(entity.asset.width!)}
      height={toNumber(entity.asset.height!)}
      id={entity.id}
      color="#ffffff"
      src={`#${entity.asset.id}`}
      look-at={entity.lookAtCamera ? "camera" : undefined}
      data-entity-id={entity.id}
    />
  );
}

function decomposeTransform(transform: THREE.Matrix4Tuple) {
  const matrix = new THREE.Matrix4().fromArray(transform);

  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  matrix.decompose(position, quaternion, scale);

  return { position, scale, quaternion };
}
