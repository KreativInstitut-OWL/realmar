import {
  createSquareThreeTextureFromSrc,
  renderSvgReactNodeToBase64Src,
} from "@/lib/render";
import { Asset } from "@/store";
import {
  GizmoHelper,
  GizmoViewport,
  Grid,
  OrbitControls,
  PerspectiveCamera,
  PivotControls,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useSuspenseQuery } from "@tanstack/react-query";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { GeneratedTarget } from "./GeneratedTarget";

interface ItemArrangeEditorProps {
  id: string;
  lookAtCamera: boolean;
  transform: THREE.Matrix4Tuple;
  onTransformChange: (transform: THREE.Matrix4Tuple) => void;
  playAnimation: boolean;
  asset: Asset | null;
  marker: Asset | null;
  cameraPosition: THREE.Vector3Tuple;
  onCameraPositionChange: (position: THREE.Vector3Tuple) => void;
}

const EulerNull = new THREE.Euler(0, 0, 0);

type TextureImageDimensions = {
  width: number;
  height: number;
  aspectRatio: number;
};

const ImageAsset = forwardRef<THREE.Mesh, { asset: Asset }>(
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
            dimensions.width / Math.min(dimensions.width, dimensions.height),
            dimensions.height / Math.min(dimensions.width, dimensions.height),
          ]}
        />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
    );
  }
);

const GltfAsset = forwardRef<
  THREE.Mesh,
  { asset: Asset; playAnimation: boolean }
>(({ asset, playAnimation }, ref) => {
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
    if (!playAnimation && mixer) {
      mixer.setTime(0);
      mixer.update(0);
    }
  }, [playAnimation, mixer]);

  useFrame((_, delta) => {
    if (playAnimation && mixer) {
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
      <boxGeometry args={[0.125, 0.125, 0.125]} />
      <meshBasicMaterial color="#55fc27" />
    </mesh>
  );
});

function getAssetComponent(asset: Asset | null) {
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

function TransformableAsset({
  asset,
  lookAtCamera,
  transform,
  onTransformChange,
  playAnimation,
}: ItemArrangeEditorProps) {
  const matrixRef = useRef<THREE.Matrix4>(
    new THREE.Matrix4().fromArray(transform)
  );

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
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

  const AssetComponent = getAssetComponent(asset);

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
      disableScaling
      axisColors={["#fca5a5", "#55fc27", "#38bdf8"]}
    >
      <AssetComponent
        asset={asset!}
        playAnimation={playAnimation}
        ref={meshRef}
      />
    </PivotControls>
  );
}

const MARKER_TEXTURE_SIZE = 512;

function MarkerObject({ id, src }: { id: string; src?: string | null }) {
  const { data: generatedMarkerTexture } = useSuspenseQuery({
    queryKey: ["generated-marker-texture", { id, src }],
    queryFn: () =>
      createSquareThreeTextureFromSrc({
        src: renderSvgReactNodeToBase64Src(
          <GeneratedTarget id={id} size={MARKER_TEXTURE_SIZE} />
        ),
        size: MARKER_TEXTURE_SIZE,
      }),
  });

  const { data: customMarkerTexture } = useSuspenseQuery({
    queryKey: ["custom-marker-texture", { src }],
    queryFn: () =>
      src
        ? createSquareThreeTextureFromSrc({ src, size: MARKER_TEXTURE_SIZE })
        : null,
  });

  return (
    <mesh renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={customMarkerTexture ?? generatedMarkerTexture}
        side={THREE.DoubleSide}
        depthWrite={false}
        transparent
      />
    </mesh>
  );
}

export function ItemArrangeEditor(props: ItemArrangeEditorProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  const isDragging = useRef(false);

  useEffect(() => {
    if (cameraRef.current && props.cameraPosition && !isDragging.current) {
      cameraRef.current.position.set(...props.cameraPosition);
    }
  }, [props.cameraPosition]);

  const handleCameraStart = () => {
    isDragging.current = true;
  };

  const handleCameraEnd = () => {
    isDragging.current = false;
    if (cameraRef.current && props.onCameraPositionChange) {
      const pos = cameraRef.current.position;
      props.onCameraPositionChange([pos.x, pos.y, pos.z]);
    }
  };

  return (
    <div className="w-full h-full overflow-clip bg-white">
      <Canvas>
        <ambientLight intensity={10} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />

        <PerspectiveCamera
          ref={cameraRef}
          position={props.cameraPosition || [2, 2, 2]}
          makeDefault
        />
        <OrbitControls
          makeDefault
          onStart={handleCameraStart}
          onEnd={handleCameraEnd}
        />

        <MarkerObject id={props.id} src={props.marker?.src} />

        <TransformableAsset {...props} />

        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport
            axisColors={["#fca5a5", "#55fc27", "#38bdf8"]}
            labelColor="black"
          />
        </GizmoHelper>
        <Grid args={[10, 10]} side={THREE.DoubleSide} />
      </Canvas>
    </div>
  );
}
