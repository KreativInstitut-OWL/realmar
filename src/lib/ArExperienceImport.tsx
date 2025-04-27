import { ExportAsset } from "./export";
function ArExperienceImport(asset: ExportAsset) {
  if (asset.type.includes("image")) {
    return <img key={asset.id} id={asset.id} src={`${asset.path}`} />;
  }
  if (asset.type.includes("video")) {
    return (
      <video
        key={asset.id}
        id={asset.id}
        src={`${asset.path}`}
        loop
        autoPlay
        muted
      />
    );
  }
  if (asset.type.includes("model")) {
    return <a-asset-item key={asset.id} id={asset.id} src={`${asset.path}`} />;
  }
}

export default ArExperienceImport;
