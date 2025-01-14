const galleryButtons = document.getElementById("gallery-buttons");
const prevButton = document.querySelector("#prev");
const nextButton = document.querySelector("#next");
const videoControls = document.getElementById("video-controls");
const playButton = document.getElementById("play");
const pauseButton = document.getElementById("pause");
const playFromStartButton = document.getElementById("play-from-start");

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
pauseButton.addEventListener("click", () => {
  handlePause();
});
playFromStartButton.addEventListener("click", () => {
  handlePlayFromStart();
});

// console.log(state);

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
      moveCurrentGallery(0); //
    });
    target.addEventListener("targetLost", () => {
      handlePause();
      fadeOutElement(videoControls);
      fadeOutElement(galleryButtons);
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
      fadeInElement(videoControls);
    });

    target.addEventListener("targetLost", () => {
      handlePause();
      fadeOutElement(videoControls);
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
  fadeInElement(pauseButton);
  fadeInElement(playFromStartButton);
}

function handlePause() {
  pauseMedia();
  fadeOutElement(pauseButton);
  fadeOutElement(playFromStartButton);
  fadeInElement(playButton);
}

function handlePlayFromStart() {
  pauseMedia();
  currentPlaneMedia.currentTime = 0;
  currentPlaneMedia.play();
}

function pauseMedia() {
  if (currentPlaneMedia === null || currentPlaneMedia === undefined) return;
  currentPlaneMedia.pause();
}

function setCurrentPlaneMediaById(id) {
  currentPlaneMedia = document.getElementById(id);
}

// TODO: Move Funktion
function moveCurrentGallery(direction) {
  if (currentTarget == null || !galleryTargetKeys.includes(currentTarget.id))
    return;

  //   Jedes mal neu berechnen, um nicht tracken zu müssen, welche Galerie gerade angezeigt wird
  const currentGallery = getCurrentGallery();
  const { currentElement, currentAssetId } = getCurrentlyDisplayedElement();

  const currentMediaIndexInGallery = currentGallery.findIndex(
    (im) => im.asset.id == currentAssetId,
  );

  const mediaCount = currentGallery.length;
  const newMediaIndexInGallery =
    currentMediaIndexInGallery + direction < 0
      ? mediaCount - 1
      : (currentMediaIndexInGallery + direction) % mediaCount;

  const newEntity = currentGallery[newMediaIndexInGallery];

  handlePause();
  swapGalleryMedia(currentElement, newEntity);

  if (newEntity.asset.fileType.includes("video")) {
    setCurrentPlaneMediaById(newEntity.asset.id);
    fadeInElement(videoControls);
  }
  if (!newEntity.asset.fileType.includes("video")) {
    fadeOutElement(videoControls);
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

const getCurrentlyDisplayedElement = () => {
  const currentElement = document.getElementById(`${currentTarget.id}-element`);
  const currentAssetId = currentElement.dataset.entityId;
  return { currentElement, currentAssetId };
};

const getCurrentGallery = () => {
  const currentTargetIndex = state.findIndex((e) => e.id == currentTarget.id);
  const currentGallery = state[currentTargetIndex].entities;
  return currentGallery;
};

function setNewGalleryMedia(element, entity) {
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
    element.setAttribute("gltf-model", `#${entity.asset.id}`);
    element.setAttribute("animation-mixer", entity.playAnimation);
  }
}
