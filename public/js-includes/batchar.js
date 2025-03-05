/**
 * @typedef {import('aframe')}
 */

import "https://cdn.jsdelivr.net/npm/aframe@1.7.0/dist/aframe-master.min.js";
import "https://cdn.jsdelivr.net/npm/aframe-extras@7.5.4/dist/aframe-extras.min.js";
import "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.min.js";

const AFRAME = window.AFRAME;

// #region look-at

AFRAME.registerComponent("look-at", {
  schema: { type: "selector" },

  init: function () {},

  tick: function () {
    this.el.object3D.lookAt(this.data.object3D.position);
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

// #region batchar-gallery

// batchar-gallery component manages gallery state and navigation
AFRAME.registerComponent("batchar-gallery", {
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
        this.el.querySelectorAll("[batchar-gallery-item]")
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

// #region batchar-gallery-item

// batchar-gallery-item component listens for index changes and updates its visibility
AFRAME.registerComponent("batchar-gallery-item", {
  schema: {
    index: { type: "number", default: 0 },
  },

  init: function () {
    this.gallery = this.el.closest("[batchar-gallery]");

    if (!this.gallery) {
      console.warn("Gallery item could not find a parent gallery component");
      return;
    }

    // Bind event handler once
    this.onIndexChanged = this.onIndexChanged.bind(this);
    this.gallery.addEventListener("gallery-index-changed", this.onIndexChanged);

    // Set initial visibility (safely)
    if (this.gallery.components["batchar-gallery"]) {
      this.updateVisibility(
        this.gallery.components["batchar-gallery"].currentItemIndex
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

// #region batchar-depends-on

AFRAME.registerComponent("batchar-depends-on", {
  schema: { type: "selector" },

  init: function () {
    this.didFindDependency = false;
    // cache own the target index
    this.mindArImageTargetIndex = this.el.getAttribute(
      "mindar-image-target"
    )?.targetIndex;

    if (this.mindArImageTargetIndex === undefined) {
      console.warn(
        "batchar-depends-on component requires a mindar-image-target component with a targetIndex"
      );
      return;
    }

    const scene = document.querySelector("a-scene");

    const handleTargetFound = (event) => {
      if (event.target === this.data) {
        this.didFindDependency = true;
        this.el.emit("dependency-found");
        scene.removeEventListener("targetFound", handleTargetFound);
        this.updateMindArImageTarget();
      }
    };

    scene.addEventListener("targetFound", handleTargetFound);

    this.updateMindArImageTarget();
  },

  updateMindArImageTarget: function () {
    this.el.setAttribute("mindar-image-target", {
      targetIndex: this.didFindDependency ? this.mindArImageTargetIndex : -1,
    });
  },

  tick: function () {
    this.el.object3D.lookAt(this.data.object3D.position);
  },
});

// #region DOM Controls

function initDomControls(scene) {
  initGalleryControls(scene);
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
    const gallery = targetEl.components["batchar-gallery"];

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

// Setup gallery controls after scene is loaded
document.addEventListener("DOMContentLoaded", () => {
  const scene = document.querySelector("a-scene");

  // If scene isn't loaded yet, wait for it
  if (!scene.hasLoaded) {
    scene.addEventListener("loaded", () => initDomControls(scene));
  } else {
    initDomControls(scene);
  }
});
