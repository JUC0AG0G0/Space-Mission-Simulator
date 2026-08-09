# Backlog

Priorisation : bug connu > trous de couverture de tests sur du code pur >
gameplay/feature > polish. Chaque item est scopé pour un run indépendant
avec un diff limité (< 400 lignes), tests inclus.

## 1. [test] Tests unitaires pour `src/simulation/celestial/celestial-body.ts`

Pas de fichier de test pour `createCelestialBody` / `createEarth`. Ajouter
`tests/celestial/celestial-body.test.ts` vérifiant que
`gravitationalParameter = G * mass` et les valeurs attendues du preset Earth
(rayon/masse).

## 2. [test] Tests unitaires pour `src/rendering/canvas/world-to-screen.ts`

Logique pure de transformation de coordonnées (pas de dépendance DOM/Canvas)
sans aucune couverture. Ajouter `tests/rendering/world-to-screen.test.ts`
couvrant le centrage de la caméra et la mise à l'échelle par le zoom.

## 3. [feature] Geler la simulation après échec/succès de mission

`SimulationEngine.step()` continue d'intégrer la physique et d'accepter les
commandes de propulsion/rotation/moteur même après que
`activeMission.status` passe à `failed` (crash) ou `succeeded` — le joueur
peut continuer à piloter un vaisseau "crashé" jusqu'à appuyer sur R
manuellement. Décider et implémenter le comportement voulu (par ex. arrêter
d'intégrer la physique du vaisseau, ou ignorer les commandes moteur, une
fois que la mission n'est plus `active`), avec des tests dans
`tests/simulation-engine.test.ts`.

## Idées identifiées pour plus tard (non détaillées)

- Tests de composants pour `src/ui/*.tsx` (Hud, MissionPanel,
  SimulationControls, ControlsPanel) — nécessite une dépendance de test
  supplémentaire (ex. Testing Library) et une mise en place plus large ;
  à traiter après les trous de couverture plus simples ci-dessus.
- Pas de tests pour `src/rendering/planet-renderer.ts`,
  `spacecraft-renderer.ts`, `trajectory-renderer.ts` (prennent un contexte
  Canvas 2D directement — nécessiterait un faux contexte/mock léger).
