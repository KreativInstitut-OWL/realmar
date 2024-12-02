import { Vector3 } from "@/schema";
import {
  GizmoHelper,
  GizmoViewport,
  Grid,
  OrbitControls,
  PivotControls,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import * as THREE from "three";
import { Marker } from "./Marker";

interface Item3dEditorProps {
  id: string;
  lookAt?: "camera";
  rotation: Vector3;
  position: Vector3;
  onPositionChange: (newPosition: Vector3) => void;
  onRotationChange: (newRotation: Vector3) => void;
  transformMode?: "translate" | "rotate" | "scale";
}

function Asset({
  id,
  rotation: rotationProp,
  position: positionProp,
  onPositionChange,
  onRotationChange,
}: Item3dEditorProps) {
  const matrixProp = useMemo(() => {
    const m = new THREE.Matrix4();
    m.makeRotationFromEuler(
      new THREE.Euler(rotationProp.x, rotationProp.y, rotationProp.z)
    );
    m.setPosition(
      new THREE.Vector3(positionProp.x, positionProp.y, positionProp.z)
    );

    return m;
  }, [
    positionProp.x,
    positionProp.y,
    positionProp.z,
    rotationProp.x,
    rotationProp.y,
    rotationProp.z,
  ]);

  const isDragging = useRef(false);

  const matrixRef = useRef<THREE.Matrix4>(matrixProp);

  useEffect(() => {
    if (!isDragging.current && matrixRef.current) {
      matrixRef.current.copy(matrixProp);
    }
  }, [matrixProp]);

  const texture = useMemo(() => {
    return new THREE.TextureLoader().load(
      "https://picsum.photos/id/237/200/300"
    );
  }, []);

  return (
    <PivotControls
      matrix={matrixRef.current}
      annotations
      onDragStart={() => {
        isDragging.current = true;
      }}
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
      }}
      disableScaling
    >
      <mesh>
        <planeGeometry args={[1, 1.5]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
    </PivotControls>
  );
}

const MARKER_TEXTURE_SIZE = 128;

function MarkerObject({ id }: { id: string }) {
  const renderedMarkerTexture = useMemo(() => {
    const container = document.createElement("div");
    const root = createRoot(container);
    flushSync(() => {
      root.render(<Marker id={id ?? ""} />);
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

  console.log(renderedMarkerTexture);

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

export default function Item3dEditor({
  id,
  lookAt,
  rotation,
  position,
  onPositionChange,
  onRotationChange,
}: Item3dEditorProps) {
  return (
    <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [2, 2, 2] }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <axesHelper args={[1]} />
        <OrbitControls makeDefault />
        <MarkerObject id={id} />
        <Asset
          id={id}
          lookAt={lookAt}
          rotation={rotation}
          position={position}
          onPositionChange={onPositionChange}
          onRotationChange={onRotationChange}
        />
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
