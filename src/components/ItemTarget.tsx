import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useLanguage } from "@/LanguageProvider";
import {
  Dropzone,
  DropzoneDragAcceptContent,
  DropzoneProvider,
} from "@/components/ui/dropzone";
import { useAsset, useCurrentItem, useStore } from "@/store";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { Target } from "./Target";

export function ItemTarget() {
  const item = useCurrentItem();
  const setItemTargetFromFile = useStore(
    (state) => state.setItemTargetFromFile
  );
  const removeItemTarget = useStore((state) => state.removeItemTarget);
  const setItem = useStore((state) => state.setItem);
  const { t } = useLanguage();

  const asset = useAsset(item?.targetAssetId);

  if (!item) return null;

  return (
    <div className="max-w-[512px] p-2">
      <DropzoneProvider
        multiple={false}
        accept={{ "image/*": [] }}
        preventDropOnDocument
        onDrop={(files) => {
          setItemTargetFromFile(item.id, files[0]);
        }}
      >
        <Dropzone className="group p-2 relative aspect-square col-span-1">
          <Target assetId={item.targetAssetId} itemId={item.id} />
          <div className="absolute rounded-full p-2 bg-lime-9 opacity-0 group-hover:opacity-100 transition-opacity">
            <ImagePlusIcon className="size-5" />
          </div>
          <DropzoneDragAcceptContent className="grid aspect-square place-items-center absolute inset-0 bg-gray-1/70 backdrop-blur-xs">
            {t("replaceMarker")}
          </DropzoneDragAcceptContent>
        </Dropzone>
      </DropzoneProvider>
      {asset ? (
        <Button
          size="sm"
          className="mt-2 max-w-full overflow-clip"
          variant="secondary"
          onClick={() => {
            removeItemTarget(item.id);
          }}
        >
          <XIcon />
          <span>
            {t("remove")}{" "}
            <span className="max-w-12 truncate inline-block align-bottom">
              {asset.originalBasename}
            </span>
            .{asset.originalExtension} {t("asMarker")}
          </span>
        </Button>
      ) : null}

      <FormItem className="mt-4 flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <FormLabel>{t("freezeTracking")}</FormLabel>
          <div className="text-sm text-gray-11">{t("freezeTracking_desc")}</div>
        </div>
        <FormControl>
          <Switch
            checked={!!item.freezeOnLost}
            onCheckedChange={(checked) => setItem(item.id, { freezeOnLost: checked })}
          />
        </FormControl>
      </FormItem>
    </div>
  );
}
