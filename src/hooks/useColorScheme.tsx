import { useSyncExternalStore } from "react";

export type ColorScheme = "light" | "dark";

export function useColorScheme() {
  // This function creates a subscription to class changes on the document.documentElement
  const subscribe = (callback: () => void) => {
    if (typeof window === "undefined") return () => {};

    let lastClassString = document.documentElement.classList.toString();

    const mutationObserver = new MutationObserver((mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.attributeName === "class") {
          const classString = document.documentElement.classList.toString();
          if (classString !== lastClassString) {
            callback();
            lastClassString = classString;
            break;
          }
        }
      }
    });

    mutationObserver.observe(document.documentElement, {
      attributeFilter: ["class"],
    });

    return () => mutationObserver.disconnect();
  };

  // This function gets the current state of the color scheme
  const getSnapshot = () => {
    if (typeof window === "undefined") return "light";
    return document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  };

  // Use the useSyncExternalStore hook to keep React in sync with the DOM
  const colorScheme = useSyncExternalStore<ColorScheme>(
    subscribe,
    getSnapshot,
    // Server-side snapshot
    () => "light"
  );

  // Function to set the color scheme
  const setColorScheme = (scheme: ColorScheme) => {
    if (typeof window === "undefined") return;

    if (scheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return [colorScheme, setColorScheme] as const;
}
