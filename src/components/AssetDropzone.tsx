import {
  Dropzone,
  DropzoneContent,
  DropzoneDragAcceptContent,
  DropzoneProvider,
} from "@/components/ui/dropzone";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { ImagePlusIcon } from "lucide-react";
import { toast } from "sonner";

export function AssetDropzone({
  className,
  ...props
}: React.ComponentProps<typeof Dropzone>) {
  const addAssetsFromFiles = useStore((state) => state.addAssetsFromFiles);

  return (
    <DropzoneProvider
      // accept={{ "image/*": [], "model/*": [".glb"] }}
      onDrop={async (files, fileRejections) => {
        if (fileRejections.length > 0) {
          toast.error(
            "Some files were not accepted. Please check the file types."
          );
          return;
        }
        await addAssetsFromFiles(files);
      }}
    >
      <Dropzone className={cn("group p-8", className)} {...props}>
        <DropzoneContent>
          <ImagePlusIcon className="size-5 mb-4" />
          <div>
            Add one or more assets by dropping them here or click to select
            files.
          </div>
          <div className="text-gray-11">
            Supported file types: images, videos and 3D models (*.glb)
          </div>
        </DropzoneContent>
        <DropzoneDragAcceptContent>
          Drop files here to add them your project…
        </DropzoneDragAcceptContent>
      </Dropzone>
    </DropzoneProvider>
  );
}
