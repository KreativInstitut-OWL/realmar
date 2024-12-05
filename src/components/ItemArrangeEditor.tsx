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
import { AssetWithFile } from "@/store";

interface ItemArrangeEditorProps {
  id: string;
  lookAtCamera: boolean;
  transform: THREE.Matrix4Tuple;
  onTransformChange: (transform: THREE.Matrix4Tuple) => void;
  shouldPlayAnimation: boolean;
  assets: AssetWithFile[];
  marker: AssetWithFile | null;
}

const EulerNull = new THREE.Euler(0, 0, 0);

type TextureImageDimensions = {
  width: number;
  height: number;
  aspectRatio: number;
};

const ImageAsset = forwardRef<THREE.Mesh, { asset: AssetWithFile }>(
  ({ asset }, ref) => {
    const [dimensions, setDimensions] = useState<TextureImageDimensions>();

    const texture = useMemo(() => {
      if (!asset.src) return null;
      return new THREE.TextureLoader().load(asset.src, (texture) => {
        setDimensions({
          width: texture.image.width,
          height: texture.image.height,
          aspectRatio: texture.image.width / texture.image.height,
        });
      });
    }, [asset.src]);

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
  { asset: AssetWithFile; shouldPlayAnimation: boolean }
>(({ asset, shouldPlayAnimation }, ref) => {
  const [gltf, setGltf] = useState<GLTF>();
  const [mixer, setMixer] = useState<THREE.AnimationMixer>();

  useEffect(() => {
    if (!asset.file) return;

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

function getAssetComponent(asset: AssetWithFile | undefined) {
  if (!asset?.file) {
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
  assets,
  lookAtCamera,
  transform,
  onTransformChange,
  shouldPlayAnimation,
}: ItemArrangeEditorProps) {
  const matrixRef = useRef<THREE.Matrix4>(
    new THREE.Matrix4().fromArray(transform)
  );

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    console.log("transform", transform);
    if (!isDragging && matrixRef.current) {
      matrixRef.current.fromArray(transform);
    }
  }, [transform, isDragging]);

  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ camera }) => {
    if (lookAtCamera) {
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
        setIsDragging(true);
      }}
      disableRotations={lookAtCamera}
      onDragEnd={() => {
        setIsDragging(false);
      }}
      onDrag={(l: THREE.Matrix4) => {
        onTransformChange([...l.elements]);
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
          <ImageAsset asset={props.marker} />
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
