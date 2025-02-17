import { FolderOpen } from "lucide-react";
import { Button } from "./ui/button";

import { load } from "@/store/save";

export function LoadButton() {
  return (
    <Button
      variant="secondary"
      onClick={() => {
        // ask for file
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".batchar";
        input.onchange = () => {
          const files = input.files;
          if (files && files.length > 0) {
            load(files[0]);
          }
        };
        input.click();
      }}
      type="button"
    >
      Load
      <FolderOpen />
    </Button>
  );
}
