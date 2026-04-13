import { renderToStaticMarkup } from "react-dom/server";
import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";
import { ArExperience } from "./ArExperience";
import type { ExportAppState, ExportAsset } from "./export";

vi.mock("@/store", () => ({
  assertIsEntityText: () => {},
  assertIsEntityVideo: () => {},
  getComponent: () => undefined,
}));

vi.mock("./export", () => ({
  assertIsExportEntityWithAsset: () => {},
}));

// prettier-ignore
const identityTransform: THREE.Matrix4Tuple = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
];

const videoAsset: ExportAsset = {
  id: "asset-video-1",
  fileId: "file-video-1",
  type: "video/mp4",
  name: "video.mp4",
  originalBasename: "video",
  originalExtension: "mp4",
  size: 1,
  createdAt: new Date(0),
  updatedAt: new Date(0),
  width: 640,
  height: 360,
  originalWidth: 640,
  originalHeight: 360,
  file: new File([""], "video.mp4", { type: "video/mp4" }),
  path: "./video.mp4",
};

function createExportState({
  autoplay,
  muted,
}: {
  autoplay: boolean;
  muted: boolean;
}): ExportAppState {
  const videoEntity = {
    id: "entity-video-1",
    name: "Video",
    type: "video" as const,
    assetId: videoAsset.id,
    transform: identityTransform,
    components: {},
    editorScaleUniformly: true,
    editorHidden: false,
    autoplay,
    muted,
    loop: true,
    asset: videoAsset,
  };

  return {
    items: [
      {
        id: "item-1",
        index: 0,
        folder: "item-1",
        targetAssetId: null,
        entities: [videoEntity],
        name: null,
        itemDependencyId: null,
        displayMode: "scene",
        link: null,
        editorLinkTransforms: false,
        editorPivotControlScale: 0.5,
        editorCurrentEntityId: null,
        editorCurrentTab: "entities",
      },
    ],
    assets: [],
    projectName: "Test Project",
    editorCurrentItemId: null,
    editorCurrentView: "items",
  };
}

describe("ArExperience export markup", () => {
  it("does not inject a deferred scene-load node", () => {
    const html = renderToStaticMarkup(
      <ArExperience
        state={createExportState({ autoplay: true, muted: true })}
      />,
    );

    expect(html).not.toContain("defer-scene-load");
  });

  it("keeps autoplay and muted intent explicit for exported videos", () => {
    const withAudioHtml = renderToStaticMarkup(
      <ArExperience
        state={createExportState({ autoplay: true, muted: false })}
      />,
    );
    const mutedHtml = renderToStaticMarkup(
      <ArExperience
        state={createExportState({ autoplay: true, muted: true })}
      />,
    );

    expect(withAudioHtml).toContain('data-autoplay="true"');
    expect(withAudioHtml).toContain('data-muted="false"');
    expect(withAudioHtml).not.toContain(' muted=""');
    expect(withAudioHtml).toContain('id="splash-screen"');

    expect(mutedHtml).toContain('data-autoplay="true"');
    expect(mutedHtml).toContain('data-muted="true"');
    expect(mutedHtml).toContain(' muted=""');
    expect(mutedHtml).not.toContain('id="splash-screen"');
  });
});
