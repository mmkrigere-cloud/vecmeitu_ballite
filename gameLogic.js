(function attachSnakeGameLogic(root) {
  const GRID_SIZE = 20;

  const DIRECTIONS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  const OPPOSITES = {
    up: "down",
    down: "up",
    left: "right",
    right: "left",
  };

  function createInitialState(random = Math.random) {
    const center = Math.floor(GRID_SIZE / 2);
    const snake = [
      { x: center, y: center },
      { x: center - 1, y: center },
      { x: center - 2, y: center },
    ];

    return {
      gridSize: GRID_SIZE,
      snake,
      direction: "right",
      nextDirection: "right",
      food: placeFood(snake, GRID_SIZE, random),
      score: 0,
      gameOver: false,
    };
  }

  function setDirection(state, dir) {
    if (!DIRECTIONS[dir]) return state;
    if (state.gameOver) return state;
    if (OPPOSITES[state.direction] === dir) return state;
    return { ...state, nextDirection: dir };
  }

  function tick(state, random = Math.random) {
    if (state.gameOver) return state;

    const direction = state.nextDirection;
    const move = DIRECTIONS[direction];
    const head = state.snake[0];
    const nextHead = { x: head.x + move.x, y: head.y + move.y };

    const hitWall =
      nextHead.x < 0 ||
      nextHead.y < 0 ||
      nextHead.x >= state.gridSize ||
      nextHead.y >= state.gridSize;

    const ateFood = nextHead.x === state.food.x && nextHead.y === state.food.y;
    const bodyToCheck = ateFood ? state.snake : state.snake.slice(0, -1);

    if (hitWall || hitsSnake(nextHead, bodyToCheck)) {
      return { ...state, direction, gameOver: true };
    }

    const nextSnake = [nextHead, ...state.snake];

    if (!ateFood) {
      nextSnake.pop();
    }

    const nextFood = ateFood
      ? placeFood(nextSnake, state.gridSize, random)
      : state.food;

    return {
      ...state,
      snake: nextSnake,
      direction,
      food: nextFood,
      score: ateFood ? state.score + 1 : state.score,
      gameOver: false,
    };
  }

  function hitsSnake(point, snake) {
    return snake.some((segment) => segment.x === point.x && segment.y === point.y);
  }

  function placeFood(snake, gridSize, random = Math.random) {
    const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));
    const freeCells = [];

    for (let y = 0; y < gridSize; y += 1) {
      for (let x = 0; x < gridSize; x += 1) {
        const key = `${x},${y}`;
        if (!occupied.has(key)) freeCells.push({ x, y });
      }
    }

    if (freeCells.length === 0) {
      return snake[0];
    }

    const idx = Math.floor(random() * freeCells.length);
    return freeCells[idx];
  }

  root.SnakeGameLogic = {
    GRID_SIZE,
    DIRECTIONS,
    createInitialState,
    setDirection,
    tick,
    placeFood,
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
