import { useObjectUrl } from "@/hooks/useObjectUrl";
import { loadAnimatedImageContainer } from "@/lib/animated-image-loader";
import { loadComposedTexture } from "@/lib/load-composed-texture";
import {
  createSquareThreeTextureFromSrc,
  renderSvgReactNodeToBase64Src,
} from "@/lib/render";
import { cn } from "@/lib/utils";
import {
  assertIsEntityModel,
  assertIsEntityText,
  assertIsEntityVideo,
  Asset,
  Entity,
  getComponent,
  isAssetFont,
  isEntityImage,
  isEntityModel,
  isEntityText,
  isEntityVideo,
  isEntityWithAsset,
  Item,
  useAsset,
  useFile,
  useStore,
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
import { Eye } from "lucide-react";
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
import { Button } from "./ui/button";
import { contentVariants } from "./ui/styles/menu";

const EulerNull = new THREE.Euler(0, 0, 0);

const EntityImageComponent = forwardRef<
  THREE.Mesh,
  { asset: Asset | null; file: File | null; children: React.ReactNode }
>(({ asset, file, children }, ref) => {
  const src = useObjectUrl(file);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);

  useEffect(() => {
    if (!file) {
      setTexture(null);
      return;
    }

    let isMounted = true;

    if (asset?.isAnimated) {
      // Load animated texture - ensure ComposedTexture is loaded first
      Promise.all([loadComposedTexture(), loadAnimatedImageContainer(file)])
        .then(async ([, container]) => {
          if (!isMounted) return;
          // Use window.THREE.ComposedTexture since that's where ComposedTexture.js registers it
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const windowThree = (window as any).THREE;
          if (!windowThree?.ComposedTexture) {
            throw new Error("ComposedTexture not available on window.THREE");
          }
          const ComposedTextureClass = windowThree.ComposedTexture;
          // Create empty and assign container (recommended for async loading)
          const composedTexture = new ComposedTextureClass();
          // ComposedTexture.assign() is async and needs to be awaited
          await composedTexture.assign(container);
          if (!isMounted) return;

          // Wait for texture to be ready
          if (!composedTexture.ready) {
            await new Promise<void>((resolve) => {
              composedTexture.addEventListener("ready", () => resolve(), {
                once: true,
              });
            });
          }

          if (!isMounted) return;

          // Ensure texture is playing (autoplay should handle this, but let's be explicit)
          if (!composedTexture.isPlaying) {
            composedTexture.play();
          }

          setTexture(composedTexture);
        })
        .catch((error) => {
          if (!isMounted) return;
          console.error(
            "Failed to load animated texture, falling back to regular texture:",
            error
          );
          const fallbackTexture = new THREE.TextureLoader().load(src!);
          setTexture(fallbackTexture);
        });
    } else {
      // Load regular texture
      const regularTexture = new THREE.TextureLoader().load(src!);
      setTexture(regularTexture);
    }

    return () => {
      isMounted = false;
    };
  }, [src, file, asset?.isAnimated, asset?.id]);

  // Force material update when texture changes (especially for ComposedTexture)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const composedTexture = texture as any;
    if (texture && composedTexture.isComposedTexture) {
      // ComposedTexture updates its canvas, so we need to mark it for update
      texture.needsUpdate = true;
      // Also ensure the texture is playing
      if (!composedTexture.isPlaying) {
        composedTexture.play();
      }
      // Update material when texture changes
      if (materialRef.current) {
        materialRef.current.needsUpdate = true;
      }
    }
  }, [texture]);

  // Continuously update ComposedTexture animations and material
  useFrame((_, delta) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const composedTexture = texture as any;
    if (texture && composedTexture.isComposedTexture) {
      // Update the texture animation (delta is in seconds)
      composedTexture.update(delta);
      // Ensure material sees texture updates
      if (texture.needsUpdate && materialRef.current) {
        materialRef.current.needsUpdate = true;
      }
    }
  });

  useEffect(() => {
    return () => {
      if (texture) texture.dispose();
    };
  }, [texture]);

  if (!texture || !asset || !file) {
    return null;
  }

  return (
    <mesh ref={ref} renderOrder={1000}>
      <planeGeometry args={[asset.width!, asset.height!]} />
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        side={THREE.DoubleSide}
        transparent={true}
        alphaTest={0.1}
      />
      {children}
    </mesh>
  );
});

const EntityVideoComponent = forwardRef<
  THREE.Mesh,
  {
    asset: Asset | null;
    file: File | null;
    entity: Entity;
    children: React.ReactNode;
  }
>(({ asset, file, entity, children }, ref) => {
  assertIsEntityVideo(entity);

  const src = useObjectUrl(file);

  if (!src) return null;

  return (
    <EntityVideoComponentImpl asset={asset} src={src!} ref={ref}>
      {children}
    </EntityVideoComponentImpl>
  );
});

const EntityVideoComponentImpl = forwardRef<
  THREE.Mesh,
  {
    asset: Asset | null;
    src: string;
    children: React.ReactNode;
  }
>(({ asset, src, children }, ref) => {
  const texture = useVideoTexture(src);

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
      <meshLambertMaterial
        map={texture}
        side={THREE.DoubleSide}
        transparent={true}
        alphaTest={0.1}
      />
      {children}
    </mesh>
  );
});

const EntityModelComponent = forwardRef<
  THREE.Mesh,
  {
    asset: Asset | null;
    file: File | null;
    entity: Entity;
    children: React.ReactNode;
  }
>(({ file, entity, children }, ref) => {
  assertIsEntityModel(entity);

  const [gltf, setGltf] = useState<GLTF>();
  const [mixer, setMixer] = useState<THREE.AnimationMixer>();

  const { playAnimation } = entity;

  useEffect(() => {
    if (!file) return;

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
    reader.readAsArrayBuffer(file);

    return () => {
      isMounted = false;
    };
  }, [file]);

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
    font,
  } = entity;

  const fontAsset = useAsset(isAssetFont(font) ? font.assetId : null);
  const fontFile = useFile(fontAsset?.fileId);
  const fontUrl = useObjectUrl(fontFile);

  const [boundingGeometry, setBoundingGeometry] =
    useState<THREE.BufferGeometry>();
  const [centerOffset, setCenterOffset] = useState<THREE.Vector3>(
    () => new THREE.Vector3(0, 0, 0)
  );
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Mesh>();
  const [fontLoaded, setFontLoaded] = useState(false);

  const calculateCentering = () => {
    const textMesh = textRef.current;

    if (textMesh?.geometry) {
      // Ensure the geometry's bounding box is computed
      textMesh.geometry.computeBoundingBox();
      const box = textMesh.geometry.boundingBox;

      if (box) {
        const center = box.getCenter(new THREE.Vector3());
        // Calculate the offset needed to move the center to the origin
        const offset = center.clone().negate();
        setCenterOffset(offset);

        // Create a bounding box geometry for the Edges component
        const size = box.getSize(new THREE.Vector3());
        const geom = new THREE.BoxGeometry(size.x, size.y, size.z);
        setBoundingGeometry(geom);
      }
    }
  };

  // Handle font loading completion
  useEffect(() => {
    if (fontLoaded && textRef.current) {
      calculateCentering();
    }
  }, [
    fontLoaded,
    text,
    fontSize,
    height,
    lineHeight,
    letterSpacing,
    bevelSize,
    bevelThickness,
    curveSegments,
    font,
  ]);

  // If a custom font is selected but not yet loaded, do not render the text until available
  if (isAssetFont(font) && !fontUrl) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <mesh ref={composeRefs(ref, meshRef)}>
        <Text3D
          ref={(mesh) => {
            if (mesh) {
              textRef.current = mesh;
              setFontLoaded(true);
            }
          }}
          font={isAssetFont(font) ? (fontUrl as string) : font.path}
          bevelEnabled
          lineHeight={lineHeight}
          letterSpacing={letterSpacing}
          size={fontSize}
          height={height}
          curveSegments={curveSegments}
          bevelSize={bevelSize}
          bevelThickness={bevelThickness}
          position={centerOffset}
          onAfterRender={() => {
            if (textRef.current && !fontLoaded) {
              setFontLoaded(true);
            }
          }}
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

function Turntable({
  enabled,
  speed,
  axis,
  children,
}: {
  enabled?: boolean;
  speed?: number;
  axis?: "x" | "y" | "z";
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const originalRotationRef = useRef<THREE.Euler | null>(null);
  const turntableRotationRef = useRef(0);

  // Initialize original rotation when component mounts
  useEffect(() => {
    if (!groupRef.current) return;
    originalRotationRef.current = groupRef.current.rotation.clone();
  }, []);

  // Reset turntable rotation when axis changes
  useEffect(() => {
    turntableRotationRef.current = 0;
    if (!groupRef.current || !originalRotationRef.current) return;
    // Restore original rotation
    groupRef.current.rotation.copy(originalRotationRef.current);
  }, [axis]);

  useFrame((_, delta) => {
    if (
      !enabled ||
      !groupRef.current ||
      speed === undefined ||
      axis === undefined ||
      !originalRotationRef.current
    )
      return;

    // Accumulate turntable rotation
    turntableRotationRef.current += speed * delta;

    // Apply turntable rotation to the group (on top of original rotation)
    const group = groupRef.current;
    group.rotation.copy(originalRotationRef.current);
    group.rotation[axis] =
      originalRotationRef.current[axis] + turntableRotationRef.current;
  });

  return <group ref={groupRef}>{children}</group>;
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

  const turntable = getComponent(entity, "turntable");

  const { transform } = entity;

  const asset = useAsset(isEntityWithAsset(entity) ? entity.assetId : null);

  const file = useFile(asset?.fileId);

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
    <EntityReactComponent
      asset={asset!}
      file={file!}
      entity={entity}
      ref={meshRef}
    >
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
        {float?.enabled ? (
          <Float {...float}>
            {turntable?.enabled ? (
              <Turntable {...turntable}>{entityNode}</Turntable>
            ) : (
              entityNode
            )}
          </Float>
        ) : turntable?.enabled ? (
          <Turntable {...turntable}>{entityNode}</Turntable>
        ) : (
          entityNode
        )}
      </PivotControls>
    </group>
  );
}

const MARKER_TEXTURE_SIZE = 512;

function MarkerObject({ id, asset }: { id: string; asset: Asset | undefined }) {
  const file = useFile(asset?.fileId);
  const src = useObjectUrl(file);

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
  marker: Asset | undefined;
  displayMode: Item["displayMode"];
}

export function ItemArrangeEditor(props: ItemArrangeEditorProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [canvasKey, setCanvasKey] = useState(0);

  // Load ComposedTexture.js on mount
  useEffect(() => {
    loadComposedTexture().catch((error) => {
      console.warn("Failed to load ComposedTexture.js:", error);
    });
  }, []);

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

  const ref = useRef<HTMLDivElement>(null);

  const selectedEntityHidden = useMemo(() => {
    return props.entities.find((e) => e.id === props.selectedEntityId)
      ?.editorHidden;
  }, [props.entities, props.selectedEntityId]);

  return (
    <div className="w-full h-full overflow-clip bg-gray-2 relative" ref={ref}>
      {selectedEntityHidden ? (
        <div
          className={cn(
            contentVariants(),
            "px-2 h-11 flex items-center absolute bottom-4 right-1/2 translate-x-1/2 z-10 gap-2"
          )}
        >
          <p className="text-sm text-gray-11">
            The currently selected entity is hidden in the editor.{" "}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              useStore
                .getState()
                .setItemEntity(props.id, props.selectedEntityId!, {
                  editorHidden: false,
                })
            }
          >
            <Eye /> Show entity
          </Button>
        </div>
      ) : null}

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

        <Suspense>
          <MarkerObject id={props.id} asset={props.marker} />
        </Suspense>

        {props.entities.map((entity) => {
          if (entity.editorHidden) {
            return null;
          }

          if (
            props.displayMode === "gallery" &&
            entity.id !== props.selectedEntityId
          ) {
            return null;
          }

          return (
            <Suspense key={entity.id}>
              <TransformableEntity
                entity={entity}
                isSelected={entity.id === props.selectedEntityId}
                onSelect={() => props.onSelectEntity(entity.id)}
                onTransformChange={props.onTransformChange}
              />
            </Suspense>
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
