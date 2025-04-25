import { cn } from "@/lib/utils";
import { Asset } from "@/store";
import {
  FileBox,
  FileImage,
  FileQuestion,
  FileVideo,
  LucideProps,
} from "lucide-react";
import { forwardRef } from "react";

const mimeTypeIcons: Record<
  string,
  React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >
> = {
  image: FileImage,
  model: FileBox,
  video: FileVideo,
};

export const AssetIcon = forwardRef<
  SVGSVGElement,
  { asset: Asset } & LucideProps
>(({ asset, className, ...props }, ref) => {
  const type = asset.type;

  const iconKey = Object.keys(mimeTypeIcons).find(
    (key) => type === key || type.startsWith(key)
  );

  const Icon = iconKey ? mimeTypeIcons[iconKey] : FileQuestion;

  return (
    <Icon
      ref={ref}
      className={cn(
        "size-4 text-gray-11 aria-selected:text-azure-11",
        className
      )}
      {...props}
    />
  );
});

AssetIcon.displayName = "AssetIcon";
