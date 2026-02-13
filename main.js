const logic = globalThis.SnakeGameLogic;
if (!logic) {
  const fallbackStatus = document.getElementById("status");
  if (fallbackStatus) {
    fallbackStatus.textContent = "Failed to load game script. Reload the page.";
  }
  throw new Error("SnakeGameLogic is not available");
}

const { createInitialState, setDirection, tick } = logic;

const TICK_MS = 140;
const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const pauseBtn = document.getElementById("pause");

if (!boardEl || !scoreEl || !statusEl || !restartBtn || !pauseBtn) {
  throw new Error("Missing required game elements in index.html");
}

const keyDirectionMap = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  a: "left",
  s: "down",
  d: "right",
};

let state = createInitialState();
let timer = null;
let paused = false;

const cells = [];
for (let i = 0; i < state.gridSize * state.gridSize; i += 1) {
  const cell = document.createElement("div");
  cell.className = "cell";
  boardEl.appendChild(cell);
  cells.push(cell);
}

function pointToIndex(p) {
  return p.y * state.gridSize + p.x;
}

function render() {
  for (const cell of cells) {
    cell.classList.remove("bride", "bride-lead", "bride-partner", "car");
    cell.textContent = "";
  }

  state.snake.forEach((segment, index) => {
    const idx = pointToIndex(segment);
    if (!cells[idx]) return;
    cells[idx].classList.add("bride");
    if (index === 0) {
      cells[idx].classList.add("bride-lead");
      cells[idx].textContent = "👰";
    } else if (index === 1) {
      cells[idx].classList.add("bride-partner");
      cells[idx].textContent = "👰";
    }
  });

  const foodIdx = pointToIndex(state.food);
  if (cells[foodIdx]) {
    cells[foodIdx].classList.add("car");
    cells[foodIdx].textContent = "🚗";
  }

  scoreEl.textContent = String(state.score);
  if (state.gameOver) {
    statusEl.textContent = "Party over. Press Restart to play again.";
  } else if (paused) {
    statusEl.textContent = "Paused. Press Pause to resume.";
  } else {
    statusEl.textContent = "Use arrow keys or WASD to guide the brides.";
  }
}

function gameTick() {
  state = tick(state);
  render();

  if (state.gameOver) {
    stopLoop();
  }
}

function startLoop() {
  stopLoop();
  timer = setInterval(gameTick, TICK_MS);
}

function stopLoop() {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
}

function restartGame() {
  state = createInitialState();
  paused = false;
  pauseBtn.textContent = "Pause";
  render();
  startLoop();
}

function togglePause() {
  if (state.gameOver) return;
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
  if (paused) {
    stopLoop();
  } else {
    startLoop();
  }
  render();
}

document.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const dir = keyDirectionMap[key];
  if (!dir) return;

  event.preventDefault();
  state = setDirection(state, dir);
});

for (const btn of document.querySelectorAll("[data-dir]")) {
  btn.addEventListener("click", () => {
    const dir = btn.getAttribute("data-dir");
    state = setDirection(state, dir);
  });
}

restartBtn.addEventListener("click", restartGame);
pauseBtn.addEventListener("click", togglePause);

render();
startLoop();
