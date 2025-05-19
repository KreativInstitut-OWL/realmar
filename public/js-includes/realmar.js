/**
 * @typedef {import('aframe')}
 * @typedef {import('three')}
 */

import "https://cdn.jsdelivr.net/npm/aframe@1.7.0/dist/aframe-master.min.js";
import "https://cdn.jsdelivr.net/npm/aframe-extras@7.5.4/dist/aframe-extras.min.js";
import "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.min.js";

const AFRAME = window.AFRAME;
const THREE = window.THREE;

// #region look-at

AFRAME.registerComponent("look-at", {
  schema: { type: "selector" },

  init: function () {},

  tick: function () {
    // TODO: fix look-at
    // this.el.object3D.lookAt(this.data.object3D.position);
  },
});

// #region quaternion

AFRAME.registerComponent("quaternion", {
  schema: { type: "vec4" },

  update: function () {
    const data = this.data;
    const object3D = this.el.object3D;
    object3D.quaternion.set(data.x, data.y, data.z, data.w);
  },

  remove: function () {
    this.el.object3D.quaternion.set(0, 0, 0, 1);
  },
});

// #region text-3d

/**
 * TextGeometry from three-stdlib
 */
/**
 * TextGeometry creates 3D text geometry by extending THREE.ExtrudeGeometry
 * @extends THREE.ExtrudeGeometry
 */
class TextGeometry extends THREE.ExtrudeGeometry {
  /**
   * Creates a new text geometry
   * @param {string} text - The text to be rendered as 3D geometry
   * @param {Object} [parameters={}] - Configuration options
   * @param {boolean} [parameters.bevelEnabled=false] - Whether to use beveling
   * @param {number} [parameters.bevelSize=8] - Size of the bevel
   * @param {number} [parameters.bevelThickness=10] - Thickness of the bevel
   * @param {Object} [parameters.font] - Font object used to generate text shapes
   * @param {number} [parameters.height=50] - Height/extrusion depth of the text
   * @param {number} [parameters.size=100] - Font size
   * @param {number} [parameters.lineHeight=1] - Line height factor
   * @param {number} [parameters.letterSpacing=0] - Spacing between letters
   */
  constructor(text, parameters = {}) {
    const {
      bevelEnabled = false,
      bevelSize = 8,
      bevelThickness = 10,
      font,
      height = 50,
      size = 100,
      lineHeight = 1,
      letterSpacing = 0,
      ...rest
    } = parameters;
    if (font === void 0) {
      super();
    } else {
      const shapes = font.generateShapes(text, size, {
        lineHeight,
        letterSpacing,
      });
      super(shapes, {
        ...rest,
        bevelEnabled,
        bevelSize,
        bevelThickness,
        depth: height,
      });
    }
    this.type = "TextGeometry";
  }
}

export class FontLoader extends THREE.Loader {
  constructor(manager) {
    super(manager);
  }

  load(url, onLoad, onProgress, onError) {
    const loader = new THREE.FileLoader(this.manager);

    loader.setPath(this.path);
    loader.setRequestHeader(this.requestHeader);
    loader.setWithCredentials(this.withCredentials);

    loader.load(
      url,
      (response) => {
        if (typeof response !== "string")
          throw new Error("unsupported data type");

        const json = JSON.parse(response);

        const font = this.parse(json);

        if (onLoad) onLoad(font);
      },
      onProgress,
      onError
    );
  }

  loadAsync(url, onProgress) {
    return super.loadAsync(url, onProgress);
  }

  parse(json) {
    return new Font(json);
  }
}

export class Font {
  isFont = true;
  type = "Font";

  constructor(data) {
    this.data = data;
  }

  generateShapes(text, size = 100, _options) {
    const shapes = [];
    const options = { letterSpacing: 0, lineHeight: 1, ..._options };
    const paths = createPaths(text, size, this.data, options);
    for (let p = 0, pl = paths.length; p < pl; p++) {
      Array.prototype.push.apply(shapes, paths[p].toShapes(false));
    }
    return shapes;
  }
}

function createPaths(text, size, data, options) {
  const chars = Array.from(text);
  const scale = size / data.resolution;
  const line_height =
    (data.boundingBox.yMax - data.boundingBox.yMin + data.underlineThickness) *
    scale;

  const paths = [];

  let offsetX = 0,
    offsetY = 0;

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    if (char === "\n") {
      offsetX = 0;
      offsetY -= line_height * options.lineHeight;
    } else {
      const ret = createPath(char, scale, offsetX, offsetY, data);
      if (ret) {
        offsetX += ret.offsetX + options.letterSpacing;
        paths.push(ret.path);
      }
    }
  }

  return paths;
}

function createPath(char, scale, offsetX, offsetY, data) {
  const glyph = data.glyphs[char] || data.glyphs["?"];

  if (!glyph) {
    console.error(
      'THREE.Font: character "' +
        char +
        '" does not exists in font family ' +
        data.familyName +
        "."
    );
    return;
  }

  const path = new THREE.ShapePath();

  let x, y, cpx, cpy, cpx1, cpy1, cpx2, cpy2;

  if (glyph.o) {
    const outline =
      glyph._cachedOutline || (glyph._cachedOutline = glyph.o.split(" "));

    for (let i = 0, l = outline.length; i < l; ) {
      const action = outline[i++];

      switch (action) {
        case "m": // moveTo
          x = parseInt(outline[i++]) * scale + offsetX;
          y = parseInt(outline[i++]) * scale + offsetY;

          path.moveTo(x, y);

          break;

        case "l": // lineTo
          x = parseInt(outline[i++]) * scale + offsetX;
          y = parseInt(outline[i++]) * scale + offsetY;

          path.lineTo(x, y);

          break;

        case "q": // quadraticCurveTo
          cpx = parseInt(outline[i++]) * scale + offsetX;
          cpy = parseInt(outline[i++]) * scale + offsetY;
          cpx1 = parseInt(outline[i++]) * scale + offsetX;
          cpy1 = parseInt(outline[i++]) * scale + offsetY;

          path.quadraticCurveTo(cpx1, cpy1, cpx, cpy);

          break;

        case "b": // bezierCurveTo
          cpx = parseInt(outline[i++]) * scale + offsetX;
          cpy = parseInt(outline[i++]) * scale + offsetY;
          cpx1 = parseInt(outline[i++]) * scale + offsetX;
          cpy1 = parseInt(outline[i++]) * scale + offsetY;
          cpx2 = parseInt(outline[i++]) * scale + offsetX;
          cpy2 = parseInt(outline[i++]) * scale + offsetY;

          path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, cpx, cpy);

          break;
      }
    }
  }

  return { offsetX: glyph.ha * scale, path };
}

/**
 * @typedef {Object} Text3DData
 * @property {string} text
 * @property {string} font
 * @property {number} size
 * @property {number} height
 * @property {number} curveSegments
 * @property {boolean} bevelEnabled
 * @property {number} bevelThickness
 * @property {number} bevelSize
 * @property {number} bevelOffset
 * @property {number} bevelSegments
 * @property {string} material
 * @property {string|number} color
 * @property {number} lineHeight
 * @property {number} letterSpacing
 */

/**
 * Creates 3D text geometry using THREE.TextGeometry.
 * Requires THREE.FontLoader and THREE.TextGeometry to be available.
 * Make sure your A-Frame build includes these or load Three.js separately.
 *
 * @this {AFRAME.Component & {data: Text3DData}}
 */
AFRAME.registerComponent("text-3d", {
  schema: {
    text: { type: "string", default: "Hello three.js!" },
    font: {
      type: "string",
      default:
        "https://cdn.jsdelivr.net/npm/three@0.163.0/examples/fonts/helvetiker_regular.typeface.json",
    }, // Path to Three.js font JSON file
    size: { type: "number", default: 1 }, // Corresponds to TextGeometry 'size', adjusted default for A-Frame scale
    height: { type: "number", default: 0.1 }, // Corresponds to TextGeometry 'height', adjusted default
    curveSegments: { type: "int", default: 12 },
    bevelEnabled: { type: "boolean", default: false },
    bevelThickness: { type: "number", default: 0.1 }, // Adjusted default
    bevelSize: { type: "number", default: 0.05 }, // Adjusted default
    bevelOffset: { type: "number", default: 0 },
    bevelSegments: { type: "int", default: 3 },
    material: { type: "string", default: "" }, // Optional: reference existing material component
    color: { type: "color", default: "#FFF" }, // Default color if no material specified
    lineHeight: { type: "number", default: 1 }, // Line height factor
    letterSpacing: { type: "number", default: 0 }, // Spacing between letters
  },
  init: function () {
    this.loader = new FontLoader();
    this.font = null;
    this.geometry = null;
    this.mesh = null;
    this.material = null;

    this.loadFont();
  },

  /**
   * @param {Text3DData} oldData
   */
  update: function (oldData) {
    /** @type {Text3DData} */
    const data = this.data;
    let needsUpdate = false;
    let needsFontReload = false;

    // Check if font needs reloading
    if (oldData && data.font !== oldData.font) {
      needsFontReload = true;
    }

    // Check if geometry needs rebuilding
    for (const key in data) {
      if (
        key !== "font" &&
        key !== "material" &&
        key !== "color" &&
        oldData &&
        data[key] !== oldData[key]
      ) {
        needsUpdate = true;
        break;
      }
    }

    // Check if material needs update
    if (
      oldData &&
      (data.material !== oldData.material || data.color !== oldData.color)
    ) {
      needsUpdate = true; // Need to update mesh material reference or color
    }

    if (needsFontReload) {
      this.loadFont(); // This will trigger createTextGeometry eventually
    } else if (needsUpdate && this.font) {
      this.createTextGeometry(); // Rebuild geometry or update material
    } else if (!this.mesh && this.font) {
      // Initial creation after font load
      this.createTextGeometry();
    }
  },

  loadFont: function () {
    this.loader.load(
      this.data.font,
      (font) => {
        this.font = font;
        this.createTextGeometry();
      },
      undefined,
      (err) => {
        console.error("Could not load font: ", err);
      }
    );
  },

  createTextGeometry: function () {
    /** @type {Text3DData} */
    const data = this.data;

    // Dispose old geometry if it exists
    if (this.geometry) {
      this.geometry.dispose();
    }

    // Create new geometry
    this.geometry = new TextGeometry(data.text, {
      font: this.font,
      size: data.size,
      height: data.height,
      curveSegments: data.curveSegments,
      bevelEnabled: data.bevelEnabled,
      bevelThickness: data.bevelThickness,
      bevelSize: data.bevelSize,
      bevelOffset: data.bevelOffset,
      bevelSegments: data.bevelSegments,
      lineHeight: data.lineHeight,
      letterSpacing: data.letterSpacing,
    });

    // Center the geometry
    this.geometry.computeBoundingBox();

    const box = this.geometry.boundingBox;

    if (box) {
      const center = box.getCenter(new THREE.Vector3());
      // Calculate the offset needed to move the center to the origin
      const offset = center.clone().negate();

      // Apply the offset to the geometry
      this.geometry.translate(offset.x, offset.y, offset.z);
    }

    // Material handling
    let materialComponent = null;
    if (data.material && this.el.sceneEl.systems.material) {
      materialComponent =
        this.el.sceneEl.systems.material.materials[data.material];
    }

    if (materialComponent) {
      this.material = materialComponent;
    } else {
      // Dispose old internally managed material
      if (this.mesh && this.mesh.material && !this.mesh.material.isShared) {
        this.mesh.material.dispose();
      }
      // Create new lambert material if no external one is provided
      this.material = new THREE.MeshLambertMaterial({ color: data.color });
      this.material.isShared = false; // Mark as not shared
    }

    // Create or update mesh
    if (!this.mesh) {
      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.el.setObject3D("mesh", this.mesh);
    } else {
      this.mesh.geometry = this.geometry;
      this.mesh.material = this.material;
    }
  },

  remove: function () {
    if (this.geometry) {
      this.geometry.dispose();
      this.geometry = null;
    }
    // Only dispose internally managed material
    if (this.mesh && this.mesh.material && !this.mesh.material.isShared) {
      this.mesh.material.dispose();
    }
    if (this.mesh) {
      this.el.removeObject3D("mesh");
      this.mesh = null;
    }
    this.font = null;
    this.loader = null;
  },
});

// #endregion text-3d

// #region mindar-image-target

// delete AFRAME.components["mindar-image-system"] to override the default from mind-ar
delete AFRAME.components["mindar-image-target"];

AFRAME.registerComponent("mindar-image-target", {
  dependencies: ["mindar-image-system"],

  schema: {
    targetIndex: { type: "number" },
  },

  postMatrix: null, // rescale the anchor to make width of 1 unit = physical width of card

  init: function () {
    const arSystem = this.el.sceneEl.systems["mindar-image-system"];
    arSystem.registerAnchor(this, this.data.targetIndex);

    this.invisibleMatrix = new AFRAME.THREE.Matrix4().set(
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    );

    this.el.object3D.matrixAutoUpdate = false;

    this._hide();
  },

  _hide: function () {
    const root = this.el.object3D;
    root.visible = false;
    root.matrix = this.invisibleMatrix;
  },

  setupMarker([markerWidth, markerHeight]) {
    const position = new AFRAME.THREE.Vector3();
    const quaternion = new AFRAME.THREE.Quaternion();
    const scale = new AFRAME.THREE.Vector3();
    position.x = markerWidth / 2;
    position.y = markerWidth / 2 + (markerHeight - markerWidth) / 2;
    scale.x = markerWidth;
    scale.y = markerWidth;
    scale.z = markerWidth;
    this.postMatrix = new AFRAME.THREE.Matrix4();
    this.postMatrix.compose(position, quaternion, scale);
  },

  updateWorldMatrix(worldMatrix) {
    const hiddenByDependsOn =
      this.el.hasAttribute("realmar-depends-on") &&
      !this.el.components["realmar-depends-on"].didFindDependency;
    if (hiddenByDependsOn) {
      console.warn("Not showing target due to realmar-depends-on");
      worldMatrix = null;
    }

    this.el.emit("targetUpdate");
    if (!this.el.object3D.visible && worldMatrix !== null) {
      this.el.emit("targetFound");
    } else if (this.el.object3D.visible && worldMatrix === null) {
      this.el.emit("targetLost");
    }

    this.el.object3D.visible = worldMatrix !== null;
    if (worldMatrix === null) {
      this.el.object3D.matrix = this.invisibleMatrix;
      return;
    }
    var m = new AFRAME.THREE.Matrix4();
    m.elements = worldMatrix;
    m.multiply(this.postMatrix);
    this.el.object3D.matrix = m;
  },
});

// #endregion mindar-image-target

// #region float

/**
 * @typedef {Object} FloatData
 * @property {boolean} enabled - Whether the floating effect is active
 * @property {number} speed - Speed of the floating animation
 * @property {number} rotationIntensity - Intensity of rotation effect
 * @property {number} intensity - Intensity of vertical floating motion
 * @property {number} floatingRangeMin - Minimum value for the float range
 * @property {number} floatingRangeMax - Maximum value for the float range
 * @property {boolean} autoInvalidate - Whether to force updates on materials
 */

/**
 * Adds a gentle floating animation to an entity.
 * Creates smooth oscillating movement and rotation similar to drei's Float component.
 *
 * @this {AFRAME.Component & {data: FloatData}}
 */
AFRAME.registerComponent("float", {
  schema: {
    enabled: { type: "boolean", default: true },
    speed: { type: "number", default: 1 },
    rotationIntensity: { type: "number", default: 1 },
    intensity: { type: "number", default: 1 },
    floatingRangeMin: { type: "number", default: -0.1 },
    floatingRangeMax: { type: "number", default: 0.1 },
    autoInvalidate: { type: "boolean", default: false },
  },

  init: function () {
    // Random offset like in the original component
    this.offset = Math.random() * 10000;

    // Store original values
    this.originalY = this.el.object3D.position.y || 0;

    // Store original matrix auto update setting
    this.wasMatrixAutoUpdate = this.el.object3D.matrixAutoUpdate;

    // Disable automatic matrix updates for performance
    this.el.object3D.matrixAutoUpdate = false;
  },

  tick: function (time) {
    /** @type {FloatData} */
    const data = this.data;

    if (!data.enabled || data.speed === 0) return;

    const t = this.offset + time / 1000; // Convert ms to seconds like THREE.Clock.elapsedTime
    const speed = data.speed;
    const rotationIntensity = data.rotationIntensity;

    // Apply rotations
    this.el.object3D.rotation.x =
      (Math.cos((t / 4) * speed) / 8) * rotationIntensity;
    this.el.object3D.rotation.y =
      (Math.sin((t / 4) * speed) / 8) * rotationIntensity;
    this.el.object3D.rotation.z =
      (Math.sin((t / 4) * speed) / 20) * rotationIntensity;

    // Apply floating motion
    let yPosition = Math.sin((t / 4) * speed) / 10;
    // Map to custom range (similar to THREE.MathUtils.mapLinear)
    yPosition = THREE.MathUtils.mapLinear(
      yPosition,
      -0.1,
      0.1,
      data.floatingRangeMin,
      data.floatingRangeMax
    );

    // Apply position
    this.el.object3D.position.y = this.originalY + yPosition * data.intensity;

    // Manually update the matrix
    this.el.object3D.updateMatrix();

    // Force scene render if autoInvalidate is true
    if (data.autoInvalidate) {
      this.el.object3D.traverse((node) => {
        if (node.material) node.material.needsUpdate = true;
      });
    }
  },

  // Utility function to replicate THREE.MathUtils.mapLinear
  // mapLinear: function (x, a1, a2, b1, b2) {
  //   return b1 + ((x - a1) * (b2 - b1)) / (a2 - a1);
  // },

  remove: function () {
    // Reset position and rotation
    this.el.object3D.position.y = this.originalY;
    this.el.object3D.rotation.set(0, 0, 0);

    // Restore original matrix auto update setting
    this.el.object3D.matrixAutoUpdate = this.wasMatrixAutoUpdate;

    // Make sure to update the matrix one last time
    this.el.object3D.updateMatrix();
  },
});

// #endregion float

// #region realmar-gallery

// realmar-gallery component manages gallery state and navigation
AFRAME.registerComponent("realmar-gallery", {
  schema: {
    startIndex: { type: "number", default: 0 },
  },

  init: function () {
    this.currentItemIndex = this.data.startIndex;
    this._galleryItems = null;

    // Create methods for navigation
    this.el.galleryAPI = {
      next: () => this.nextItem(),
      prev: () => this.prevItem(),
      setIndex: (index) => this.setItemIndex(index),
      getCurrentIndex: () => this.currentItemIndex,
      getItemCount: () => this.getGalleryItems().length,
    };

    // Wait for scene to be fully loaded
    this.el.sceneEl.addEventListener("loaded", () => {
      this.updateVisibility();
    });
  },

  // Cache gallery items for better performance
  getGalleryItems: function () {
    if (!this._galleryItems) {
      this._galleryItems = Array.from(
        this.el.querySelectorAll("[realmar-gallery-item]")
      );
    }
    return this._galleryItems;
  },

  // Navigation methods with shared logic
  nextItem: function () {
    const items = this.getGalleryItems();
    if (items.length === 0) return;

    this.currentItemIndex = (this.currentItemIndex + 1) % items.length;
    this.updateVisibility();
  },

  prevItem: function () {
    const items = this.getGalleryItems();
    if (items.length === 0) return;

    this.currentItemIndex =
      (this.currentItemIndex - 1 + items.length) % items.length;
    this.updateVisibility();
  },

  setItemIndex: function (index) {
    const items = this.getGalleryItems();
    if (items.length === 0) return;

    if (index >= 0 && index < items.length) {
      this.currentItemIndex = index;
      this.updateVisibility();
    }
  },

  updateVisibility: function () {
    this.el.emit("gallery-index-changed", { index: this.currentItemIndex });
  },

  // Handle dynamic content changes
  update: function () {
    this._galleryItems = null; // Invalidate cache
  },

  remove: function () {
    this._galleryItems = null;
  },
});

// #region realmar-gallery-item

// realmar-gallery-item component listens for index changes and updates its visibility
AFRAME.registerComponent("realmar-gallery-item", {
  schema: {
    index: { type: "number", default: 0 },
  },

  init: function () {
    this.gallery = this.el.closest("[realmar-gallery]");

    if (!this.gallery) {
      console.warn("Gallery item could not find a parent gallery component");
      return;
    }

    // Bind event handler once
    this.onIndexChanged = this.onIndexChanged.bind(this);
    this.gallery.addEventListener("gallery-index-changed", this.onIndexChanged);

    // Set initial visibility (safely)
    if (this.gallery.components["realmar-gallery"]) {
      this.updateVisibility(
        this.gallery.components["realmar-gallery"].currentItemIndex
      );
    }
  },

  onIndexChanged: function (event) {
    this.updateVisibility(event.detail.index);
  },

  updateVisibility: function (currentIndex) {
    const shouldBeVisible = currentIndex === this.data.index;
    const isCurrentlyVisible = this.el.getAttribute("visible");

    if (shouldBeVisible !== isCurrentlyVisible) {
      this.el.setAttribute("visible", shouldBeVisible);
    }
  },

  remove: function () {
    if (this.gallery) {
      this.gallery.removeEventListener(
        "gallery-index-changed",
        this.onIndexChanged
      );
    }
  },
});

// #region realmar-depends-on

AFRAME.registerComponent("realmar-depends-on", {
  schema: { type: "selector" },

  didFindDependency: false,

  init: function () {
    this.didFindDependency = false;
    // cache own the target index
    this.mindArImageTargetIndex = this.el.getAttribute(
      "mindar-image-target"
    )?.targetIndex;

    if (this.mindArImageTargetIndex === undefined) {
      console.warn(
        "realmar-depends-on component requires a mindar-image-target component with a targetIndex"
      );
      return;
    }

    const scene = document.querySelector("a-scene");

    const handleTargetFound = (event) => {
      if (event.target === this.data) {
        console.log("Found dependency:", this.data);
        this.didFindDependency = true;
        this.el.emit("dependency-found");
        scene.removeEventListener("targetFound", handleTargetFound);
      }
    };

    scene.addEventListener("targetFound", handleTargetFound);
  },
});

// #region DOM Controls

function initDomControls(scene) {
  initGalleryControls(scene);
  initVideoControls(scene);
}

function initGalleryControls(scene) {
  // Find gallery buttons
  const galleryButtons = document.getElementById("gallery-buttons");
  const prevButton = galleryButtons.querySelector("#prev");
  const nextButton = galleryButtons.querySelector("#next");

  // Track currently active gallery
  let activeGallery = null;

  // Show/hide gallery buttons based on marker visibility
  scene.addEventListener("targetFound", (event) => {
    const targetEl = event.target;
    const gallery = targetEl.components["realmar-gallery"];

    if (gallery) {
      activeGallery = targetEl;
      galleryButtons.classList.remove("invisible");
    }
  });

  scene.addEventListener("targetLost", (event) => {
    const targetEl = event.target;

    // If the lost target was our active gallery, hide buttons
    if (targetEl === activeGallery) {
      activeGallery = null;
      galleryButtons.classList.add("invisible");
    }
  });

  // Connect button click handlers to gallery API
  prevButton.addEventListener("click", () => {
    if (activeGallery && activeGallery.galleryAPI) {
      activeGallery.galleryAPI.prev();
    }
  });

  nextButton.addEventListener("click", () => {
    if (activeGallery && activeGallery.galleryAPI) {
      activeGallery.galleryAPI.next();
    }
  });
}

function getVideoObjectsFromTarget(targetEl) {
  return [...targetEl.querySelectorAll('a-plane[src^="#"]')]
    .map((plane) => {
      const video = document.querySelector(plane.getAttribute("src"));
      if (video && video.tagName === "VIDEO") {
        return {
          plane,
          video,
        };
      }
      return null;
    })
    .filter(Boolean);
}

function initVideoControls(scene) {
  // Find video controls
  const videoButtons = document.getElementById("video-buttons");
  const playButton = videoButtons.querySelector("#play");
  const pauseButton = videoButtons.querySelector("#pause");
  const replayButton = videoButtons.querySelector("#replay");

  // Track currently active video
  let activeVideoObject = null;

  // Show/hide video buttons based on marker visibility
  scene.addEventListener("targetFound", (event) => {
    const targetEl = event.target;
    // Find video elements in the target
    const videoObjects = getVideoObjectsFromTarget(targetEl);

    // If there are no videos, do nothing
    if (videoObjects.length === 0) {
      return;
    }

    // console.log("Found target with videos:", videoObjects);

    const firstVideoObject = videoObjects[0];

    if (firstVideoObject) {
      activeVideoObject = firstVideoObject;
      if (activeVideoObject.video.dataset.autoplay === "true") {
        activeVideoObject.video.play().catch((e) => {
          console.log("Video play error:", e);
        });
      }
      videoButtons.classList.remove("invisible");
    }
  });

  scene.addEventListener("targetLost", (event) => {
    const targetEl = event.target;

    const videoObjects = getVideoObjectsFromTarget(targetEl);

    // If there are no videos, do nothing
    if (videoObjects.length === 0) {
      return;
    }

    console.log("Lost target with videos:", videoObjects);

    const firstVideoObject = videoObjects[0];

    // If the lost target was our active video, hide buttons
    if (firstVideoObject.video === activeVideoObject.video) {
      firstVideoObject.video.pause();

      activeVideoObject = null;
      videoButtons.classList.add("invisible");
    }
  });

  // Connect button click handlers to video API
  playButton.addEventListener("click", () => {
    if (activeVideoObject && activeVideoObject.video) {
      activeVideoObject.video.play().catch((e) => {
        console.log("Video play error:", e);
      });
    }
  });

  pauseButton.addEventListener("click", () => {
    if (activeVideoObject && activeVideoObject.video) {
      activeVideoObject.video.pause();
    }
  });

  replayButton.addEventListener("click", () => {
    if (activeVideoObject && activeVideoObject.video) {
      activeVideoObject.video.currentTime = 0;
      activeVideoObject.video.play().catch((e) => {
        console.log("Video play error:", e);
      });
    }
  });
}

// Setup gallery controls after scene is loaded
document.addEventListener("DOMContentLoaded", () => {
  initAudioPermission();

  const scene = document.querySelector("a-scene");
  // If scene isn't loaded yet, wait for it
  if (!scene.hasLoaded) {
    scene.addEventListener("loaded", () => initDomControls(scene));
  } else {
    initDomControls(scene);
  }
});
// #endregion

// #region audio autoplay permission
function initAudioPermission() {
  const splashScreen = document.getElementById("splash-screen");
  const startButton = document.getElementById("start-button");
  const deferSceneLoadNode = document.getElementById("defer-scene-load");

  if (!splashScreen || !startButton) {
    if (deferSceneLoadNode) {
      deferSceneLoadNode.load();
    }
    return;
  }

  // Create audio context - this helps with unlocking audio on iOS
  let audioContext;

  // Function to unlock audio
  function unlockAudio() {
    // Create audio context if it doesn't exist
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Create and play a silent sound to unlock audio
    if (audioContext.state === "suspended") {
      const buffer = audioContext.createBuffer(1, 1, 22050);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
    }

    // Find all video elements
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      // Enable audio
      video.muted = false;

      // If the video should autoplay but was paused due to browser restrictions
      if (video.hasAttribute("autoplay") && video.paused) {
        video.play().catch((e) => console.log("Video play error:", e));
      }
    });

    // Set global flag for future videos
    window.audioPermissionGranted = true;

    // Hide splash screen
    splashScreen.style.display = "none";

    // finish loading the scene
    deferSceneLoadNode.load();
  }

  // Add click event listener
  startButton.addEventListener("click", unlockAudio);

  // Monitor for new video elements being added to the scene
  const observer = new MutationObserver((mutations) => {
    if (window.audioPermissionGranted) {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === "VIDEO") {
            node.muted = false;
            if (node.hasAttribute("autoplay")) {
              node.play().catch((e) => console.log("Video play error:", e));
            }
          }

          // Check for videos in child elements
          const videos = node.querySelectorAll?.("video");
          if (videos) {
            videos.forEach((video) => {
              video.muted = false;
              if (video.hasAttribute("autoplay")) {
                video.play().catch((e) => console.log("Video play error:", e));
              }
            });
          }
        });
      });
    }
  });

  // Start observing the document with the configured parameters
  observer.observe(document.body, { childList: true, subtree: true });
}
