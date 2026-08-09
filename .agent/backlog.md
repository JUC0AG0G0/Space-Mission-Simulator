# Backlog

Priorisation : bug connu > trous de couverture de tests sur du code pur >
gameplay/feature > polish. Chaque item est scopé pour un run indépendant
avec un diff limité (< 400 lignes), tests inclus.

## 1. [bug] La consommation de carburant sous-compte les grands `deltaTime`

`computeFuelConsumed` (`src/simulation/spacecraft/engine.ts`) brûle le
carburant par sous-pas fixes de 0.1s et ignore silencieusement le reste d'un
`deltaTime` qui n'est pas un multiple exact de 0.1s. Le bug est déjà
documenté dans un commentaire (`KNOWN ISSUE`) et couvert par un test qui
affirme explicitement le comportement *bugué* :
`tests/spacecraft/spacecraft.test.ts` → `'BUG: under-counts fuel burned for
a large deltaTime...'`.

En pratique l'impact est limité à 60 FPS (deltaTime ~0.016s, bien sous le
sous-pas), mais devient réel dès qu'un frame dépasse 0.1s (lag, onglet en
arrière-plan avant clamp à `MAX_FRAME_DELTA = 0.25` dans `App.tsx`).

Correction attendue : calculer le carburant brûlé linéairement
(`fuelConsumption * throttle * deltaTime`) au lieu de quantifier en sous-pas
entiers, sauf si le sous-pas s'avère nécessaire pour une raison non
documentée ici (vérifier avant de le supprimer). Mettre à jour le test
existant pour qu'il affirme le résultat linéaire correct plutôt que le bug.

Fichiers : `src/simulation/spacecraft/engine.ts`,
`tests/spacecraft/spacecraft.test.ts`.

## 2. [test] Tests unitaires pour `src/simulation/physics/vectors.ts`

Aucune couverture pour `add`, `subtract`, `scale`, `magnitude`, `normalize`,
`fromAngle` alors que c'est le module le plus réutilisé de la couche
simulation (gravity, integration, spacecraft en dépendent tous). Ajouter
`tests/physics/vectors.test.ts` couvrant les cas normaux et le cas limite
`normalize` d'un vecteur nul.

## 3. [test] Tests unitaires pour `src/simulation/celestial/celestial-body.ts`

Pas de fichier de test pour `createCelestialBody` / `createEarth`. Ajouter
`tests/celestial/celestial-body.test.ts` vérifiant que
`gravitationalParameter = G * mass` et les valeurs attendues du preset Earth
(rayon/masse).

## 4. [test] Tests unitaires pour `src/rendering/canvas/world-to-screen.ts`

Logique pure de transformation de coordonnées (pas de dépendance DOM/Canvas)
sans aucune couverture. Ajouter `tests/rendering/world-to-screen.test.ts`
couvrant le centrage de la caméra et la mise à l'échelle par le zoom.

## 5. [feature] Geler la simulation après échec/succès de mission

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
