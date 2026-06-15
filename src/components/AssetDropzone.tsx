import {
  Dropzone,
  DropzoneContent,
  DropzoneDragAcceptContent,
  DropzoneProvider,
} from "@/components/ui/dropzone";
import { cn } from "@/lib/utils";
import { ImagePlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/LanguageProvider";

export function AssetDropzone({
  className,
  onFiles,
  ...props
}: React.ComponentProps<typeof Dropzone> & {
  onFiles: (files: File[]) => void;
}) {
  const { t } = useLanguage();
  return (
    <DropzoneProvider
      // accept={{ "image/*": [], "model/*": [".glb"] }}
      onDrop={(files, fileRejections) => {
        if (fileRejections.length > 0) {
          toast.error(
            t("filesNotAccepted")
          );
          return;
        }

        onFiles(files);
      }}
    >
      <Dropzone className={cn("group p-6", className)} {...props}>
        <DropzoneContent className="text-sm">
          <ImagePlusIcon className="size-4 mb-4" />
          <div>
            {t("dropFilesInstruction")}
          </div>
          <div className="text-gray-11">
            {t("supportedFileTypes")}
          </div>
        </DropzoneContent>
        <DropzoneDragAcceptContent>
          {t("dropFilesHere")}
        </DropzoneDragAcceptContent>
      </Dropzone>
    </DropzoneProvider>
  );
}
