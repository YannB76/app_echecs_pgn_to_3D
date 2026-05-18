import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { Chess } from "chess.js";

const canvas = document.querySelector("#scene");
const gameLibrary = document.querySelector("#gameLibrary");
const pgnInput = document.querySelector("#pgnInput");
const fenOutput = document.querySelector("#fenOutput");
const statusEl = document.querySelector("#status");
const positionLabel = document.querySelector("#positionLabel");
const turnMetric = document.querySelector("#turnMetric");
const moveMetric = document.querySelector("#moveMetric");
const pieceMetric = document.querySelector("#pieceMetric");
const moveSlider = document.querySelector("#moveSlider");
const moveLabel = document.querySelector("#moveLabel");
const annotationCurrent = document.querySelector("#annotationCurrent");
const annotationChoices = document.querySelector("#annotationChoices");
const moveComment = document.querySelector("#moveComment");
const clearCommentButton = document.querySelector("#clearComment");
const annotatedPgn = document.querySelector("#annotatedPgn");
const openOptionsButton = document.querySelector("#openOptions");
const closeOptionsButton = document.querySelector("#closeOptions");
const optionsOverlay = document.querySelector("#optionsOverlay");
const optionTabs = document.querySelectorAll(".option-tab");
const optionPanels = document.querySelectorAll("[data-panel]");
const sideTabs = document.querySelectorAll(".side-tab");
const sidePanels = document.querySelectorAll("[data-side-panel]");
const firstMoveButton = document.querySelector("#firstMove");
const previousMoveButton = document.querySelector("#previousMove");
const nextMoveButton = document.querySelector("#nextMove");
const lastMoveButton = document.querySelector("#lastMove");
const pieceThemeSelect = document.querySelector("#pieceTheme");
const lightSquareColorInput = document.querySelector("#lightSquareColor");
const darkSquareColorInput = document.querySelector("#darkSquareColor");
const backgroundModeSelect = document.querySelector("#backgroundMode");
const backgroundImageSelect = document.querySelector("#backgroundImage");
const backgroundColorInput = document.querySelector("#backgroundColor");
const pieceScaleInput = document.querySelector("#pieceScale");
const pieceScaleLabel = document.querySelector("#pieceScaleLabel");
const lightIntensityInput = document.querySelector("#lightIntensity");
const lightIntensityLabel = document.querySelector("#lightIntensityLabel");
const shadowIntensityInput = document.querySelector("#shadowIntensity");
const shadowIntensityLabel = document.querySelector("#shadowIntensityLabel");
const moveAnimationsEnabledInput = document.querySelector("#moveAnimationsEnabled");
const animationSpeedInput = document.querySelector("#animationSpeed");
const animationSpeedLabel = document.querySelector("#animationSpeedLabel");
const randomAnimationSpeedInput = document.querySelector("#randomAnimationSpeed");
const soundEnabledInput = document.querySelector("#soundEnabled");
const soundVolumeInput = document.querySelector("#soundVolume");
const soundVolumeLabel = document.querySelector("#soundVolumeLabel");
const soundThemeSelect = document.querySelector("#soundTheme");

const squareSize = 1;
const boardOffset = 3.5;
const famousGames = [
  {
    id: "immortal",
    label: "Anderssen - Kieseritzky, 1851 - Immortal Game",
    pgn: `[Event "Immortal Game"]
[Site "London ENG"]
[Date "1851.06.21"]
[Round "?"]
[White "Adolf Anderssen"]
[Black "Lionel Kieseritzky"]
[Result "1-0"]

1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6
6. Nf3 Qh6 7. d3 Nh5 8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6
11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8 15. Bxf4 Qf6
16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2 Na6
21. Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7# 1-0`
  },
  {
    id: "deep-blue",
    label: "Deep Blue - Kasparov, 1997 - Match game 6",
    pgn: `[Event "IBM Man-Machine Match"]
[Site "New York, NY USA"]
[Date "1997.05.11"]
[Round "6"]
[White "Deep Blue"]
[Black "Garry Kasparov"]
[Result "1-0"]

1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Nd7 5. Ng5 Ngf6
6. Bd3 e6 7. N1f3 h6 8. Nxe6 Qe7 9. O-O fxe6 10. Bg6+ Kd8
11. Bf4 b5 12. a4 Bb7 13. Re1 Nd5 14. Bg3 Kc8 15. axb5 cxb5
16. Qd3 Bc6 17. Bf5 exf5 18. Rxe7 Bxe7 19. c4 1-0`
  },
  {
    id: "fischer",
    label: "Byrne - Fischer, 1956 - Game of the Century",
    pgn: `[Event "Third Rosenwald Trophy"]
[Site "New York, NY USA"]
[Date "1956.10.17"]
[Round "8"]
[White "Donald Byrne"]
[Black "Robert James Fischer"]
[Result "0-1"]

1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5
6. Qb3 dxc4 7. Qxc4 c6 8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4
11. Bg5 Na4 12. Qa3 Nxc3 13. bxc3 Nxe4 14. Bxe7 Qb6
15. Bc4 Nxc3 16. Bc5 Rfe8+ 17. Kf1 Be6 18. Bxb6 Bxc4+
19. Kg1 Ne2+ 20. Kf1 Nxd4+ 21. Kg1 Ne2+ 22. Kf1 Nc3+
23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1 26. h3 Rxa2
27. Kh2 Nxf2 28. Re1 Rxe1 29. Qd8+ Bf8 30. Nxe1 Bd5
31. Nf3 Ne4 32. Qb8 b5 33. h4 h5 34. Ne5 Kg7 35. Kg1 Bc5+
36. Kf1 Ng3+ 37. Ke1 Bb4+ 38. Kd1 Bb3+ 39. Kc1 Ne2+
40. Kb1 Nc3+ 41. Kc1 Rc2# 0-1`
  },
  {
    id: "capablanca",
    label: "Capablanca - Tartakower, 1922 - London",
    pgn: `[Event "London"]
[Site "London ENG"]
[Date "1922.08.10"]
[Round "8"]
[White "Jose Raul Capablanca"]
[Black "Savielly Tartakower"]
[Result "1/2-1/2"]

1. d4 Nf6 2. Nf3 d5 3. c4 e6 4. Nc3 Be7 5. Bg5 O-O 6. e3 h6
7. Bh4 b6 8. cxd5 exd5 9. Qb3 Be6 10. Rd1 c6 11. Qc2 Ne4
12. Bxe7 Qxe7 13. Nxe4 dxe4 14. Qxe4 Qb4+ 15. Nd2 Qxb2
16. Bd3 g6 17. Qf4 Kg7 18. h4 Nd7 19. Ne4 Qxa2 20. h5 g5
21. Qg3 Qa5+ 22. Ke2 f5 23. Nxg5 hxg5 24. Qxg5+ Kf7
25. h6 Rg8 26. Qh5+ Ke7 27. h7 Rxg2 28. Kf1 Qd5 29. h8=Q Rxh8
30. Qxh8 Qf3 31. Rd2 Bd5 32. Ke1 Rg8 33. Qh4+ Kd6 34. Rf1 Be6
35. Rc2 a5 36. Qh2+ Ke7 37. Be2 Qe4 38. Kd2 c5 39. Bd3 Qg2
40. Qh4+ Qg5 41. Qxg5+ Rxg5 42. Rb1 f4 1/2-1/2`
  },
  {
    id: "ivanchuk",
    label: "Ivanchuk - Yusupov, 1991 - Brussels",
    pgn: `[Event "Brussels Candidates"]
[Site "Brussels BEL"]
[Date "1991.08.24"]
[Round "9"]
[White "Vasyl Ivanchuk"]
[Black "Artur Yusupov"]
[Result "0-1"]

1. c4 e5 2. g3 d6 3. Bg2 g6 4. d4 Nd7 5. Nc3 Bg7 6. Nf3 Ngf6
7. O-O O-O 8. Qc2 Re8 9. Rd1 c6 10. b3 Qe7 11. Ba3 e4
12. Ng5 e3 13. f4 Nf8 14. b4 Bf5 15. Qb3 h6 16. Nf3 Ng4
17. b5 g5 18. bxc6 bxc6 19. Ne5 gxf4 20. Nxc6 Qg5
21. Bxd6 Ng6 22. Nd5 Qh5 23. h4 Nxh4 24. gxh4 Qxh4
25. Nde7+ Kh8 26. Nxf5 Qh2+ 27. Kf1 Re6 28. Qb7 Rg6
29. Qxa8+ Kh7 30. Qg8+ Kxg8 31. Nce7+ Kh7 32. Nxg6 fxg6
33. Nxg7 Nf2 34. Bxf4 Qxf4 35. Ne6 Qh2 36. Rdb1 Nh3
37. Rb7+ Kh8 38. Rb8+ Qxb8 39. Bxh3 Qg3 0-1`
  }
];
const pieceMeshes = new THREE.Group();
let flipped = false;
let lastFen = new Chess().fen();
let lastMoveCount = 0;
let timeline = [{ fen: lastFen, label: "Depart" }];
let currentMoveIndex = 0;
let moveAnnotations = new Map();
let soundEnabled = true;
let soundVolume = 0.75;
let soundTheme = "wood";
let audioContext = null;
let activeAnimation = null;
let realModelsLoading = false;
let pieceScale = 0.8;
let shadowIntensity = 1;
let shadowPlane = null;
let moveAnimationsEnabled = true;
let animationSpeed = 1;
let randomAnimationSpeed = false;
let selectedPieceTheme = "ornate";
let selectedBackgroundImage = "bd5835a3-49d6-442d-ad70-be464ae4dc6c.png";
const backgroundImageTextures = new Map();
const loadedModelThemes = new Map();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x37a072);
const backgroundTextureLoader = new THREE.TextureLoader();
loadBackgroundImage(selectedBackgroundImage);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(0, 6.4, -8.4);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);
controls.minDistance = 5;
controls.maxDistance = 15;
controls.maxPolarAngle = Math.PI * 0.48;

const ambient = new THREE.HemisphereLight(0xf5efe0, 0x38414a, 2.2);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xfff0cc, 2.8);
keyLight.position.set(3, 8, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x9bbcff, 1.1);
fillLight.position.set(-7, 5, -4);
scene.add(fillLight);
const baseLightIntensities = {
  ambient: ambient.intensity,
  key: keyLight.intensity,
  fill: fillLight.intensity
};

const boardGroup = new THREE.Group();
scene.add(boardGroup, pieceMeshes);

const lightSquare = new THREE.MeshStandardMaterial({ color: 0xdcc9a3, roughness: 0.68, metalness: 0.03 });
const darkSquare = new THREE.MeshStandardMaterial({ color: 0x6e5437, roughness: 0.74, metalness: 0.02 });
const edgeMat = new THREE.MeshStandardMaterial({ color: 0x2a2119, roughness: 0.7 });
const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf1efe7, roughness: 0.55, metalness: 0.08 });
const blackMat = new THREE.MeshStandardMaterial({ color: 0x24282d, roughness: 0.5, metalness: 0.16 });
const goldMat = new THREE.MeshStandardMaterial({ color: 0xd7a94b, roughness: 0.44, metalness: 0.22 });
const soundThemes = {
  wood: { type: "triangle", frequencyRatio: 1, gainRatio: 1, durationRatio: 1 },
  crystal: { type: "sine", frequencyRatio: 1.45, gainRatio: 0.85, durationRatio: 0.82 },
  arcade: { type: "square", frequencyRatio: 0.72, gainRatio: 0.58, durationRatio: 1.15 }
};
const pieceModelThemes = {
  ornate: {
    label: "OBJ detaille",
    basePath: "assets/models/chess-obj/OBJ%20Files",
    files: {
      p: "Pawn V1.obj",
      r: "Rook V1.obj",
      n: "Knight.obj",
      b: "Bishop V1.obj",
      q: "Queen V1.obj",
      k: "King V1.obj"
    },
    heights: {
      p: 1.15,
      r: 1.34,
      n: 1.48,
      b: 1.58,
      q: 1.74,
      k: 1.86
    }
  },
  classic: {
    label: "OBJ classique",
    basePath: "assets/models/classic-obj",
    files: {
      p: "Pawn.obj",
      r: "Rook.obj",
      n: "Knight.obj",
      b: "Bishop.obj",
      q: "Queen.obj",
      k: "King.obj"
    },
    heights: {
      p: 1.15,
      r: 1.34,
      n: 1.48,
      b: 1.58,
      q: 1.74,
      k: 1.86
    }
  }
};
const annotationTypes = [
  { id: "brilliant", label: "Brillant", icon: "!!", color: "#72d7b2" },
  { id: "excellent", label: "Excellent", icon: "!", color: "#9bb7df" },
  { id: "theory", label: "Theorique", icon: "📖", color: "#d7b48a" },
  { id: "best", label: "Meilleur", icon: "★", color: "#9ccc65" },
  { id: "very-good", label: "Tres bien", icon: "👍", color: "#8ab661" },
  { id: "good", label: "Bon", icon: "✓", color: "#9ccf86" },
  { id: "inaccuracy", label: "Imprecision", icon: "?!", color: "#f4cf45" },
  { id: "mistake", label: "Erreur", icon: "?", color: "#f2a65a" },
  { id: "miss", label: "Manque", icon: "×", color: "#ec8574" },
  { id: "blunder", label: "Gaffe", icon: "??", color: "#e8583c" }
];

buildBoard();
buildAnnotationChoices();
populateGameLibrary();
initializeDefaultGame();
resize();
animate();

document.querySelector("#renderPosition").addEventListener("click", () => {
  gameLibrary.value = "custom";
  renderCurrentInput();
});

gameLibrary.addEventListener("change", () => {
  if (gameLibrary.value === "custom") return;
  loadSelectedGame(gameLibrary.value);
});

pgnInput.addEventListener("input", () => {
  gameLibrary.value = "custom";
});

function renderCurrentInput() {
  const source = pgnInput.value.trim();
  try {
    timeline = timelineFromText(source);
    moveAnnotations = new Map();
    currentMoveIndex = 0;
    lastFen = timeline[currentMoveIndex].fen;
    lastMoveCount = currentMoveIndex;
    showTimelinePosition(currentMoveIndex);
    updateAnnotatedPgn();
    setStatus(`Rendu genere depuis ${sourceLooksLikeFen(source) ? "FEN" : "PGN"}.`);
  } catch (error) {
    setStatus(error.message || "Impossible de lire cette position.", true);
  }
}

firstMoveButton.addEventListener("click", () => showTimelinePosition(0));
previousMoveButton.addEventListener("click", () => showTimelinePosition(currentMoveIndex - 1));
nextMoveButton.addEventListener("click", () => showTimelinePosition(currentMoveIndex + 1));
lastMoveButton.addEventListener("click", () => showTimelinePosition(timeline.length - 1));
moveSlider.addEventListener("input", () => showTimelinePosition(Number(moveSlider.value)));

moveComment.addEventListener("input", () => {
  updateCurrentAnnotation({ text: moveComment.value });
});

clearCommentButton.addEventListener("click", () => {
  moveAnnotations.delete(currentMoveIndex);
  updateAnnotationPanel();
  updateAnnotatedPgn();
});

openOptionsButton.addEventListener("click", () => {
  optionsOverlay.hidden = false;
  closeOptionsButton.focus();
});

closeOptionsButton.addEventListener("click", closeOptions);

optionsOverlay.addEventListener("click", (event) => {
  if (event.target === optionsOverlay) {
    closeOptions();
  }
});

optionTabs.forEach((tab) => {
  tab.addEventListener("click", () => activateOptionTab(tab.dataset.tab));
});

sideTabs.forEach((tab) => {
  tab.addEventListener("click", () => activateSideTab(tab.dataset.sideTab));
});

document.querySelector("#flipBoard").addEventListener("click", () => {
  flipped = !flipped;
  boardGroup.rotation.y = flipped ? Math.PI : 0;
  pieceMeshes.rotation.y = flipped ? Math.PI : 0;
});

soundEnabledInput.addEventListener("change", () => {
  soundEnabled = soundEnabledInput.checked;
  if (soundEnabled) {
    playSoundEffect("preview");
  }
});

soundVolumeInput.addEventListener("input", () => {
  soundVolume = Number(soundVolumeInput.value) / 100;
  soundVolumeLabel.value = `${soundVolumeInput.value}%`;
});

soundVolumeInput.addEventListener("change", () => playSoundEffect("preview"));

soundThemeSelect.addEventListener("change", () => {
  soundTheme = soundThemeSelect.value;
  playSoundEffect("preview");
});

document.querySelector("#resetCamera").addEventListener("click", () => {
  camera.position.set(0, 6.4, -8.4);
  controls.target.set(0, 0, 0);
  controls.update();
});

backgroundModeSelect.addEventListener("change", applyBackground);
backgroundImageSelect.addEventListener("change", () => {
  selectedBackgroundImage = backgroundImageSelect.value;
  backgroundModeSelect.value = "image";
  loadBackgroundImage(selectedBackgroundImage);
});
backgroundColorInput.addEventListener("input", applyBackground);

function applyBackground() {
  scene.background = backgroundModeSelect.value === "image" && backgroundImageTextures.has(selectedBackgroundImage)
    ? backgroundImageTextures.get(selectedBackgroundImage)
    : new THREE.Color(backgroundColorInput.value);
}

function loadBackgroundImage(fileName) {
  if (backgroundImageTextures.has(fileName)) {
    applyBackground();
    return;
  }

  backgroundTextureLoader.load(
    `images/${fileName}`,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      backgroundImageTextures.set(fileName, texture);
      applyBackground();
    },
    undefined,
    () => {
      backgroundModeSelect.value = "color";
      applyBackground();
    }
  );
}

pieceScaleInput.addEventListener("input", () => {
  pieceScale = Number(pieceScaleInput.value) / 100;
  pieceScaleLabel.value = `${pieceScaleInput.value}%`;
  renderFen(timeline[currentMoveIndex].fen, { moveCount: currentMoveIndex });
});

pieceThemeSelect.addEventListener("change", async () => {
  selectedPieceTheme = pieceThemeSelect.value;

  if (selectedPieceTheme === "code") {
    setStatus("Pieces stylisees chargees.");
    renderFen(timeline[currentMoveIndex].fen, { moveCount: currentMoveIndex });
    return;
  }

  realModelsLoading = true;
  pieceThemeSelect.disabled = true;
  setStatus(`Chargement du theme ${pieceModelThemes[selectedPieceTheme].label}...`);

  try {
    await loadPieceTheme(selectedPieceTheme);
    setStatus(`Theme ${pieceModelThemes[selectedPieceTheme].label} charge.`);
  } catch (error) {
    selectedPieceTheme = "code";
    pieceThemeSelect.value = "code";
    setStatus("Theme OBJ indisponible. Pieces stylisees chargees.", true);
  } finally {
    realModelsLoading = false;
    pieceThemeSelect.disabled = false;
    renderFen(timeline[currentMoveIndex].fen, { moveCount: currentMoveIndex });
  }
});

lightSquareColorInput.addEventListener("input", () => {
  lightSquare.color.set(lightSquareColorInput.value);
});

darkSquareColorInput.addEventListener("input", () => {
  darkSquare.color.set(darkSquareColorInput.value);
});

lightIntensityInput.addEventListener("input", () => {
  const ratio = Number(lightIntensityInput.value) / 100;
  ambient.intensity = baseLightIntensities.ambient * ratio;
  keyLight.intensity = baseLightIntensities.key * ratio;
  fillLight.intensity = baseLightIntensities.fill * ratio;
  lightIntensityLabel.value = `${lightIntensityInput.value}%`;
});

shadowIntensityInput.addEventListener("input", () => {
  shadowIntensity = Number(shadowIntensityInput.value) / 100;
  shadowIntensityLabel.value = `${shadowIntensityInput.value}%`;
  renderer.shadowMap.enabled = shadowIntensity > 0;
  if (shadowPlane) {
    shadowPlane.material.opacity = 0.28 * shadowIntensity;
    shadowPlane.visible = shadowIntensity > 0;
  }
  renderFen(timeline[currentMoveIndex].fen, { moveCount: currentMoveIndex });
});

moveAnimationsEnabledInput.addEventListener("change", () => {
  moveAnimationsEnabled = moveAnimationsEnabledInput.checked;
  activeAnimation = null;
});

animationSpeedInput.addEventListener("input", () => {
  animationSpeed = Number(animationSpeedInput.value) / 100;
  animationSpeedLabel.value = `${animationSpeedInput.value}%`;
});

randomAnimationSpeedInput.addEventListener("change", () => {
  randomAnimationSpeed = randomAnimationSpeedInput.checked;
});

window.addEventListener("resize", resize);
window.addEventListener("keydown", handleKeyboardNavigation);

function timelineFromText(source) {
  if (!source) {
    throw new Error("Ajoute un PGN ou une FEN avant de generer le rendu.");
  }

  const chess = new Chess();
  if (sourceLooksLikeFen(source)) {
    chess.load(source);
    return [{ fen: chess.fen(), label: "Position FEN" }];
  }

  const cleaned = source.replace(/\r/g, "").trim();
  chess.loadPgn(cleaned, { strict: false });
  return buildTimeline(chess);
}

function sourceLooksLikeFen(source) {
  const firstLine = source.split(/\n/).find(Boolean) || "";
  return firstLine.split(/\s+/).length >= 4 && /^[prnbqkPRNBQK1-8/]+$/.test(firstLine.split(/\s+/)[0]);
}

function populateGameLibrary() {
  gameLibrary.innerHTML = "";
  famousGames.forEach((game) => {
    const option = document.createElement("option");
    option.value = game.id;
    option.textContent = game.label;
    gameLibrary.append(option);
  });

  const customOption = document.createElement("option");
  customOption.value = "custom";
  customOption.textContent = "PGN personnalise";
  gameLibrary.append(customOption);
}

function buildAnnotationChoices() {
  annotationTypes.forEach((type) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "annotation-choice";
    button.dataset.annotation = type.id;
    button.innerHTML = `<span class="annotation-icon" style="--annotation-color: ${type.color}">${type.icon}</span><span>${type.label}</span>`;
    button.addEventListener("click", () => {
      const current = moveAnnotations.get(currentMoveIndex);
      const nextType = current?.type === type.id ? "" : type.id;
      updateCurrentAnnotation({ type: nextType });
    });
    annotationChoices.append(button);
  });
}

function loadSelectedGame(gameId) {
  const game = famousGames.find((entry) => entry.id === gameId) ?? famousGames[0];
  gameLibrary.value = game.id;
  pgnInput.value = game.pgn;
  renderCurrentInput();
}

async function initializeDefaultGame() {
  pieceThemeSelect.disabled = true;
  setStatus(`Chargement du theme ${pieceModelThemes[selectedPieceTheme].label}...`);

  try {
    await loadPieceTheme(selectedPieceTheme);
    setStatus(`Theme ${pieceModelThemes[selectedPieceTheme].label} charge.`);
  } catch (error) {
    selectedPieceTheme = "code";
    pieceThemeSelect.value = "code";
    setStatus("Modeles OBJ indisponibles. Pieces stylisees chargees.", true);
  } finally {
    pieceThemeSelect.disabled = false;
    loadSelectedGame("immortal");
  }
}

function handleKeyboardNavigation(event) {
  if (event.key === "Escape" && !optionsOverlay.hidden) {
    closeOptions();
    return;
  }

  const tagName = document.activeElement?.tagName;
  if (tagName === "TEXTAREA" || tagName === "INPUT" || tagName === "SELECT") {
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    showTimelinePosition(currentMoveIndex - 1);
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    showTimelinePosition(currentMoveIndex + 1);
  }
}

function closeOptions() {
  optionsOverlay.hidden = true;
  openOptionsButton.focus();
}

function activateOptionTab(tabName) {
  optionTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });
  optionPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === tabName);
  });
}

function activateSideTab(tabName) {
  sideTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.sideTab === tabName);
  });
  sidePanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.sidePanel === tabName);
  });
}

function buildTimeline(chess) {
  const reversed = [];
  while (chess.history().length > 0) {
    const fen = chess.fen();
    const move = chess.undo();
    reversed.push({ fen, label: move.san, move });
  }

  const positions = [{ fen: chess.fen(), label: "Depart" }];
  reversed.reverse().forEach((entry, index) => {
    const moveNumber = Math.floor(index / 2) + 1;
    const prefix = index % 2 === 0 ? `${moveNumber}.` : `${moveNumber}...`;
    positions.push({
      fen: entry.fen,
      label: `${prefix} ${entry.label}`,
      move: entry.move
    });
  });

  return positions;
}

function buildBoard() {
  const base = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.24, 8.6), edgeMat);
  base.position.y = -0.16;
  base.receiveShadow = true;
  boardGroup.add(base);

  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const material = (rank + file) % 2 === 0 ? darkSquare : lightSquare;
      const square = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.12, 0.98), material);
      square.position.set(fileToX(file), 0, rank - boardOffset);
      square.receiveShadow = true;
      boardGroup.add(square);
    }
  }

  addBoardCoordinates();

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(36, 36),
    new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.28 * shadowIntensity })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.29;
  plane.receiveShadow = true;
  scene.add(plane);
  shadowPlane = plane;
}

function addBoardCoordinates() {
  const files = "abcdefgh";
  const labelMaterial = (text, onDarkSquare) => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = onDarkSquare ? "#f4edc7" : "#6d8a43";
    context.font = "700 78px Inter, Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 64, 66);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false
    });
    return material;
  };

  for (let file = 0; file < 8; file += 1) {
    const isDark = file % 2 === 0;
    const label = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.28), labelMaterial(files[file], isDark));
    label.rotation.x = -Math.PI / 2;
    label.rotation.z = Math.PI;
    label.position.set(fileToX(file) - 0.35, 0.075, -boardOffset - 0.34);
    label.renderOrder = 2;
    boardGroup.add(label);
  }

  for (let rank = 0; rank < 8; rank += 1) {
    const isDark = rank % 2 === 0;
    const label = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.28), labelMaterial(String(rank + 1), isDark));
    label.rotation.x = -Math.PI / 2;
    label.rotation.z = Math.PI;
    label.position.set(boardOffset + 0.35, 0.075, rank - boardOffset + 0.35);
    label.renderOrder = 2;
    boardGroup.add(label);
  }
}

function renderFen(fen, details = {}) {
  activeAnimation = null;
  pieceMeshes.clear();
  const chess = new Chess(fen);
  const board = chess.board();
  let pieces = 0;

  board.forEach((rankSquares, rankIndex) => {
    rankSquares.forEach((piece, fileIndex) => {
      if (!piece) return;
      pieces += 1;
      const mesh = createPiece(piece);
      mesh.position.set(fileToX(fileIndex), 0.08, boardOffset - rankIndex);
      mesh.userData.square = `${"abcdefgh"[fileIndex]}${8 - rankIndex}`;
      pieceMeshes.add(mesh);
    });
  });

  fenOutput.value = fen;
  positionLabel.textContent = chess.isCheckmate()
    ? "Echec et mat"
    : chess.isCheck()
      ? "Roi en echec"
      : "Position chargee";
  turnMetric.textContent = chess.turn() === "w" ? "Blancs" : "Noirs";
  moveMetric.textContent = Math.max(0, details.moveCount ?? 0).toString();
  pieceMetric.textContent = pieces.toString();
  if (!details.suppressAnnotationBubble) {
    updateAnnotationBubble();
  }
}

function showTimelinePosition(index) {
  const safeIndex = Math.max(0, Math.min(index, timeline.length - 1));
  const entry = timeline[safeIndex];
  const previousMoveIndex = currentMoveIndex;
  const previousEntry = timeline[previousMoveIndex];
  currentMoveIndex = safeIndex;
  lastFen = entry.fen;
  lastMoveCount = safeIndex;
  if (moveAnimationsEnabled && Math.abs(safeIndex - previousMoveIndex) === 1 && entry.move) {
    animateTimelineStep(previousEntry, entry, safeIndex > previousMoveIndex);
  } else {
    renderFen(entry.fen, { moveCount: safeIndex });
  }
  updateMovePlayer(entry);
  updateAnnotationPanel();
  playMoveSound(entry, previousMoveIndex);
}

function updateMovePlayer(entry) {
  moveSlider.max = Math.max(0, timeline.length - 1).toString();
  moveSlider.value = currentMoveIndex.toString();
  moveSlider.disabled = timeline.length <= 1;
  moveLabel.value = `${currentMoveIndex}/${timeline.length - 1} - ${entry.label}`;
  firstMoveButton.disabled = currentMoveIndex === 0;
  previousMoveButton.disabled = currentMoveIndex === 0;
  nextMoveButton.disabled = currentMoveIndex >= timeline.length - 1;
  lastMoveButton.disabled = currentMoveIndex >= timeline.length - 1;
}

function updateCurrentAnnotation(patch) {
  if (currentMoveIndex === 0) return;

  const current = moveAnnotations.get(currentMoveIndex) ?? { type: "", text: "" };
  const next = { ...current, ...patch };

  if (!next.type && !next.text.trim()) {
    moveAnnotations.delete(currentMoveIndex);
  } else {
    moveAnnotations.set(currentMoveIndex, next);
  }

  updateAnnotationPanel();
  updateAnnotatedPgn();
  updateAnnotationBubble();
}

function updateAnnotationPanel() {
  const entry = timeline[currentMoveIndex];
  const annotation = moveAnnotations.get(currentMoveIndex) ?? { type: "", text: "" };
  annotationCurrent.textContent = currentMoveIndex === 0
    ? "Position initiale"
    : `${entry.label}`;
  moveComment.value = annotation.text;
  moveComment.disabled = currentMoveIndex === 0;
  clearCommentButton.disabled = currentMoveIndex === 0 || (!annotation.type && !annotation.text);

  annotationChoices.querySelectorAll(".annotation-choice").forEach((button) => {
    button.disabled = currentMoveIndex === 0;
    button.classList.toggle("active", button.dataset.annotation === annotation.type);
  });
}

function updateAnnotationBubble() {
  clearAnnotationBubble();
  if (currentMoveIndex === 0) return;

  const annotation = moveAnnotations.get(currentMoveIndex);
  if (!annotation?.type) return;

  const move = timeline[currentMoveIndex]?.move;
  if (!move?.to) return;

  const type = annotationTypes.find((entry) => entry.id === annotation.type);
  if (!type) return;

  const bubble = createAnnotationBubble(type);
  const position = squareToPosition(move.to);
  bubble.position.set(position.x, 2.15, position.z);
  bubble.userData.annotationBubble = true;
  pieceMeshes.add(bubble);
}

function clearAnnotationBubble() {
  [...pieceMeshes.children].forEach((child) => {
    if (child.userData.annotationBubble) {
      child.material?.map?.dispose?.();
      child.material?.dispose?.();
      pieceMeshes.remove(child);
    }
  });
}

function createAnnotationBubble(type) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 220;
  const context = canvas.getContext("2d");

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = type.color;
  context.beginPath();
  context.arc(128, 110, 82, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#17201b";
  context.font = "900 78px Inter, Arial, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(type.icon, 128, 113);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.1, 1.1, 1);
  return sprite;
}

function updateAnnotatedPgn() {
  annotatedPgn.value = buildAnnotatedPgn();
}

function buildAnnotatedPgn() {
  const headers = pgnInput.value
    .split(/\r?\n/)
    .filter((line) => /^\[[^\]]+\]$/.test(line.trim()))
    .join("\n");
  const moves = [];

  for (let index = 1; index < timeline.length; index += 1) {
    const entry = timeline[index];
    if (index % 2 === 1) {
      moves.push(`${Math.floor(index / 2) + 1}.`);
    } else if (index === timeline.length - 1 && entry.move?.color === "b") {
      moves.push(`${Math.floor(index / 2)}...`);
    }

    moves.push(entry.move?.san ?? entry.label.replace(/^\d+\.\.\.\s|^\d+\.\s/, ""));

    const annotation = moveAnnotations.get(index);
    if (annotation?.type || annotation?.text.trim()) {
      moves.push(`{${formatPgnComment(annotation)}}`);
    }
  }

  const result = sourceLooksLikeFen(pgnInput.value) ? "" : getPgnResult();
  return `${headers}${headers ? "\n\n" : ""}${moves.join(" ")}${result ? ` ${result}` : ""}`.trim();
}

function formatPgnComment(annotation) {
  const type = annotationTypes.find((entry) => entry.id === annotation.type);
  const parts = [];
  if (type) parts.push(`${type.icon} ${type.label}`);
  if (annotation.text.trim()) parts.push(annotation.text.trim().replace(/[{}]/g, ""));
  return parts.join(" - ");
}

function getPgnResult() {
  const result = pgnInput.value.match(/\s(1-0|0-1|1\/2-1\/2|\*)\s*$/);
  return result?.[1] ?? "";
}

function animateTimelineStep(fromEntry, toEntry, isForward) {
  const move = isForward ? toEntry.move : fromEntry.move;
  if (!move) {
    renderFen(toEntry.fen, { moveCount: currentMoveIndex });
    return;
  }

  renderFen(isForward ? fromEntry.fen : fromEntry.fen, { moveCount: currentMoveIndex, suppressAnnotationBubble: true });
  const movingFrom = isForward ? move.from : move.to;
  const movingTo = isForward ? move.to : move.from;
  const movingPiece = findPieceMeshAt(movingFrom);

  if (!movingPiece) {
    renderFen(toEntry.fen, { moveCount: currentMoveIndex });
    return;
  }

  const capturedSquare = move.flags.includes("e") && isForward
    ? `${move.to[0]}${move.from[1]}`
    : movingTo;
  const capturedPiece = isForward && move.captured ? findPieceMeshAt(capturedSquare) : null;
  if (capturedPiece) {
    makeMeshTransparent(capturedPiece);
  }

  const start = squareToPosition(movingFrom);
  const end = squareToPosition(movingTo);
  movingPiece.position.copy(start);
  const movingAnnotationBubble = createMovingAnnotationBubble(move, movingFrom);

  activeAnimation = {
    movingPiece,
    movingAnnotationBubble,
    capturedPiece,
    start,
    end,
    startTime: performance.now(),
    duration: getMoveAnimationDuration(move),
    finalFen: toEntry.fen,
    finalMoveCount: currentMoveIndex
  };
}

function createMovingAnnotationBubble(move, movingFrom) {
  const annotationIndex = currentMoveIndex;
  const annotation = moveAnnotations.get(annotationIndex);
  if (!annotation?.type) return null;

  const type = annotationTypes.find((entry) => entry.id === annotation.type);
  if (!type) return null;

  const bubble = createAnnotationBubble(type);
  const position = squareToPosition(movingFrom);
  bubble.position.set(position.x, 2.15, position.z);
  bubble.userData.annotationBubble = true;
  pieceMeshes.add(bubble);
  return bubble;
}

function getMoveAnimationDuration(move) {
  const baseDuration = move.flags.includes("n") ? 380 : 520;
  const randomRatio = randomAnimationSpeed ? 0.65 + Math.random() * 0.7 : 1;
  return baseDuration / (animationSpeed * randomRatio);
}

function updateActiveAnimation() {
  if (!activeAnimation) return;

  const elapsed = performance.now() - activeAnimation.startTime;
  const progress = Math.min(1, elapsed / activeAnimation.duration);
  const eased = easeInOutCubic(progress);
  activeAnimation.movingPiece.position.lerpVectors(activeAnimation.start, activeAnimation.end, eased);
  activeAnimation.movingPiece.position.y = 0.08 + Math.sin(progress * Math.PI) * 0.42;

  if (activeAnimation.movingAnnotationBubble) {
    activeAnimation.movingAnnotationBubble.position.x = activeAnimation.movingPiece.position.x;
    activeAnimation.movingAnnotationBubble.position.z = activeAnimation.movingPiece.position.z;
    activeAnimation.movingAnnotationBubble.position.y = activeAnimation.movingPiece.position.y + 2.07;
  }

  if (activeAnimation.capturedPiece) {
    const scale = 1 - eased * 0.75;
    activeAnimation.capturedPiece.scale.setScalar(Math.max(0.2, scale));
    setMeshOpacity(activeAnimation.capturedPiece, 1 - eased);
  }

  if (progress >= 1) {
    const finalFen = activeAnimation.finalFen;
    const finalMoveCount = activeAnimation.finalMoveCount;
    activeAnimation = null;
    renderFen(finalFen, { moveCount: finalMoveCount });
  }
}

function findPieceMeshAt(square) {
  return pieceMeshes.children.find((mesh) => mesh.userData.square === square) || null;
}

function squareToPosition(square) {
  const file = square.charCodeAt(0) - "a".charCodeAt(0);
  const rank = Number(square[1]);
  return new THREE.Vector3(fileToX(file), 0.08, rank - 1 - boardOffset);
}

function makeMeshTransparent(group) {
  group.traverse((child) => {
    if (!child.isMesh) return;
    child.material = child.material.clone();
    child.material.transparent = true;
    child.material.depthWrite = false;
  });
}

function setMeshOpacity(group, opacity) {
  group.traverse((child) => {
    if (child.isMesh) {
      child.material.opacity = Math.max(0.001, opacity);
    }
  });
}

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function playMoveSound(entry, previousMoveIndex) {
  if (currentMoveIndex === previousMoveIndex || currentMoveIndex === 0 || !entry.move) {
    return;
  }

  const chess = new Chess(entry.fen);
  if (chess.isCheckmate()) {
    playSoundEffect("mate");
    return;
  }

  if (chess.isCheck()) {
    playSoundEffect("check");
    return;
  }

  if (entry.move.captured) {
    playSoundEffect("capture");
    return;
  }

  playSoundEffect("move");
}

function playSoundEffect(effect) {
  const patterns = {
    preview: [{ frequency: 660, duration: 0.06, gain: 0.035 }],
    move: [
      { frequency: 520, duration: 0.045, gain: 0.032 },
      { frequency: 390, duration: 0.045, gain: 0.026, delay: 0.045 }
    ],
    capture: [
      { frequency: 240, duration: 0.05, gain: 0.045 },
      { frequency: 170, duration: 0.09, gain: 0.035, delay: 0.05 }
    ],
    check: [
      { frequency: 880, duration: 0.07, gain: 0.04 },
      { frequency: 660, duration: 0.08, gain: 0.035, delay: 0.08 }
    ],
    mate: [
      { frequency: 740, duration: 0.08, gain: 0.045 },
      { frequency: 520, duration: 0.12, gain: 0.04, delay: 0.08 },
      { frequency: 880, duration: 0.16, gain: 0.035, delay: 0.2 }
    ]
  };

  playToneSequence(patterns[effect] ?? patterns.move);
}

function playToneSequence(notes) {
  if (!soundEnabled) return;
  audioContext ??= new AudioContext();

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const now = audioContext.currentTime;
  const theme = soundThemes[soundTheme] ?? soundThemes.wood;
  notes.forEach((note) => {
    const start = now + (note.delay ?? 0);
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const duration = note.duration * theme.durationRatio;
    const targetGain = note.gain * soundVolume * theme.gainRatio;

    oscillator.type = theme.type;
    oscillator.frequency.setValueAtTime(note.frequency * theme.frequencyRatio, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, targetGain), start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  });
}

function createPiece(piece) {
  const realModels = loadedModelThemes.get(selectedPieceTheme);
  if (selectedPieceTheme !== "code" && !realModelsLoading && realModels?.has(piece.type)) {
    const group = createRealPiece(piece);
    group.scale.multiplyScalar(pieceScale);
    return group;
  }

  const group = new THREE.Group();
  const material = piece.color === "w" ? whiteMat : blackMat;
  const trim = piece.color === "w" ? goldMat : edgeMat;

  addCylinder(group, 0.31, 0.37, 0.12, 0.08, material);
  addCylinder(group, 0.22, 0.26, 0.24, 0.25, material);

  if (piece.type === "p") {
    addSphere(group, 0.24, 0.55, material);
  }

  if (piece.type === "r") {
    addCylinder(group, 0.28, 0.28, 0.36, 0.52, material);
    for (let i = 0; i < 4; i += 1) {
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), material);
      tooth.position.set(Math.cos(i * Math.PI / 2) * 0.18, 0.78, Math.sin(i * Math.PI / 2) * 0.18);
      tooth.castShadow = true;
      group.add(tooth);
    }
  }

  if (piece.type === "n") {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.36, 8, 16), material);
    body.position.set(0.05, 0.62, 0);
    body.rotation.z = -0.36;
    body.castShadow = true;
    group.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.18), material);
    head.position.set(0.03, 0.87, -0.1);
    head.rotation.x = -0.5;
    head.castShadow = true;
    group.add(head);
  }

  if (piece.type === "b") {
    addCylinder(group, 0.18, 0.26, 0.52, 0.52, material);
    addSphere(group, 0.22, 0.85, material);
    addCylinder(group, 0.025, 0.025, 0.24, 1.05, trim);
  }

  if (piece.type === "q") {
    addCylinder(group, 0.2, 0.3, 0.56, 0.52, material);
    for (let i = 0; i < 6; i += 1) {
      addSphere(group, 0.07, 0.98, trim, Math.cos(i * Math.PI / 3) * 0.2, Math.sin(i * Math.PI / 3) * 0.2);
    }
    addSphere(group, 0.15, 0.86, material);
  }

  if (piece.type === "k") {
    addCylinder(group, 0.2, 0.3, 0.58, 0.52, material);
    const vertical = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.36, 0.08), trim);
    vertical.position.y = 1.02;
    vertical.castShadow = true;
    group.add(vertical);
    const horizontal = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.07, 0.07), trim);
    horizontal.position.y = 1.08;
    horizontal.castShadow = true;
    group.add(horizontal);
  }

  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  group.scale.setScalar(pieceScale);
  return group;
}

async function loadPieceTheme(themeId) {
  if (themeId === "code" || loadedModelThemes.has(themeId)) return;

  const theme = pieceModelThemes[themeId];
  if (!theme) {
    throw new Error(`Theme inconnu: ${themeId}`);
  }

  const loader = new OBJLoader();
  const realModels = new Map();

  for (const [type, file] of Object.entries(theme.files)) {
    const url = `${theme.basePath}/${file.replaceAll(" ", "%20")}`;
    const object = await loader.loadAsync(url);
    normalizeModel(object, theme.heights[type]);
    realModels.set(type, object);
  }

  loadedModelThemes.set(themeId, realModels);
}

function normalizeModel(object, targetHeight) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  object.position.x -= center.x;
  object.position.z -= center.z;
  object.position.y -= box.min.y;
  object.scale.setScalar(targetHeight / Math.max(size.y, 0.001));

  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

function createRealPiece(piece) {
  const source = loadedModelThemes.get(selectedPieceTheme).get(piece.type);
  const group = source.clone(true);
  const material = (piece.color === "w" ? whiteMat : blackMat).clone();
  material.transparent = false;
  material.opacity = 1;
  material.depthWrite = true;
  material.side = THREE.DoubleSide;

  group.traverse((child) => {
    if (child.isMesh) {
      child.material = material;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return group;
}

function fileToX(fileIndex) {
  return boardOffset - fileIndex;
}

function addCylinder(group, top, bottom, height, y, material) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, 32), material);
  mesh.position.y = y;
  group.add(mesh);
}

function addSphere(group, radius, y, material, x = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 18), material);
  mesh.position.set(x, y, z);
  group.add(mesh);
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function resize() {
  const { clientWidth, clientHeight } = canvas;
  renderer.setSize(clientWidth, clientHeight, false);
  camera.aspect = clientWidth / Math.max(1, clientHeight);
  camera.updateProjectionMatrix();
}

function animate() {
  updateActiveAnimation();
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
