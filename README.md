# Space Mission Simulator

A small, browser-based space mission simulator. Build a stable orbit around
a simplified Earth using a deterministic physics engine, driven entirely in
the client — no backend, no database, no external API.

This is a deliberately small **V0**: a playable foundation meant to grow
through many small, independent iterations (see `.agent/backlog.md`).

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Then open the printed local URL in your browser.

## Tests

```bash
npm test
```

## Lint

```bash
npm run lint
```

## Controls

| Key     | Action           |
| ------- | ---------------- |
| `W` / `↑` | Increase throttle |
| `S` / `↓` | Decrease throttle |
| `A` / `←` | Turn left         |
| `D` / `→` | Turn right        |

> Note: this table is not exhaustive — the in-app **Controls** panel is the
> source of truth for all available keyboard shortcuts.

## Architecture

The codebase is split into three independent layers:

```text
src/simulation/   Pure physics, spacecraft, celestial body, and mission
                   logic. No React, no Canvas, no DOM. Fully unit-testable
                   and deterministic given the same inputs.

src/rendering/    Draws a GameState onto an HTML Canvas 2D context. Reads
                   simulation state; never mutates it.

src/ui/           React components (HUD, panels, controls) that read
                   simulation state and turn keyboard input into commands
                   for the simulation engine.
```

`src/app/App.tsx` routes between the main menu, mission setup, and the
active simulation screen based on `src/app/app-state.ts`.
`src/app/SimulationScreen.tsx` owns the game loop for the active
simulation: it advances the `SimulationEngine` on every animation frame
using a deterministic `deltaTime`, and calls the renderer to draw the
current state.

See `.agent/backlog.md` for known issues and planned work.
