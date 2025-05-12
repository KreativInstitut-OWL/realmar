import { RefObject, useEffect, useState } from "react";

/**
 * Hook to handle WebGL context loss and restoration
 * @returns A key for forcing re-renders
 * @param canvasRef - Ref to the canvas element
 */
export function useWebGlContextLoss(canvasRef: RefObject<HTMLCanvasElement>) {
  const [canvasKey, setCanvasKey] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleContextLost = (event: Event) => {
      console.error("WebGL context lost:", event);
      event.preventDefault();
      event.stopPropagation();
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
  }, [canvasRef]);

  return canvasKey;
}
