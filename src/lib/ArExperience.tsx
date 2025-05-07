import { assertIsEntityText, EntityType, getComponent } from "@/store";
import { toAttrs, toNumber, toVec3, toVec4 } from "./a-frame/attributes";
import "./a-frame/types";
import { AFrameEntityProps } from "./a-frame/types";
import ArExperienceImport from "./ArExperienceImport";
import {
  assertIsExportEntityWithAsset,
  ExportAppState,
  ExportEntity,
} from "./export";
import { decomposeMatrix4 } from "./three";

export const ArExperience = ({ state }: { state: ExportAppState }) => {
  const { items, projectName } = state;

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <title>{projectName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="style.css" rel="stylesheet" />
        <script src="realmar.js" type="module" />
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
      mindar-image={toAttrs({
        imageTargetSrc: "targets.mind",
        filterMinCF: 0.0001,
        filterBeta: 0.01,
      })}
      vr-mode-ui={toAttrs({ enabled: false })}
      device-orientation-permission-ui={toAttrs({ enabled: false })}
    >
      <a-assets>
        {items.map((item) => {
          return item.entities
            .map((entity) => {
              if (!("asset" in entity)) return null;
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
            ? { "realmar-gallery": toAttrs({ startIndex: 0 }) }
            : {})}
          {...(item.itemDependencyId !== null
            ? { "realmar-depends-on": `#${item.itemDependencyId}` }
            : {})}
        >
          {item.entities.map((entity, entityIndex) => (
            <ArExperienceEntity
              entity={entity}
              key={entity.id}
              {...(item.displayMode === "gallery"
                ? { "realmar-gallery-item": toAttrs({ index: entityIndex }) }
                : {})}
            />
          ))}
        </a-entity>
      ))}
    </a-scene>
  );
}

const arExperienceEntityComponents = {
  text: ArExperienceEntityText,
  model: ArExperienceEntityModel,
  null: () => null,
  image: ArExperienceEntityPlane,
  video: ArExperienceEntityPlane,
} satisfies Record<
  EntityType,
  React.ComponentType<
    {
      entity: ExportEntity;
    } & AFrameEntityProps
  >
>;

function ArExperienceEntity(
  props: { entity: ExportEntity } & AFrameEntityProps
) {
  const Component = arExperienceEntityComponents[props.entity.type];
  if (!Component) {
    throw new Error(`Unknown entity type: ${props.entity.type}`);
  }

  const { position, scale, quaternion } = decomposeMatrix4(
    props.entity.transform
  );
  const lookAtCamera = getComponent(props.entity, "look-at-camera");
  const float = getComponent(props.entity, "float");

  const element = (
    <Component
      position={toVec3(position)}
      quaternion={toVec4(quaternion)}
      scale={toVec3(scale)}
      id={props.entity.id}
      data-entity-id={props.entity.id}
      look-at={lookAtCamera?.enabled ? "camera" : undefined}
      {...props}
    />
  );

  return float?.enabled ? (
    <a-entity
      float={toAttrs({
        enabled: float.enabled,
        speed: float.speed,
        intensity: float.intensity,
        rotationIntensity: float.rotationIntensity,
        floatingRangeMin: float.floatingRange?.[0],
        floatingRangeMax: float.floatingRange?.[1],
      })}
    >
      {element}
    </a-entity>
  ) : (
    element
  );
}

function ArExperienceEntityText({
  entity,
  ...props
}: {
  entity: ExportEntity;
} & AFrameEntityProps) {
  assertIsEntityText(entity);

  return (
    <a-entity
      {...props}
      text-3d={toAttrs({
        text: entity.text,
        font: entity.font.path,
        size: toNumber(entity.fontSize),
        height: toNumber(entity.height),
        curveSegments: toNumber(entity.curveSegments),
        bevelEnabled: true,
        bevelThickness: toNumber(entity.bevelThickness),
        bevelSize: toNumber(entity.bevelSize),
        lineHeight: toNumber(entity.lineHeight),
        letterSpacing: toNumber(entity.letterSpacing),
        color: entity.color,
      })}
    />
  );
}

function ArExperienceEntityModel({
  entity,
  ...props
}: {
  entity: ExportEntity;
} & AFrameEntityProps) {
  assertIsExportEntityWithAsset(entity);

  return (
    <a-entity {...props} gltf-model={`#${entity.asset.id}`} animation-mixer />
  );
}

function ArExperienceEntityPlane({
  entity,
  ...props
}: {
  entity: ExportEntity;
} & AFrameEntityProps) {
  assertIsExportEntityWithAsset(entity);
  return (
    <a-plane
      {...props}
      src={`#${entity.asset.id}`}
      width={toNumber(entity.asset.width!)}
      height={toNumber(entity.asset.height!)}
      color="#ffffff"
    />
  );
}
