import {
  createSquareThreeTextureFromSrc,
  renderSvgReactNodeToBase64Src,
} from "@/lib/render";
import {
  assertIsEntityModel,
  assertIsEntityText,
  assertIsEntityVideo,
  Asset,
  Entity,
  isEntityImage,
  isEntityModel,
  isEntityText,
  isEntityVideo,
  Item,
  useEntityAsset,
} from "@/store";
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
  Text3D,
  useVideoTexture,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  cloneElement,
  forwardRef,
  isValidElement,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { GeneratedTarget } from "./GeneratedTarget";

const EulerNull = new THREE.Euler(0, 0, 0);

const EntityImageComponent = forwardRef<
  THREE.Mesh,
  { asset: Asset | null; children: React.ReactNode }
>(({ asset, children }, ref) => {
  const texture = useMemo(() => {
    if (!asset?.src) return null;
    return new THREE.TextureLoader().load(asset.src);
  }, [asset?.src]);

  useEffect(() => {
    return () => {
      if (texture) texture.dispose();
    };
  }, [texture]);

  if (!texture || !asset) {
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

const EntityVideoComponent = forwardRef<
  THREE.Mesh,
  { asset: Asset | null; entity: Entity; children: React.ReactNode }
>(({ asset, entity, children }, ref) => {
  assertIsEntityVideo(entity);

  // const { autoplay, loop, muted } = entity;

  const texture = useVideoTexture(asset?.src ?? null);

  useEffect(() => {
    return () => {
      if (texture) texture.dispose();
    };
  }, [texture]);

  if (!texture || !asset) {
    return null;
  }

  return (
    <mesh ref={ref}>
      <planeGeometry args={[asset.width!, asset.height!]} />
      <meshLambertMaterial map={texture} side={THREE.DoubleSide} />
      {children}
    </mesh>
  );
});

const EntityModelComponent = forwardRef<
  THREE.Mesh,
  { asset: Asset | null; entity: Entity; children: React.ReactNode }
>(({ asset, entity, children }, ref) => {
  assertIsEntityModel(entity);

  const [gltf, setGltf] = useState<GLTF>();
  const [mixer, setMixer] = useState<THREE.AnimationMixer>();

  const { playAnimation } = entity;

  useEffect(() => {
    if (!asset?.file) return;

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

  const [boundingGeometry, setBoundingGeometry] =
    useState<THREE.BufferGeometry>();

  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!boundingGeometry) {
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
  }, [boundingGeometry]);

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

const EntityTextComponent = forwardRef<
  THREE.Mesh,
  { children: React.ReactNode; entity: Entity }
>(({ children, entity }, ref) => {
  assertIsEntityText(entity);
  const {
    bevelSize,
    bevelThickness,
    color,
    curveSegments,
    fontSize,
    height,
    letterSpacing,
    lineHeight,
    text,
  } = entity;

  const [boundingGeometry, setBoundingGeometry] =
    useState<THREE.BufferGeometry>();

  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    void entity;

    const mesh = meshRef.current;

    const scene = mesh?.children[0] as THREE.Mesh;

    if (scene) {
      const backupMatrix = scene.matrix.clone();
      scene.matrix.identity();
      scene.updateMatrixWorld(true);

      scene.geometry.computeBoundingBox();
      const box = scene.geometry.boundingBox?.clone() ?? new THREE.Box3();
      const size = box?.getSize(new THREE.Vector3());
      const center = box?.getCenter(new THREE.Vector3());
      const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
      geometry.translate(center.x, center.y, center.z);

      scene.applyMatrix4(backupMatrix);
      setBoundingGeometry(geometry);
    }
  }, [entity]);

  return (
    <Suspense fallback={null}>
      <mesh ref={composeRefs(ref, meshRef)}>
        <Text3D
          font="Open_Sans_Regular.json"
          bevelEnabled
          lineHeight={lineHeight}
          letterSpacing={letterSpacing}
          size={fontSize}
          height={height}
          curveSegments={curveSegments}
          bevelSize={bevelSize}
          bevelThickness={bevelThickness}
        >
          {text}
          <meshLambertMaterial color={color} />
        </Text3D>
        {boundingGeometry && isValidElement<EdgesProps>(children)
          ? cloneElement(children, { geometry: boundingGeometry })
          : null}
      </mesh>
    </Suspense>
  );
});

const EntityPlaceholderComponent = forwardRef<
  THREE.Mesh,
  { children: React.ReactNode }
>(({ children }, ref) => {
  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.125, 0.125, 0.125]} />
      <meshBasicMaterial color="#55fc27" />
      {children}
    </mesh>
  );
});

function useEntityComponent(entity: Entity) {
  return useMemo(() => {
    if (isEntityImage(entity)) {
      return EntityImageComponent;
    }
    if (isEntityVideo(entity)) {
      return EntityVideoComponent;
    }
    if (isEntityModel(entity)) {
      return EntityModelComponent;
    }
    if (isEntityText(entity)) {
      return EntityTextComponent;
    }
    return EntityPlaceholderComponent;
  }, [entity]);
}

function TransformableEntity({
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
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  const { lookAtCamera, transform } = entity;

  const { data: asset } = useEntityAsset(entity);

  // console.log("TransformableEntity render", renderCountRef.current, {
  //   entityId: entity.id,
  //   type: entity.type,
  //   asset,
  // });

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

  const EntityComponent = useEntityComponent(entity);

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
        <EntityComponent asset={asset!} entity={entity} ref={meshRef}>
          <Edges
            visible={isSelected}
            scale={1.1}
            renderOrder={1000}
            color="#999"
            lineWidth={1.25}
          />
        </EntityComponent>
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

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [canvasKey, setCanvasKey] = useState(0);

  // Set up context loss handler manually
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleContextLost = (event: Event) => {
      console.error("WebGL context lost:", event);
      event.preventDefault();
      setCanvasKey((prevKey) => prevKey + 1); // Force a re-render of the canvas
    };

    const handleContextRestored = () => {
      console.log("WebGL context restored");
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
    };
  }, []);

  // console.log("ItemArrangeEditor render");

  return (
    <div className="w-full h-full overflow-clip bg-gray-2 test">
      <Canvas ref={canvasRef} key={canvasKey}>
        <PerspectiveCamera
          ref={cameraRef}
          position={props.cameraPosition || [2, 2, 2]}
          makeDefault
          near={0.01}
        />
        <OrbitControls
          makeDefault
          onStart={handleCameraStart}
          onEnd={handleCameraEnd}
        />

        <ambientLight intensity={2.5} />
        <directionalLight position={[5, 10, 5]} intensity={5} />
        <directionalLight position={[0, 0, 10]} intensity={10} />

        <MarkerObject id={props.id} src={props.marker?.src} />

        {props.entities.map((entity) => {
          if (
            props.displayMode === "gallery" &&
            entity.id !== props.selectedEntityId
          ) {
            return null;
          }

          return (
            <TransformableEntity
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
