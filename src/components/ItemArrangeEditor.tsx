import { Asset, Vector3 } from "@/schema";
import {
  GizmoHelper,
  GizmoViewport,
  Grid,
  OrbitControls,
  PivotControls,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { GeneratedMarker } from "./GeneratedMarker";

interface ItemArrangeEditorProps {
  id: string;
  lookAt?: "camera";
  rotation: Vector3;
  position: Vector3;
  scale: Vector3;
  onPositionChange: (newPosition: Vector3) => void;
  onRotationChange: (newRotation: Vector3) => void;
  onScaleChange: (newScale: Vector3) => void;
  assets: Asset[];
  shouldPlayAnimation: boolean;
  marker: File | null;
}

const EulerNull = new THREE.Euler(0, 0, 0);

function useTransformsAsMatrix(
  position: Vector3,
  rotation: Vector3,
  scale: Vector3,
  lookAt: "camera" | undefined
): THREE.Matrix4 {
  return useMemo(() => {
    const matrix = new THREE.Matrix4();
    if (lookAt !== "camera") {
      matrix.makeRotationFromEuler(
        new THREE.Euler(rotation.x, rotation.y, rotation.z)
      );
    }
    matrix.setPosition(new THREE.Vector3(position.x, position.y, position.z));
    matrix.scale(new THREE.Vector3(scale.x, scale.y, scale.z));

    return matrix;
  }, [
    lookAt,
    position.x,
    position.y,
    position.z,
    rotation.x,
    rotation.y,
    rotation.z,
    scale.x,
    scale.y,
    scale.z,
  ]);
}

type TextureImageDimensions = {
  width: number;
  height: number;
  aspectRatio: number;
};

const ImageAsset = forwardRef<THREE.Mesh, { asset: Asset }>(
  ({ asset }, ref) => {
    const [dimensions, setDimensions] = useState<TextureImageDimensions>();

    const texture = useMemo(() => {
      return new THREE.TextureLoader().load(
        URL.createObjectURL(asset.file),
        (texture) => {
          setDimensions({
            width: texture.image.width,
            height: texture.image.height,
            aspectRatio: texture.image.width / texture.image.height,
          });
        }
      );
    }, [asset.file]);

    if (!texture || !dimensions) {
      return null;
    }

    return (
      <mesh ref={ref}>
        <planeGeometry
          args={[
            dimensions.width / Math.max(dimensions.width, dimensions.height),
            dimensions.height / Math.max(dimensions.width, dimensions.height),
          ]}
        />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
    );
  }
);

const GltfAsset = forwardRef<
  THREE.Mesh,
  { asset: Asset; shouldPlayAnimation: boolean }
>(({ asset, shouldPlayAnimation }, ref) => {
  const [gltf, setGltf] = useState<GLTF>();
  const [mixer, setMixer] = useState<THREE.AnimationMixer>();

  useEffect(() => {
    let isMounted = true;
    const reader = new FileReader();
    reader.onload = function () {
      if (!reader.result || !isMounted) return;
      const gltfLoader = new GLTFLoader();
      gltfLoader.parse(reader.result, "/", (gltf) => {
        if (!isMounted) return;
        setGltf(gltf);

        if (gltf.animations.length) {
          const mixer = new THREE.AnimationMixer(gltf.scene);
          setMixer(mixer);
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
        } else {
          setMixer(undefined);
        }
      });
    };
    reader.readAsArrayBuffer(asset.file);

    return () => {
      isMounted = false;
    };
  }, [asset]);

  useEffect(() => {
    if (!shouldPlayAnimation && mixer) {
      mixer.setTime(0);
      mixer.update(0);
    }
  }, [shouldPlayAnimation, mixer]);

  useFrame((_, delta) => {
    if (shouldPlayAnimation && mixer) {
      mixer.update(delta);
    }
  });

  if (!gltf) {
    return null;
  }

  console.log(gltf.animations);

  return (
    <mesh ref={ref}>
      <primitive object={gltf.scene} />
    </mesh>
  );
});

const PlaceholderAsset = forwardRef<THREE.Mesh>((_, ref) => {
  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.25, 0.25, 0.25]} />
      <meshBasicMaterial color="#55fc27" />
    </mesh>
  );
});

function getAssetComponent(asset: Asset) {
  console.log("getAssetComponent", asset?.file.type);

  if (!asset) {
    return PlaceholderAsset;
  }

  if (asset.file.type.startsWith("image/")) {
    return ImageAsset;
  }

  if (asset.file.type.startsWith("model/gltf")) {
    return GltfAsset;
  }

  return PlaceholderAsset;
}

function TransformableAssets({
  lookAt,
  rotation: rotationProp,
  position: positionProp,
  scale: scaleProp,
  onPositionChange,
  onRotationChange,
  onScaleChange,
  assets,
  shouldPlayAnimation,
}: ItemArrangeEditorProps) {
  const matrixProp = useTransformsAsMatrix(
    positionProp,
    rotationProp,
    scaleProp,
    lookAt
  );
  const matrixRef = useRef<THREE.Matrix4>(matrixProp);

  const isDragging = useRef(false);

  useEffect(() => {
    if (!isDragging.current && matrixRef.current) {
      matrixRef.current.copy(matrixProp);
    }
  }, [matrixProp]);

  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ camera }) => {
    if (lookAt === "camera") {
      const matrixPosition = new THREE.Vector3();
      matrixRef.current.decompose(
        matrixPosition,
        new THREE.Quaternion(),
        new THREE.Vector3()
      );

      // add the matrix position to the camera position
      const cameraPosition = camera.position.clone();
      cameraPosition.add(matrixPosition);

      meshRef.current?.lookAt(cameraPosition);
    } else {
      meshRef.current?.setRotationFromEuler(EulerNull);
    }
  });

  const previewAsset = assets?.[0] ?? undefined;

  const AssetComponent = getAssetComponent(previewAsset);

  return (
    <PivotControls
      matrix={matrixRef.current}
      annotations
      onDragStart={() => {
        isDragging.current = true;
      }}
      disableRotations={lookAt === "camera"}
      onDragEnd={() => {
        isDragging.current = false;
        // flush the matrix to the ref
        matrixRef.current.copy(matrixProp);
      }}
      onDrag={(l: THREE.Matrix4) => {
        const position = new THREE.Vector3();
        const quaternionRotation = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        l.decompose(position, quaternionRotation, scale);

        const rotation = new THREE.Euler();
        rotation.setFromQuaternion(quaternionRotation);

        if (
          positionProp.x !== position.x ||
          positionProp.y !== position.y ||
          positionProp.z !== position.z
        ) {
          onPositionChange({
            x: position.x,
            y: position.y,
            z: position.z,
          });
        }
        if (
          rotationProp.x !== rotation.x ||
          rotationProp.y !== rotation.y ||
          rotationProp.z !== rotation.z
        ) {
          onRotationChange({
            x: rotation.x,
            y: rotation.y,
            z: rotation.z,
          });
        }
        if (
          scaleProp.x !== scale.x ||
          scaleProp.y !== scale.y ||
          scaleProp.z !== scale.z
        ) {
          onScaleChange({
            x: scale.x,
            y: scale.y,
            z: scale.z,
          });
        }
      }}
    >
      <AssetComponent
        asset={previewAsset}
        shouldPlayAnimation={shouldPlayAnimation}
        ref={meshRef}
      />
    </PivotControls>
  );
}

const MARKER_TEXTURE_SIZE = 128;

function MarkerObject({ id }: { id: string }) {
  const renderedMarkerTexture = useMemo(() => {
    const container = document.createElement("div");
    const root = createRoot(container);
    flushSync(() => {
      root.render(<GeneratedMarker id={id ?? ""} />);
    });

    const canvas = document.createElement("canvas");
    canvas.width = MARKER_TEXTURE_SIZE;
    canvas.height = MARKER_TEXTURE_SIZE;
    const ctx = canvas.getContext("2d");

    const img = document.createElement("img");
    img.setAttribute(
      "src",
      "data:image/svg+xml;base64," + btoa(container.innerHTML)
    );
    img.width = MARKER_TEXTURE_SIZE;
    img.height = MARKER_TEXTURE_SIZE;

    const texture = new THREE.Texture(canvas);

    img.onload = function () {
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      texture.needsUpdate = true;
    };

    return texture;
  }, [id]);

  return (
    <mesh renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={renderedMarkerTexture}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

export function ItemArrangeEditor(props: ItemArrangeEditorProps) {
  return (
    <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [2, 2, 2] }}>
        <ambientLight intensity={10} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <axesHelper args={[1]} />
        <OrbitControls makeDefault />

        {props.marker ? (
          <ImageAsset asset={{ id: "marker", file: props.marker }} />
        ) : (
          <MarkerObject id={props.id} />
        )}
        <TransformableAssets {...props} />

        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport
            axisColors={["red", "green", "blue"]}
            labelColor="white"
          />
        </GizmoHelper>
        <Grid args={[10, 10]} side={THREE.DoubleSide} />
      </Canvas>
    </div>
  );
}
