const galleryButtons = document.getElementById("gallery-buttons");
const prevButton = document.querySelector("#prev");
const nextButton = document.querySelector("#next");
const playButton = document.getElementById("play-button");

let currentTarget = null;
let galleryTargetKeys = [];
let currentPlaneMedia = null;

prevButton.addEventListener("click", () => {
  moveCurrentGallery(-1);
});
nextButton.addEventListener("click", () => {
  moveCurrentGallery(1);
});
playButton.addEventListener("click", () => {
  handlePlay();
});

console.log(state);

state.map((marker) => {
  const target = document.getElementById(marker.id);

  // Wenn beim Marker eine Galerie hinterlegt ist
  if (marker.entities.length > 1) {
    // Füge die Marker-Id dem Galerie-Array hinzu
    galleryTargetKeys.push(marker.id);

    // Fade Bedienelemente ein/aus wenn Marker erkannt wird
    target.addEventListener("targetFound", () => {
      currentTarget = target;
      fadeInElement(galleryButtons);
    });
    target.addEventListener("targetLost", () => {
      fadeOutElement(galleryButtons);
      fadeOutElement(playButton);
      pauseMedia();
    });
  }

  // Wenn beim Marker ein Video hinterlegt ist
  if (
    marker.entities.length === 1 &&
    marker.entities[0].asset.fileType.includes("video")
  ) {
    target.addEventListener("targetFound", () => {
      currentTarget = target;
      setCurrentPlaneMediaById(marker.entities[0].asset.id);
      fadeInElement(playButton);
    });

    target.addEventListener("targetLost", () => {
      fadeOutElement(playButton);
      pauseMedia();
    });
  }
});

function fadeInElement(element) {
  element.classList.remove("invisible");
  element.classList.add("visible");
}

function fadeOutElement(element) {
  element.classList.remove("visible");
  element.classList.add("invisible");
}

function handlePlay() {
  currentPlaneMedia.play();
  fadeOutElement(playButton);
}

function pauseMedia() {
  if (currentPlaneMedia === null || currentPlaneMedia === undefined) return;
  currentPlaneMedia.pause();
}

function setCurrentPlaneMediaById(id) {
  console.log(id);
  currentPlaneMedia = document.getElementById(id);
}

// TODO: Move Funktion
function moveCurrentGallery(direction) {
  if (currentTarget == null || !galleryTargetKeys.includes(currentTarget.id))
    return;
  const currentTargetIndex = state.findIndex((e) => e.id == currentTarget.id);
  const currentGallery = state[currentTargetIndex].entities;

  //   Jedes mal neu berechnen, um nicht tracken zu müssen, welche Galerie gerade angezeigt wird
  const currentElement = document.getElementById(`${currentTarget.id}-element`);
  const currentAssetId = getCurrentAssetId(currentElement);
  console.log("currentAssetID " + currentAssetId);

  const currentMediaIndexInGallery = currentGallery.findIndex(
    (im) => im.asset.id == currentAssetId,
  );

  const mediaCount = currentGallery.length;
  const newMediaIndexInGallery =
    currentMediaIndexInGallery + direction < 0
      ? mediaCount - 1
      : (currentMediaIndexInGallery + direction) % mediaCount;
  console.log(
    currentMediaIndexInGallery,
    direction,
    mediaCount,
    newMediaIndexInGallery,
  );

  const newEntity = currentGallery[newMediaIndexInGallery];

  pauseMedia();
  swapGalleryMedia(currentElement, newEntity);

  if (newEntity.asset.fileType.includes("video")) {
    setCurrentPlaneMediaById(newEntity.asset.id);
    fadeInElement(playButton);
  }
  if (!newEntity.asset.fileType.includes("video")) {
    fadeOutElement(playButton);
  }
}

function swapGalleryMedia(currentElement, newEntity) {
  let newElement = currentElement;
  const elementId = currentElement.getAttribute("id");

  // Wenn wir von 2D auf 3D wechseln
  if (
    currentElement.tagName === "A-PLANE" &&
    newEntity.asset.fileType.includes("model")
  ) {
    newElement = document.createElement("A-ENTITY");
    currentElement.parentNode.replaceChild(newElement, currentElement);
  }

  // Wenn wir von 3D auf 2D wechseln

  if (
    currentElement.tagName === "A-ENTITY" &&
    !newEntity.asset.fileType.includes("model")
  ) {
    newElement = document.createElement("A-PLANE");
    currentElement.parentNode.replaceChild(newElement, currentElement);
  }

  newElement.setAttribute("id", elementId);
  setNewGalleryMedia(newElement, newEntity);
  currentElement = newElement;
}

const getCurrentAssetId = (currentElement) => {
  const currentAssetId = currentElement.dataset.entityId;
  return currentAssetId;
};

function setNewGalleryMedia(element, entity) {
  console.log(element, entity);
  element.setAttribute("position", {
    x: entity.position.x,
    y: entity.position.y,
    z: entity.position.z,
  });
  element.setAttribute(
    "rotation",
    `${entity.rotation._x} ${entity.rotation._y} ${entity.rotation._z}`,
  );
  element.setAttribute(
    "scale",
    `${entity.scale.x} ${entity.scale.y} ${entity.scale.z}`,
  );
  // element.setAttribute(
  //   "look-at",
  //   `${entity.lookAtCamera? "camera" : ""}`
  // );
  element.setAttribute("data-entity-id", entity.asset.id);
  if (
    !entity.asset.fileType.includes("model") &&
    element.tagName === "A-PLANE"
  ) {
    element.setAttribute("src", `#${entity.asset.id}`);
    element.setAttribute("color", "#ffffff");
    element.setAttribute("width", "1");
    element.setAttribute("height", "1");
  }
  if (
    entity.asset.fileType.includes("model") &&
    element.tagName === "A-ENTITY"
  ) {
    console.log("changing mode", entity.asset.id);
    element.setAttribute("gltf-model", `#${entity.asset.id}`);
    element.setAttribute("animation-mixer", entity.playAnimation);
  }
}
