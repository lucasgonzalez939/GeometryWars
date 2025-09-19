Geometry Wars - Modular Educational Geometry Games

Project layout (recommended):

- index.html - main entry
- assets/
  - css/styles.css - responsive layout
  - js/
    - engine.js - game engine and scene manager
    - game-manager.js - orchestrates which game is running
    - games/ - individual game modules (game1.js, game2.js, ...)
    - shared/ - shared utilities (storage, scoring, HUD, utils)

How to run locally:

1) From the project root, start a static server:

   python3 -m http.server 8000

2) Open http://localhost:8000/ in your browser.

Module contracts and notes:

- Engine.init(canvasId, initialScene) — initializes canvas, input, and starts the loop. Scenes should implement update(deltaTime) and render(ctx).
- GameManager.startGame(gameId) — loads a game's scene and calls its onEnter method if present.
- Shared utilities are lightweight wrappers around localStorage and drawing helpers.

Engine details and API:

- Engine now supports a logical coordinate system (default 800x600). The canvas is scaled to fit the viewport while preserving aspect ratio. Use `Engine.baseWidth` and `Engine.baseHeight` to change the logical size.
- Use `Engine.setScene(scene)` to switch scenes. Scenes can implement `onEnter(params)` and `onExit()` lifecycle methods. Scenes must implement `update(deltaTime)` and `render(ctx)`.
- Input is normalized: use `Engine.keys` for keyboard state and `Engine.touch` for pointer/touch state (x,y in logical coordinates and isDown boolean).

Next steps:
- Implement Engine resize and scene switching.
- Flesh out Game1 mechanics (weighted spawns, modes, HUD, scoring).

