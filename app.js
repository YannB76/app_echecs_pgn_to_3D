import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { Chess } from "chess.js";

const canvas = document.querySelector("#scene");
const pgnInput = document.querySelector("#pgnInput");
const fenOutput = document.querySelector("#fenOutput");
const statusEl = document.querySelector("#status");
const positionLabel = document.querySelector("#positionLabel");
const turnMetric = document.querySelector("#turnMetric");
const moveMetric = document.querySelector("#moveMetric");
const pieceMetric = document.querySelector("#pieceMetric");
const moveSlider = document.querySelector("#moveSlider");
const moveLabel = document.querySelector("#moveLabel");
const firstMoveButton = document.querySelector("#firstMove");
const previousMoveButton = document.querySelector("#previousMove");
const nextMoveButton = document.querySelector("#nextMove");
const lastMoveButton = document.querySelector("#lastMove");
const toggleSoundButton = document.querySelector("#toggleSound");
const toggleModelsButton = document.querySelector("#toggleModels");
const backgroundColorInput = document.querySelector("#backgroundColor");
const pieceScaleInput = document.querySelector("#pieceScale");
const pieceScaleLabel = document.querySelector("#pieceScaleLabel");

const squareSize = 1;
const boardOffset = 3.5;
const pieceMeshes = new THREE.Group();
let flipped = false;
let lastFen = new Chess().fen();
let lastMoveCount = 0;
let timeline = [{ fen: lastFen, label: "Depart" }];
let currentMoveIndex = 0;
let soundEnabled = true;
let audioContext = null;
let activeAnimation = null;
let realModelsEnabled = false;
let realModelsLoading = false;
let pieceScale = 0.8;
const realModels = new Map();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x37a072);

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

const boardGroup = new THREE.Group();
scene.add(boardGroup, pieceMeshes);

const lightSquare = new THREE.MeshStandardMaterial({ color: 0xdcc9a3, roughness: 0.68, metalness: 0.03 });
const darkSquare = new THREE.MeshStandardMaterial({ color: 0x6e5437, roughness: 0.74, metalness: 0.02 });
const edgeMat = new THREE.MeshStandardMaterial({ color: 0x2a2119, roughness: 0.7 });
const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf1efe7, roughness: 0.55, metalness: 0.08 });
const blackMat = new THREE.MeshStandardMaterial({ color: 0x24282d, roughness: 0.5, metalness: 0.16 });
const goldMat = new THREE.MeshStandardMaterial({ color: 0xd7a94b, roughness: 0.44, metalness: 0.22 });

buildBoard();
showTimelinePosition(0);
resize();
animate();

document.querySelector("#renderPosition").addEventListener("click", () => {
  const source = pgnInput.value.trim();
  try {
    timeline = timelineFromText(source);
    currentMoveIndex = timeline.length - 1;
    lastFen = timeline[currentMoveIndex].fen;
    lastMoveCount = currentMoveIndex;
    showTimelinePosition(currentMoveIndex);
    setStatus(`Rendu genere depuis ${sourceLooksLikeFen(source) ? "FEN" : "PGN"}.`);
  } catch (error) {
    setStatus(error.message || "Impossible de lire cette position.", true);
  }
});

document.querySelector("#loadStart").addEventListener("click", () => {
  const chess = new Chess();
  pgnInput.value = chess.fen();
  lastFen = chess.fen();
  lastMoveCount = 0;
  timeline = [{ fen: lastFen, label: "Depart" }];
  showTimelinePosition(0);
  setStatus("Position de depart chargee.");
});

firstMoveButton.addEventListener("click", () => showTimelinePosition(0));
previousMoveButton.addEventListener("click", () => showTimelinePosition(currentMoveIndex - 1));
nextMoveButton.addEventListener("click", () => showTimelinePosition(currentMoveIndex + 1));
lastMoveButton.addEventListener("click", () => showTimelinePosition(timeline.length - 1));
moveSlider.addEventListener("input", () => showTimelinePosition(Number(moveSlider.value)));

document.querySelector("#flipBoard").addEventListener("click", () => {
  flipped = !flipped;
  boardGroup.rotation.y = flipped ? Math.PI : 0;
  pieceMeshes.rotation.y = flipped ? Math.PI : 0;
});

toggleSoundButton.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  toggleSoundButton.setAttribute("aria-pressed", String(soundEnabled));
  toggleSoundButton.textContent = soundEnabled ? "Son" : "Muet";
  if (soundEnabled) {
    playToneSequence([{ frequency: 660, duration: 0.06, gain: 0.035 }]);
  }
});

toggleModelsButton.addEventListener("click", async () => {
  realModelsEnabled = !realModelsEnabled;
  toggleModelsButton.textContent = realModelsEnabled ? "Style code" : "Pieces 3D";
  toggleModelsButton.disabled = true;

  if (realModelsEnabled && realModels.size === 0) {
    realModelsLoading = true;
    setStatus("Chargement des modeles OBJ...");
    try {
      await loadRealModels();
      setStatus("Modeles OBJ charges.");
    } catch (error) {
      realModelsEnabled = false;
      setStatus("Impossible de charger les modeles OBJ. Pieces stylisees conservees.", true);
    } finally {
      realModelsLoading = false;
    }
  }

  toggleModelsButton.disabled = false;
  showTimelinePosition(currentMoveIndex);
});

document.querySelector("#resetCamera").addEventListener("click", () => {
  camera.position.set(0, 6.4, -8.4);
  controls.target.set(0, 0, 0);
  controls.update();
});

backgroundColorInput.addEventListener("input", () => {
  scene.background.set(backgroundColorInput.value);
});

pieceScaleInput.addEventListener("input", () => {
  pieceScale = Number(pieceScaleInput.value) / 100;
  pieceScaleLabel.value = `${pieceScaleInput.value}%`;
  renderFen(timeline[currentMoveIndex].fen, { moveCount: currentMoveIndex });
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

function handleKeyboardNavigation(event) {
  const tagName = document.activeElement?.tagName;
  if (tagName === "TEXTAREA" || tagName === "INPUT") {
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
    new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.28 })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.29;
  plane.receiveShadow = true;
  scene.add(plane);
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
}

function showTimelinePosition(index) {
  const safeIndex = Math.max(0, Math.min(index, timeline.length - 1));
  const entry = timeline[safeIndex];
  const previousMoveIndex = currentMoveIndex;
  const previousEntry = timeline[previousMoveIndex];
  currentMoveIndex = safeIndex;
  lastFen = entry.fen;
  lastMoveCount = safeIndex;
  if (Math.abs(safeIndex - previousMoveIndex) === 1 && entry.move) {
    animateTimelineStep(previousEntry, entry, safeIndex > previousMoveIndex);
  } else {
    renderFen(entry.fen, { moveCount: safeIndex });
  }
  updateMovePlayer(entry);
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

function animateTimelineStep(fromEntry, toEntry, isForward) {
  const move = isForward ? toEntry.move : fromEntry.move;
  if (!move) {
    renderFen(toEntry.fen, { moveCount: currentMoveIndex });
    return;
  }

  renderFen(isForward ? fromEntry.fen : fromEntry.fen, { moveCount: currentMoveIndex });
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

  activeAnimation = {
    movingPiece,
    capturedPiece,
    start,
    end,
    startTime: performance.now(),
    duration: move.flags.includes("n") ? 380 : 520,
    finalFen: toEntry.fen,
    finalMoveCount: currentMoveIndex
  };
}

function updateActiveAnimation() {
  if (!activeAnimation) return;

  const elapsed = performance.now() - activeAnimation.startTime;
  const progress = Math.min(1, elapsed / activeAnimation.duration);
  const eased = easeInOutCubic(progress);
  activeAnimation.movingPiece.position.lerpVectors(activeAnimation.start, activeAnimation.end, eased);
  activeAnimation.movingPiece.position.y = 0.08 + Math.sin(progress * Math.PI) * 0.42;

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
    playToneSequence([
      { frequency: 740, duration: 0.08, gain: 0.045 },
      { frequency: 520, duration: 0.12, gain: 0.04, delay: 0.08 },
      { frequency: 880, duration: 0.16, gain: 0.035, delay: 0.2 }
    ]);
    return;
  }

  if (chess.isCheck()) {
    playToneSequence([
      { frequency: 880, duration: 0.07, gain: 0.04 },
      { frequency: 660, duration: 0.08, gain: 0.035, delay: 0.08 }
    ]);
    return;
  }

  if (entry.move.captured) {
    playToneSequence([
      { frequency: 240, duration: 0.05, gain: 0.045 },
      { frequency: 170, duration: 0.09, gain: 0.035, delay: 0.05 }
    ]);
    return;
  }

  playToneSequence([
    { frequency: 520, duration: 0.045, gain: 0.032 },
    { frequency: 390, duration: 0.045, gain: 0.026, delay: 0.045 }
  ]);
}

function playToneSequence(notes) {
  if (!soundEnabled) return;
  audioContext ??= new AudioContext();

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const now = audioContext.currentTime;
  notes.forEach((note) => {
    const start = now + (note.delay ?? 0);
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(note.frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(note.gain, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + note.duration);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + note.duration + 0.02);
  });
}

function createPiece(piece) {
  if (realModelsEnabled && !realModelsLoading && realModels.has(piece.type)) {
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

async function loadRealModels() {
  const loader = new OBJLoader();
  const modelFiles = {
    p: "Pawn V1.obj",
    r: "Rook V1.obj",
    n: "Knight.obj",
    b: "Bishop V1.obj",
    q: "Queen V1.obj",
    k: "King V1.obj"
  };
  const heights = {
    p: 1.15,
    r: 1.34,
    n: 1.48,
    b: 1.58,
    q: 1.74,
    k: 1.86
  };

  for (const [type, file] of Object.entries(modelFiles)) {
    const url = `assets/models/chess-obj/OBJ%20Files/${file.replaceAll(" ", "%20")}`;
    const object = await loader.loadAsync(url);
    normalizeModel(object, heights[type]);
    realModels.set(type, object);
  }
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
  const source = realModels.get(piece.type);
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
