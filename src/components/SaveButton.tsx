import { Save } from "lucide-react";
import { Button } from "./ui/button";

import { save } from "@/store/save";

export function SaveButton() {
  return (
    <Button
      variant="secondary"
      onClick={() => {
        save();
      }}
      type="button"
    >
      Save
      <Save />
    </Button>
  );
}
