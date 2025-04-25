import * as React from "react";

export function useOutsideClick(
  ref: React.RefObject<HTMLElement>,
  callback: () => void
) {
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // also ignore all clicks on the context menus ([data-radix-popper-content-wrapper])
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        !document
          .querySelector("[data-radix-popper-content-wrapper]")
          ?.contains(event.target as Node)
      ) {
        callback();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}
