import { ExportAsset } from "./export";
function ArExperienceImport(asset: ExportAsset) {
  if (asset.fileType.includes("image")) {
    return <img key={asset.id} id={asset.id} src={`${asset.path}`} />;
  }
  if (asset.fileType.includes("video")) {
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
  if (asset.fileType.includes("model")) {
    return <a-asset-item key={asset.id} id={asset.id} src={`${asset.path}`} />;
  }
}

export default ArExperienceImport;
