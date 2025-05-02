import { useEffect, useState, useRef } from "react";

export function useObjectUrl(object: Blob | MediaSource | null | undefined) {
  const [url, setUrl] = useState<string | undefined>();
  const urlRef = useRef<string | undefined>();

  useEffect(() => {
    if (!object) {
      // Clean up previous URL if object becomes null/undefined
      if (urlRef.current) {
        // console.log("Revoking object URL", urlRef.current);
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = undefined;
        setUrl(undefined);
      }
      return;
    }

    // Create new URL
    const newUrl = URL.createObjectURL(object);
    // console.log("Creating object URL", newUrl);
    urlRef.current = newUrl;
    setUrl(newUrl);

    // Cleanup function
    return () => {
      // console.log("Revoking object URL", newUrl);
      URL.revokeObjectURL(newUrl);
    };
  }, [object]);

  return url;
}
