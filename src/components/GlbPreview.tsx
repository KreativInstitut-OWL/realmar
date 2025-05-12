import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  useGLTF,
  Center,
  OrbitControls,
  Bounds,
  Environment,
  PerspectiveCamera,
} from "@react-three/drei";
import { ErrorBoundary } from "react-error-boundary";
import { cn } from "@/lib/utils";
import { useObjectUrl } from "@/hooks/useObjectUrl";
import { useFile } from "@/store";
import { useWebGlContextLoss } from "@/hooks/useWebGlContextLoss";

// The 3D model component that loads and renders the GLB
const Model = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
};

// Loading placeholder
const ModelLoader = () => {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="gray" wireframe />
    </mesh>
  );
};

interface GlbPreviewProps {
  fileId: string;
  className?: string;
  autoRotateSpeed?: number;
}

export const GlbPreview = ({
  fileId,
  className,
  autoRotateSpeed = 2,
}: GlbPreviewProps) => {
  const url = useObjectUrl(useFile(fileId));

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const canvasKey = useWebGlContextLoss(canvasRef);

  if (!url) {
    return (
      <div className="flex items-center justify-center w-48 aspect-video">
        Loading...
      </div>
    );
  }

  return (
    <div className={cn("w-48 aspect-video", className)}>
      <ErrorBoundary
        fallback={
          <div className="flex items-center justify-center">
            Failed to load 3D model
          </div>
        }
      >
        <Canvas shadows ref={canvasRef} key={canvasKey}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />

          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

          {/* Model with loading state */}
          <Suspense fallback={<ModelLoader />}>
            <Bounds fit clip observe margin={1.2}>
              <Center>
                <Model url={url} />
              </Center>
            </Bounds>
            <Environment preset="city" />
          </Suspense>

          {/* Controls for auto-rotation */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={autoRotateSpeed}
          />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};
