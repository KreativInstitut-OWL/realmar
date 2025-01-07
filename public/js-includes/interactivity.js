const galleryButtons = document.getElementById("gallery-buttons");
const prevButton = document.querySelector("#prev");
const nextButton = document.querySelector("#next");
const playButton = document.getElementById("play-button");

let currentTarget = null;
let galleryTargetKeys = [];

prevButton.addEventListener("click", () => {
  move(-1);
});
nextButton.addEventListener("click", () => {
  move(1);
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

// TODO: Move Funktion
const move = (direction) => {
  console.log(direction);
  if (currentTarget == null || !galleryTargetKeys.includes(currentTarget))
    return;
  const currentImage = currentGallery.currentImage;
  const imageCount = currentGallery.imageCount;
  const imagePlaneName = `plane${currentTarget}`;
  const imagePlane = document.getElementById(imagePlaneName);
  const newImage =
    currentImage + direction < 0
      ? imageCount - 1
      : (currentImage + direction) % imageCount;
  const newImageId = `#${currentGallery.name}-asset${newImage}`;
  imagePlane.setAttribute("src", newImageId);
  currentGallery.currentImage = newImage;
};
