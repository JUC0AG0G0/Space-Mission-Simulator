# Backlog

Priorisation : bug connu > trous de couverture de tests sur du code pur >
gameplay/feature > polish. Chaque item est scopé pour un run indépendant
avec un diff limité (< 400 lignes), tests inclus.

## 1. [test] Tests de composants pour `src/ui/*.tsx`

`Hud`, `MissionPanel`, `SimulationControls`, `ControlsPanel` (dans
`src/ui/`) n'ont aucun test. Nécessite l'ajout d'une dépendance de test
supplémentaire (`@testing-library/react` + `@testing-library/jest-dom`,
et un environnement `jsdom` pour Vitest — actuellement `environment: 'node'`
dans `vite.config.ts`, à passer en `'jsdom'` ou à surcharger uniquement
pour ces tests via un `environmentMatchGlobs`). Commencer par le composant
le plus simple (`ControlsPanel`, purement statique) pour poser le pattern,
puis `Hud`/`MissionPanel`/`SimulationControls` qui lisent des props issues
du `GameState`. Tests dans `tests/ui/*.test.tsx`.

## Idées identifiées pour plus tard (non détaillées)

- Une fois `src/ui` testé, revoir `src/app/App.tsx` (game loop) pour
  identifier s'il reste de la logique extractible/testable hors du
  `requestAnimationFrame`.
