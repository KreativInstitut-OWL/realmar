import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Creates an object URL for a given file and cleans it up afterwards.
 */
export function useObjectUrl(object: Blob | MediaSource | null | undefined) {
  const previousObject = useRef<Blob | MediaSource | null | undefined>(null);

  const [url, setUrl] = useState<string | undefined>();

  useLayoutEffect(() => {
    if (!object) return;
    if (object === previousObject.current) return;

    const newUrl = URL.createObjectURL(object);
    setUrl(newUrl);
    previousObject.current = object;
  }, [object]);

  useEffect(() => {
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);

  return url;
}
