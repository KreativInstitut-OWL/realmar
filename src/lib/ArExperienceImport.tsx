import { assertIsEntityVideo } from "@/store";
import { ExportEntity } from "./export";
function ArExperienceImport({ entity }: { entity: ExportEntity }) {
  if (!("asset" in entity)) {
    return null;
  }
  const { asset } = entity;

  if (asset.type.includes("image")) {
    return (
      <img key={asset.id} id={`asset_${asset.id}`} src={`${asset.path}`} />
    );
  }

  if (asset.type.includes("video")) {
    assertIsEntityVideo(entity);
    return (
      <video
        key={asset.id}
        id={`asset_${asset.id}`}
        src={`${asset.path}`}
        loop={entity.loop ? true : undefined}
        data-autoplay={entity.autoplay ? true : undefined}
        muted={entity.muted ? true : undefined}
        playsInline={true}
        crossOrigin="anonymous"
      />
    );
  }
  if (asset.type.includes("model")) {
    return (
      <a-asset-item
        key={asset.id}
        id={`asset_${asset.id}`}
        src={`${asset.path}`}
      />
    );
  }
}

export default ArExperienceImport;
