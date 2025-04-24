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
  getComponent,
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
  Float,
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
  // State to hold the calculated center offset
  const [centerOffset, setCenterOffset] = useState<THREE.Vector3>(
    () => new THREE.Vector3(0, 0, 0)
  );

  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    // This effect calculates the center of the Text3D geometry
    // and updates the state to apply an offset, centering the text.
    const mesh = meshRef.current;
    // Access the Text3D mesh directly (assuming it's the first child)
    const textMesh = mesh?.children[0] as THREE.Mesh;

    if (textMesh?.geometry) {
      // Ensure the geometry's bounding box is computed
      textMesh.geometry.computeBoundingBox();
      const box = textMesh.geometry.boundingBox;

      if (box) {
        const center = box.getCenter(new THREE.Vector3());
        // Calculate the offset needed to move the center to the origin
        const offset = center.clone().negate();
        setCenterOffset(offset);

        // Create a bounding box geometry centered at the origin
        // for the Edges component.
        const size = box.getSize(new THREE.Vector3());
        const geom = new THREE.BoxGeometry(size.x, size.y, size.z);
        // No translation needed here as the BoxGeometry is already centered
        // and will be placed relative to the parent mesh's origin.
        setBoundingGeometry(geom);
      } else {
        // Reset if bounding box calculation fails
        setCenterOffset(new THREE.Vector3(0, 0, 0));
        setBoundingGeometry(undefined);
      }
    } else {
      // Reset if geometry is not available
      setCenterOffset(new THREE.Vector3(0, 0, 0));
      setBoundingGeometry(undefined);
    }
    // Re-run the effect if the entity properties affecting the text change
  }, [entity]);

  return (
    <Suspense fallback={null}>
      {/* The outer mesh remains the pivot point */}
      <mesh ref={composeRefs(ref, meshRef)}>
        {/* Apply the calculated position offset to center the Text3D */}
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
          position={centerOffset} // Apply the centering offset here
        >
          {text}
          <meshLambertMaterial color={color} />
        </Text3D>
        {/* The Edges component uses the centered boundingGeometry */}
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

function useEntityReactComponent(entity: Entity) {
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

  const lookAtCamera = getComponent(entity, "look-at-camera");

  const float = getComponent(entity, "float");

  const { transform } = entity;

  const { data: asset } = useEntityAsset(entity);

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
    if (lookAtCamera?.enabled) {
      const matrixPosition = new THREE.Vector3();
      matrixRef.current.decompose(
        matrixPosition,
        new THREE.Quaternion(),
        new THREE.Vector3()
      );

      // add the matrix position to the camera position
      const cameraTransform = camera.position.clone();
      cameraTransform.add(matrixPosition);

      meshRef.current?.lookAt(cameraTransform);
    } else {
      meshRef.current?.setRotationFromEuler(EulerNull);
    }
  });

  const EntityReactComponent = useEntityReactComponent(entity);

  const entityNode = (
    <EntityReactComponent asset={asset!} entity={entity} ref={meshRef}>
      <Edges
        visible={isSelected}
        scale={1.1}
        renderOrder={1000}
        color="#999"
        lineWidth={1.25}
      />
    </EntityReactComponent>
  );

  return (
    <group onClick={() => onSelect()}>
      <PivotControls
        scale={0.5}
        matrix={matrixRef.current}
        annotations
        onDragStart={() => {
          setIsDragging(true);
        }}
        disableRotations={!isSelected || lookAtCamera?.enabled}
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
        {float?.enabled ? <Float {...float}>{entityNode}</Float> : entityNode}
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
  displayMode: Item["displayMode"];
}

export function ItemArrangeEditor(props: ItemArrangeEditorProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

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

  return (
    <div className="w-full h-full overflow-clip bg-gray-2 test">
      <Canvas ref={canvasRef} key={canvasKey}>
        <PerspectiveCamera
          ref={cameraRef}
          makeDefault
          near={0.01}
          position={[2, 2, 2]}
        />
        <OrbitControls makeDefault />

        <ambientLight intensity={4} />
        <directionalLight position={[5, 10, 5]} intensity={4} />
        <directionalLight position={[0, 0, 10]} intensity={6} />

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
