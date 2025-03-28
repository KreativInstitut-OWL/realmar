import {
  createSquareThreeTextureFromSrc,
  renderSvgReactNodeToBase64Src,
} from "@/lib/render";
import { Asset, Entity, Item, useAsset } from "@/store";
import { composeRefs } from "@radix-ui/react-compose-refs";
import {
  Edges,
  EdgesProps,
  GizmoHelper,
  GizmoViewport,
  Grid,
  OrbitControls,
  PerspectiveCamera,
  PivotControls,
  useVideoTexture,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { GeneratedTarget } from "./GeneratedTarget";

const EulerNull = new THREE.Euler(0, 0, 0);

const ImageAsset = forwardRef<
  THREE.Mesh,
  { asset: Asset; children: React.ReactNode }
>(({ asset, children }, ref) => {
  const texture = useMemo(() => {
    if (!asset.src) return null;
    return new THREE.TextureLoader().load(asset.src);
  }, [asset.src]);

  if (!texture) {
    return null;
  }

  return (
    <mesh ref={ref} renderOrder={1000}>
      <planeGeometry args={[asset.width!, asset.height!]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      {children}
    </mesh>
  );
});

const VideoAsset = forwardRef<
  THREE.Mesh,
  { asset: Asset; children: React.ReactNode }
>(({ asset, children }, ref) => {
  const texture = useVideoTexture(asset.src);

  if (!texture) {
    return null;
  }

  return (
    <mesh ref={ref}>
      <planeGeometry args={[asset.width!, asset.height!]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      {children}
    </mesh>
  );
});

const GltfAsset = forwardRef<
  THREE.Mesh,
  { asset: Asset; modelPlayAnimation: boolean; children: React.ReactNode }
>(({ asset, modelPlayAnimation, children }, ref) => {
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
    if (!modelPlayAnimation && mixer) {
      mixer.setTime(0);
      mixer.update(0);
    }
  }, [modelPlayAnimation, mixer]);

  useFrame((_, delta) => {
    if (modelPlayAnimation && mixer) {
      mixer.update(delta);
    }
  });

  const [boundingGeometry, setBoundingGeometry] =
    useState<THREE.BufferGeometry>();

  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (gltf && !boundingGeometry) {
      const mesh = meshRef.current;
      const scene = mesh?.children[0];

      if (scene) {
        const backupMatrix = scene.matrix.clone();
        scene.matrix.identity();
        scene.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        geometry.translate(center.x, center.y, center.z);

        scene.applyMatrix4(backupMatrix);

        setBoundingGeometry(geometry);
      }
    }
  }, [boundingGeometry, gltf]);

  if (!gltf) {
    return null;
  }

  return (
    <mesh ref={composeRefs(ref, meshRef)}>
      <primitive object={gltf.scene} />
      {boundingGeometry && isValidElement<EdgesProps>(children)
        ? cloneElement(children, { geometry: boundingGeometry })
        : null}
    </mesh>
  );
});

const PlaceholderAsset = forwardRef<THREE.Mesh, { children: React.ReactNode }>(
  ({ children }, ref) => {
    return (
      <mesh ref={ref}>
        <boxGeometry args={[0.125, 0.125, 0.125]} />
        <meshBasicMaterial color="#55fc27" />
        {children}
      </mesh>
    );
  }
);

function useAssetComponent(asset: Asset | null) {
  const assetFileType = asset?.file?.type;

  return useMemo(() => {
    if (!assetFileType) {
      return PlaceholderAsset;
    }

    if (assetFileType.startsWith("image/")) {
      return ImageAsset;
    }

    if (assetFileType.startsWith("video/")) {
      return VideoAsset;
    }

    if (assetFileType.startsWith("model/gltf")) {
      return GltfAsset;
    }

    return PlaceholderAsset;
  }, [assetFileType]);
}

function TransformableAsset({
  entity,
  onTransformChange,
  isSelected,
  onSelect,
}: {
  entity: Entity;
  onTransformChange: (transform: THREE.Matrix4Tuple) => void;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { lookAtCamera, transform, modelPlayAnimation } = entity;

  const { data: asset } = useAsset(entity.assetId);

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

  const AssetComponent = useAssetComponent(asset);

  return (
    <group onClick={() => onSelect()}>
      <PivotControls
        scale={0.5}
        matrix={matrixRef.current}
        annotations
        onDragStart={() => {
          setIsDragging(true);
        }}
        disableRotations={!isSelected || lookAtCamera}
        disableAxes={!isSelected}
        disableSliders={!isSelected}
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
          modelPlayAnimation={modelPlayAnimation}
          ref={meshRef}
        >
          <Edges
            visible={isSelected}
            scale={1.1}
            renderOrder={1000}
            color="#999"
            lineWidth={1.25}
          />
        </AssetComponent>
      </PivotControls>
    </group>
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
    networkMode: "always",
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { data: customMarkerTexture } = useSuspenseQuery({
    queryKey: [
      "custom-marker-texture",
      { src, checkerboardTransparency: true },
    ],
    queryFn: () =>
      src
        ? createSquareThreeTextureFromSrc({
            src,
            size: MARKER_TEXTURE_SIZE,
            checkerboardTransparency: true,
          })
        : null,
    networkMode: "always",
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return (
    <mesh renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={customMarkerTexture ?? generatedMarkerTexture}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

interface ItemArrangeEditorProps {
  id: string;
  // lookAtCamera: boolean;
  // transform: THREE.Matrix4Tuple;
  onTransformChange: (transform: THREE.Matrix4Tuple) => void;
  // modelPlayAnimation: boolean;
  // asset: Asset | null;
  entities: Entity[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string) => void;
  marker: Asset | null;
  cameraPosition: THREE.Vector3Tuple;
  onCameraPositionChange: (position: THREE.Vector3Tuple) => void;
  displayMode: Item["displayMode"];
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
    <div className="w-full h-full overflow-clip bg-gray-2">
      <Canvas>
        <ambientLight intensity={10} />
        {/* <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} /> */}

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

        {props.entities.map((entity) => {
          if (
            props.displayMode === "gallery" &&
            entity.id !== props.selectedEntityId
          ) {
            return null;
          }

          return (
            <TransformableAsset
              key={entity.id}
              entity={entity}
              isSelected={entity.id === props.selectedEntityId}
              onSelect={() => props.onSelectEntity(entity.id)}
              onTransformChange={props.onTransformChange}
            />
          );
        })}

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
