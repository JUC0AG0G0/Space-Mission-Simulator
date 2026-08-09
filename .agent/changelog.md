# Changelog agent

## 2026-08-09 — Planification

Le backlog était vide. Analyse du repo (structure `src/`, couverture de
`tests/`, commentaires `KNOWN ISSUE`) et régénération d'un backlog priorisé
dans `.agent/backlog.md` :

1. Bug déjà documenté et non corrigé : `computeFuelConsumed` sous-compte le
   carburant brûlé pour les `deltaTime` > 0.1s (comment `KNOWN ISSUE` dans
   `src/simulation/spacecraft/engine.ts`, test qui affirme explicitement le
   comportement bugué dans `tests/spacecraft/spacecraft.test.ts`).
2. Trois trous de couverture de tests identifiés sur du code pur et
   facilement testable, sans dépendance DOM/Canvas :
   `src/simulation/physics/vectors.ts`,
   `src/simulation/celestial/celestial-body.ts`,
   `src/rendering/canvas/world-to-screen.ts`.
3. Comportement gameplay à clarifier : la simulation continue de tourner
   (physique + commandes moteur) après un crash ou un succès de mission,
   au lieu de s'arrêter.
4. Notées pour plus tard (hors scope immédiat) : tests de composants React
   pour `src/ui/*.tsx` et tests des renderers Canvas.

Aucun changement de code dans ce run — tâche de planification uniquement.

## 2026-08-09T20-52-24-021Z — planning
- Description: Le backlog ne contient plus de tâche actionnable (bug/feature/test/doc). Analyse le repo (structure, TODOs dans le code, couverture de tests, README) et regénère un backlog priorisé dans .agent/backlog.md.
- Branche/push: main (direct)
- Coût estimé: 0.5740209 USD
