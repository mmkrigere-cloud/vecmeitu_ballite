import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const source = fs.readFileSync(path.join(__dirname, "gameLogic.js"), "utf8");

const sandbox = {
  globalThis: {},
  window: {},
  Math,
  Set,
};
sandbox.window = sandbox.globalThis;
vm.runInNewContext(source, sandbox);

const { createInitialState, placeFood, setDirection, tick } =
  sandbox.globalThis.SnakeGameLogic;

function randomSequence(values) {
  let index = 0;
  return () => {
    const value = values[index] ?? values[values.length - 1] ?? 0;
    index += 1;
    return value;
  };
}

test("tick moves snake one step in current direction", () => {
  const state = createInitialState(() => 0);
  const next = tick(state, () => 0);

  assert.equal(next.snake[0].x, state.snake[0].x + 1);
  assert.equal(next.snake[0].y, state.snake[0].y);
  assert.equal(next.snake.length, state.snake.length);
});

test("setDirection blocks instant reverse", () => {
  const state = createInitialState(() => 0);
  const changed = setDirection(state, "left");

  assert.equal(changed.nextDirection, "right");
});

test("eating food grows snake and increments score", () => {
  const base = createInitialState(() => 0);
  const state = {
    ...base,
    food: { x: base.snake[0].x + 1, y: base.snake[0].y },
  };

  const next = tick(state, randomSequence([0]));

  assert.equal(next.snake.length, state.snake.length + 1);
  assert.equal(next.score, state.score + 1);
  assert.notDeepEqual(next.food, state.food);
});

test("wall collision ends game", () => {
  const state = {
    ...createInitialState(() => 0),
    snake: [{ x: 19, y: 0 }, { x: 18, y: 0 }, { x: 17, y: 0 }],
    direction: "right",
    nextDirection: "right",
  };

  const next = tick(state, () => 0);
  assert.equal(next.gameOver, true);
});

test("placeFood never picks occupied cells", () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  const food = placeFood(snake, 3, () => 0);
  const occupied = snake.some((s) => s.x === food.x && s.y === food.y);
  assert.equal(occupied, false);
});
