import { useEffect, useMemo } from "react";

/**
 * Creates an object URL for a given file and cleans it up afterwards.
 */
export function useObjectUrl(file: Blob | MediaSource | null | undefined) {
  const objectUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : undefined),
    [file]
  );
  // Cleanup the object URL
  useEffect(() => {
    return () => {
      if (objectUrl) {
        console.log("revoking", objectUrl);
      }
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);
  return objectUrl;
}
