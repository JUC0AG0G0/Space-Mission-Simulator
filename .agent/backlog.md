# Backlog

Priorisation : bug connu > trous de couverture de tests sur du code pur >
gameplay/feature > polish. Chaque item est scopé pour un run indépendant
avec un diff limité (< 400 lignes), tests inclus.

## 1. [test] Couvrir les renderers Canvas (`src/rendering/*.ts`)

`planet-renderer.ts`, `spacecraft-renderer.ts`, `trajectory-renderer.ts` et
`canvas-renderer.ts` n'ont aucun test (seul `canvas/world-to-screen.ts` est
couvert). Ce sont de petites fonctions pures qui reçoivent un
`CanvasRenderingContext2D` et appellent une poignée de méthodes de dessin
(`arc`, `moveTo`, `lineTo`, `fillRect`, ...). Écrire un faux contexte 2D
léger (objet plain avec `vi.fn()` pour chaque méthode utilisée, pas de
dépendance externe type `jest-canvas-mock`) et vérifier, pour chaque
renderer, que les bons appels sont faits avec les bons paramètres (position
à l'écran, rayon, couleur) pour un `GameState`/`CelestialBody`/`Spacecraft`
donné. Tests dans `tests/rendering/*.test.ts`.

## Idées identifiées pour plus tard (non détaillées)

- Tests de composants pour `src/ui/*.tsx` (Hud, MissionPanel,
  SimulationControls, ControlsPanel) — nécessite une dépendance de test
  supplémentaire (ex. Testing Library) et une mise en place plus large ;
  à traiter après les trous de couverture plus simples ci-dessus.
