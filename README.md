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

## Gameplay

A playthrough moves through the following screens and flight phases:

```text
Main menu
   ↓
Mission setup
   ↓
Pre-launch (countdown)
   ↓
Launch
   ↓
Flight
   ↓
Mission complete / Mission failed
```

- **Main menu** — start a **New mission**, or **Continue** a saved one if a
  valid save exists in `localStorage`. Also lists mission progress (✓
  completed / 🔒 not yet completed) for every available mission profile.
- **Mission setup** — choose a mission profile (e.g. *Earth orbit*, *High
  orbit*, *Fast orbit*, each with its own difficulty and success criteria)
  and a rocket model (mass, fuel, thrust), then review a summary before
  launching. The chosen configuration is saved locally so it can be resumed
  later via **Continue**.
- **Pre-launch** — the rocket starts on the surface, engine off, fuel full.
  A short simulation-time countdown (`T-3` … `LIFTOFF`) plays before manual
  control is enabled; the physics simulation does not advance and the flight
  HUD is inactive during this phase.
- **Launch / Flight** — once the countdown ends, the player must turn the
  engine on to take off. Throttle and heading are controlled with
  WASD/arrow keys (see **Controls**); the flight HUD shows live telemetry
  while the deterministic physics engine (two-body gravity, thrust, fuel
  consumption) advances each frame.
- **Mission complete / Mission failed** — reached when the active mission's
  success or failure conditions are met (e.g. holding a stable orbit inside
  the target altitude band, running out of fuel while stranded outside it,
  or crashing). Shows mission time, max altitude/speed, and objective
  status, with options to return to the main menu or replay.

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
