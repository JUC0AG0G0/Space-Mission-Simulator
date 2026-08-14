# Backlog

Priorisation : bug connu > trous de couverture de tests sur du code pur >
gameplay/feature > polish. Chaque item est scopé pour un run indépendant
avec un diff limité (< 400 lignes), tests inclus.

La feuille de route initiale (écran de préparation de mission, départ
depuis la surface, compte à rebours, phase de lancement, écran de
résultat, sauvegarde, plusieurs missions, machine à états complète,
sélection de fusée, progression) est entièrement terminée — voir les
items cochés ci-dessous pour l'historique et les notes d'implémentation.

Revue du 2026-08-11 (3e passe) : code, tests (`npm test`, 238 tests),
lint (`npm run lint`) et typecheck (`npx tsc --noEmit`) sont tous
propres, aucun `TODO`/`FIXME` dans le code, et chaque module de
`src/simulation` et `src/rendering` a un fichier de test dédié. Quatre
bugs concrets ont été identifiés en lisant `SimulationEngine.step` et
`SimulationScreen`'s `onKeyDown` (voir "Bugs connus" ci-dessous, tous
corrigés depuis, y compris le key-repeat sur `onKeyDown`) ; aucun trou
de couverture supplémentaire ni doc obsolète trouvé cette fois-ci (le
`README.md` reste cohérent avec `src/app`).

Revue du 2026-08-11 (4e passe) : `npm test` (241 tests), `npm run lint`
et `npx tsc --noEmit` sont propres, aucun `TODO`/`FIXME`, et tout le
code pur de `src/simulation`/`src/rendering` a un fichier de test dédié
(y compris `src/simulation/spacecraft/engine.ts`, couvert indirectement
via `tests/spacecraft/spacecraft.test.ts`). En lisant
`SimulationEngine.step`, `evaluateMission` (`src/simulation/missions/
mission.ts`) et `computeThrustAcceleration`/`applyFuelConsumption`
(`src/simulation/spacecraft/spacecraft.ts`), un bug de logique de
mission a été identifié : une fois le carburant épuisé, un vaisseau qui
a atteint une orbite stable (donc qui ne retombe jamais sous
`CRASH_ALTITUDE`) mais située hors de la bande `[minAltitude,
maxAltitude]` du profil de mission ne peut plus jamais faire évoluer
son statut — `evaluateMission` ne renvoie `'failed'` que sur un crash,
et `'succeeded'` que si l'altitude entre un jour dans la bande cible,
ce qui n'arrivera jamais pour une orbite fermée qui ne la croise pas.
La mission reste `'active'` indéfiniment (voir "Bugs connus"
ci-dessous). Aucun autre trou de couverture, doc obsolète ou
incohérence README trouvé cette fois-ci.

Suivi du 2026-08-11 : le bug ci-dessus est corrigé (`evaluateMission`
fait désormais échouer une mission bloquée sur une orbite hors bande
avec carburant épuisé, voir la note "Fait le 2026-08-11" sous l'item
correspondant). `npm test` (247 tests), `npm run lint` et `npx tsc
--noEmit` sont propres.

Revue du 2026-08-11 (5e passe) : `npm test` (247 tests), `npm run lint`
et `npx tsc --noEmit` sont toujours propres, aucun `TODO`/`FIXME`, et
chaque fichier de `src/simulation`/`src/rendering` a un fichier de test
dédié — aucun bug ni trou de couverture de tests supplémentaire trouvé
cette fois-ci. Deux items plus mineurs ont été identifiés en lisant
`MissionSetup.tsx` et en comparant `README.md` aux écrans réellement
implémentés dans `src/app`/`src/ui` (voir "Features à ajouter" et
"Documentation" ci-dessous) : l'un est un défaut d'affichage (label de
difficulté non formaté dans le sélecteur de mission), l'autre une
lacune de documentation (le `README.md` ne décrit toujours que le
squelette V0 — menu, préparation, simulation — sans mentionner le
compte à rebours, la sélection de fusée/profil de mission, la
sauvegarde/`Continuer`, l'écran de résultat ou le suivi de
progression, qui sont pourtant tous fonctionnels).

Suivi du 2026-08-11 (bis) : le bug de recadrage des noms de mission/
fusée dans `MissionSetup` (identifié lors de la 6e passe ci-dessous)
est corrigé — voir la note "Fait le 2026-08-11" sous l'item
correspondant. `npm test` (249 tests), `npm run lint` et `npx tsc
--noEmit` sont propres.

Revue du 2026-08-11 (6e passe) : `npm test` (248 tests), `npm run lint`
et `npx tsc --noEmit` sont propres, aucun `TODO`/`FIXME`, et chaque
fichier de `src/simulation`/`src/rendering` a un fichier de test dédié.
Quatre points concrets ont été identifiés en lisant `MissionSetup.tsx`,
`src/rendering/canvas/world-to-screen.ts`,
`src/simulation/spacecraft/engine.ts` et `package.json` (voir "Bugs
connus", "Features à ajouter", "Tests manquants" et "Divers /
à clarifier" ci-dessous) : les noms de mission/fusée saisis dans
`MissionSetup` ne sont jamais recadrés (`trim()`) avant d'être
sauvegardés/affichés, alors que la validation, elle, les recadre ; le
niveau de difficulté du profil choisi n'apparaît que dans le
sélecteur, pas sur l'écran de résumé avant lancement ; aucun outillage
de couverture de tests n'est configuré (`npx vitest run --coverage`
échoue faute de `@vitest/coverage-v8`), ce qui rend la recherche de
trous de couverture entièrement manuelle à chaque revue ; et deux
fonctions exportées (`screenToWorld`,
`src/rendering/canvas/world-to-screen.ts:34`, et `createEngine`,
`src/simulation/spacecraft/engine.ts:3`) ont chacune un fichier de test
dédié mais ne sont appelées nulle part dans `src/`. Aucun bug de
logique de jeu supplémentaire trouvé cette fois-ci.

Revue du 2026-08-11 (7e passe) : `npm test` (250 tests), `npm run lint`
et `npx tsc --noEmit` sont propres, aucun `TODO`/`FIXME`, et chaque
fichier de `src/simulation`/`src/rendering` a un fichier de test dédié.
`@vitest/coverage-v8` étant désormais installé (voir la 6e passe),
`npm run coverage` a été utilisé pour la première fois pour cibler la
recherche de trous de couverture au lieu de comparer les arborescences
à la main : couverture globale 97.18 % de lignes / 94.94 % de branches,
avec une poignée de branches non exercées repérées précisément (voir
"Tests manquants" ci-dessous pour celles jugées utiles à couvrir — les
branches purement défensives dans du code DOM/React, comme le repli
`fuelPercent = 0` de `Hud.tsx` quand `maxFuel <= 0` qui ne peut pas se
produire avec les modèles de fusée actuels, ou la boucle
`requestAnimationFrame`/le redimensionnement du canvas dans
`SimulationScreen.tsx`, ont été jugées trop marginales pour justifier un
item de backlog dédié). En lisant `mission-result.ts` en détail pour
comprendre une de ces branches non couvertes
(`describeFailureCause`), un bug de logique a été identifié : la cause
d'échec affichée sur l'écran de résultat se trompe quand un vaisseau
sans carburant s'écrase au sol (voir "Bugs connus" ci-dessous). La
décision laissée en suspens depuis la 6e passe sur `screenToWorld`/
`createEngine` (section "Divers / à clarifier") a été tranchée : les
deux sont conservées, et `createEngine` doit être câblée dans
`createSpacecraft` pour cesser d'être un export sans appelant (voir le
nouvel item "Features à ajouter" ci-dessous).

Revue du 2026-08-11 (8e passe, planification périodique) : `npm test`
(253 tests), `npm run lint` et `npx tsc --noEmit` sont propres, aucun
`TODO`/`FIXME`/`XXX` dans `src/` ou `tests/`. `npm run coverage`
confirme une couverture globale de 97.33 % de lignes / 95.27 % de
branches ; toutes les lignes non couvertes recoupent soit des items déjà
suivis (`engine.ts:44-45`, `mission-save.ts:34,65`,
`mission-progress.ts:49`, `MissionResult.tsx:56-58`), soit des branches
déjà explicitement jugées trop marginales lors de la 7e passe
(`Hud.tsx:47`, la boucle `requestAnimationFrame`/le redimensionnement du
canvas et la branche clavier `'r'` dans `SimulationScreen.tsx`, le
`default`/repli défensif de `App.tsx` sur un `AppPhase`/
`missionConfiguration` déjà garantis exhaustifs par `app-state.ts`).
Une branche non suivie jusqu'ici a été identifiée en lisant
`evaluateMission` en détail (`src/simulation/missions/mission.ts`) :
la clause `return objective;` du `.map` qui recalcule les objectifs
(pour un `id` autre que `'reach-altitude'`/`'hold-orbit'`) n'est
exercée par aucun test — contrairement aux branches DOM/React
ci-dessus, il s'agit de logique métier pure dans un module déjà
fortement testé, donc jugée utile à couvrir plutôt que marginale (voir
le nouvel item sous "Tests manquants"). Aucun autre bug, trou de
couverture ou doc obsolète trouvé cette fois-ci — le `README.md` reste
cohérent avec `src/app`/`src/ui`, et les trois items "Tests manquants"
déjà ouverts (moteur inactif de `computeFuelConsumed`, échecs
silencieux de `localStorage`, objectif non complété dans
`MissionResult`) restent les prochains items à traiter en priorité,
conformément à la règle "bug connu > trous de couverture de tests sur
du code pur > gameplay/feature > polish" ci-dessus (aucun bug ni
feature n'est actuellement en attente).

Revue du 2026-08-12 (9e passe, planification périodique) : `npm test`
(254 tests), `npm run lint` et `npx tsc --noEmit` sont propres, aucun
`TODO`/`FIXME`/`XXX` dans `src/` ou `tests/`. `npm run coverage`
confirme 97.47 % de lignes / 95.56 % de branches, en légère hausse
depuis la 8e passe (le test de `computeFuelConsumed` moteur inactif,
ajouté depuis, porte `engine.ts` à 100 %). Toutes les lignes non
couvertes recoupent des items déjà suivis (`mission-save.ts:17-18,34,65`,
`mission-progress.ts:49`, `MissionResult.tsx:56-58`, `mission.ts:151`)
ou des branches déjà jugées trop marginales (`Hud.tsx:47`, la boucle
`requestAnimationFrame`/le redimensionnement du canvas dans
`SimulationScreen.tsx`, le repli `App.tsx` sur un `AppPhase` déjà
exhaustif). Un point nouveau a été identifié en lisant
`SimulationEngine.step`/`advanceCountdown` en détail
(`src/simulation/simulation-engine.ts:173-187,232`) : l'unique appelant
de la méthode privée `advanceCountdown` (ligne 232,
`if (this.state.countdown && this.advanceCountdown(deltaTime))`) ne
l'invoque déjà que lorsque `this.state.countdown` est non nul, ce qui
rend la garde interne `if (!countdown) { return false; }`
(lignes 175-177) inatteignable en pratique — ce n'est pas un trou de
couverture à combler par un test (la méthode est privée et son seul
appelant garantit déjà l'invariant), mais une petite garde
défensive redondante à trancher (garder pour la robustesse contre un
futur second appelant, ou simplifier) ; voir le nouvel item sous
"Divers / à clarifier". Aucun bug, trou de couverture actionnable ou
doc obsolète supplémentaire trouvé cette fois-ci — le `README.md` reste
cohérent avec `src/app`/`src/ui`. Les trois items "Tests manquants"
déjà ouverts (échecs silencieux de `localStorage`, objectif non
complété dans `MissionResult`, `id` d'objectif inconnu dans
`evaluateMission`) restent les prochains items à traiter en priorité.

Revue du 2026-08-12 (10e passe, planification périodique) : `npm test`
(257 tests), `npm run lint` et `npx tsc --noEmit` sont propres, aucun
`TODO`/`FIXME`/`XXX` dans `src/` ou `tests/`. `npm run coverage` confirme
97.67 % de lignes / 96.39 % de branches, en hausse depuis la 9e passe
(les trois tests `localStorage` ajoutés depuis portent
`mission-progress.ts` à 100 % et font progresser `mission-save.ts`).
Toutes les lignes non couvertes recoupent des items déjà suivis
(`mission-save.ts:17-18`, `MissionResult.tsx:56-58`, `mission.ts:151`,
`simulation-engine.ts:176-177`) ou des branches déjà jugées trop
marginales (`Hud.tsx:47`, `App.tsx:55,57`, la boucle
`requestAnimationFrame`/le redimensionnement du canvas dans
`SimulationScreen.tsx:143-150`). Un point nouveau a été identifié en
lisant `SimulationScreen.tsx` en détail : le gestionnaire `onKeyUp`
(lignes 101-106), qui retire une touche continue (WASD/flèches) de
`heldKeysRef` quand elle est relâchée, n'est exercé par aucun test —
contrairement à `onKeyDown`, qui a une suite de tests dédiée
(`tests/ui/SimulationScreen.test.tsx`). Ce n'est pas une simple garde
défensive DOM comme la boucle `requestAnimationFrame` : si ce
gestionnaire régressait (ex. mauvaise normalisation de casse, mauvaise
touche retirée), une touche relâchée resterait "collée" et continuerait
à piloter le throttle/cap indéfiniment, ce qui est un vrai bug
gameplay potentiel — voir le nouvel item sous "Tests manquants".
Aucun autre bug, trou de couverture actionnable ou doc obsolète trouvé
cette fois-ci (le `README.md` reste cohérent avec `src/app`/`src/ui`,
sa section "Gameplay" décrit fidèlement l'enchaînement d'écrans actuel).
Les deux items "Tests manquants" déjà ouverts (objectif non complété
dans `MissionResult`, `id` d'objectif inconnu dans `evaluateMission`)
restent les prochains items à traiter en priorité, conformément à la
règle "bug connu > trous de couverture de tests sur du code pur >
gameplay/feature > polish" ci-dessus (aucun bug ni feature n'est
actuellement en attente).

Revue du 2026-08-12 (11e passe, planification périodique) : `npm test`
(258 tests), `npm run lint` et `npx tsc --noEmit` sont propres, aucun
`TODO`/`FIXME`/`XXX` dans `src/` ou `tests/`. L'item "Tests manquants"
sur `MissionResult` (objectif non complété) noté comme prochaine
priorité lors de la 10e passe a depuis été traité (voir l'entrée
correspondante, cochée ci-dessous, et `.agent/changelog.md`) ; les deux
priorités suivantes restent `SimulationScreen.onKeyUp` et l'`id`
d'objectif inconnu dans `evaluateMission`. `npm run coverage` confirme
97.67 % de lignes / 96.96 % de branches. Toutes les lignes non couvertes
recoupent des items déjà suivis (`SimulationScreen.tsx:102-106,143-150`,
`App.tsx:55,57`, `simulation-engine.ts:176-177`, `mission.ts:151`,
`Hud.tsx:47`) — sauf une : `mission-save.ts:17-18`
(`isMissionConfigurationShape`, garde `if (typeof value !== 'object' ||
value === null)`) n'était pas encore documentée comme trou de
couverture actionnable (une précédente tâche sur les échecs silencieux
de `localStorage`, cf. l'item coché "Les branches d'échec silencieux de
`localStorage`..." ci-dessous, l'avait explicitement laissée hors
périmètre). `tests/persistence/mission-save.test.ts` couvre déjà une
sauvegarde corrompue *syntaxiquement* (JSON invalide) et un objet JSON
valide mais incomplet (`{ foo: 'bar' }`), mais aucun test ne couvre une
valeur JSON *valide* qui n'est structurellement pas un objet (ex.
`localStorage` contenant `"42"`, `"null"` ou `"[]"`, ce qui peut arriver
si une version antérieure du jeu ou un script externe écrit une forme
différente sous la même clé) — voir le nouvel item sous "Tests
manquants". Aucun bug, doc obsolète ou incohérence README supplémentaire
trouvé cette fois-ci.

Revue du 2026-08-12 (12e passe, planification périodique) : l'item
"Tests manquants" sur l'`id` d'objectif inconnu dans `evaluateMission`,
noté comme priorité lors de la 11e passe, est désormais traité (voir
l'entrée correspondante, cochée ci-dessus, et `.agent/changelog.md`) —
`mission.ts` est à 100 % de couverture. `npm test` (261 tests), `npm
run lint` et `npx tsc --noEmit` sont propres, aucun `TODO`/`FIXME`/`XXX`
dans `src/`/`tests/`. La seule priorité "Tests manquants" restant
ouverte est `isMissionConfigurationShape` (garde `typeof value !==
'object' || value === null` dans `mission-save.ts:17-18`, non couverte
par un test JSON valide mais non-objet — voir l'item détaillé
ci-dessous), identifiée lors de la 11e passe. Aucun bug, trou de
couverture supplémentaire, ni doc obsolète trouvé cette fois-ci (le
`README.md` reste cohérent avec `src/app`/`src/ui`). Les deux points
sous "Divers / à clarifier" (garde redondante dans `advanceCountdown`,
idées de missions futures non scopées) restent des décisions en
attente, pas des tâches actionnables en l'état.

Revue du 2026-08-12 (13e passe, planification périodique) : le backlog
ne contenait plus d'item actionnable non coché (les trois sections
"Bugs connus", "Features à ajouter" et "Tests manquants" n'avaient que
des entrées déjà cochées, cf. 12e passe). `npm test` (266 tests), `npm
run lint` et `npx tsc --noEmit` sont propres, aucun `TODO`/`FIXME`/`XXX`
dans `src/`/`tests/`. L'item "Tests manquants" sur
`isMissionConfigurationShape` noté comme dernière priorité lors de la
12e passe est désormais traité (voir l'entrée correspondante, cochée
ci-dessus, et `.agent/changelog.md`) — `npm run coverage` confirme
98.22 % de lignes / 97.56 % de branches, et plus aucun fichier de
`src/simulation`/`src/rendering` n'a de ligne non couverte ; les seules
lignes restantes hors 100 % (`App.tsx:55,57`,
`SimulationScreen.tsx:143-150`, `simulation-engine.ts:176-177`,
`Hud.tsx:47`) recoupent toutes des branches déjà jugées trop marginales
lors de passes précédentes (repli défensif déjà exhaustif, boucle
`requestAnimationFrame`/redimensionnement du canvas, garde interne déjà
garantie par l'unique appelant, repli `fuelPercent = 0`
inatteignable avec les modèles de fusée actuels). `npm outdated` montre
plusieurs dépendances avec des majeures disponibles (React 19, Vite 8,
ESLint 10, Vitest 4, `typescript` 7) mais aucune n'est une action de
backlog de ce projet (montées de version majeures hors du périmètre
"petit diff, comportement inchangé" visé ici).

Un bug concret a été identifié en lisant `MissionSetup.tsx` et les
styles associés (`src/app/styles.css`) : les champs "Mission name" et
"Spacecraft name" (`src/ui/MissionSetup.tsx:66-81`) n'ont aucune limite
de longueur (`maxLength` absent des deux `<input>`), et aucun des
conteneurs qui affichent ensuite ces noms — `.hud__mission`
(`styles.css:96-101`, largeur du panneau HUD fixée par `min-width:
220px` seul, sans `max-width`) sur l'écran de vol, `.mission-setup__summary
dd` sur l'écran de résumé, ou `.mission-result__summary dd` sur l'écran
de résultat — n'a de `overflow`/`text-overflow`/`word-break` pour
absorber un texte anormalement long. Un nom collé ou saisi de plusieurs
centaines de caractères (rien dans `isValidMissionConfiguration`,
`src/simulation/missions/mission-configuration.ts:105-114`, ne borne la
longueur, seul un `trim().length > 0` est vérifié) traverse donc
`MissionSetup` → sauvegarde (`mission-save.ts`) → HUD/résumé/résultat
sans jamais être tronqué, et peut élargir ou faire déborder le panneau
HUD (positionné en `absolute` par-dessus le canvas) au point de
recouvrir une partie de la zone de jeu. Voir le nouvel item sous "Bugs
connus" ci-dessous. Aucun autre bug, trou de couverture actionnable ou
doc obsolète trouvé cette fois-ci — le `README.md` reste cohérent avec
`src/app`/`src/ui`. Les deux points sous "Divers / à clarifier" restent
des décisions en attente, pas des tâches actionnables en l'état.

Revue du 2026-08-12 (14e passe, planification périodique) : le bug de
nom anormalement long identifié lors de la 13e passe est désormais
corrigé (voir l'entrée cochée correspondante et `.agent/changelog.md`).
Au moment de cette revue, les quatre sections actionnables du backlog
(Bugs connus, Features à ajouter, Tests manquants, Documentation)
n'avaient plus aucune entrée non cochée. `npm test` (267 tests), `npm
run lint` et `npx tsc --noEmit` sont propres, aucun `TODO`/`FIXME`/`XXX`
dans `src/`/`tests/`. `npm run coverage` confirme 98.22 % de lignes /
97.56 % de branches, inchangé depuis la 13e passe (aucune ligne
nouvellement non couverte) ; chaque fichier de `src/` a toujours un
fichier de test dédié dans `tests/` (`main.tsx` excepté, point d'entrée
Vite non exécuté par les tests, déjà jugé hors périmètre lors de
passes précédentes). Une relecture ciblée de `MissionSetup.tsx`,
`App.tsx`, `MainMenu.tsx`, `MissionPanel.tsx`, `mission.ts`,
`spacecraft.ts`, `simulation-engine.ts`, `flight-phase.ts` et
`game-phase.ts` n'a fait remonter aucun bug ni trou de couverture
supplémentaire. Le seul point resté en suspens était la décision sous
"Divers / à clarifier" sur la garde redondante d'`advanceCountdown` — elle
est maintenant tranchée (simplifier plutôt que garder un filet de
sécurité spéculatif, conformément à la consigne du projet de ne pas
ajouter de garde pour un scénario déjà garanti impossible par
l'appelant unique), et déplacée en tâche actionnable sous "Features à
ajouter" ci-dessous. `npm outdated` ne montre rien de nouveau par
rapport à la 13e passe (mêmes majeures disponibles, toujours hors
périmètre). Le `README.md` reste cohérent avec `src/app`/`src/ui`.

Revue du 2026-08-12 (15e passe, planification périodique) : `npm test`
(267 tests), `npm run lint` et `npx tsc --noEmit` sont propres, aucun
`TODO`/`FIXME`/`XXX` dans `src/`/`tests/`. `npm run coverage` confirme
98.36 % de lignes / 97.82 % de branches, inchangé depuis la 14e passe
(les seules lignes non couvertes restent `App.tsx:55,57`,
`SimulationScreen.tsx:143-150`, `Hud.tsx:47`, déjà jugées trop
marginales lors de passes précédentes). En relisant en détail la boucle
de rendu de `SimulationScreen.tsx` (lignes 139-151) avec
`src/app/styles.css` (`.app__canvas { width: 100%; height: 100%; }`) et
`src/rendering/canvas-renderer.ts`, un vrai défaut visuel a été
identifié plutôt qu'un simple trou de couverture : le buffer du canvas
(`canvas.width`/`canvas.height`) est dimensionné directement à partir
de `canvas.clientWidth`/`clientHeight` (des pixels CSS), sans tenir
compte de `window.devicePixelRatio` — sur un écran Retina/haute
densité (`devicePixelRatio` 2 ou 3), le navigateur doit donc
suréchantillonner un buffer sous-dimensionné pour remplir la boîte CSS,
ce qui rend tout le rendu (planète, vaisseau, trajectoire) visiblement
flou par rapport à un rendu natif. Aucune recherche de
`devicePixelRatio` dans `src/`/`tests/` ne remonte de résultat, donc ce
n'est pas un compromis déjà tranché. Voir le nouvel item sous "Bugs
connus" ci-dessous. `npm outdated` ne montre rien de nouveau
d'actionnable par rapport à la 13e/14e passe (mêmes majeures hors
périmètre, plus un bump mineur `typescript-eslint` 8.66.0 → 8.67.0 sans
intérêt propre à documenter). Aucun autre bug, trou de couverture
actionnable ou doc obsolète trouvé cette fois-ci — le `README.md` reste
cohérent avec `src/app`/`src/ui`. Le point sous "Divers / à clarifier"
(idées de missions futures non scopées) reste une décision en attente,
pas une tâche actionnable en l'état.

Revue du 2026-08-12 (16e passe, planification périodique) : le bug de
canvas flou sur écran Retina, identifié lors de la 15e passe, est
désormais corrigé (voir l'entrée cochée correspondante et
`.agent/changelog.md`). Au moment de cette revue, les quatre sections
actionnables du backlog (Bugs connus, Features à ajouter, Tests
manquants, Documentation) n'avaient plus aucune entrée non cochée. `npm
test` (270 tests), `npm run lint` et `npx tsc --noEmit` sont propres,
aucun `TODO`/`FIXME`/`XXX` dans `src/`/`tests/`. `npm run coverage`
confirme 97.9 % de lignes / 97.83 % de branches (légère baisse relative
depuis la 15e passe, mais aucune ligne nouvellement non couverte : le
pourcentage bouge simplement parce que `canvas-buffer-size.ts`, ajouté
lors du correctif Retina, est déjà à 100 % et fait légèrement grossir le
dénominateur) ; les seules lignes non couvertes restent `App.tsx:55,57`,
`SimulationScreen.tsx:144-160` et `Hud.tsx:47`, toutes trois déjà jugées
trop marginales lors de passes précédentes (repli défensif déjà
exhaustif, boucle `requestAnimationFrame`/redimensionnement du canvas,
repli `fuelPercent = 0` inatteignable avec les modèles de fusée
actuels). Une relecture ciblée de `SimulationScreen.tsx`,
`simulation-engine.ts`, `Hud.tsx`, `MissionPanel.tsx`,
`ControlsPanel.tsx`, `CountdownOverlay.tsx`, `mission-configuration.ts`,
`rocket-models.ts`, `canvas-renderer.ts` et `celestial-body.ts` (y
compris une vérification numérique du ratio poussée/poids au sol des
trois modèles de fusée avec le `g` réel du corps céleste simulé,
`GM/r² ≈ 11.07 m/s²` — chacun reste bien au-dessus de 1, conformément
au commentaire de `createInitialSpacecraft`) n'a fait remonter aucun bug
ni trou de couverture supplémentaire. Nouveauté par rapport aux passes
précédentes : `npm audit` (jamais exécuté explicitement jusqu'ici, seul
`npm outdated` l'avait été) signale 6 vulnérabilités (3 modérées, 1
haute, 2 critiques) dans la chaîne `esbuild`/`vite`/`vitest`/
`@vitest/coverage-v8`, dépendances de développement uniquement (le
correctif nécessite un saut de version majeure de `vite` 5→8 et
`vitest` 2→4, donc hors périmètre "petit diff" de ce backlog, comme les
autres majeures déjà notées via `npm outdated`) — voir le nouvel item
sous "Divers / à clarifier". Aucun autre bug, trou de couverture
actionnable ou doc obsolète trouvé cette fois-ci — le `README.md` reste
cohérent avec `src/app`/`src/ui`.

Revue du 2026-08-13 (17e passe, planification périodique) : au moment
de cette revue, les quatre sections actionnables du backlog (Bugs
connus, Features à ajouter, Tests manquants, Documentation) n'avaient
plus aucune entrée non cochée. `npm test` (270 tests), `npm run lint`
et `npx tsc --noEmit` sont propres, aucun `TODO`/`FIXME`/`XXX` dans
`src/`/`tests/`. `npm run coverage` confirme 97.9 % de lignes / 97.83 %
de branches, inchangé depuis la 16e passe ; les seules lignes non
couvertes restent `App.tsx:55,57`, `SimulationScreen.tsx:144-160` et
`Hud.tsx:47`, toutes trois déjà jugées trop marginales lors de passes
précédentes. `npm outdated`/`npm audit` ne montrent rien de nouveau par
rapport à la 16e passe (mêmes majeures et mêmes 6 vulnérabilités
dev-only déjà documentées sous "Divers / à clarifier"). En relisant les
composants `src/ui/*.tsx` sous l'angle accessibilité — jamais audité
explicitement lors des 16 passes précédentes, qui portaient surtout sur
la logique métier et le rendu canvas — un vrai défaut a été identifié
dans `MainMenu.tsx` : le marqueur ✓/🔒 de la liste de progression des
missions (lignes 44-46) est marqué `aria-hidden="true"`, et le `<li>`
qui l'entoure n'affiche par ailleurs que `entry.destinationName` — un
lecteur d'écran énonce donc uniquement le nom de la destination pour
chaque mission, sans jamais indiquer si elle est terminée ou verrouillée,
alors que cette information existe (`entry.completed`,
`src/simulation/progression/mission-progress.ts:15`) et est bien rendue
visuellement. `MissionPanel.tsx`/`MissionResult.tsx` ont un motif voisin
(`✓`/`○` pour les objectifs) mais sans `aria-hidden`, donc le symbole y
est au moins énoncé (imparfait mais pas une perte totale d'information
comme dans `MainMenu`) ; ce n'est donc pas la même sévérité et n'est pas
retenu comme item séparé. Voir le nouvel item sous "Bugs connus"
ci-dessous. Aucun autre bug, trou de couverture actionnable ou doc
obsolète trouvé cette fois-ci — le `README.md` reste cohérent avec
`src/app`/`src/ui`. Les deux points sous "Divers / à clarifier" restent
des décisions en attente, pas des tâches actionnables en l'état.

Revue du 2026-08-13 (18e passe, planification périodique) : le bug
d'accessibilité de `MainMenu.tsx` identifié lors de la 17e passe est
désormais corrigé (voir l'entrée cochée correspondante et
`.agent/changelog.md`). Au moment de cette revue, les quatre sections
actionnables du backlog (Bugs connus, Features à ajouter, Tests
manquants, Documentation) n'avaient plus aucune entrée non cochée. `npm
test` (271 tests), `npm run lint` et `npx tsc --noEmit` sont propres,
aucun `TODO`/`FIXME`/`XXX` dans `src/`/`tests/`. `npm run coverage`
confirme 97.9 % de lignes / 97.84 % de branches ; les seules lignes non
couvertes restent `App.tsx:55,57`, `SimulationScreen.tsx:144-160` et
`Hud.tsx:47`, toutes trois déjà jugées trop marginales lors de passes
précédentes. En relisant `SimulationScreen.tsx` en détail sous l'angle
"quelles touches déclenchent `preventDefault()` sans vérifier les
touches de modification" — l'angle qui avait déjà permis de trouver,
lors d'une passe antérieure, que `onKeyDown` détournait Ctrl/Cmd+R et
Ctrl/Cmd+P — un bug concret de la même famille, resté non couvert par
ce correctif précédent, a été identifié : la branche des touches
continues (WASD/flèches, `onKeyDown` lignes 72-76) ajoute la touche à
`heldKeysRef` et appelle `event.preventDefault()` sans jamais vérifier
`event.ctrlKey`/`metaKey`/`altKey`, contrairement à la branche des
touches discrètes (`' '`/`'p'`/`'r'`, lignes 78-99) juste en dessous,
qui a bien cette garde depuis le correctif précédent. Voir le nouvel
item sous "Bugs connus" ci-dessous pour le détail et l'impact (pas
seulement un `preventDefault()` superflu : la touche reste aussi
"tenue" et pilote réellement le vaisseau tant que le raccourci est
maintenu). Aucun autre bug, trou de couverture actionnable ou doc
obsolète trouvé cette fois-ci — le `README.md` reste cohérent avec
`src/app`/`src/ui`. Les deux points sous "Divers / à clarifier" restent
des décisions en attente, pas des tâches actionnables en l'état.

Revue du 2026-08-13 (19e passe, planification périodique) : le bug de
`SimulationScreen.onKeyDown` sur les touches continues (Ctrl/Cmd+A/S/D),
identifié lors de la 18e passe, est désormais corrigé (voir l'entrée
cochée correspondante et `.agent/changelog.md`). Au moment de cette
revue, les quatre sections actionnables du backlog n'avaient plus
aucune entrée non cochée. `npm test` (272 tests), `npm run lint` et
`npx tsc --noEmit` sont propres, aucun `TODO`/`FIXME`/`XXX` dans
`src/`/`tests/`. `npm run coverage` confirme 97.9 % de lignes / 97.84 %
de branches ; les seules lignes non couvertes restent `App.tsx:55,57`,
`SimulationScreen.tsx:147-163` et `Hud.tsx:47`, toutes trois déjà jugées
trop marginales lors de passes précédentes. `npm outdated`/`npm audit`
ne montrent rien de nouveau par rapport à la 16e/17e passe (mêmes
majeures et mêmes 6 vulnérabilités dev-only déjà documentées sous
"Divers / à clarifier"). Une relecture complète de chaque fichier de
`src/` non spécifiquement revisité lors des dernières passes
(`ControlsPanel.tsx`, `Hud.tsx`, `MissionPanel.tsx`,
`CountdownOverlay.tsx`, `MissionResult.tsx`, `mission-result.ts`,
`rocket-models.ts`, `App.tsx`, `MainMenu.tsx`, `celestial-body.ts`,
`canvas-renderer.ts`, `world-to-screen.ts`, `orbit.ts`,
`simulation-engine.ts`, `spacecraft.ts`, `SimulationControls.tsx`,
`MissionSetup.tsx`, `styles.css`, `package.json`), complétée par un
parcours de bout en bout de l'application dans un vrai navigateur
(Playwright headless : menu principal → préparation de mission
`fast-orbit`/Javelin → résumé → compte à rebours → décollage manuel),
n'a fait remonter aucun bug ni régression (aucune erreur ni
avertissement dans la console du navigateur au long du parcours). Un
point de documentation mineur a en revanche été identifié : la section
"## Tests" du `README.md` ne mentionne que `npm test`, pas le script
`npm run coverage` — pourtant déjà présent dans `package.json` et
systématiquement utilisé par chaque revue de ce backlog depuis son
ajout. Voir le nouvel item sous "Documentation" ci-dessous. Aucun autre
bug, trou de couverture actionnable ou incohérence README trouvé cette
fois-ci. Les deux points sous "Divers / à clarifier" restent des
décisions en attente, pas des tâches actionnables en l'état.

Revue du 2026-08-13 (20e passe, planification périodique) : le point de
documentation identifié lors de la 19e passe (section "Tests" du
`README.md` sans mention de `npm run coverage`) est désormais corrigé
(voir l'entrée cochée correspondante et `.agent/changelog.md`). Au
moment de cette revue, les quatre sections actionnables du backlog
n'avaient plus aucune entrée non cochée. `npm test` (272 tests), `npm
run lint` et `npx tsc --noEmit` sont propres, aucun `TODO`/`FIXME`/
`XXX` dans `src/`/`tests/`. `npm run coverage` confirme 97.9 % de
lignes / 97.84 % de branches, inchangé depuis la 19e passe ; les seules
lignes non couvertes restent `App.tsx:55,57`,
`SimulationScreen.tsx:147-163` et `Hud.tsx:47`, toutes trois déjà jugées
trop marginales lors de passes précédentes. Une relecture complète de
chaque fichier de `src/` (y compris ceux non revisités depuis
plusieurs passes : `orbit.ts`, `canvas-renderer.ts`,
`trajectory-renderer.ts`, `spacecraft-renderer.ts`, `world-to-screen.ts`,
`celestial-body.ts`, `app-state.ts`, `mission-configuration.ts`,
`spacecraft.ts`, `engine.ts`, `mission.ts`, `mission-result.ts`,
`Hud.tsx`, `ControlsPanel.tsx`, `SimulationControls.tsx`,
`MissionPanel.tsx`, `MissionResult.tsx`, `CountdownOverlay.tsx`,
`MainMenu.tsx`, `MissionSetup.tsx`, `App.tsx`) n'a fait remonter aucun
bug de logique ni trou de couverture supplémentaire — tout ce code pur
reste à 100 % de couverture. Une lacune de gameplay concrète a en
revanche été identifiée en croisant `index.html` (balise `<meta
name="viewport">` déjà présente), la règle `@media (max-width: 640px)`
de `src/app/styles.css:652-662` (qui repositionne déjà le panneau
latéral pour petit écran) et `SimulationScreen.tsx`/`SimulationControls
.tsx` : aucune des commandes de vol (accélération/décélération,
rotation, allumage moteur) n'est accessible autrement qu'au clavier
(`CONTINUOUS_KEYS`/`onKeyDown`/`onKeyUp`, `src/app/SimulationScreen.tsx
:21-118`) — `grep -rn "Touch\|Pointer"` sur `src/`/`tests/` ne renvoie
aucun résultat, et `SimulationControls.tsx` n'expose que Pause et
Restart, pas de bouton d'allumage moteur. La mise en page mobile déjà
présente laisse donc croire que le jeu est jouable sur écran tactile,
alors qu'un joueur sur un tel appareil peut configurer et lancer une
mission mais ne peut ensuite ni allumer le moteur, ni piloter le
vaisseau une fois le compte à rebours terminé. Voir le nouvel item sous
"Features à ajouter" ci-dessous. Aucun autre bug, trou de couverture
actionnable ou doc obsolète trouvé cette fois-ci — le `README.md` reste
cohérent avec `src/app`/`src/ui`. Les deux points sous "Divers /
à clarifier" restent des décisions en attente, pas des tâches
actionnables en l'état.

Revue du 2026-08-13 (21e passe, planification périodique) : la feature
tactile ajoutée lors de la 20e passe (`src/ui/TouchControls.tsx`) est
désormais fonctionnelle. `npm test` (279 tests), `npm run lint` et `npx
tsc --noEmit` sont propres, aucun `TODO`/`FIXME`/`XXX` dans
`src/`/`tests/`. `npm run coverage` confirme 97.97 % de lignes / 97.89 %
de branches ; les seules lignes non couvertes restent `App.tsx:55,57`,
`SimulationScreen.tsx:148-164` et `Hud.tsx:47`, toutes trois déjà jugées
trop marginales lors de passes précédentes. En relisant en détail
`src/ui/TouchControls.tsx` (jamais spécifiquement audité depuis son
ajout à la passe précédente) avec `src/app/styles.css`, un vrai défaut
visuel a été identifié et confirmé dans un vrai navigateur (Playwright
headless, émulation iPhone 13 — viewport 390×844, tactile) : le D-pad et
le bouton "Engine" de `.touch-controls`
(`src/app/styles.css:658-669`, `position: absolute; left: 16px; right:
16px; bottom: 16px; z-index: 2;`, actif dès que le pointeur est
`coarse`) se superposent directement au panneau latéral
`.app__sidebar` une fois repositionné en bas d'écran par la règle
`@media (max-width: 640px)` (`src/app/styles.css:731-736`, `top: auto;
bottom: 16px;`, même largeur quasi pleine écran) — les deux règles
s'appliquent simultanément sur un téléphone en portrait, le cas
d'usage le plus courant pour cette fonctionnalité. La capture d'écran
obtenue montre le D-pad et le bouton "Engine" peints par-dessus le
texte du panneau `ControlsPanel` (légende des touches) et
`SimulationControls`, les rendant illisibles à cet endroit ; sur un
écran encore plus petit ou avec un panneau latéral plus haut, cela peut
aussi rendre certains boutons du panneau (Pause/Restart) inatteignables
au toucher puisque `.touch-controls__button` a `pointer-events: auto`
et un `z-index` égal capté en priorité (ordre DOM : `TouchControls` est
rendu après `.app__sidebar` dans `SimulationScreen.tsx:206-224`, donc
peint par-dessus). Voir le nouvel item sous "Bugs connus" ci-dessous.
Aucun autre bug, trou de couverture actionnable ou doc obsolète trouvé
cette fois-ci — le `README.md` reste cohérent avec `src/app`/`src/ui`.
Les deux points sous "Divers / à clarifier" restent des décisions en
attente, pas des tâches actionnables en l'état.

Revue du 2026-08-13 (22e passe, planification périodique) : le bug de
superposition tactile/panneau latéral en portrait, identifié lors de la
21e passe, est désormais corrigé (voir l'entrée cochée correspondante
et `.agent/changelog.md`). Au moment de cette revue, les quatre
sections actionnables du backlog n'avaient plus aucune entrée non
cochée. `npm test` (279 tests), `npm run lint` et `npx tsc --noEmit`
sont propres, aucun `TODO`/`FIXME`/`XXX` dans `src/`/`tests/`. `npm run
coverage` confirme 97.97 % de lignes / 97.89 % de branches, inchangé
depuis la 21e passe ; les seules lignes non couvertes restent
`App.tsx:55,57`, `SimulationScreen.tsx:148-164` et `Hud.tsx:47`, toutes
trois déjà jugées trop marginales lors de passes précédentes. Le
correctif de la 21e passe n'ajoute qu'une règle `@media (pointer:
coarse) and (max-width: 640px)` (`src/app/styles.css:752-762`) qui ne
se déclenche que sous 640px de large — en la relisant avec la règle de
base `.app__sidebar` (`top: 16px; right: 16px; width: 260px`,
`src/app/styles.css:51-60`), un deuxième cas concret et non couvert par
ce correctif a été identifié puis confirmé dans un vrai navigateur
(Playwright headless, émulation `devices['iPhone 13 landscape']` —
viewport 750×342 CSS px, tactile) : en **paysage**, la largeur d'un
téléphone dépasse 640px (750px pour un iPhone 13), donc ni la règle
`max-width: 640px` ni la règle combinée `pointer: coarse` + `max-width:
640px` ne s'appliquent — le panneau latéral reste ancré tel quel en
haut à droite (`top: 16px; right: 16px`), sans le repositionnement ni
le `max-height`/`overflow-y: auto` qui limitent son encombrement en
portrait. Or la hauteur totale du panneau (`MissionPanel` +
`SimulationControls` + `ControlsPanel`, ce dernier resté visible
puisque la règle qui le masque ne s'applique pas non plus) dépasse
largement la hauteur disponible sur un téléphone en paysage :
`.app__sidebar` mesure `{ x: 474, y: 16, width: 260, height: 469 }`
quand le viewport ne fait que 342px de haut, et `.touch-controls`
(ancré en bas via la règle `pointer: coarse` seule, qui elle s'applique
bien) mesure `{ x: 16, y: 206, width: 718, height: 120 }` — un
recouvrement de boîtes de 260×120px est mesuré entre les deux éléments.
La capture d'écran confirme visuellement le D-pad peint directement
par-dessus le panneau `CONTROLS` et le bouton "Engine" par-dessus la
légende "Decrease throttle", strictement le même symptôme que le bug
portrait déjà corrigé, mais déclenché par l'orientation plutôt que par
une largeur CSS étroite — le correctif précédent, ciblé sur
`max-width`, ne couvre donc pas ce cas. Voir le nouvel item sous "Bugs
connus" ci-dessous. Aucun autre bug, trou de couverture actionnable ou
doc obsolète trouvé cette fois-ci — le `README.md` reste cohérent avec
`src/app`/`src/ui`. Les deux points sous "Divers / à clarifier" restent
des décisions en attente, pas des tâches actionnables en l'état.

Suivi du 2026-08-13 : le bug de superposition tactile en paysage,
identifié lors de la 22e passe ci-dessus, est désormais corrigé (voir
l'entrée cochée correspondante et `.agent/changelog.md`) — la règle
combinée `@media (pointer: coarse) and (max-width: 640px)` du correctif
portrait précédent gagne une deuxième condition alternative sur
`max-height` dans `src/app/styles.css`, avec le même traitement pour
les deux cas. Vérifié dans un vrai navigateur (Playwright, `devices[
'iPhone 13 landscape']`, `devices['iPhone 13']` et un contexte desktop
sans tactile) qu'aucun chevauchement ne subsiste en paysage et
qu'aucune régression n'apparaît sur les cas déjà corrigés. `npm test`
(279 tests), `npm run lint` et `npx tsc --noEmit` restent propres.

Revue du 2026-08-14 (23e passe, planification périodique) : au moment
de cette revue, les quatre sections actionnables du backlog (Bugs
connus, Features à ajouter, Tests manquants, Documentation) n'avaient
plus aucune entrée non cochée. `npm test` (279 tests), `npm run lint`,
`npx tsc --noEmit` et `npm run build` (jamais vérifié explicitement
lors des passes précédentes — `tsc && vite build` compile proprement,
64 modules, aucun avertissement) sont tous propres, aucun `TODO`/
`FIXME`/`XXX` dans `src/`/`tests/`. `npm run coverage` confirme
97.97 % de lignes / 97.89 % de branches, inchangé depuis la 21e/22e
passe ; les seules lignes non couvertes restent `App.tsx:55,57`,
`SimulationScreen.tsx:148-164` et `Hud.tsx:47`, toutes trois déjà
jugées trop marginales lors de passes précédentes. `npm outdated`/`npm
audit` ne montrent rien de nouveau par rapport à la 16e passe (mêmes
majeures et mêmes 6 vulnérabilités dev-only déjà documentées sous
"Divers / à clarifier"). Une relecture de `TouchControls.tsx`,
`SimulationScreen.tsx`, `MainMenu.tsx`, `MissionPanel.tsx`,
`SimulationControls.tsx`, `ControlsPanel.tsx`, `Hud.tsx` et
`MissionSetup.tsx` (accessibilité des boutons, garde `paused`/
`countdown` déjà appliquée aux commandes tactiles via
`SimulationEngine.applyCommand`, cartes de fusée déjà de vrais
`<button>` clavier-accessibles) n'a fait remonter aucun bug de logique
ni trou de couverture supplémentaire. En testant l'application dans un
vrai navigateur (Playwright headless) sur plusieurs largeurs de
viewport non essayées lors des passes précédentes (320px, 300px, 280px,
260px, 240px — profils d'écrans très étroits : Galaxy Fold replié
~280px, navigateur redimensionné en mode split-screen, etc.), un bug
concret a été identifié : `document.documentElement.scrollWidth` dépasse
`clientWidth` de 20 à 40px dès que le viewport passe sous 320px sur
l'écran `MissionSetup` (formulaire *et* résumé), avec un débordement
horizontal visible et du texte tronqué sur la gauche (capture d'écran à
280px : "Mission 01" affiché "ission 01", "Spacecraft name" affiché
"acecraft name") — voir le nouvel item sous "Bugs connus" ci-dessous.
Aucun autre bug, trou de couverture actionnable ou doc obsolète trouvé
cette fois-ci — le `README.md` reste cohérent avec `src/app`/`src/ui`.
Les deux points sous "Divers / à clarifier" restent des décisions en
attente, pas des tâches actionnables en l'état.

Revue du 2026-08-14 (24e passe, planification périodique) : le bug de
débordement horizontal sur viewport très étroit, identifié lors de la
23e passe, est désormais corrigé (voir l'entrée cochée correspondante
et `.agent/changelog.md`). Au moment de cette revue, les quatre
sections actionnables du backlog n'avaient plus aucune entrée non
cochée. `npm test` (279 tests), `npm run lint` et `npx tsc --noEmit`
sont propres, aucun `TODO`/`FIXME`/`XXX` dans `src/`/`tests/`. `npm run
coverage` confirme 97.97 % de lignes / 97.89 % de branches, inchangé
depuis la 21e/22e/23e passe ; les seules lignes non couvertes restent
`App.tsx:55,57`, `SimulationScreen.tsx:148-164` et `Hud.tsx:47`, toutes
trois déjà jugées trop marginales lors de passes précédentes. `npm
outdated`/`npm audit` ne montrent rien de nouveau par rapport à la 16e
passe (mêmes majeures et mêmes 6 vulnérabilités dev-only déjà
documentées sous "Divers / à clarifier"). Une relecture ciblée de
`orbit.ts`, `mission.ts`, `mission-result.ts`, `Hud.tsx`,
`MissionResult.tsx`, `rocket-models.ts`, `App.tsx` et
`SimulationScreen.tsx` (recherche spécifique de bugs de logique
numérique — division par zéro, bornes d'orbite dégénérées, ordre des
opérations fuel/poussée) n'a fait remonter aucun bug ni trou de
couverture supplémentaire. Une vraie lacune de documentation a en
revanche été trouvée en comparant `README.md` au code réellement
livré : `src/ui/TouchControls.tsx` (le D-pad + bouton "Engine" affiché
sur écran tactile, ajouté et corrigé au fil de plusieurs passes
précédentes — voir les items cochés "Aucune commande de vol n'est
accessible sur écran tactile" et les deux bugs de superposition
tactile déjà résolus) n'est mentionné nulle part dans `README.md` —
`grep -i "touch\|pointer" README.md` ne renvoie aucun résultat ; la
section "## Controls" et le paragraphe "Launch / Flight" de "##
Gameplay" ne décrivent que le clavier (WASD/flèches/SPACE), laissant
croire que le jeu est uniquement pilotable au clavier alors qu'il
fonctionne déjà tout aussi bien au toucher sur mobile/tablette — voir
le nouvel item sous "Documentation" ci-dessous. En creusant la boucle
de rendu de `SimulationScreen.tsx` (lignes 122-172) pour vérifier une
suspicion de fuite de performance, un point réel mais non tranché a
aussi été identifié : la boucle `requestAnimationFrame` ne s'arrête
jamais une fois la mission terminée (`isMissionOver`), y compris quand
le joueur reste inactif sur l'écran `MissionResult` — voir le nouvel
item sous "Divers / à clarifier" ci-dessous, qui documente pourquoi ce
n'est pas encore tranché comme un bug actionnable (impact réel
probablement négligeable, correctif non trivial sans risquer de
régresser le bouton "Replay"). Aucun autre bug, trou de couverture
actionnable ou doc obsolète trouvé cette fois-ci.

Revue du 2026-08-14 (25e passe, planification périodique) : la lacune
de documentation sur les commandes tactiles, identifiée lors de la 24e
passe, est désormais corrigée (voir l'entrée cochée correspondante et
`.agent/changelog.md`). Au moment de cette revue, les quatre sections
actionnables du backlog n'avaient plus aucune entrée non cochée. `npm
test` (279 tests), `npm run lint`, `npx tsc --noEmit` et `npm run
build` sont propres, aucun `TODO`/`FIXME`/`XXX` dans `src/`/`tests/`.
`npm run coverage` confirme 97.97 % de lignes / 97.89 % de branches,
inchangé depuis la 21e/22e/23e/24e passe ; les seules lignes non
couvertes restent `App.tsx:55,57`, `SimulationScreen.tsx:148-164` et
`Hud.tsx:47`, toutes trois déjà jugées trop marginales lors de passes
précédentes — tout le code de `src/simulation`/`src/rendering` reste à
100 % de couverture. `npm outdated`/`npm audit` ne montrent rien de
nouveau par rapport à la 16e passe (mêmes majeures et mêmes 6
vulnérabilités dev-only déjà documentées sous "Divers / à clarifier").
Une relecture complète de chaque fichier de `src/` non spécifiquement
revisité en détail depuis plusieurs passes (`SimulationControls.tsx`,
`ControlsPanel.tsx`, `MissionPanel.tsx`, `MainMenu.tsx`,
`CountdownOverlay.tsx`, `MissionResult.tsx`, `MissionSetup.tsx`,
`mission-configuration.ts`, `App.tsx`, `app-state.ts`,
`simulation-engine.ts`, `SimulationScreen.tsx`, `TouchControls.tsx`,
`mission.ts`, `mission-result.ts`, `orbit.ts`, `celestial-body.ts`,
`spacecraft.ts`, `canvas-renderer.ts`, `rocket-models.ts`), complétée
par une vérification numérique du ratio poussée/poids au sol des trois
modèles de fusée et une relecture de `package.json`/`vite.config.ts`/
`eslint.config.js`/`.gitignore`/`index.html`, n'a fait remonter aucun
bug de logique, trou de couverture ou incohérence de configuration.
Une seule lacune de documentation, mineure mais concrète, a été
trouvée en comparant la section "## Architecture" du `README.md` au
code réel : elle décrit toujours `src/ui/` comme un ensemble de
composants qui "turn keyboard input into commands for the simulation
engine", alors que `src/ui/TouchControls.tsx` (documenté depuis la 24e
passe dans les sections "## Controls" et "## Gameplay" du même fichier,
mais pas dans "## Architecture") fait exactement la même chose à partir
d'entrées tactiles — voir le nouvel item sous "Documentation"
ci-dessous. Aucun autre bug, trou de couverture actionnable ou doc
obsolète trouvé cette fois-ci. Les deux points sous "Divers / à
clarifier" (vulnérabilités dev-only, boucle `requestAnimationFrame`
après fin de mission) restent des décisions en attente, pas des tâches
actionnables en l'état.

Suivi du 2026-08-14 : la lacune de documentation sur la section
"Architecture" identifiée lors de la 25e passe ci-dessus est désormais
corrigée (voir l'entrée cochée correspondante et
`.agent/changelog.md`) — la phrase décrivant `src/ui/` mentionne
maintenant "keyboard or touch input" au lieu de "keyboard input" seul.
Item documentation pure, aucun fichier de code ni de test modifié.
`npm run lint` reste propre.

Chaque tâche doit rester suffisamment petite pour être réalisée dans un
seul run et produire un diff raisonnablement limité. Une tâche peut être
subdivisée si son implémentation dépasse le périmètre raisonnable d'un run.

Revue du 2026-08-14 (26e passe, planification périodique) : au moment de
cette revue, les quatre sections actionnables du backlog (Bugs connus,
Features à ajouter, Tests manquants, Documentation) n'avaient plus aucune
entrée non cochée. `npm test` (279 tests), `npm run lint`, `npx tsc
--noEmit` et `npm run build` (`tsc && vite build`, 64 modules, aucun
avertissement) sont tous propres, aucun `TODO`/`FIXME`/`XXX` dans
`src/`/`tests/`. `npm run coverage` confirme 98.03 % de lignes / 98.15 %
de branches — tout `src/simulation`, `src/rendering` et `src/ui` est
désormais à 100 % de couverture ; les seules lignes non couvertes
restent `App.tsx:55,57` et `SimulationScreen.tsx:148-164`, toutes deux
déjà jugées trop marginales lors de passes précédentes (repli défensif
déjà exhaustif, boucle `requestAnimationFrame`/redimensionnement du
canvas). `npm outdated`/`npm audit` ne montrent rien de nouveau par
rapport à la 16e passe (mêmes majeures et mêmes 6 vulnérabilités
dev-only déjà documentées sous "Divers / à clarifier"). Chaque fichier
de `src/` a un fichier de test dédié (`main.tsx` excepté, déjà jugé hors
périmètre). Une relecture ciblée de `App.tsx`, `MissionSetup.tsx`,
`SimulationScreen.tsx`, `TouchControls.tsx`, `simulation-engine.ts`,
`mission.ts`, `mission-result.ts`, `Hud.tsx`, `MissionPanel.tsx`,
`ControlsPanel.tsx`, `CountdownOverlay.tsx`, `SimulationControls.tsx` et
`MainMenu.tsx` n'a fait remonter aucun bug de logique ni trou de
couverture supplémentaire. Un vrai défaut concret, jamais audité lors
des 25 passes précédentes, a en revanche été trouvé en comparant
`index.html` au reste des assets statiques du dépôt : aucune balise
`<link rel="icon">` n'y figure, et aucun fichier favicon n'existe nulle
part dans le dépôt (`public/` ne contient qu'un `.gitkeep`) — vérifié en
démarrant `npm run dev` et en interrogeant `/favicon.ico` avec `curl`,
qui répond `404`, et confirmé aussi absent de `dist/` après `npm run
build`. Voir le nouvel item sous "Bugs connus" ci-dessous. Aucun autre
bug, trou de couverture actionnable ou doc obsolète trouvé cette
fois-ci — le `README.md` reste cohérent avec `src/app`/`src/ui`. Les
deux points sous "Divers / à clarifier" restent des décisions en
attente, pas des tâches actionnables en l'état.

Revue du 2026-08-14 (27e passe, planification périodique) : le bug de
favicon manquant, identifié lors de la 26e passe, est désormais corrigé
(voir l'entrée cochée correspondante et `.agent/changelog.md`). Au
moment de cette revue, les quatre sections actionnables du backlog
n'avaient plus aucune entrée non cochée. `npm test` (279 tests), `npm
run lint`, `npx tsc --noEmit` et `npm run build` (`tsc && vite build`,
64 modules, aucun avertissement) sont tous propres, aucun `TODO`/
`FIXME`/`XXX` dans `src/`/`tests/`. `npm run coverage` confirme
98.03 % de lignes / 98.15 % de branches, inchangé depuis la 26e passe ;
les seules lignes non couvertes restent `App.tsx:55,57` et
`SimulationScreen.tsx:148-164`, toutes deux déjà jugées trop marginales
lors de passes précédentes. `npm outdated`/`npm audit` ne montrent rien
de nouveau par rapport à la 16e passe (mêmes majeures et mêmes 6
vulnérabilités dev-only déjà documentées sous "Divers / à clarifier",
si ce n'est le bump mineur `typescript-eslint` 8.66.0 → 8.67.0 déjà
absorbé sans action dédiée). En relisant `src/app/SimulationScreen.tsx`
sous l'angle accessibilité — un axe déjà exploité avec succès lors de la
17e passe (marqueur ✓/🔒 de `MainMenu` sans texte accessible) mais
jamais appliqué à l'élément `<canvas>` lui-même — un vrai défaut a été
identifié : `<canvas ref={canvasRef} className="app__canvas" />`
(`src/app/SimulationScreen.tsx:208`) n'a ni `role`, ni `aria-label`, ni
contenu de repli. `grep -rn "aria-\|role=" src/` confirme que
`MainMenu.tsx`, `MissionSetup.tsx` et `TouchControls.tsx` portent tous
des `aria-label`/`aria-pressed`, mais qu'aucun élément de
`SimulationScreen.tsx`/`Hud.tsx` n'en porte — un lecteur d'écran qui
atteint ce canvas n'a donc aucune indication de ce qu'il représente
(planète, trajectoire, vaisseau) ; ce n'est pas rattrapé par le HUD
voisin (`Hud.tsx`, déjà accessible en tant que texte), qui reste un
élément frère distinct plutôt qu'une alternative textuelle du canvas
lui-même. Voir le nouvel item sous "Bugs connus" ci-dessous. En
relisant aussi `MissionPanel.tsx` dans la foulée (motif ✓/○ voisin de
celui de `MainMenu`) : le marqueur d'objectif n'a toujours pas
`aria-hidden`, donc reste au moins partiellement annoncé par un lecteur
d'écran — confirmé non-régressé et toujours jugé de sévérité moindre,
comme tranché explicitement lors de la 17e passe, donc pas un nouvel
item. Aucun autre bug, trou de couverture actionnable ou doc obsolète
trouvé cette fois-ci — le `README.md` reste cohérent avec `src/app`/
`src/ui`. Les deux points sous "Divers / à clarifier" (vulnérabilités
dev-only, boucle `requestAnimationFrame` après fin de mission) restent
des décisions en attente, pas des tâches actionnables en l'état.

Revue du 2026-08-14 (28e passe, planification périodique) : le bug
d'accessibilité du `<canvas>` de vol, identifié lors de la 27e passe,
est désormais corrigé (voir l'entrée cochée correspondante et
`.agent/changelog.md`). Au moment de cette revue, les quatre sections
actionnables du backlog n'avaient plus aucune entrée non cochée. `npm
test` (280 tests), `npm run lint` et `npx tsc --noEmit` sont propres,
aucun `TODO`/`FIXME`/`XXX` dans `src/`/`tests/`. `npm run coverage`
confirme 98.04 % de lignes / 98.15 % de branches, en légère hausse
depuis la 27e passe (le test ajouté pour `SimulationScreen.tsx` porte
ce fichier à 90.5 % de lignes contre un peu moins auparavant) ; les
seules lignes non couvertes restent `App.tsx:55,57` et
`SimulationScreen.tsx:148-164`, toutes deux déjà jugées trop marginales
lors de passes précédentes. `npm outdated`/`npm audit` ne montrent rien
de nouveau par rapport à la 16e passe (mêmes majeures et mêmes 6
vulnérabilités dev-only déjà documentées sous "Divers / à clarifier").
En poursuivant l'audit accessibilité entamé lors des 17e/27e passes
(marqueur ✓/🔒 de `MainMenu`, puis `<canvas>` de `SimulationScreen`) sur
un composant encore non couvert par cet angle, `CountdownOverlay.tsx` a
été relu en détail : un vrai défaut a été identifié. Ce composant
affiche `MISSION READY` puis un décompte qui change de valeur à chaque
frame (`T-3`, `T-2`, `T-1`, `LIFTOFF`, `src/ui/CountdownOverlay.tsx:13-16`)
en réécrivant le même nœud de texte (`<div
className="countdown-overlay__value">{label}</div>`), sans aucun
`aria-live` ni `role="status"`/`role="timer"` sur ce conteneur ni sur
son parent. `grep -rn "aria-live\|role=\"status\"\|role=\"alert\""
src/` ne renvoie aucun résultat dans tout le projet — ce mécanisme n'est
utilisé nulle part, alors que c'est le seul endroit de l'application où
un texte change automatiquement, plusieurs fois de suite, sans action
du joueur. Par défaut, un changement de texte dans le DOM en dehors
d'une région `aria-live` n'est pas annoncé par un lecteur d'écran tant
que le focus ne s'y déplace pas explicitement — un joueur non-voyant
qui atteint cet écran n'a donc aucun moyen de savoir que le compte à
rebours progresse ni quand `LIFTOFF` est atteint (moment exact où le
contrôle manuel devient actif, cf. `determineFlightPhase`,
`src/simulation/flight-phase.ts`), contrairement au joueur voyant qui
voit le chiffre défiler visuellement. `tests/ui/CountdownOverlay.test.tsx`
confirme qu'aucun test actuel ne vérifie de comportement d'annonce
(seul le texte affiché est vérifié à chaque rendu isolé). Voir le
nouvel item sous "Bugs connus" ci-dessous. Aucun autre bug, trou de
couverture actionnable ou doc obsolète trouvé cette fois-ci — le
`README.md` reste cohérent avec `src/app`/`src/ui`. Les deux points
sous "Divers / à clarifier" restent des décisions en attente, pas des
tâches actionnables en l'état.

Revue du 2026-08-14 (29e passe, planification périodique) : le bug
d'annonce du décompte de `CountdownOverlay`, identifié lors de la 28e
passe, est désormais corrigé (voir l'entrée cochée correspondante et
`.agent/changelog.md`). Au moment de cette revue, les quatre sections
actionnables du backlog n'avaient plus aucune entrée non cochée. `npm
test` (282 tests), `npm run lint` et `npx tsc --noEmit` sont propres,
aucun `TODO`/`FIXME`/`XXX` dans `src/`/`tests/`. `npm run coverage`
confirme 98.04 % de lignes / 98.15 % de branches, inchangé depuis la
28e passe ; les seules lignes non couvertes restent `App.tsx:55,57` et
`SimulationScreen.tsx:148-164`, toutes deux déjà jugées trop marginales
lors de passes précédentes — tout `src/simulation`, `src/rendering` et
`src/ui` reste à 100 % de couverture. En poursuivant l'audit
accessibilité entamé lors des 17e/27e/28e passes (marqueur ✓/🔒 de
`MainMenu`, `<canvas>` de `SimulationScreen`, décompte de
`CountdownOverlay`) sur un élément encore non couvert par cet angle, le
`<div className="hud__phase">` de `src/ui/Hud.tsx:55` a été relu en
détail : un vrai défaut de la même famille a été identifié. Ce
conteneur affiche le libellé de phase de vol (`PRE-LAUNCH`, `LAUNCH`,
`FLIGHT`, `MISSION COMPLETE`, `MISSION FAILED`, via `phaseLabel`/
`determineFlightPhase`, `src/simulation/flight-phase.ts`), qui change
automatiquement au fil du vol sans action directe du joueur sur cet
élément (ex. la transition `LAUNCH` → `FLIGHT` dépend de l'altitude/
vitesse du vaisseau, pas d'une touche pressée) — mais aucun `aria-live`
ni `role="status"` ne couvre ce `<div>` ni son parent `.hud`.
`grep -rn "aria-live\|role=\"status\"" src/` (relancé pour cette passe)
ne montre que `CountdownOverlay.tsx`, corrigé lors de la passe
précédente ; `hud__phase` n'apparaît dans aucun résultat. Contrairement
à `ALTITUDE`/`VELOCITY`/`FUEL` (qui changent à chaque frame et ne
doivent délibérément pas être annoncés en continu, sous peine de noyer
l'utilisateur de lecteur d'écran), le libellé de phase ne change qu'à
quelques instants clés et précis du vol — c'est une information d'état
discrète, du même type que le décompte déjà corrigé, pas un flux
continu. Voir le nouvel item sous "Bugs connus" ci-dessous. Aucun autre
bug, trou de couverture actionnable ou doc obsolète trouvé cette
fois-ci — le `README.md` reste cohérent avec `src/app`/`src/ui`. Les
deux points sous "Divers / à clarifier" restent des décisions en
attente, pas des tâches actionnables en l'état.

Suivi du 2026-08-14 : le bug d'annonce du libellé de phase de vol du
HUD, identifié lors de la 29e passe ci-dessus, est désormais corrigé
(voir l'entrée cochée correspondante et `.agent/changelog.md`) —
`Hud.tsx` pose `role="status"`/`aria-live="polite"` sur `.hud__phase`,
sur le même modèle que le correctif déjà appliqué à
`CountdownOverlay.tsx`. `npm test` (284 tests), `npm run lint`, `npx
tsc --noEmit` et `npm run coverage` (98.04 % de lignes / 98.15 % de
branches, `Hud.tsx` toujours à 100 %) restent propres. Au moment de
cette mise à jour, les quatre sections actionnables du backlog
n'avaient plus aucune entrée non cochée.

Revue du 2026-08-14 (30e passe, planification périodique) : au moment
de cette revue, les quatre sections actionnables du backlog n'avaient
plus aucune entrée non cochée. `npm test` (284 tests), `npm run lint`
et `npx tsc --noEmit` sont propres, aucun `TODO`/`FIXME`/`XXX` dans
`src/`/`tests/`. `npm run coverage` confirme 98.04 % de lignes /
98.15 % de branches ; les seules lignes non couvertes restent
`App.tsx:55,57` et `SimulationScreen.tsx:148-164`, toutes deux déjà
jugées trop marginales lors de passes précédentes. `npm outdated`/`npm
audit` ne montrent rien de nouveau par rapport à la 16e passe (mêmes
majeures et mêmes 6 vulnérabilités dev-only déjà documentées sous
"Divers / à clarifier"). En poursuivant l'audit accessibilité entamé
lors des 17e/27e/28e/29e passes (marqueur ✓/🔒 de `MainMenu`, `<canvas>`
de `SimulationScreen`, décompte de `CountdownOverlay`, libellé de phase
du HUD) sur le dernier élément du HUD encore non couvert par cet angle,
`.hud__engine` (`src/ui/Hud.tsx:78-80`) a été relu en détail : un vrai
défaut de la même famille a été identifié, plus net encore que celui du
libellé de phase déjà corrigé. Ce conteneur affiche "ENGINE ONLINE"/
"ENGINE OFFLINE" à partir de `spacecraft.engine.active`, sans aucun
`aria-live`/`role="status"` sur ce `<div>` ni sur son parent (`grep -rn
"aria-live\|role=\"status\"" src/` — relancé pour cette passe — ne
montre que `CountdownOverlay.tsx` et `.hud__phase`, pas `.hud__engine`).
Le joueur peut certes couper le moteur lui-même (touche `SPACE` ou
bouton tactile "Engine", `src/app/SimulationScreen.tsx`), auquel cas le
changement suit une action directe — mais `applyFuelConsumption`
(`src/simulation/spacecraft/spacecraft.ts:64-83`) coupe aussi
**automatiquement** le moteur dès que le carburant atteint zéro
(`engine: newFuelMass <= 0 ? { ...spacecraft.engine, active: false } :
spacecraft.engine`, ligne 78-80), sans aucune action du joueur à cet
instant précis — exactement le même schéma que la transition de phase
`LAUNCH` → `FLIGHT` déjà jugée digne d'un `aria-live` lors de la 29e
passe (un changement d'état déclenché par la simulation, pas par une
touche pressée). Un joueur non-voyant qui laisse le moteur allumé
jusqu'à épuisement du carburant n'a donc aucun moyen d'être informé
automatiquement que le moteur vient de se couper — contrairement au
joueur voyant, qui voit "ENGINE OFFLINE" apparaître immédiatement dans
le HUD. `tests/ui/Hud.test.tsx` confirme qu'aucun test actuel ne vérifie
de comportement d'annonce pour cet élément (seul le texte affiché est
vérifié à chaque rendu isolé, lignes 77 et 84). Voir le nouvel item sous
"Bugs connus" ci-dessous. Aucun autre bug, trou de couverture
actionnable ou doc obsolète trouvé cette fois-ci — le `README.md` reste
cohérent avec `src/app`/`src/ui`. Les deux points sous "Divers /
à clarifier" restent des décisions en attente, pas des tâches
actionnables en l'état.

Suivi du 2026-08-14 : le bug d'annonce du statut moteur du HUD
(`hud__engine`), identifié lors de la 30e passe ci-dessus, est
désormais corrigé (voir l'entrée cochée correspondante et
`.agent/changelog.md`) — `Hud.tsx` pose `role="status"`/
`aria-live="polite"` sur `.hud__engine`, sur le même modèle que les
correctifs déjà appliqués à `.hud__phase` et `CountdownOverlay.tsx`.
`npm test` (286 tests), `npm run lint`, `npx tsc --noEmit` et `npm run
coverage` (98.04 % de lignes / 98.15 % de branches, `Hud.tsx` toujours
à 100 %) restent propres. Au moment de cette mise à jour, les quatre
sections actionnables du backlog n'avaient plus aucune entrée non
cochée.

Revue du 2026-08-14 (31e passe, planification périodique) : au moment
de cette revue, les quatre sections actionnables du backlog n'avaient
plus aucune entrée non cochée. `npm test` (286 tests), `npm run lint`
et `npx tsc --noEmit` sont propres, aucun `TODO`/`FIXME`/`XXX` dans
`src/`/`tests/`. `npm run coverage` confirme 98.04 % de lignes /
98.15 % de branches ; les seules lignes non couvertes restent
`App.tsx:55,57` et `SimulationScreen.tsx:148-164`, toutes deux déjà
jugées trop marginales lors de passes précédentes — tout
`src/simulation`, `src/rendering` et `src/ui` reste à 100 % de
couverture. `npm outdated`/`npm audit` ne montrent rien de nouveau par
rapport à la 16e passe (mêmes majeures et mêmes 6 vulnérabilités
dev-only déjà documentées sous "Divers / à clarifier"). En poursuivant
l'audit accessibilité entamé lors des 17e/27e/28e/29e/30e passes
(marqueur ✓/🔒 de `MainMenu`, `<canvas>` de `SimulationScreen`, décompte
de `CountdownOverlay`, libellé de phase et statut moteur du HUD — tous
des éléments qui changent de texte *à l'intérieur* d'un même écran),
l'angle a été élargi aux transitions *entre* écrans elles-mêmes : un
vrai défaut d'une autre nature a été identifié. `grep -rn "useRef|\.
focus\(\)|autoFocus" src/` ne montre que les `useRef` de
`SimulationScreen.tsx` utilisés pour le canvas/le moteur/les touches
tenues (`canvasRef`, `engineRef`, `heldKeysRef`,
`missionConfigurationRef`) — aucun appel à `.focus()` ni `autoFocus`
nulle part dans `src/`. Chaque écran (`MainMenu`, `MissionSetup` sous
ses deux formes formulaire/résumé, `SimulationScreen` sous ses
sous-écrans pré-lancement/vol/`MissionResult`) porte pourtant son
propre `<h1>` (`grep -n "<h1" src/ui` : `MainMenu.tsx:18`,
`MissionSetup.tsx:54,166`, `MissionResult.tsx:24`), mais rien ne
déplace jamais le focus clavier vers ce titre lors d'une transition —
`App.tsx` (lignes 25-58) change simplement l'arbre React retourné par
son `switch (appState.phase)`, sans plus d'action, et
`SimulationScreen.tsx` fait de même en interne pour basculer vers
`MissionResult` une fois `isMissionOver` vrai (ligne 194). Un
utilisateur qui navigue au clavier (ex. valide "New mission" avec
`Enter`/`Space`) se retrouve donc avec le focus resté sur un bouton qui
n'existe plus dans le nouveau DOM — la plupart des navigateurs le
reportent silencieusement sur `<body>`, donc un lecteur d'écran n'a
alors plus aucune indication qu'un nouvel écran vient de se charger, ni
aucun repère pour reprendre la navigation par tabulation depuis le
début du nouvel écran (il doit retourner tout en haut manuellement).
C'est le même type de lacune que les cinq déjà corrigées dans ce
backlog (contenu qui change sans que rien ne le signale à l'assistance
technique), mais appliquée cette fois à un changement d'écran complet
plutôt qu'à un élément isolé — et contrairement aux cas déjà traités
avec `aria-live`/`role="status"` (annonce passive d'un texte qui
change), la pratique standard ici est la gestion de focus (déplacer le
focus clavier vers le titre du nouvel écran), le mécanisme recommandé
pour les transitions d'écran complètes dans une SPA. Voir le nouvel
item sous "Bugs connus" ci-dessous. Aucun autre bug, trou de couverture
actionnable ou doc obsolète trouvé cette fois-ci — le `README.md` reste
cohérent avec `src/app`/`src/ui`. Les deux points sous "Divers /
à clarifier" restent des décisions en attente, pas des tâches
actionnables en l'état.

Suivi du 2026-08-14 : le bug d'absence de gestion du focus clavier lors
des transitions d'écran, identifié lors de la 31e passe ci-dessus, est
désormais corrigé (voir l'entrée cochée correspondante et
`.agent/changelog.md`) — `MainMenu.tsx`, `MissionSetup.tsx` (formulaire
et résumé) et `MissionResult.tsx` déplacent désormais le focus clavier
vers leur `<h1>` dès qu'ils apparaissent. `npm test` (291 tests), `npm
run lint`, `npx tsc --noEmit` et `npm run coverage` (`src/ui` reste à
100 % de lignes/branches) restent propres. Au moment de cette mise à
jour, les quatre sections actionnables du backlog n'avaient plus aucune
entrée non cochée.

Revue du 2026-08-14 (32e passe, planification périodique) : au moment
de cette revue, les quatre sections actionnables du backlog n'avaient
plus aucune entrée non cochée. `npm test` (291 tests), `npm run lint`,
`npx tsc --noEmit` et `npm run build` (`tsc && vite build`, 64 modules,
aucun avertissement) sont tous propres, aucun `TODO`/`FIXME`/`XXX` dans
`src/`/`tests/`. `npm run coverage` confirme 98.07 % de lignes /
98.17 % de branches ; tout `src/simulation`, `src/rendering` et
`src/ui` reste à 100 % de couverture, les seules lignes non couvertes
restent `App.tsx:55,57` et `SimulationScreen.tsx:148-164`, toutes deux
déjà jugées trop marginales lors de passes précédentes. `npm outdated`/
`npm audit` ne montrent rien de nouveau par rapport à la 16e passe
(mêmes majeures et mêmes 6 vulnérabilités dev-only déjà documentées
sous "Divers / à clarifier"). Une relecture de `App.tsx`,
`SimulationScreen.tsx`, `MissionSetup.tsx`, `MissionPanel.tsx`,
`Hud.tsx`, `TouchControls.tsx`, `mission-save.ts`,
`mission-configuration.ts`, `simulation-engine.ts` et `engine.ts` n'a
fait remonter aucun bug de logique, trou de couverture ou lacune
d'accessibilité supplémentaire. En élargissant l'audit à la
configuration du dépôt lui-même (jamais fait explicitement lors des 31
passes précédentes, qui portaient sur le code applicatif) — `package.json`,
`.gitignore`, `spec.md`, et la présence/absence d'un dossier
`.github/` — un vrai point d'outillage manquant a été identifié :
`git remote -v` confirme que `origin` pointe vers un vrai dépôt GitHub
(`github.com/JUC0AG0G0/Space-Mission-Simulator`), mais aucun workflow
GitHub Actions n'existe (`ls .github` échoue, dossier absent) — chaque
commit poussé sur `main` n'a donc aucune vérification automatique
visible côté GitHub (pas de coche verte/rouge sur l'historique des
commits), alors que `npm test`/`npm run lint`/`npx tsc --noEmit`/`npm
run build` sont déjà quatre commandes stables et rapides, systématiquement
exécutées à la main à chaque passe de ce backlog depuis son origine.
Voir le nouvel item sous "Tests manquants" ci-dessous. Aucun autre bug,
trou de couverture actionnable ou doc obsolète trouvé cette fois-ci —
le `README.md` reste cohérent avec `src/app`/`src/ui`. Les trois points
sous "Divers / à clarifier" restent des décisions en attente, pas des
tâches actionnables en l'état.

Revue du 2026-08-14 (33e passe, planification périodique) : le point
d'outillage CI identifié lors de la 32e passe ci-dessus est désormais
traité (`.github/workflows/ci.yml` existe et exécute `npm run lint`,
`npx tsc --noEmit`, `npm test` et `npm run build`, voir l'entrée cochée
correspondante sous "Tests manquants" et `.agent/changelog.md`). Au
moment de cette revue, les quatre sections actionnables du backlog
n'avaient plus aucune entrée non cochée. `npm test` (291 tests), `npm
run lint` et `npx tsc --noEmit` sont propres, aucun `TODO`/`FIXME`/
`XXX` dans `src/`/`tests/` (`grep -rn "TODO\|FIXME\|XXX" src tests`).
`npm run coverage` confirme 98.07 % de lignes / 98.17 % de branches ;
tout `src/simulation`, `src/rendering` et `src/ui` reste à 100 % de
couverture, les seules lignes non couvertes restent `App.tsx:55,57` et
`SimulationScreen.tsx:148-164`, toutes deux déjà jugées trop marginales
lors de passes précédentes (repli défensif déjà exhaustif, boucle
`requestAnimationFrame`/redimensionnement du canvas). En relisant
`TouchControls.tsx`, `index.html` et `main.tsx` sous un angle pas
encore exploré lors des 32 passes précédentes — la résilience de
l'application *après* une erreur inattendue, plutôt que la prévention
d'un bug précis — un vrai point de robustesse manquant a été identifié :
`grep -rn "ErrorBoundary|componentDidCatch|getDerivedStateFromError"
src/` ne renvoie aucun résultat, et `main.tsx` monte `<App />`
directement sans aucun composant d'englobement qui intercepterait une
exception de rendu — une erreur imprévue dans n'importe quel composant
ferait donc planter toute l'application sur un écran blanc, sans
message ni moyen de récupérer autrement qu'en rechargeant la page
manuellement. Voir le nouvel item sous "Features à ajouter" ci-dessous.
Un second point, plus mineur, a été identifié en comparant le nouveau
`.github/workflows/ci.yml` (ajouté lors de la passe précédente) au
contenu du `README.md` : `grep -i "badge\|workflows\|actions"
README.md` ne renvoie aucun résultat — rien n'indique dans le README
qu'une CI existe désormais, alors qu'un badge de statut est la
convention standard pour l'exposer. Voir le nouvel item sous
"Documentation" ci-dessous. Aucun autre bug, trou de couverture
actionnable ou doc obsolète trouvé cette fois-ci — le `README.md` reste
par ailleurs cohérent avec `src/app`/`src/ui`. Les trois points sous
"Divers / à clarifier" restent des décisions en attente, pas des tâches
actionnables en l'état.

Revue du 2026-08-14 (34e passe, planification périodique) : le badge de
statut CI ajouté lors de la passe précédente est désormais dans
`README.md` (voir l'entrée cochée correspondante et
`.agent/changelog.md`). Au moment de cette revue, les quatre sections
actionnables du backlog n'avaient plus aucune entrée non cochée. `npm
test` (294 tests), `npm run lint` et `npx tsc --noEmit` sont propres,
aucun `TODO`/`FIXME`/`XXX` dans `src/`/`tests/`. `npm run coverage`
confirme 97.92 % de lignes / 98.21 % de branches (le nouvel
`ErrorBoundary.tsx` est à 100 %, `main.tsx` et `types/simulation.ts`
restent à 0 % — point d'entrée Vite et fichier de types purs, déjà
jugés hors périmètre lors de passes précédentes) ; les seules lignes de
code applicatif non couvertes restent `App.tsx:55,57` et
`SimulationScreen.tsx:148-164`, toutes deux déjà jugées trop marginales.
`npm outdated`/`npm audit` ne montrent rien de nouveau par rapport à la
16e passe (mêmes majeures et mêmes 6 vulnérabilités dev-only déjà
documentées sous "Divers / à clarifier"). En relisant `TouchControls.tsx`
en détail — jamais spécifiquement comparé à `Hud.tsx` sur le plan de la
cohérence d'état visuel, seulement sous l'angle fonctionnel/gameplay
lors de son ajout — un vrai défaut a été identifié : le bouton tactile
"Engine" (`src/ui/TouchControls.tsx:39-45`) affiche toujours le texte
statique `Engine`, sans jamais lire `spacecraft.engine.active`, alors
que `Hud.tsx:78-79` affiche "ENGINE ONLINE"/"ENGINE OFFLINE" à partir de
ce même champ juste à côté. `grep -n "engine.active" src/ui/*.tsx` ne
montre que `Hud.tsx` — `TouchControls.tsx` n'a aucune indication visuelle
(couleur, texte, `aria-pressed`) de l'état courant du moteur, alors que
`SimulationScreen.tsx:206-226` a déjà `state.spacecraft.engine.active`
disponible au même endroit où `<TouchControls onEngineToggle=... />` est
rendu. Un joueur sur écran tactile ne peut donc pas savoir, en regardant
uniquement le bouton, si le prochain appui va allumer ou couper le
moteur — il doit reporter son regard sur le HUD voisin (`.hud__engine`),
ce qui n'est pas garanti d'être dans son champ de vision pendant un vol
qui demande une attention constante au D-pad. Voir le nouvel item sous
"Bugs connus" ci-dessous. Aucun autre bug, trou de couverture
actionnable ou doc obsolète trouvé cette fois-ci — le `README.md` reste
cohérent avec `src/app`/`src/ui`. Les trois points sous "Divers /
à clarifier" restent des décisions en attente, pas des tâches
actionnables en l'état.

Revue du 2026-08-14 (35e passe, planification périodique) : le bug
d'état visuel du bouton tactile "Engine", identifié lors de la 34e
passe, est désormais corrigé (voir l'entrée cochée correspondante et
`.agent/changelog.md`). Au moment de cette revue, les quatre sections
actionnables du backlog n'avaient plus aucune entrée non cochée. `npm
test` (295 tests), `npm run lint` et `npx tsc --noEmit` sont propres,
aucun `TODO`/`FIXME`/`XXX` dans `src/`/`tests/`. `npm run coverage`
confirme 97.93 % de lignes / 98.23 % de branches ; tout
`src/simulation`, `src/rendering` et `src/ui` reste à 100 % de
couverture, les seules lignes non couvertes restent `App.tsx:55,57` et
`SimulationScreen.tsx:148-164`, toutes deux déjà jugées trop marginales
lors de passes précédentes. `npm outdated`/`npm audit` ne montrent rien
de nouveau par rapport à la 16e passe (mêmes majeures et mêmes 6
vulnérabilités dev-only déjà documentées sous "Divers / à clarifier").
En poursuivant l'audit accessibilité entamé lors des 17e/27e/28e/29e/
30e passes (marqueur ✓/🔒 de `MainMenu`, `<canvas>` de vol, décompte de
`CountdownOverlay`, libellé de phase et statut moteur du HUD — tous des
éléments qui changent automatiquement sans `aria-live`) sur le dernier
panneau encore non couvert par cet angle, `MissionPanel.tsx` a été relu
en détail : un vrai défaut de la même famille a été identifié. Ce
panneau affiche à la fois le statut de la mission (`IN PROGRESS`/
`SUCCESS`/`FAILED`, `statusLabel`, lignes 7-16) et le marqueur ✓/○ de
chaque objectif (`objective.completed`, ligne 40), deux valeurs qui
changent automatiquement en cours de vol sans action directe du joueur
sur cet élément précis — exactement le même schéma que les cinq
éléments déjà corrigés dans ce backlog (ex. l'objectif "Reach target
altitude" passe de ○ à ✓ dès que l'altitude entre dans la bande cible,
pas au moment d'une touche pressée). `grep -rn "aria-live\|role=
\"status\"" src/` (relancé pour cette passe) ne montre que `Hud.tsx` et
`CountdownOverlay.tsx` — `MissionPanel.tsx` n'apparaît dans aucun
résultat. Un joueur non-voyant en vol n'a donc aucun moyen d'être
informé automatiquement qu'un objectif vient de se compléter, ou que la
mission vient de réussir/échouer (l'instant précis où
`SimulationScreen` bascule vers `MissionResult`), sans naviguer
manuellement pour redécouvrir l'état affiché — contrairement au joueur
voyant, qui voit le marqueur et le badge de statut changer
immédiatement à l'écran. `tests/ui/MissionPanel.test.tsx` confirme
qu'aucun test actuel ne vérifie de comportement d'annonce (seul le
texte affiché est vérifié à chaque rendu isolé). Voir le nouvel item
sous "Bugs connus" ci-dessous. Aucun autre bug, trou de couverture
actionnable ou doc obsolète trouvé cette fois-ci — le `README.md` reste
cohérent avec `src/app`/`src/ui`. Les trois points sous "Divers /
à clarifier" restent des décisions en attente, pas des tâches
actionnables en l'état.

Revue du 2026-08-14 (36e passe, planification périodique) : au moment
de cette revue, les quatre sections actionnables du backlog n'avaient
plus aucune entrée non cochée. `npm test` (299 tests), `npm run lint`
et `npx tsc --noEmit` sont propres, aucun `TODO`/`FIXME`/`XXX` dans
`src/`/`tests/`. `npm run coverage` confirme 97.94 % de lignes /
98.23 % de branches ; tout `src/simulation`, `src/rendering` et
`src/ui` est désormais à 100 % de couverture (`ErrorBoundary.tsx`
inclus) — les seules lignes non couvertes restent `App.tsx:55,57` et
`SimulationScreen.tsx:148-164`, toutes deux déjà jugées trop marginales
lors de passes précédentes. `npm outdated`/`npm audit` ne montrent rien
de nouveau par rapport à la 16e passe (mêmes majeures et mêmes 6
vulnérabilités dev-only déjà documentées sous "Divers / à clarifier").
`index.html`/`spec.md`/`package.json` relus en détail (balises meta,
absence de ressource externe chargée par `src/app/styles.css` ou
`index.html` — cohérent avec la contrainte "no external API" du
`spec.md` — scripts npm) sans rien trouver d'actionnable.
`src/simulation/progression/mission-progress.ts` relu en détail (`Set`
utilisé dans `markMissionCompleted`, aucun risque de doublon) sans bug
trouvé. En poursuivant l'audit accessibilité entamé lors des
17e/27e/28e/29e/30e/35e passes (gestion du focus clavier et régions
`aria-live` déjà appliquées à `MainMenu`/`MissionSetup`/`MissionResult`
et à plusieurs éléments du HUD/`MissionPanel`/`CountdownOverlay`) sur un
composant ajouté après ces correctifs et jamais revisité sous cet
angle, `src/ui/ErrorBoundary.tsx` a été relu en détail : un vrai défaut
de la même famille que le bug de gestion du focus déjà corrigé pour les
trois écrans principaux (voir l'item coché "Aucune gestion du focus
clavier lors des transitions d'écran..." ci-dessous) a été identifié.
Ce composant affiche son propre `<h1 className="error-boundary__title">`
(`src/ui/ErrorBoundary.tsx:41`) quand une exception de rendu est
interceptée — un changement d'écran complet au même titre que les
transitions déjà couvertes — mais, contrairement à `MainMenu.tsx`,
`MissionSetup.tsx` et `MissionResult.tsx`, il ne porte ni `ref`, ni
`tabIndex={-1}`, ni logique de focus au montage : `grep -n "focus\|
tabIndex" src/ui/ErrorBoundary.tsx` ne renvoie aucun résultat.
`tests/ui/ErrorBoundary.test.tsx` confirme qu'aucun test actuel ne
vérifie de comportement de focus (seuls le texte affiché et le clic sur
"Reload" sont vérifiés). C'est très probablement un oubli de
séquencement plutôt qu'un choix délibéré : `ErrorBoundary.tsx` a été
ajouté par une passe antérieure à celle qui a introduit la convention
de gestion du focus pour les trois autres écrans, et n'a jamais été
retouché depuis pour l'aligner. Voir le nouvel item sous "Bugs connus"
ci-dessous. Aucun autre bug, trou de couverture actionnable ou doc
obsolète trouvé cette fois-ci — le `README.md` reste cohérent avec
`src/app`/`src/ui`. Les trois points sous "Divers / à clarifier"
restent des décisions en attente, pas des tâches actionnables en
l'état.

## Bugs connus

- [x] L'écran de repli d'`ErrorBoundary` ne déplace pas le focus
  clavier vers son titre, contrairement aux trois autres écrans
  principaux

  `src/ui/ErrorBoundary.tsx` affiche un `<h1 className=
  "error-boundary__title">SOMETHING WENT WRONG</h1>` (ligne 41) quand
  une exception de rendu est interceptée — un changement d'écran
  complet, remplaçant tout l'arbre React monté jusque-là, au même titre
  que les transitions déjà couvertes par le correctif "Aucune gestion
  du focus clavier lors des transitions d'écran" (voir l'item coché
  correspondant plus bas dans cette section). Ce correctif a ajouté un
  `ref` + `tabIndex={-1}` + un `useEffect` qui appelle `.focus()` au
  montage sur le `<h1>` de `MainMenu.tsx`, `MissionSetup.tsx` (formulaire
  et résumé) et `MissionResult.tsx` — mais `ErrorBoundary.tsx` n'a
  jamais reçu le même traitement (`grep -n "focus\|tabIndex"
  src/ui/ErrorBoundary.tsx` ne renvoie aucun résultat). Un utilisateur
  au clavier/lecteur d'écran qui déclenche accidentellement ce chemin
  (bug de rendu imprévu ailleurs dans l'app) se retrouve donc, comme
  avant ce correctif pour les trois autres écrans, avec le focus resté
  sur un élément qui n'existe plus dans le nouveau DOM — la plupart des
  navigateurs le reportent silencieusement sur `<body>`, sans aucune
  indication qu'un nouvel écran (le message d'erreur, potentiellement
  la seule information exploitable pour comprendre ce qui vient de se
  passer) vient de s'afficher. `tests/ui/ErrorBoundary.test.tsx` ne
  vérifie aujourd'hui que le texte affiché et le comportement du bouton
  "Reload", pas de comportement de focus.

  Piste : comme `ErrorBoundary` est un composant de classe (obligatoire
  pour `componentDidCatch`/`getDerivedStateFromError`, donc pas de
  hooks), utiliser `createRef<HTMLHeadingElement>()` plutôt que
  `useRef`, et appeler `.focus()` dans `componentDidUpdate` (déclenché
  quand `this.state.hasError` passe de `false` à `true` — comparer
  `prevState.hasError`) plutôt que dans un `useEffect` — sur le même
  modèle que le correctif déjà appliqué aux trois écrans fonctionnels,
  mais adapté au cycle de vie d'un composant de classe. Ajouter
  `tabIndex={-1}` sur le `<h1>`. Ajouter un test dans
  `tests/ui/ErrorBoundary.test.tsx` vérifiant que
  `screen.getByRole('heading', { level: 1 })).toHaveFocus()` juste après
  qu'un enfant a levé une exception au rendu, sur le même modèle que les
  tests déjà ajoutés pour `MainMenu.test.tsx`/`MissionSetup.test.tsx`/
  `MissionResult.test.tsx`.

  Fait le 2026-08-14 : `ErrorBoundary.tsx` porte désormais un
  `headingRef = createRef<HTMLHeadingElement>()`, câblé sur le `<h1>`
  du fallback (avec `tabIndex={-1}`, comme suggéré par la piste). La
  piste envisageait un seul `componentDidUpdate` comparant
  `prevState.hasError` — insuffisant en pratique : quand un enfant lève
  dès le tout premier rendu (le cas du test déjà existant
  "shows a fallback screen...", qui monte directement `<ErrorBoundary>
  <ThrowingComponent /></ErrorBoundary>`), React ne committe jamais
  d'état `hasError: false` au préalable ; le fallback est ce qui
  finit monté, donc c'est `componentDidMount` qui s'exécute pour ce
  commit, pas `componentDidUpdate`. Deux méthodes de cycle de vie sont
  donc ajoutées : `componentDidMount` (appelle `.focus()` si
  `hasError` est déjà vrai au tout premier commit) et
  `componentDidUpdate` (appelle `.focus()` quand `hasError` passe de
  `false` à `true` lors d'un rendu ultérieur — un enfant qui lève après
  un montage initial réussi). Deux tests ajoutés dans
  `tests/ui/ErrorBoundary.test.tsx`, un par chemin : l'un réutilise le
  composant `ThrowingComponent` existant (lève dès le premier rendu,
  exerce `componentDidMount`) et vérifie
  `screen.getByRole('heading', { level: 1 })).toHaveFocus()` ; l'autre
  introduit un nouveau composant `ThrowsOnlyWhenAsked` monté d'abord
  avec `shouldThrow={false}` (rendu normal vérifié), puis re-rendu avec
  `shouldThrow={true}` (exerce `componentDidUpdate`), avec la même
  assertion de focus. `npm run coverage` confirme que
  `src/ui/ErrorBoundary.tsx` est désormais à 100 % de couverture
  (lignes/branches/fonctions) — sans le second test, la branche
  `componentDidUpdate` restait non exercée. `npm test` (301 tests),
  `npm run lint`, `npx tsc --noEmit` et `npm run coverage` (97.95 % de
  couverture globale) restent propres.

- [x] Le statut de mission et les marqueurs d'objectif de
  `MissionPanel` (`IN PROGRESS`/`SUCCESS`/`FAILED`, ✓/○) changent
  automatiquement en vol sans qu'aucune région `aria-live` ne les
  couvre

  `src/ui/MissionPanel.tsx` affiche `statusLabel(mission.status)`
  (lignes 7-16, dans le `<h2>` du panneau, ligne 31) et un marqueur
  `✓`/`○` par objectif (`objective.completed`, ligne 40), tous deux
  recalculés à chaque frame par `evaluateMission`
  (`src/simulation/missions/mission.ts`) — un objectif se complète
  (ex. atteindre l'altitude cible) ou la mission entière passe à
  `'succeeded'`/`'failed'` sans qu'aucune touche ne soit pressée à cet
  instant précis, exactement le même schéma que les cinq éléments déjà
  corrigés dans ce backlog (marqueur ✓/🔒 de `MainMenu`, `<canvas>` de
  vol, décompte de `CountdownOverlay`, libellé de phase et statut
  moteur du HUD — tous avec `role="status"`/`aria-live="polite"`
  ajoutés lors de passes précédentes). `grep -rn "aria-live\|role=
  \"status\"" src/` ne montre que `Hud.tsx` et `CountdownOverlay.tsx` —
  `MissionPanel.tsx` n'a ni l'un ni l'autre. Sans région `aria-live`,
  un changement de texte dans le DOM n'est pas annoncé par un lecteur
  d'écran tant que le focus ne s'y déplace pas explicitement : un
  joueur non-voyant en vol n'a donc aucun moyen de savoir qu'un
  objectif vient de se compléter, ni que la mission vient de réussir ou
  d'échouer, sans naviguer manuellement pour redécouvrir l'état
  affiché.

  Piste : ajouter `role="status"` et `aria-live="polite"` sur le
  `<h2>` (ou un conteneur englobant le statut) et sur la `<ul>` des
  objectifs de `MissionPanel.tsx`, sur le même modèle que les
  correctifs déjà appliqués à `.hud__phase`/`.hud__engine`
  (`src/ui/Hud.tsx`) et à `.countdown-overlay`
  (`src/ui/CountdownOverlay.tsx`). Attention à ne pas dupliquer les
  annonces : si le statut et les objectifs sont dans deux régions
  `aria-live` séparées plutôt qu'une seule englobant tout le panneau,
  vérifier qu'un changement de statut (ex. `'active'` → `'succeeded'`)
  n'est pas annoncé deux fois si plusieurs objectifs se complètent au
  même instant. Étendre `tests/ui/MissionPanel.test.tsx` pour vérifier
  la présence de l'attribut `aria-live`/`role` sur ces deux régions, et
  qu'un re-rendu avec un statut/objectif différent met bien à jour le
  contenu de la région déjà présente (pas une région recréée), sur le
  même modèle que les tests d'accessibilité déjà ajoutés pour
  `CountdownOverlay.tsx`/`Hud.tsx`.

  Fait le 2026-08-14 : `MissionPanel.tsx` pose désormais `role="status"`
  et `aria-live="polite"` sur deux régions distinctes — le `<span
  className="mission-panel__status">` qui affiche `IN PROGRESS`/
  `SUCCESS`/`FAILED` dans le `<h2>`, et un nouveau `<div>` englobant la
  `<ul>` des objectifs (plutôt que poser `role="status"` directement sur
  la `<ul>`, qui aurait écrasé son rôle implicite de liste et cassé la
  sémantique lue par les lecteurs d'écran/`getAllByRole('listitem')`) —
  exactement le premier choix suggéré par la piste ("un conteneur
  englobant le statut" plutôt que le `<h2>` entier, pour ne pas
  ré-annoncer le nom de la mission à chaque changement de statut). Les
  deux régions restent séparées comme envisagé par la piste : un
  changement de statut et une complétion d'objectif au même instant
  déclenchent chacun une seule annonce dans leur propre région, sans
  duplication croisée. Quatre tests ajoutés dans
  `tests/ui/MissionPanel.test.tsx`, sur le même modèle que ceux déjà
  ajoutés pour `Hud.tsx`/`CountdownOverlay.tsx` : deux vérifient la
  région de statut (présence de `aria-live="polite"`, puis mise à jour
  du contenu de la même région lors d'un re-rendu `'active'` →
  `'succeeded'`), deux vérifient la région des objectifs (présence de
  `aria-live="polite"`, puis mise à jour du marqueur `○` → `✓` de la
  même région lors d'un re-rendu avec un objectif nouvellement
  complété). `npm test` (299 tests), `npm run lint`, `npx tsc --noEmit`
  et `npm run coverage` (`MissionPanel.tsx` reste à 100 % de
  lignes/branches, 97.94 % de couverture globale) restent propres.


- [x] Le bouton tactile "Engine" de `TouchControls` n'indique jamais si
  le moteur est actuellement allumé ou éteint

  `src/ui/TouchControls.tsx:39-45` rend le bouton moteur ainsi :

  ```tsx
  <button
    type="button"
    className="touch-controls__button touch-controls__button--engine"
    onClick={onEngineToggle}
  >
    Engine
  </button>
  ```

  Le texte est une chaîne statique `"Engine"`, et
  `.touch-controls__button--engine` (`src/app/styles.css:782-786`) n'a
  qu'une largeur/hauteur/`border-radius` fixes — aucune classe ni
  attribut ne varie selon que le moteur est allumé ou éteint. Le
  composant ne reçoit d'ailleurs même pas cette information : sa
  signature (`TouchControlsProps`, lignes 3-6) n'expose que
  `onEngineToggle`/`onHoldChange`, pas l'état du moteur. Comparer avec
  `Hud.tsx:78-80`, qui affiche juste à côté "ENGINE ONLINE"/"ENGINE
  OFFLINE" à partir de `spacecraft.engine.active`, avec
  `role="status"`/`aria-live="polite"` (corrigé lors d'une passe
  antérieure de ce backlog). `SimulationScreen.tsx` a pourtant déjà
  cette valeur sous la main à l'endroit où `<TouchControls>` est monté
  (`state.spacecraft.engine.active`, lignes 206-226), donc ce n'est pas
  une donnée manquante, juste un fil non tiré jusqu'au composant.

  Concrètement : un joueur sur écran tactile qui garde les yeux sur le
  D-pad/bouton Engine (l'un des points d'interaction principaux pendant
  le vol) n'a aucun moyen de savoir, sans reporter son regard ailleurs
  sur l'écran, si le moteur est actuellement allumé ou éteint avant
  d'appuyer — contrairement au joueur clavier, qui voit `ENGINE
  ONLINE`/`ENGINE OFFLINE` dans le HUD au même endroit que le reste de
  sa télémétrie qu'il consulte déjà. Ce n'est pas qu'un défaut
  cosmétique : appuyer par erreur en pensant allumer un moteur déjà
  actif le coupe à la place (`toggleEngine`,
  `src/simulation/simulation-engine.ts`), ce qui peut interrompre une
  poussée en cours sans que le joueur l'ait voulu.

  Piste : faire remonter `active: boolean` (ou directement
  `spacecraft.engine.active`) comme prop de `TouchControls`, l'utiliser
  pour changer le texte du bouton (ex. "ENGINE ON"/"ENGINE OFF", sur le
  même vocabulaire que le HUD) et ajouter `aria-pressed={active}` pour
  que les lecteurs d'écran/technologies d'assistance sur mobile
  connaissent aussi l'état courant, en plus de la surcouche visuelle
  (ex. une classe `touch-controls__button--engine-active` dans
  `styles.css` qui change la couleur de fond/bordure, sur le même
  principe que `:active` déjà présent pour le retour tactile immédiat).
  Câbler la prop depuis `SimulationScreen.tsx` avec
  `state.spacecraft.engine.active`. Étendre
  `tests/ui/TouchControls.test.tsx` pour vérifier que le texte/
  `aria-pressed` du bouton changent selon la prop `active` (rendu avec
  `active: true` puis `active: false`), et ajouter/adapter un test
  d'intégration dans `tests/ui/SimulationScreen.test.tsx` vérifiant que
  le bouton reflète bien l'état réel du moteur après un
  allumage/extinction.

  Fait le 2026-08-14 : `TouchControlsProps` porte désormais un nouveau
  champ `engineActive: boolean`, câblé depuis `SimulationScreen.tsx`
  avec `state.spacecraft.engine.active` (exactement la même source que
  `Hud.tsx`). Le bouton "Engine" de `TouchControls.tsx` affiche
  maintenant "ENGINE ON"/"ENGINE OFF" (vocabulaire aligné sur "ENGINE
  ONLINE"/"ENGINE OFFLINE" du HUD) au lieu du texte statique "Engine",
  porte `aria-pressed={engineActive}`, et une nouvelle classe
  `touch-controls__button--engine-active` (utilisant `--color-success`,
  déjà utilisée ailleurs dans `styles.css` pour les états positifs)
  change sa couleur de fond/bordure/texte quand le moteur est actif —
  en plus du retour tactile `:active` déjà présent. Tests étendus dans
  `tests/ui/TouchControls.test.tsx` (nouveau test vérifiant le
  libellé/`aria-pressed` pour `engineActive: true` et `false`, plus les
  tests existants adaptés au nouveau texte de bouton) et dans
  `tests/ui/SimulationScreen.test.tsx` (le test d'intégration existant
  du tap sur le bouton Engine vérifie désormais aussi que le libellé et
  `aria-pressed` du bouton changent après le basculement). Un test
  préexistant ("gates the flight HUD behind the pre-flight countdown")
  utilisait une regex générique `/ENGINE/` qui matchait accidentellement
  le nouveau texte du bouton tactile (déjà monté pendant le countdown,
  comportement inchangé par ce correctif) ; remplacé par deux
  assertions ciblant spécifiquement le texte du HUD ("ENGINE ONLINE"/
  "ENGINE OFFLINE"), qui est la donnée réellement pertinente pour ce
  test. `npm test` (295 tests), `npm run lint`, `npx tsc --noEmit` et
  `npm run coverage` (`TouchControls.tsx` reste à 100 % de
  lignes/branches) restent propres.

- [x] Aucune gestion du focus clavier lors des transitions d'écran :
  un utilisateur au clavier/lecteur d'écran perd son repère à chaque
  changement d'écran

  Chaque écran principal porte son propre `<h1>` (`MainMenu.tsx:18`,
  `MissionSetup.tsx:54,166` pour le formulaire et le résumé,
  `MissionResult.tsx:24`), mais rien ne déplace jamais le focus clavier
  vers ce titre lors d'une transition. `App.tsx:25-58` change
  simplement l'arbre React retourné par son `switch (appState.phase)`
  (`main-menu` → `mission-setup` → `simulation`), sans aucune autre
  action ; `SimulationScreen.tsx:194-201` fait de même en interne pour
  basculer vers `MissionResult` une fois `isMissionOver` vrai. `grep -rn
  "useRef|\.focus\(\)|autoFocus" src/` ne montre aucun appel à
  `.focus()` ni `autoFocus` nulle part dans le projet — les seuls
  `useRef` existants (`SimulationScreen.tsx`) servent au canvas, au
  moteur de simulation et aux touches tenues, pas à la gestion du
  focus.

  Concrètement : un joueur qui navigue au clavier (ex. atteint le
  bouton "New mission" par tabulation puis valide avec `Enter`/`Space`)
  se retrouve, une fois l'écran `MissionSetup` monté, avec le focus
  resté sur l'ancien bouton "New mission" — qui n'existe plus dans le
  nouveau DOM. La plupart des navigateurs reportent alors silencieusement
  le focus sur `<body>` : un utilisateur de lecteur d'écran n'a plus
  aucune indication qu'un nouvel écran vient de se charger (aucune
  annonce, contrairement aux changements de texte *à l'intérieur* d'un
  écran déjà couverts par les cinq correctifs `aria-live`/`role=
  "status"` précédents de ce backlog — marqueur ✓/🔒 de `MainMenu`,
  `<canvas>` de vol, décompte de `CountdownOverlay`, libellé de phase et
  statut moteur du HUD), et doit reprendre sa navigation par tabulation
  depuis le tout début de la page (potentiellement en retraversant tout
  le nouvel écran) plutôt que depuis le titre ou le premier champ
  pertinent du nouvel écran. C'est le même défaut à chacune des quatre
  transitions principales : menu → préparation de mission, formulaire →
  résumé de `MissionSetup`, préparation → vol, et vol → écran de
  résultat.

  Piste : gérer le focus explicitement à chaque transition d'écran,
  plutôt que de laisser le navigateur y reporter silencieusement.
  Approche la plus simple et la plus cohérente avec le style du projet
  (pas de librairie de routage, tout est déjà un `switch` React) :
  ajouter un `ref` sur le `<h1>` de chaque écran (`MainMenu`,
  `MissionSetup`, `MissionResult`) et un `useEffect` avec dépendances
  `[]` dans chacun de ces composants qui appelle `headingRef.current
  ?.focus()` au montage — nécessite d'ajouter `tabIndex={-1}` sur ces
  `<h1>` pour les rendre focusables par script sans les ajouter à
  l'ordre de tabulation naturel (motif standard pour la gestion de
  focus en SPA). Vérifier qu'aucun style visuel de focus indésirable
  n'apparaît sur ces titres (ex. `outline: none` ciblé sur ces `<h1>`
  précis si le contour par défaut du navigateur détonne, en gardant tout
  de même un indicateur visible pour les utilisateurs de clavier qui
  arrivent par tabulation classique — pas la peine de le masquer
  entièrement). Ajouter un test par écran (`tests/ui/MainMenu.test.tsx`,
  `tests/ui/MissionSetup.test.tsx`, `tests/ui/MissionResult.test.tsx`,
  et un test d'intégration dans `tests/ui/SimulationScreen.test.tsx`
  pour la transition vol → résultat) vérifiant que
  `document.activeElement` est bien le titre de l'écran juste après son
  rendu (ex. `expect(screen.getByRole('heading', { level: 1 })).toHaveFocus()`).

  Fait le 2026-08-14 : chacun des trois composants d'écran principal
  (`MainMenu.tsx`, `MissionSetup.tsx` — formulaire *et* résumé,
  `MissionResult.tsx`) porte désormais un `ref` sur son `<h1>`, avec
  `tabIndex={-1}` et un `useEffect` qui appelle `headingRef.current
  ?.focus()` au montage, exactement comme suggéré par la piste. Pour
  `MissionSetup.tsx`, qui ne remonte pas entre le formulaire et le
  résumé (un seul composant qui retourne l'un ou l'autre selon l'état
  `reviewing`), le `useEffect` du formulaire dépend de `[reviewing]`
  plutôt que `[]`, pour redéplacer le focus aussi bien au montage
  initial qu'au retour depuis "Edit" ; le résumé (`MissionSummary`),
  lui, est un composant à part qui remonte fraîchement à chaque passage
  en revue, donc un `useEffect` à dépendances `[]` suffit. Comme
  `MissionResult` est déjà rendu par `SimulationScreen` à la place du
  reste de l'écran de vol dès que `isMissionOver` devient vrai (un
  changement de type d'élément React, donc un démontage/remontage), la
  transition vol → résultat est couverte sans code supplémentaire dans
  `SimulationScreen.tsx`. La transition "préparation → vol" (écran de
  compte à rebours dans `SimulationScreen`) reste hors périmètre de ce
  correctif : cet écran n'a pas de `<h1>` (uniquement le canvas déjà
  accessible via `role="img"`/`aria-label` et le HUD/`CountdownOverlay`
  déjà couverts par `aria-live`/`role="status"`), conformément à la
  piste qui ne mentionne que les trois composants avec un `<h1>` — même
  limitation que le champ documenté par la piste elle-même. Vérifié
  qu'aucun style de focus indésirable n'apparaît : aucune règle
  `outline: none` ciblant ces `<h1>` n'existe dans `src/app/styles.css`,
  donc l'anneau de focus par défaut du navigateur s'applique tel quel ;
  confirmé dans un vrai navigateur (Playwright, installé temporairement
  via `npm install --no-save`, jamais ajouté à `package.json`) que
  `document.activeElement` est bien le `<h1>` de chaque écran après
  chacune des quatre transitions (menu → préparation, formulaire →
  résumé, résumé → formulaire via "Edit", vol → résultat), et que
  l'anneau de focus (`:focus-visible`, `outline: auto`) s'affiche
  visuellement pour une activation au clavier (Tab + Enter) tout en
  restant invisible pour une activation à la souris — comportement
  natif de `:focus-visible`, sans CSS supplémentaire nécessaire. Tests
  ajoutés dans `tests/ui/MainMenu.test.tsx`, `tests/ui/MissionSetup
  .test.tsx` (montage, et aller-retour résumé/formulaire) et
  `tests/ui/MissionResult.test.tsx` (montage), plus un test
  d'intégration dans `tests/ui/SimulationScreen.test.tsx` pour la
  transition vol → résultat — les cinq vérifient
  `screen.getByRole('heading', { level: 1 })).toHaveFocus()`, sur le
  modèle suggéré par la piste. `npm test` (291 tests), `npm run lint`,
  `npx tsc --noEmit` et `npm run coverage` (`src/ui` reste à 100 % de
  lignes/branches) restent propres.

- [x] Le statut moteur du HUD (`hud__engine` : `ENGINE ONLINE`/`ENGINE
  OFFLINE`) change automatiquement sans qu'aucune région `aria-live` ne
  le couvre

  `src/ui/Hud.tsx:78-80` rend `<div className="hud__engine">ENGINE
  {spacecraft.engine.active ? 'ONLINE' : 'OFFLINE'}</div>`, sans
  `aria-live`/`role="status"` ni sur ce `<div>` ni sur son parent
  (`grep -rn "aria-live\|role=\"status\"" src/` ne montre que
  `CountdownOverlay.tsx` et `.hud__phase`, tous deux déjà corrigés lors
  de passes précédentes — pas `.hud__engine`). Le joueur peut couper le
  moteur lui-même (touche `SPACE` ou bouton tactile "Engine",
  `src/app/SimulationScreen.tsx`), mais `applyFuelConsumption`
  (`src/simulation/spacecraft/spacecraft.ts:64-83`) coupe aussi
  **automatiquement** le moteur dès que le carburant atteint zéro
  (`engine: newFuelMass <= 0 ? { ...spacecraft.engine, active: false } :
  spacecraft.engine`), sans aucune action du joueur à cet instant précis
  — exactement le même schéma que la transition de phase `LAUNCH` →
  `FLIGHT` déjà jugée digne d'un `aria-live` (changement d'état déclenché
  par la simulation, pas par une touche pressée). Un joueur non-voyant
  qui laisse le moteur allumé jusqu'à épuisement du carburant n'a donc
  aucun moyen d'être informé automatiquement que le moteur vient de se
  couper, contrairement au joueur voyant qui voit "ENGINE OFFLINE"
  apparaître immédiatement. `tests/ui/Hud.test.tsx` (lignes 77, 84) ne
  vérifie que le texte affiché à chaque rendu isolé, pas de comportement
  d'annonce. C'est la même famille de défaut que les quatre lacunes
  d'accessibilité déjà corrigées dans ce backlog (marqueur ✓/🔒 de
  `MainMenu`, `<canvas>` de vol, décompte de `CountdownOverlay`, libellé
  de phase du HUD), appliquée ici à un cinquième élément qui change de
  texte automatiquement.

  Piste : ajouter `role="status"` et `aria-live="polite"` sur le
  conteneur `.hud__engine` dans `Hud.tsx`, sur le même modèle que le
  correctif déjà appliqué à `.hud__phase`. Étendre
  `tests/ui/Hud.test.tsx` pour vérifier la présence de l'attribut
  `aria-live`/`role` sur ce conteneur (ex. un second appel à
  `screen.getByRole('status')`, ou `screen.getAllByRole('status')` si
  les deux régions coexistent dans le même rendu — vérifier que le texte
  "ENGINE ONLINE"/"ENGINE OFFLINE" y apparaît bien), sur le même modèle
  que les tests d'accessibilité déjà ajoutés pour `.hud__phase`.

  Fait le 2026-08-14 : `Hud.tsx` pose désormais `role="status"` et
  `aria-live="polite"` sur le conteneur `.hud__engine`, exactement comme
  suggéré par la piste et sur le même modèle que le correctif déjà
  appliqué à `.hud__phase`. Le HUD contient maintenant deux régions
  `role="status"` distinctes (phase de vol et statut moteur) : les deux
  tests existants de `tests/ui/Hud.test.tsx` qui utilisaient
  `screen.getByRole('status')` (attendant une seule correspondance) sont
  adaptés en `screen.getAllByRole('status')` filtré par contenu textuel,
  pour continuer à cibler spécifiquement la région de phase sans se
  casser sur l'ajout de la seconde région. Deux nouveaux tests ajoutés
  sur le même modèle : l'un vérifie que la région `ENGINE ONLINE` porte
  `aria-live="polite"`, l'autre re-rend le composant avec le moteur
  coupé et vérifie que le contenu de cette même région passe bien de
  "ENGINE ONLINE" à "ENGINE OFFLINE". `npm test` (286 tests), `npm run
  lint`, `npx tsc --noEmit` et `npm run coverage` (`Hud.tsx` reste à
  100 % de lignes/branches, 98.04 % de couverture globale inchangée)
  restent propres.

- [x] Le libellé de phase de vol du HUD (`hud__phase` : `PRE-LAUNCH`,
  `LAUNCH`, `FLIGHT`, `MISSION COMPLETE`, `MISSION FAILED`) change
  automatiquement sans qu'aucune région `aria-live` ne le couvre

  `src/ui/Hud.tsx:55` rend `<div className={`hud__phase
  hud__phase--${phase}`}>{phaseLabel(phase)}</div>`, où `phase` vient de
  `determineFlightPhase` (`src/simulation/flight-phase.ts`) et change au
  fil du vol sans que le joueur agisse directement sur cet élément — en
  particulier la transition `LAUNCH` → `FLIGHT` dépend de l'altitude/
  vitesse du vaisseau, pas d'une touche pressée à cet instant précis.
  `grep -rn "aria-live\|role=\"status\"" src/` ne montre aucune
  occurrence sur `Hud.tsx` (seul `CountdownOverlay.tsx` en a une,
  ajoutée lors de la 28e passe de ce backlog pour son propre décompte).
  Sans région `aria-live`, un changement de texte dans le DOM n'est pas
  annoncé par un lecteur d'écran tant que le focus ne s'y déplace pas
  explicitement — un joueur non-voyant en vol n'a donc aucun moyen de
  savoir que la phase a changé (ex. passage effectif en vol libre après
  le décollage, ou bascule en `MISSION FAILED` juste avant que l'écran
  de résultat ne prenne le relais) sans naviguer manuellement pour
  redécouvrir la valeur affichée. C'est la même famille de défaut que
  les trois lacunes d'accessibilité déjà corrigées dans ce backlog
  (marqueur ✓/🔒 de `MainMenu`, `<canvas>` de vol, décompte de
  `CountdownOverlay`), appliquée ici à un quatrième élément qui change
  de texte automatiquement.

  Piste : ajouter `role="status"` et `aria-live="polite"` sur le
  conteneur `.hud__phase` dans `Hud.tsx`, sur le même modèle que le
  correctif déjà appliqué à `CountdownOverlay.tsx` lors de la passe
  précédente. Ne pas étendre cette région à tout le `.hud` (les valeurs
  `ALTITUDE`/`VELOCITY`/`FUEL`/`MASS`/`THROTTLE` changent à chaque frame
  et noieraient l'utilisateur de lecteur d'écran sous des annonces
  continues) — seul le libellé de phase, qui ne change qu'à quelques
  instants clés, doit être couvert. Étendre `tests/ui/Hud.test.tsx` pour
  vérifier la présence de l'attribut `aria-live`/`role` sur ce
  conteneur (ex. `screen.getByRole('status')` doit exister et contenir
  le libellé de phase affiché), sur le même modèle que les tests
  d'accessibilité déjà ajoutés pour `CountdownOverlay.tsx`.

  Fait le 2026-08-14 : `Hud.tsx` pose désormais `role="status"` et
  `aria-live="polite"` sur le conteneur `.hud__phase`, exactement comme
  suggéré par la piste — seul ce conteneur porte la région annoncée, le
  reste du `.hud` (`ALTITUDE`/`VELOCITY`/`FUEL`/`MASS`/`THROTTLE`, qui
  changent à chaque frame) reste inchangé pour ne pas noyer
  l'utilisateur de lecteur d'écran sous des annonces continues. Deux
  tests ajoutés dans `tests/ui/Hud.test.tsx`, sur le même modèle que
  ceux déjà ajoutés pour `CountdownOverlay.tsx` : l'un vérifie que
  `screen.getByRole('status')` existe, porte `aria-live="polite"` et
  contient le libellé de phase affiché ("FLIGHT") ; l'autre re-rend le
  composant avec un état de mission différent et vérifie que le contenu
  de la même région passe bien de "FLIGHT" à "MISSION FAILED". `npm
  test` (284 tests), `npm run lint`, `npx tsc --noEmit` et `npm run
  coverage` (`Hud.tsx` reste à 100 % de lignes/branches, 98.04 % de
  couverture globale inchangée) restent propres.

- [x] Le décompte de `CountdownOverlay` (T-3…T-1, LIFTOFF) n'est annoncé
  par aucun lecteur d'écran : aucune région `aria-live` ne couvre son
  texte, qui change automatiquement plusieurs fois sans action du joueur

  `CountdownOverlay.tsx` (`src/ui/CountdownOverlay.tsx:18-23`) affiche
  `MISSION READY` puis un `<div className="countdown-overlay__value">`
  dont le contenu texte (`T-3`, `T-2`, `T-1`, `LIFTOFF`) est recalculé
  et réaffecté à chaque re-rendu, au rythme du temps de simulation (le
  compte à rebours est piloté par `SimulationEngine`/`advanceCountdown`,
  `src/simulation/simulation-engine.ts`). Aucun `aria-live`, `role=
  "status"` ni `role="timer"` n'entoure ce conteneur ni son parent
  `.countdown-overlay` — `grep -rn "aria-live\|role=\"status\"\|role=
  \"alert\"" src/` ne renvoie aucun résultat dans tout le projet.
  Sans région `aria-live`, un changement de texte dans le DOM n'est pas
  annoncé par les lecteurs d'écran tant que le focus ne s'y déplace pas
  explicitement (ce qui n'arrive jamais ici, l'écran ne reçoit aucune
  interaction pendant le compte à rebours). C'est le seul endroit de
  l'application où du texte change plusieurs fois de suite sans action
  du joueur : un utilisateur de lecteur d'écran qui atteint cet écran
  entend "MISSION READY" une fois, puis plus rien jusqu'à ce qu'il
  navigue manuellement pour redécouvrir la valeur affichée — il n'a
  aucun moyen de savoir que le décompte progresse ni de repérer le
  moment `LIFTOFF`, qui est pourtant l'instant précis où le contrôle
  manuel du vaisseau devient actif (`determineFlightPhase`,
  `src/simulation/flight-phase.ts`). C'est la même famille de défaut que
  les deux lacunes d'accessibilité déjà corrigées dans ce backlog
  (marqueur ✓/🔒 de `MainMenu` sans texte accessible, `<canvas>` de vol
  sans `aria-label`), appliquée ici à une région dynamique plutôt qu'à
  un élément statique.

  Piste : ajouter `role="status"` (ou `role="timer"`) et `aria-live=
  "polite"` sur le conteneur `.countdown-overlay` (ou directement sur
  `.countdown-overlay__value`) dans `CountdownOverlay.tsx`, pour que
  chaque changement de valeur soit annoncé automatiquement par les
  lecteurs d'écran sans déplacement de focus. Attention à ne pas
  sur-annoncer : `aria-live="polite"` avec `role="status"` n'interrompt
  pas la lecture en cours (contrairement à `role="alert"`/
  `aria-live="assertive"`, à éviter ici puisque le décompte n'est pas
  une urgence) — vérifier que chaque valeur (`T-3`, `T-2`, `T-1`,
  `LIFTOFF`) est bien lue l'une après l'autre plutôt qu'une seule fois
  résumée. Étendre `tests/ui/CountdownOverlay.test.tsx` pour vérifier la
  présence de l'attribut `aria-live`/`role` sur le conteneur (ex.
  `screen.getByRole('status')` doit exister et contenir le texte
  affiché), sur le même modèle que le test d'accessibilité déjà ajouté
  pour le `<canvas>` de `SimulationScreen` lors de la 27e passe.

  Fait le 2026-08-14 : `CountdownOverlay.tsx` pose désormais
  `role="status"` et `aria-live="polite"` sur le conteneur
  `.countdown-overlay` (le parent des deux `<div>` de texte), exactement
  la première option suggérée par la piste — un seul attribut sur le
  conteneur plutôt que sur `.countdown-overlay__value` seul, pour que
  "MISSION READY" et la valeur du compte à rebours soient couverts par
  la même région annoncée. `aria-live="polite"` (pas `"assertive"`/
  `role="alert"`) évite d'interrompre une lecture en cours, conformément
  à la mise en garde de la piste sur le fait que le décompte n'est pas
  une urgence. Deux tests ajoutés dans
  `tests/ui/CountdownOverlay.test.tsx` : l'un vérifie que
  `screen.getByRole('status')` existe, porte `aria-live="polite"` et
  contient le texte affiché ; l'autre re-rend le composant avec des
  `countdown` différents et vérifie que le contenu de la même région
  passe bien de "T-1" à "LIFTOFF". `npm test` (282 tests), `npm run
  lint`, `npx tsc --noEmit` et `npm run coverage` (`CountdownOverlay.tsx`
  reste à 100 % de lignes/branches, 98.04 % de couverture globale
  inchangée) restent propres.

- [x] Le `<canvas>` de la simulation de vol n'a ni `role`, ni
  `aria-label`, ni contenu de repli pour les lecteurs d'écran

  `SimulationScreen.tsx:208` rend l'élément qui porte tout le rendu
  visuel du vol (planète, trajectoire, vaisseau, via `renderScene`,
  `src/rendering/canvas-renderer.ts`) ainsi :

  ```tsx
  <canvas ref={canvasRef} className="app__canvas" />
  ```

  Aucun `role`, `aria-label`/`aria-labelledby`, ni contenu HTML de
  repli entre les balises `<canvas>...</canvas>` (le contenu de repli
  d'un `<canvas>` n'est rendu par le navigateur que si l'élément est
  vide de tout `ref`/dessin — ici il ne l'est jamais, puisque
  `renderScene` dessine dès la première frame). `grep -rn "aria-\|
  role=" src/` (voir 27e passe ci-dessus) montre que `MainMenu.tsx`,
  `MissionSetup.tsx` et `TouchControls.tsx` portent déjà des
  `aria-label`, mais que ni `SimulationScreen.tsx` ni aucun de ses
  enfants directs (le `<canvas>` lui-même, distinct du `Hud`/
  `MissionPanel` déjà textuels) n'en porte pour ce point précis. Un
  utilisateur de lecteur d'écran qui navigue jusqu'à cet élément
  n'obtient donc aucune indication sur ce qu'il représente — ce n'est
  pas une régression fonctionnelle (le HUD adjacent expose déjà
  altitude/vitesse/carburant/statut en texte), mais une lacune
  d'accessibilité du même type que celle déjà corrigée pour `MainMenu`
  lors de la 17e passe de ce backlog (voir l'item coché "La liste de
  progression des missions du menu principal n'indique aucun statut
  terminé/verrouillé..." ci-dessous).

  Piste : ajouter `role="img"` et un `aria-label` statique et concis
  sur l'élément `<canvas>` de `SimulationScreen.tsx` (ex. `aria-label="
  Live spacecraft flight visualization"` ou équivalent — un texte fixe
  suffit, puisque le détail dynamique (altitude, vitesse, carburant,
  statut de mission) est déjà exposé en texte par `Hud.tsx`/
  `MissionPanel.tsx` juste à côté ; pas besoin de recalculer un libellé
  par frame). Ajouter un test dans `tests/ui/SimulationScreen.test.tsx`
  vérifiant que le canvas est accessible par son nom (ex.
  `screen.getByRole('img', { name: /flight visualization/i })`), sur le
  même modèle que les tests d'accessibilité déjà ajoutés pour
  `MainMenu.tsx` lors de la 17e passe.

  Fait le 2026-08-14 : `SimulationScreen.tsx` pose désormais
  `role="img"` et `aria-label="Live spacecraft flight visualization"`
  sur l'élément `<canvas>`, exactement comme suggéré par la piste — un
  libellé statique, puisque le détail dynamique (altitude, vitesse,
  carburant, statut de mission) reste exposé en texte par `Hud.tsx`/
  `MissionPanel.tsx` juste à côté. Test ajouté dans
  `tests/ui/SimulationScreen.test.tsx` ("exposes the flight canvas to
  assistive technology by its accessible name") vérifiant
  `screen.getByRole('img', { name: /flight visualization/i })`. `npm
  test` (280 tests), `npm run lint`, `npx tsc --noEmit` et `npm run
  coverage` (`SimulationScreen.tsx` reste à 100 % de lignes/branches en
  dehors des lignes déjà jugées marginales) restent propres.

- [x] Aucun favicon n'est servi : le navigateur reçoit une 404 sur
  `/favicon.ico` à chaque chargement de l'application

  `index.html` ne contient aucune balise `<link rel="icon" ...>` dans son
  `<head>` (seuls `<meta charset>`, `<meta name="viewport">` et `<title>`
  y figurent), et le dépôt ne contient aucun fichier favicon nulle part
  — `public/` (référencé par défaut comme racine des assets statiques de
  Vite) ne contient qu'un `.gitkeep`. Confirmé concrètement : `npm run
  dev` puis `curl -s -o /dev/null -w '%{http_code}' http://localhost:
  <port>/favicon.ico` répond `404` (le navigateur demande cette URL par
  défaut sur toute page qui n'indique pas explicitement d'icône) ; `npm
  run build` produit un `dist/` sans aucun fichier favicon ni référence
  à une icône dans `dist/index.html`. Ce n'est pas bloquant pour jouer,
  mais c'est une requête ratée systématique visible dans les DevTools
  (onglet Network/Console) à chaque chargement, et l'onglet du
  navigateur affiche l'icône générique par défaut au lieu d'une icône
  dédiée au jeu — un défaut de finition simple à corriger, jamais
  identifié lors des 25 passes précédentes de ce backlog (qui portaient
  sur la logique de jeu, l'accessibilité, le CSS responsive et la
  couverture de tests, pas sur les assets statiques racine).

  Piste : ajouter un favicon minimal (un simple SVG suffit, pas besoin
  d'un jeu d'icônes multi-résolution pour ce projet V0 — ex.
  `public/favicon.svg` avec une forme simple sur le thème spatial/fusée)
  et référencer `<link rel="icon" type="image/svg+xml" href="/favicon.svg"
  />` dans le `<head>` d'`index.html`, sur le modèle du template Vite par
  défaut. Vérifier après coup que `npm run dev` ne renvoie plus de `404`
  sur la requête d'icône du navigateur, et que `npm run build` copie
  bien le fichier dans `dist/`. Item purement statique (HTML + un
  fichier d'asset) : aucun test unitaire n'est attendu au-delà de
  `npm run build`/`npm run lint` qui doivent rester propres.

  Fait le 2026-08-14 : nouveau fichier `public/favicon.svg` (une forme
  simple sur le thème spatial — planète bleu nuit avec une fusée
  stylisée et ses deux flammes), et nouvelle balise `<link rel="icon"
  type="image/svg+xml" href="/favicon.svg" />` ajoutée dans le `<head>`
  d'`index.html`, entre `<meta name="viewport">` et `<title>`, sur le
  modèle du template Vite par défaut suggéré par la piste. Vérifié
  concrètement : `npm run build` copie bien `favicon.svg` dans `dist/`
  (à côté d'`index.html`, qui référence la même balise `<link>`) ; `npm
  run dev` répond `200` sur `GET /favicon.svg` (`/favicon.ico` répond
  toujours `404`, mais un navigateur ne le demande plus automatiquement
  dès qu'une balise `<link rel="icon">` est présente dans le HTML, donc
  la 404 systématique visible dans les DevTools disparaît). Item
  purement statique (HTML + un fichier d'asset), sans logique
  applicative : aucun test unitaire ajouté, conformément à la piste —
  `npm test` (279 tests), `npm run lint`, `npx tsc --noEmit` et `npm run
  build` restent tous propres.

- [x] Sur un viewport très étroit (< 320px CSS, ex. Galaxy Fold replié
  ~280px), l'écran `MissionSetup` (et potentiellement `MissionResult`/
  `MainMenu`) déborde horizontalement et tronque du texte

  `.mission-setup__form` et `.mission-setup__summary`
  (`src/app/styles.css:331-337,446-453`) ont chacun une largeur fixe
  `width: 320px;` — pas un `max-width`, donc aucune adaptation possible
  en dessous de cette valeur. `.mission-result__summary`
  (`src/app/styles.css:588-591`) et le bloc juste en dessous (objectifs,
  `src/app/styles.css:~617`) utilisent le même `width: 320px;` fixe, et
  `.main-menu__actions`/`.main-menu__progress`
  (`src/app/styles.css:~474-476,509-511`) ont le même motif avec
  `width: 240px;`. Aucun de ces conteneurs n'a de `max-width: 100%` ni
  de mécanisme de repli pour un viewport plus étroit que sa largeur
  fixe.

  Vérifié dans un vrai navigateur (Playwright headless, plusieurs
  largeurs de viewport) sur l'écran `MissionSetup` : à 320px de large,
  `scrollWidth === clientWidth === 320` (aucun débordement) ; dès que le
  viewport passe sous 320px, `.mission-setup__form` garde sa largeur de
  320px alors que le viewport rétrécit, ce qui fait déborder
  `document.documentElement.scrollWidth` au-delà de `clientWidth` — 310
  à 300px de large, 300 à 280px, 290 à 260px, 280 à 240px (un
  débordement de 20 à 40px selon le viewport). La capture d'écran prise
  à 280px de large confirme visuellement l'effet : le formulaire, plus
  large que l'écran, force un défilement horizontal et le focus initial
  sur le premier champ fait défiler la page vers la droite, tronquant
  le texte sur la gauche ("Mission 01" apparaît comme "ission 01",
  "Spacecraft name" comme "acecraft name", "Mission profile" comme
  "ission profile", etc.) — un vrai défaut d'affichage, pas seulement un
  défilement superflu, puisque rien n'indique au joueur que le contenu
  continue hors champ. Le menu principal (`MainMenu`, largeurs fixes de
  240px) n'a montré aucun débordement dans la plage de viewports testée
  (320px à 240px) mais partage le même motif de largeur fixe sans
  `max-width`, donc reste vulnérable au même défaut en dessous de
  ~240px + son padding.

  Piste : remplacer chaque `width: 320px`/`width: 240px` fixe de ces
  quatre blocs (`.mission-setup__form`, `.mission-setup__summary`,
  `.mission-result__summary` et le bloc d'objectifs juste en dessous,
  `.main-menu__actions`, `.main-menu__progress`) par `width: 100%;
  max-width: 320px;` (ou `240px` selon le bloc), pour que le conteneur
  se limite à sa largeur cible sur un écran large mais rétrécisse sur un
  viewport plus étroit au lieu de forcer un débordement horizontal.
  Vérifier qu'aucune régression n'apparaît sur les viewports déjà
  utilisés par les tests visuels précédents (iPhone 13 portrait/
  paysage, desktop). Comme pour les bugs de superposition tactile déjà
  corrigés dans ce backlog, un layout CSS pur n'est pas vérifiable par
  un test unitaire classique (jsdom ne fait pas de mise en page réelle) :
  vérifier le correctif visuellement dans un vrai navigateur avec un
  viewport étroit (ex. 280px de large, ou la device toolbar Chrome
  DevTools en mode responsive réduit sous 320px), en confirmant que
  `document.documentElement.scrollWidth` ne dépasse plus `clientWidth`.

  Fait le 2026-08-14 : les six blocs identifiés par la piste ont chacun
  leur `width: 320px`/`width: 240px` fixe remplacé par `width: 100%;
  max-width: 320px;` (ou `240px`) dans `src/app/styles.css` —
  `.mission-setup__form`, `.mission-setup__summary`,
  `.mission-result__summary`, `.mission-result__objectives`,
  `.main-menu__actions`, `.main-menu__progress`. Chacun de ces
  conteneurs vit dans un parent flex column centré avec `padding: 24px`
  (`.mission-setup`, `.mission-result`, `.main-menu`), donc `width:
  100%` reste borné par ce parent sans introduire de nouveau
  débordement. Vérifié dans un vrai navigateur (Playwright headless,
  installé temporairement via `npm install --no-save`, jamais ajouté à
  `package.json`) sur cinq largeurs de viewport (320, 300, 280, 260,
  240px) : `document.documentElement.scrollWidth === clientWidth` dans
  tous les cas, sur l'écran `MissionSetup` (formulaire *et* résumé) et
  sur `MainMenu` — capture d'écran à 280px confirmant que "Mission
  name"/"Spacecraft name"/"Mission profile" et les cartes de fusée
  s'affichent désormais intégralement, sans troncature ni défilement
  horizontal. Comme pour les bugs de superposition tactile déjà
  corrigés dans ce backlog, changement CSS pur non vérifiable par un
  test unitaire classique (jsdom ne fait pas de mise en page réelle) :
  aucun test ajouté/modifié. `npm test` (279 tests), `npm run lint` et
  `npx tsc --noEmit` restent propres.

- [x] Sur téléphone en **paysage**, les commandes tactiles
  (`TouchControls`) se superposent toujours au panneau latéral — le
  correctif du bug équivalent en portrait ne couvre pas ce cas

  Le correctif de la 21e passe de ce backlog (voir l'item coché "Sur
  téléphone en portrait, les commandes tactiles..." ci-dessous) ajoute
  une règle combinée `@media (pointer: coarse) and (max-width: 640px)`
  (`src/app/styles.css:752-762`) qui repositionne `.app__sidebar`
  au-dessus de `.touch-controls` et masque `.controls-panel` — mais
  cette règle se déclenche uniquement sous 640px de large. Un téléphone
  tenu en **paysage** dépasse cette largeur (ex. iPhone 13 : 750px CSS
  en paysage, contre 390px en portrait), donc ni cette règle combinée
  ni la règle `@media (max-width: 640px)` seule (`src/app/styles.css:
  731-736`) ne s'appliquent : `.app__sidebar` reste ancré à sa position
  de base (`top: 16px; right: 16px; width: 260px`,
  `src/app/styles.css:51-60`), sans repositionnement ni `max-height`/
  `overflow-y: auto`, et `.controls-panel` (légende clavier) reste
  visible. Or `@media (pointer: coarse)` seule (`src/app/styles.css:
  658-669`) s'applique bien dès que le pointeur est tactile,
  indépendamment de l'orientation, donc `.touch-controls` s'affiche
  toujours ancré en bas d'écran (`position: absolute; left: 16px;
  right: 16px; bottom: 16px;`).

  Vérifié dans un vrai navigateur (Playwright, émulation
  `devices['iPhone 13 landscape']` — viewport 750×342 CSS px, tactile)
  en jouant jusqu'à l'écran de vol : `.app__sidebar` mesure `{ x: 474,
  y: 16, width: 260, height: 469 }` (sa hauteur, 469px, dépasse déjà à
  elle seule la hauteur du viewport, 342px) et `.touch-controls` `{ x:
  16, y: 206, width: 718, height: 120 }` — un recouvrement de boîtes de
  260×120px est mesuré entre les deux éléments (calcul sur les deux
  `boundingBox()`). La capture d'écran confirme visuellement le D-pad
  peint par-dessus le panneau `CONTROLS` (légende des touches) et le
  bouton "Engine" par-dessus la ligne "Decrease throttle", les rendant
  illisibles à cet endroit — et, comme pour le bug portrait déjà
  corrigé, `.touch-controls__button` a `pointer-events: auto` et est
  rendu après `.app__sidebar` dans le JSX
  (`src/app/SimulationScreen.tsx`), donc capté en priorité sur les taps
  qui atterriraient sinon sur les boutons du panneau (Pause/Restart) à
  cet endroit.

  Piste : étendre la logique déjà en place plutôt que d'en réinventer
  une — le correctif portrait raisonne uniquement sur `max-width`, alors
  que le vrai problème est "le panneau latéral est-il assez haut et
  assez proche du bas d'écran pour empiéter sur `.touch-controls` ancré
  en bas ?", une question qui dépend de la hauteur du viewport
  (`max-height`/`orientation: landscape`), pas de sa largeur. Envisager
  une règle `@media (pointer: coarse) and (max-height: 500px)` (ou
  `orientation: landscape`) à côté de celle déjà existante en
  `max-width`, appliquant le même traitement (relever `.app__sidebar`
  au-dessus de `.touch-controls`, masquer `.controls-panel`, contraindre
  `max-height`/`overflow-y: auto`) — ou fusionner les deux conditions
  avec une seule règle `@media (pointer: coarse) and (max-width: 640px),
  (pointer: coarse) and (max-height: 500px)` si les valeurs numériques
  choisies s'avèrent identiques pour les deux orientations. Comme pour
  le bug portrait déjà corrigé, un layout CSS pur n'est pas vérifiable
  par un test unitaire classique (jsdom ne fait pas de mise en page
  réelle) : vérifier le correctif visuellement dans un vrai navigateur
  avec un viewport de téléphone en paysage et `hasTouch`/`isMobile`
  activés (Chrome DevTools device toolbar, ou Playwright avec
  `devices['iPhone 13 landscape']` comme utilisé pour identifier ce
  bug), en confirmant par les `boundingBox()` des deux éléments qu'ils
  ne se chevauchent plus — et vérifier aussi qu'aucune régression
  n'apparaît sur les cas déjà corrigés (portrait tactile, et
  desktop/pointeur fin en paysage, qui doivent rester inchangés).

  Fait le 2026-08-13 : la règle combinée `@media (pointer: coarse) and
  (max-width: 640px)` ajoutée par le correctif portrait précédent est
  étendue avec une deuxième condition alternative,
  `(pointer: coarse) and (max-height: 500px)`, dans la même liste de
  media queries séparée par une virgule (`src/app/styles.css`) — la
  piste envisageait soit une règle `max-height`/`orientation:
  landscape` séparée, soit une fusion des deux conditions dans une
  seule règle "si les valeurs numériques choisies s'avèrent identiques
  pour les deux orientations" ; c'est cette deuxième option qui a été
  retenue, avec la même valeur de traitement (`bottom: 152px`,
  `max-height: calc(100vh - 152px - 16px)`, `overflow-y: auto`,
  `.controls-panel { display: none; }`) pour les deux cas, ce qui évite
  de dupliquer les déclarations. Vérifié dans un vrai navigateur
  (Playwright, émulation `devices['iPhone 13 landscape']` — 750×342 CSS
  px, tactile) après correctif : `.app__sidebar` mesure `{ x: 474, y:
  16, width: 260, height: 174 }` et `.touch-controls` `{ x: 16, y: 206,
  width: 718, height: 120 }` — un espace de 16px les sépare (190 à
  206), aucun chevauchement (calcul de recouvrement de boîtes sur les
  deux `boundingBox()` : aire nulle), confirmé par une capture d'écran
  (panneau `MISSION 01`/objectifs entièrement lisible au-dessus du
  D-pad et du bouton Engine). Aucune régression sur les deux cas déjà
  corrigés/inchangés, revérifiés dans la même session : portrait
  tactile (`devices['iPhone 13']`, 390×844) reste identique au
  correctif précédent (`.app__sidebar` `{ x: 16, y: 326, width: 358,
  height: 186 }`, aucun chevauchement avec `.touch-controls`) ; desktop
  sans tactile (1280×800, `hasTouch: false`) n'active aucune des deux
  media queries `pointer: coarse` et garde `.controls-panel` visible
  et `.app__sidebar` à sa taille pleine (`height: 469`). Changement CSS
  pur, comme pour le correctif portrait : non vérifiable par un test
  unitaire classique (jsdom ne fait pas de mise en page réelle), aucun
  test ajouté/modifié. `npm test` (279 tests), `npm run lint` et `npx
  tsc --noEmit` restent propres.

- [x] Sur téléphone en portrait, les commandes tactiles (`TouchControls`)
  se superposent au panneau latéral au lieu de coexister avec lui

  Deux règles CSS indépendantes de `src/app/styles.css` peuvent
  s'appliquer en même temps sur un téléphone tenu en portrait (tactile
  ET largeur ≤ 640px, le profil le plus courant) :

  * `@media (pointer: coarse) { .touch-controls { position: absolute;
    left: 16px; right: 16px; bottom: 16px; z-index: 2; ... } }`
    (`src/app/styles.css:658-669`) affiche le D-pad (haut/bas/gauche/
    droite) et le bouton "Engine" ajoutés par `src/ui/TouchControls.tsx`
    à la 20e passe de ce backlog ;
  * `@media (max-width: 640px) { .app__sidebar { width: calc(100% -
    32px); top: auto; bottom: 16px; } }` (`src/app/styles.css:731-736`)
    repositionne le panneau latéral (`MissionPanel` + `SimulationControls`
    + `ControlsPanel`, tous les trois dans `.app__sidebar`, elle-même à
    `z-index: 2` en base, `src/app/styles.css:51-60`) en bas d'écran, sur
    quasiment toute la largeur.

  Aucune des deux règles ne tient compte de l'autre : les deux zones
  finissent ancrées au même coin bas de l'écran, avec le même
  `z-index`. Vérifié dans un vrai navigateur (Playwright, émulation
  iPhone 13 — 390×844, tactile) en jouant jusqu'à l'écran de vol :
  `.app__sidebar` mesure `{ x: 16, y: 234, width: 358, height: 414 }` et
  `.touch-controls` `{ x: 16, y: 528, width: 358, height: 120 }`, soit un
  recouvrement complet en largeur et de 120 px en hauteur (tout le bloc
  `.touch-controls`). Comme `TouchControls` est rendu après
  `.app__sidebar` dans le JSX (`src/app/SimulationScreen.tsx:206-224`),
  il est peint par-dessus à égalité de `z-index` : le D-pad et le
  bouton "Engine" recouvrent visuellement la fin du panneau
  `ControlsPanel` (légende des touches) et le bas de
  `SimulationControls`, rendant leur texte illisible à cet endroit — et
  captent les taps qui atterriraient sinon sur ce qu'il y a en dessous
  (`.touch-controls__button` a `pointer-events: auto`). Cette
  superposition sape directement l'utilité de la fonctionnalité tactile
  tout juste ajoutée : c'est précisément sur téléphone (petit écran +
  tactile) qu'elle est censée servir.

  Piste : introduire une règle combinée `@media (pointer: coarse) and
  (max-width: 640px)` (ou équivalent) qui évite le chevauchement plutôt
  que de laisser les deux règles indépendantes se cumuler — par exemple
  réduire `.app__sidebar` (masquer `ControlsPanel`, moins utile une fois
  les commandes tactiles visibles, et/ou réduire son `max-height` avec
  défilement) ou remonter son ancrage (`bottom` calculé à partir de la
  hauteur réelle de `.touch-controls`, ou repositionner `.app__sidebar`
  en haut même sous 640px quand le pointeur est `coarse`) pour que les
  deux zones ne se recouvrent plus. Comme pour le bug de flou Retina
  déjà corrigé dans ce backlog, un layout CSS pur n'est pas vérifiable
  par un test unitaire classique (jsdom ne fait pas de mise en page
  réelle) : vérifier le correctif visuellement dans un vrai navigateur
  avec un viewport étroit et `hasTouch`/`isMobile` activés (Chrome
  DevTools device toolbar, ou Playwright avec `devices['iPhone 13']`
  comme utilisé pour identifier ce bug), en confirmant par les
  `boundingBox()` des deux éléments qu'ils ne se chevauchent plus.

  Fait le 2026-08-13 : nouvelle règle combinée `@media (pointer: coarse)
  and (max-width: 640px)` ajoutée dans `src/app/styles.css`, juste après
  les deux règles indépendantes qui se cumulaient — approche "remonter
  l'ancrage" + "masquer `ControlsPanel`" (les deux pistes suggérées,
  combinées plutôt qu'une seule) : `.app__sidebar` passe de `bottom:
  16px` à `bottom: 152px` (la hauteur du bloc `.touch-controls`, 120px,
  plus sa marge de 16px, plus 16px de respiration) avec `max-height:
  calc(100vh - 152px - 16px)` et `overflow-y: auto` en filet de sécurité
  si le contenu du panneau dépasse malgré tout l'espace disponible ; et
  `.controls-panel` (légende clavier, `ControlsPanel.tsx`) passe à
  `display: none` dans ce même contexte, puisque les raccourcis clavier
  qu'elle documente ne servent plus une fois les commandes tactiles
  affichées, ce qui réduit d'autant la hauteur du panneau restant
  (`MissionPanel` + `SimulationControls`). Aucune des deux règles
  préexistantes n'est modifiée : sur un écran étroit sans tactile
  (pointeur fin), le panneau reste positionné exactement comme avant
  (`bottom: 16px`, `ControlsPanel` visible) — vérifié dans un vrai
  navigateur (Playwright, viewport 390×844 avec un pointeur fin) :
  `.app__sidebar` mesure toujours `{ x: 16, y: 414, width: 358, height:
  414 }` et `.controls-panel` reste visible. Sur tactile + portrait
  (Playwright, émulation iPhone 13 — 390×844, tactile), après ce
  correctif : `.app__sidebar` mesure `{ x: 16, y: 326, width: 358,
  height: 186 }` et `.touch-controls` `{ x: 16, y: 528, width: 358,
  height: 120 }` — un espace de 16px les sépare (512 à 528), aucun
  chevauchement, confirmé par un calcul de recouvrement de boîtes sur
  les deux `boundingBox()` et par une capture d'écran (légende du panneau
  et boutons Pause/Restart entièrement lisibles au-dessus du D-pad et du
  bouton Engine). Changement CSS pur, comme prévu par la piste, non
  vérifiable par un test unitaire classique (jsdom ne fait pas de mise
  en page réelle) : aucun test ajouté/modifié. `npm test` (279 tests),
  `npm run lint` et `npx tsc --noEmit` restent propres.

- [x] `SimulationScreen.onKeyDown` détourne toujours des raccourcis
  navigateur/OS pour les touches continues (WASD/flèches), contrairement
  aux touches discrètes déjà corrigées

  `onKeyDown` (`src/app/SimulationScreen.tsx:69-99`) a deux branches.
  La branche des touches discrètes (`' '`, `'p'`, `'r'`, lignes 78-99)
  vérifie explicitement `event.ctrlKey || event.metaKey || event.altKey`
  et laisse le navigateur gérer nativement Ctrl/Cmd+R (rafraîchir) et
  Ctrl/Cmd+P (imprimer) — un bug corrigé lors d'une passe antérieure de
  ce backlog (voir l'item coché "`SimulationScreen.onKeyDown` détourne
  des raccourcis navigateur..." plus bas dans cette section). Mais la
  branche des touches continues, juste au-dessus (lignes 72-76) :

  ```ts
  if (CONTINUOUS_KEYS.has(key)) {
    heldKeysRef.current.add(key);
    event.preventDefault();
    return;
  }
  ```

  n'a pas cette garde. `CONTINUOUS_KEYS` contient `'a'`, `'s'`, `'d'`
  (`src/app/SimulationScreen.tsx:21-30`), qui correspondent à des
  raccourcis navigateur/OS très courants : Ctrl/Cmd+A (tout sélectionner),
  Ctrl/Cmd+S (enregistrer la page), Ctrl/Cmd+D (ajouter aux favoris). En
  vol, appuyer sur l'un de ces raccourcis pendant que le canvas a le
  focus clavier (`window`, pas un élément spécifique — le cas normal
  puisque le jeu écoute sur `window`) :

  1. bloque le raccourci navigateur (`preventDefault()` inconditionnel) ;
  2. **et** ajoute la touche à `heldKeysRef`, donc `buildCommandFromKeys`
     (lignes 32-42) continue de piloter le throttle/le cap du vaisseau
     tant que le raccourci est maintenu enfoncé, exactement comme si le
     joueur avait appuyé sur la touche seule — ce n'est donc pas qu'un
     `preventDefault()` superflu, mais une vraie entrée de jeu non
     désirée déclenchée par une combinaison de touches système.

  `onKeyUp` (lignes 102-107) retire bien la touche du set au relâchement
  indépendamment des modificateurs, donc l'effet s'arrête dès que le
  raccourci est relâché, mais l'action aura déjà été appliquée entre
  temps.

  Piste : appliquer la même garde que la branche des touches discrètes
  au début de `onKeyDown`, avant la vérification `CONTINUOUS_KEYS.has(key)`
  — par exemple `if (event.ctrlKey || event.metaKey || event.altKey) {
  return; }` en tout début de fonction, ce qui couvre les deux branches
  d'un coup plutôt que de dupliquer la garde. Vérifier que cela ne casse
  pas les touches fléchées (`ArrowUp`/`ArrowDown`/`ArrowLeft`/`ArrowRight`,
  qui n'ont pas de raccourci navigateur usuel avec Ctrl/Cmd/Alt) ni les
  touches discrètes déjà gérées. Ajouter des tests dans
  `tests/ui/SimulationScreen.test.tsx`, sur le même modèle que les tests
  existants "does not hijack Ctrl/Cmd+R"/"does not hijack Ctrl/Cmd+P" :
  `fireEvent.keyDown(window, { key: 'a', ctrlKey: true })` (et `'s'`/
  `'d'` avec `metaKey: true`) suivi d'une frame, puis vérifier via
  l'espion sur `SimulationEngine.prototype.applyCommand` (déjà utilisé
  par les tests voisins de `onKeyUp`) que la commande appliquée a
  `turnDelta: 0`/`throttleDelta: 0` — pas la valeur non nulle qu'on
  observerait pour un appui normal sur la même touche sans modificateur.

  Fait le 2026-08-13 : la garde `if (event.ctrlKey || event.metaKey ||
  event.altKey) { return; }` est désormais évaluée en tout début
  d'`onKeyDown` (`src/app/SimulationScreen.tsx`), avant la vérification
  `CONTINUOUS_KEYS.has(key)`, exactement comme suggéré par la piste —
  elle couvre donc d'un coup la branche des touches continues (WASD/
  flèches) et celle des touches discrètes (`' '`/`'p'`/`'r'`), dont la
  garde locale équivalente (dupliquée) a été retirée. Comportement
  inchangé pour les touches fléchées (`ArrowUp`/`ArrowDown`/`ArrowLeft`/
  `ArrowRight`, qui n'ont pas de raccourci navigateur usuel avec Ctrl/
  Cmd/Alt) et pour les touches discrètes déjà couvertes par les tests
  existants ("does not hijack Ctrl/Cmd+R"/"does not hijack Ctrl/Cmd+P").
  Test ajouté dans `tests/ui/SimulationScreen.test.tsx` ("does not
  hijack Ctrl/Cmd+A, +S, or +D, leaving the browser shortcuts alone") :
  `keydown` sur `'a'` avec `ctrlKey: true`, `'s'` et `'d'` avec
  `metaKey: true`, suivi d'une frame — vérifie via l'espion sur
  `SimulationEngine.prototype.applyCommand` que la commande appliquée a
  `throttleDelta: 0`/`turnDelta: 0` (pas les valeurs non nulles qu'on
  observerait pour un appui normal sur ces mêmes touches). `npm test`
  (272 tests), `npm run lint`, `npx tsc --noEmit` et `npm run coverage`
  (97.9 % de lignes / 97.84 % de branches, inchangé — la garde était
  déjà exercée par les tests Ctrl/Cmd+R/+P existants, seule sa portée a
  changé) restent propres.

- [x] La liste de progression des missions du menu principal n'indique
  aucun statut terminé/verrouillé aux lecteurs d'écran

  `MainMenu.tsx:34-50` affiche une `<ul>` de missions, une par profil
  disponible (`MissionProgressEntry`,
  `src/simulation/progression/mission-progress.ts:11-16`). Chaque `<li>`
  contient un `<span className="main-menu__progress-marker"
  aria-hidden="true">{entry.completed ? '✓' : '🔒'}</span>` suivi du
  texte `entry.destinationName`. Le marqueur — seul élément qui porte
  l'information `entry.completed` — est explicitement retiré de l'arbre
  d'accessibilité par `aria-hidden="true"`, et rien d'autre dans le
  `<li>` ne restitue cette information sous forme de texte. Un lecteur
  d'écran énonce donc simplement "Earth orbit", "High orbit", "Fast
  orbit" pour les trois missions, sans jamais dire si elles sont déjà
  réussies ou encore verrouillées — alors que visuellement (✓ vs 🔒 et
  la classe `main-menu__progress-entry--completed`) cette distinction
  est le seul contenu utile de toute la section "Missions" du menu
  principal.

  Piste : ajouter un texte accessible portant le statut à côté du
  marqueur toujours `aria-hidden` — par exemple un `<span
  className="sr-only">{entry.completed ? 'Completed' : 'Locked'}</span>`
  (avec une classe utilitaire `sr-only` à ajouter dans
  `src/app/styles.css`, motif standard : contenu visuellement masqué
  mais lu par les lecteurs d'écran, `position: absolute; width: 1px;
  height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space:
  nowrap;`), ou plus simplement poser `aria-label={`${entry
  .destinationName} — ${entry.completed ? 'Completed' : 'Locked'}`}` sur
  le `<li>` avec le contenu visuel existant gardé `aria-hidden` en plus
  du marqueur (pour éviter la double lecture destination+statut puis à
  nouveau destination). Étendre `tests/ui/MainMenu.test.tsx` : rendre
  `MainMenu` avec un `missionProgress` mêlant une entrée `completed:
  true` et une `completed: false`, et vérifier que le texte accessible
  de chaque élément de liste (`getByRole('listitem')` ou
  `getByText`/`getByLabelText` selon l'implémentation choisie) distingue
  bien les deux statuts, pas seulement leur classe CSS.

  Fait le 2026-08-13 : chaque `<li>` de `MainMenu.tsx` porte désormais
  `aria-label={`${entry.destinationName} — ${entry.completed ?
  'Completed' : 'Locked'}`}` (approche retenue plutôt que la classe
  utilitaire `sr-only` proposée en alternative dans la piste, plus
  simple ici puisque tout le contenu visuel du `<li>` peut être masqué
  d'un coup) ; le texte visuel `entry.destinationName` est désormais
  enveloppé dans son propre `<span aria-hidden="true">` (en plus du
  marqueur ✓/🔒, déjà `aria-hidden`), pour que l'`aria-label` du `<li>`
  soit la seule source lue par un lecteur d'écran et évite la double
  lecture destination+statut puis à nouveau destination. Le rendu
  visuel (texte + marqueur + classe `--completed`) est inchangé. Test
  ajouté dans `tests/ui/MainMenu.test.tsx` ("exposes completed/locked
  status to assistive technology, not just visually") : rend `MainMenu`
  avec une entrée `completed: true` et une `completed: false`, et
  vérifie via `screen.getByRole('listitem', { name: ... })` que le nom
  accessible de chaque élément de liste contient bien "— Completed" /
  "— Locked", pas seulement le nom de destination. Les tests existants
  (`getByText('Earth orbit').closest('li')`) continuent de passer sans
  modification : `getByText` ignore `aria-hidden`, seul le texte exposé
  aux lecteurs d'écran change. `npm test` (271 tests), `npm run lint`,
  `npx tsc --noEmit` et `npm run coverage` (97.9 % de lignes / 97.84 %
  de branches globales, `MainMenu.tsx` désormais à 100 %) restent
  propres.

- [x] Le canvas de simulation ne tient pas compte de `devicePixelRatio` :
  rendu flou sur les écrans Retina/haute densité

  La boucle de rendu de `SimulationScreen.tsx` (lignes 139-151)
  redimensionne le buffer du canvas ainsi :

  ```ts
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  renderScene(ctx, nextState, { width: canvas.width, height: canvas.height });
  ```

  `clientWidth`/`clientHeight` sont exprimés en pixels CSS, et
  `.app__canvas` (`src/app/styles.css:43-49`) est simplement dimensionné
  à `width: 100%; height: 100%;` de son conteneur — rien ne multiplie
  ces dimensions par `window.devicePixelRatio` avant de les affecter au
  buffer du canvas (`canvas.width`/`canvas.height`, qui contrôlent la
  résolution réelle du buffer de pixels, indépendamment de la taille
  d'affichage CSS). Sur un écran standard (`devicePixelRatio === 1`)
  cela ne se voit pas, mais sur un écran Retina/haute densité
  (`devicePixelRatio` 2 ou 3, très courant sur les Mac et les mobiles
  récents), le navigateur doit suréchantillonner un buffer deux à trois
  fois plus petit que nécessaire pour remplir la boîte CSS affichée : la
  planète, le vaisseau et la trajectoire (`renderPlanet`/
  `renderSpacecraft`/`renderTrajectory`, `src/rendering/`) sont donc
  rendus visiblement flous par rapport à un rendu natif, alors que nulle
  part dans `src/` ni `tests/` `devicePixelRatio` n'est pris en compte
  ni ce compromis documenté comme volontaire.

  Piste : dans `SimulationScreen.tsx`, calculer `const dpr =
  window.devicePixelRatio || 1;`, dimensionner le buffer du canvas à
  `width * dpr` / `height * dpr` plutôt qu'à `width`/`height` bruts, et
  appeler `ctx.scale(dpr, dpr)` juste avant `renderScene` pour que le
  reste du pipeline de rendu (`buildCamera`, `renderPlanet`, etc.)
  continue de raisonner en pixels CSS (`width`/`height` non multipliés)
  sans aucune modification. Comme jsdom ne implémente pas réellement
  `HTMLCanvasElement.getContext('2d')` (avertissement `Not implemented`
  déjà visible dans la sortie de `npm test`), ce correctif n'est pas
  vérifiable par un test de rendu visuel ; envisager d'extraire le
  calcul de dimensionnement (ex. une fonction pure
  `computeCanvasBufferSize(clientWidth, clientHeight, devicePixelRatio)`
  renvoyant `{ width, height }`) dans un module testable séparément,
  pour au moins couvrir la logique de mise à l'échelle par un test
  unitaire classique plutôt que de laisser tout le correctif sans test.

  Fait le 2026-08-12 : nouvelle fonction pure exportée
  `computeCanvasBufferSize(clientWidth, clientHeight, devicePixelRatio)`
  (`src/rendering/canvas/canvas-buffer-size.ts`), qui multiplie les
  dimensions CSS par le ratio de pixels et arrondit au pixel entier.
  `SimulationScreen.tsx` calcule désormais `const devicePixelRatio =
  window.devicePixelRatio || 1;` à chaque frame, l'utilise via cette
  fonction pour dimensionner `canvas.width`/`canvas.height` (au lieu de
  `clientWidth`/`clientHeight` bruts), puis appelle
  `ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)`
  avant `renderScene` — préféré à `ctx.scale(dpr, dpr)` (suggestion
  initiale de la piste) car `setTransform` fixe une échelle absolue à
  chaque frame plutôt que de composer avec la précédente, évitant tout
  risque de sur-échelle si le buffer n'est pas redimensionné à une frame
  donnée (taille inchangée). `renderScene` reçoit toujours
  `clientWidth`/`clientHeight` (pixels CSS non multipliés), donc
  `buildCamera`/`renderPlanet`/`renderSpacecraft`/`renderTrajectory`
  n'ont pas été modifiés. Comme prévu par la piste, ce correctif n'est
  pas vérifiable par un test de rendu visuel (jsdom n'implémente pas
  `HTMLCanvasElement.getContext('2d')`) ; la logique de dimensionnement
  est en revanche couverte par un test unitaire classique dans
  `tests/rendering/canvas-buffer-size.test.ts` (ratio 1 inchangé, ratio
  2 doublé, ratio fractionnaire 1.5 arrondi). `npm test` (270 tests),
  `npm run lint`, `npx tsc --noEmit` et `npm run coverage` (97.9 % de
  lignes / 97.83 % de branches globales, `canvas-buffer-size.ts` à
  100 %) restent propres ; les lignes non couvertes du bloc canvas de
  `SimulationScreen.tsx` (désormais 144-160, contre 143-150
  auparavant) restent la même limitation jsdom déjà documentée comme
  marginale, pas une régression de couverture.

- [x] Un nom de mission/fusée anormalement long peut déborder du panneau
  HUD et recouvrir la zone de jeu

  Les champs "Mission name" et "Spacecraft name" de `MissionSetup`
  (`src/ui/MissionSetup.tsx:66-81`) n'ont pas d'attribut `maxLength`, et
  `isValidMissionConfiguration`
  (`src/simulation/missions/mission-configuration.ts:105-114`) ne vérifie
  que `trim().length > 0`, sans borne haute. Ces noms sont ensuite
  affichés tels quels dans `.hud__mission` (`src/ui/Hud.tsx:54`,
  panneau positionné en `absolute` par-dessus le canvas,
  `src/app/styles.css:81-101` — `min-width: 220px` mais pas de
  `max-width` ni d'`overflow`/`text-overflow`/`word-break`), dans le
  résumé de `MissionSetup` (`.mission-setup__summary dd`) et dans
  `MissionResult` (`.mission-result__summary dd`, aucun de ces deux
  sélecteurs n'a non plus de troncature). Un nom collé ou saisi de
  plusieurs centaines de caractères traverse donc la validation, la
  sauvegarde (`mission-save.ts`) et l'affichage sans jamais être
  tronqué, et peut élargir le panneau HUD au point de recouvrir une
  partie de la zone de jeu pendant le vol.

  Piste : ajouter un `maxLength` raisonnable (ex. 40 caractères) aux
  deux `<input>` de `MissionSetup.tsx`, et/ou ajouter `overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap;` (avec un `max-width`)
  sur `.hud__mission` dans `src/app/styles.css` comme filet de sécurité
  pour toute donnée déjà en `localStorage` avant ce correctif. Ajouter
  un test dans `tests/ui/MissionSetup.test.tsx` vérifiant l'attribut
  `maxLength` sur les deux champs.

  Fait le 2026-08-12 : nouvelle constante exportée
  `MISSION_NAME_MAX_LENGTH = 40`
  (`src/simulation/missions/mission-configuration.ts`), appliquée comme
  attribut `maxLength` sur les deux `<input>` "Mission name" et
  "Spacecraft name" de `MissionSetup.tsx` — un nom ne peut donc plus
  être *saisi* au-delà de 40 caractères dans l'UI. En filet de sécurité
  pour toute configuration déjà présente en `localStorage` avant ce
  correctif (sauvegardée par une version antérieure du jeu, sans cette
  borne), `src/app/styles.css` ajoute `max-width: 320px` à `.hud` et
  `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;` à
  `.hud__mission`, `.mission-setup__summary dd` et
  `.mission-result__summary dd` : un nom anormalement long est tronqué
  avec une ellipse au lieu d'élargir le panneau et de recouvrir la zone
  de jeu. `isValidMissionConfiguration` n'a pas été modifiée (elle
  continue de n'exiger qu'un nom non blanc) : le `maxLength` HTML suffit
  pour la saisie normale, et l'ellipse CSS couvre le cas résiduel d'une
  donnée déjà sauvegardée. Test ajouté dans
  `tests/ui/MissionSetup.test.tsx` ("caps the mission name and
  spacecraft name inputs to a reasonable length") vérifiant l'attribut
  `maxLength` sur les deux champs. `npm test` (267 tests), `npm run
  lint` et `npx tsc --noEmit` restent propres.

- [x] `describeFailureCause` affiche une cause d'échec trompeuse quand
  un vaisseau à court de carburant s'écrase au sol

  `describeFailureCause` (`src/simulation/missions/mission-result.ts:15-17`)
  déduit la cause affichée sur l'écran `MissionResult` uniquement à
  partir de `state.spacecraft.fuelMass` au moment où la mission passe à
  `'failed'` : `fuelMass <= 0` → "Fuel depleted", sinon → "Spacecraft
  crashed". Or `evaluateMission`
  (`src/simulation/missions/mission.ts:126-131`) fait déjà échouer la
  mission pour un crash (`altitude < CRASH_ALTITUDE`) indépendamment du
  niveau de carburant. Un scénario de jeu tout à fait normal — le joueur
  épuise son carburant en montée, le moteur se coupe automatiquement
  (`applyFuelConsumption`, `src/simulation/spacecraft/spacecraft.ts:70`),
  puis le vaisseau retombe en trajectoire balistique et finit par
  toucher le sol (`altitude < 0`) — déclenche le statut `'failed'` via
  la branche crash, mais `describeFailureCause` affiche "Fuel depleted"
  au lieu de "Spacecraft crashed" : le joueur perd l'information que
  c'est bien l'impact au sol, et pas seulement la panne sèche, qui a mis
  fin à la mission.

  Piste : plutôt que de re-dériver la cause depuis l'état courant (ce
  qui perd l'information de *quelle* branche d'`evaluateMission` a fait
  échouer la mission), faire porter la cause directement par le
  `Mission` au moment où `evaluateMission` bascule son `status` à
  `'failed'` (ex. un champ `failureReason: 'crashed' | 'fuel-depleted'
  | null` dans `src/types/simulation.ts`, renseigné dans les deux
  branches d'échec de `mission.ts`), et faire lire ce champ par
  `describeFailureCause` au lieu de réinspecter `spacecraft.fuelMass`.
  Ajouter un test dans `tests/missions/mission.test.ts` couvrant un
  crash avec `fuelMass: 0`, et un test dans
  `tests/missions/mission-result.test.ts` vérifiant que
  `buildMissionResultStats` reporte bien "Spacecraft crashed" (et non
  "Fuel depleted") pour ce cas.

  Fait le 2026-08-11 : nouveau champ `failureReason: 'crashed' |
  'fuel-depleted' | null` sur `Mission`
  (`src/types/simulation.ts`), renseigné directement par
  `evaluateMission` (`src/simulation/missions/mission.ts`) au moment où
  elle bascule `status` à `'failed'` — `'crashed'` sur la branche
  `altitude < CRASH_ALTITUDE`, `'fuel-depleted'` sur la branche
  "stranded outside target band", `null` sinon (préservé tel quel une
  fois la mission déjà non-active). `describeFailureCause`
  (`src/simulation/missions/mission-result.ts`) lit désormais ce champ
  au lieu de re-dériver la cause depuis `spacecraft.fuelMass`, donc un
  vaisseau à court de carburant qui retombe et s'écrase affiche
  correctement "Spacecraft crashed". Tests ajoutés dans
  `tests/missions/mission.test.ts` ("tags a ground impact as a crash
  even with the fuel tank already empty", crash avec `fuelMass: 0`) et
  dans `tests/missions/mission-result.test.ts` ("reports 'Spacecraft
  crashed', not 'Fuel depleted', when a fuel-less spacecraft crashes on
  the ground"), plus des assertions sur `failureReason` ajoutées aux
  tests existants de crash/stranding. Les littéraux `Mission` construits
  à la main dans les tests (`MissionPanel.test.tsx`,
  `SimulationScreen.test.tsx`, `mission-result.test.ts`) ont été mis à
  jour avec le nouveau champ obligatoire. `npm test` (252 tests), `npm
  run lint` et `npx tsc --noEmit` restent propres.

- [x] Les noms saisis dans `MissionSetup` ne sont pas recadrés
  (`trim()`), contrairement à ce que la validation laisse croire

  `isValidMissionConfiguration` (`src/simulation/missions/
  mission-configuration.ts:105-113`) vérifie `configuration.missionName
  .trim().length > 0` et `configuration.spacecraftName.trim().length >
  0` avant d'activer le bouton "Review mission" — donc un nom composé
  uniquement d'espaces est bien rejeté. Mais `updateField` dans
  `src/ui/MissionSetup.tsx` (appelé depuis les `onChange` des champs
  "Mission name" et "Spacecraft name", lignes 66 et 74) stocke la
  valeur brute de l'`<input>` telle quelle, sans jamais la recadrer.
  Un nom valide mais avec des espaces en début/fin (ex. `"  Mission 01
  "`) passe donc la validation intacte, est transmis à `onLaunch`, puis
  sauvegardé par `saveMission` (`src/simulation/persistence/
  mission-save.ts`) et utilisé par `createOrbitMission`
  (`src/simulation/missions/mission.ts`) et `createInitialSpacecraft`
  (`src/simulation/simulation-engine.ts`) sans normalisation — les
  espaces parasites se retrouvent donc affichés tels quels dans le HUD
  (`src/ui/Hud.tsx`), le panneau de mission (`src/ui/MissionPanel.tsx`)
  et l'écran de résultat (`src/ui/MissionResult.tsx`).

  Recadrer la valeur avant de l'écrire dans `updateField` (ou juste
  avant `onLaunch`) pour les deux champs texte, et ajouter un test dans
  `tests/ui/MissionSetup.test.tsx` vérifiant qu'un nom saisi avec des
  espaces en début/fin est recadré dans la configuration transmise à
  `onLaunch`.

  Fait le 2026-08-11 : le `onSubmit` du formulaire dans
  `src/ui/MissionSetup.tsx` recadre désormais `missionName` et
  `spacecraftName` dans l'état `configuration` (via `setConfiguration`,
  `.trim()` sur les deux champs) juste avant `setReviewing(true)`, donc
  au moment où le joueur passe du formulaire à l'écran de résumé —
  plutôt qu'à chaque frappe dans `updateField`, ce qui aurait empêché de
  taper un espace entre deux mots. L'écran de résumé (`MissionSummary`)
  et `onLaunch` lisent la même valeur d'état déjà recadrée, donc plus
  aucune trace des espaces parasites en sauvegarde/HUD/résultat. Test
  ajouté dans `tests/ui/MissionSetup.test.tsx` ("trims leading/trailing
  whitespace from mission and spacecraft names on review") : saisit
  `"  Mission 01  "` / `"  Falcon  "`, vérifie que le résumé affiche les
  valeurs recadrées puis que `onLaunch` est appelé avec
  `missionName: 'Mission 01'` / `spacecraftName: 'Falcon'`. `npm test`
  (249 tests), `npm run lint` et `npx tsc --noEmit` restent propres.

- [x] Une mission peut rester bloquée en statut `active` indéfiniment :
  aucune condition d'échec ne se déclenche pour un vaisseau à court de
  carburant, installé sur une orbite stable qui ne croise jamais la
  bande d'altitude cible de la mission.

  `evaluateMission` (`src/simulation/missions/mission.ts:78`) ne fait
  passer une mission à `'failed'` que si `altitude < CRASH_ALTITUDE`
  (le vaisseau touche le sol), et à `'succeeded'` que si l'altitude
  entre un jour dans `[minAltitude, maxAltitude]` assez longtemps.
  Or la physique (`src/simulation/physics/gravity.ts` +
  `integration.ts`) est une gravité à deux corps sans atmosphère : une
  orbite fermée (circulaire ou elliptique) qui ne croise ni le sol ni
  la bande cible est stable indéfiniment. `computeThrustAcceleration`
  et `applyFuelConsumption` (`src/simulation/spacecraft/spacecraft.ts`)
  coupent bien la poussée à carburant nul, donc le joueur n'a alors
  plus aucun moyen de corriger sa trajectoire — mais rien ne fait
  échouer la mission pour autant : `SimulationEngine.step` continue de
  tourner et le mission-result screen (`src/simulation/missions/
  mission-result.ts`) n'est jamais atteint. C'est la même famille de
  bug que l'ancien "carburant qui rend la mission injouable au sol",
  déjà corrigé, mais en vol.

  Exemple reproductible en test unitaire : construire un `Spacecraft`
  avec `fuelMass: 0`, positionné/orienté pour une orbite circulaire
  stable sous `minAltitude` (ex. rayon = `centralBody.radius + 50_000`
  avec la vitesse orbitale circulaire correspondante), moteur éteint,
  puis appeler `SimulationEngine.step` un grand nombre de fois : le
  statut de `activeMission` reste `'active'` alors que l'altitude ne
  rejoindra jamais la bande cible et que le vaisseau ne peut plus
  manœuvrer.

  Piste : ajouter une condition d'échec explicite (ex. carburant épuisé
  ET objectif `reach-altitude` non complété ET vaisseau hors bande
  cible) dans `evaluateMission`, en veillant à ne pas faire échouer
  prématurément une trajectoire elliptique sans carburant qui
  traverserait encore la bande cible périodiquement (périapside/
  apoapside). `describeFailureCause`
  (`src/simulation/missions/mission-result.ts:15`) sait déjà afficher
  "Fuel depleted" comme cause — cette tâche consiste à faire en sorte
  que ce statut soit réellement atteint plutôt qu'à ajouter l'affichage.

  Fait le 2026-08-11 : nouveau module `src/simulation/physics/orbit.ts`
  exposant `computeOrbitRadiusBounds(position, velocity, body)`, qui
  calcule le périapside et l'apoapside (en distance au centre du corps
  central) de la trajectoire képlérienne non propulsée à partir de la
  position/vitesse courantes (équation vis-viva + moment cinétique
  spécifique), et renvoie `null` pour une trajectoire non liée
  (parabolique/hyperbolique, énergie spécifique ≥ 0) qui n'a pas
  d'orbite refermée à raisonner. `evaluateMission`
  (`src/simulation/missions/mission.ts`) utilise cette fonction dans une
  nouvelle garde `isStrandedOutsideTargetBand` : si `spacecraft.fuelMass
  <= 0`, que les objectifs ne sont pas tous complétés, et que la plage
  `[périapside, apoapside]` (convertie en altitude) ne recouvre pas
  `[minAltitude, maxAltitude]` de la mission, le statut passe à
  `'failed'` au lieu de rester bloqué à `'active'`. Une orbite avec du
  carburant restant, ou une orbite elliptique sans carburant dont
  l'apoapside ou le périapside retombe encore dans la bande cible, ne
  sont pas affectées (le statut reste `'active'`, conformément à la
  mise en garde de la piste ci-dessus contre un échec prématuré).
  `describeFailureCause` (`mission-result.ts`) affichait déjà "Fuel
  depleted" pour `spacecraft.fuelMass <= 0`, donc l'écran de résultat
  fonctionne sans modification. Tests ajoutés dans
  `tests/physics/orbit.test.ts` (orbite circulaire, orbite elliptique
  avec périapside/apoapside connus, trajectoire d'échappement → `null`)
  et dans `tests/missions/mission.test.ts` (orbite circulaire hors bande
  + carburant épuisé → `'failed'` ; même orbite avec carburant restant →
  `'active'` ; orbite elliptique hors bande courante mais dont
  l'apoapside retombe dans la bande, carburant épuisé → `'active'`).

- [x] `SimulationEngine.applyCommand` ignore l'état `paused`

  Fait le 2026-08-11 : `applyCommand` (`src/simulation/simulation-engine.ts:190`)
  vérifie désormais `this.state.paused` en plus de `isMissionActive()`
  et `countdown` (même garde que `step`), donc `toggleEngine`,
  `throttleDelta` et `turnDelta` sont ignorés tant que le jeu est en
  pause — le vaisseau ne bouge plus et le HUD ne change plus (throttle,
  moteur, cap) pendant la pause. Test ajouté dans
  `tests/simulation-engine.test.ts` ("ignores toggleEngine,
  throttleDelta, and turnDelta while paused") : les trois commandes sont
  appliquées pendant que `engine.setPaused(true)`, et l'état
  `spacecraft` est vérifié inchangé.

- [x] La configuration de mission saisie dans `MissionSetup` est ignorée
  au lancement

- [x] Le HUD de vol affiche un identifiant de mission constant au lieu
  du nom réel de la mission

  Fait le 2026-08-11 : `Hud.tsx` affichait `state.activeMission?.id`,
  qui vaut toujours la constante `'ORBIT-01'` (fixée dans
  `createOrbitMission`), quel que soit le profil de mission choisi
  (`earth-orbit` / `high-orbit` / `fast-orbit`) ou le nom saisi par le
  joueur dans `MissionSetup`. `src/ui/Hud.tsx:54` affiche désormais
  `state.activeMission?.name`, qui reflète le nom réel de la mission
  (`'Orbit-01'` par défaut, ou le nom personnalisé saisi par le joueur).
  `tests/ui/Hud.test.tsx` mis à jour : le test existant vérifie
  désormais `MISSION: Orbit-01`, et un nouveau test couvre l'affichage
  d'un nom de mission personnalisé (`'Mission 01'`).

- [x] Le carburant se consomme intégralement même quand le vaisseau est
  immobilisé au sol, ce qui peut rendre la mission injouable sans
  jamais se terminer

  Fait le 2026-08-11 : `SimulationEngine.step`
  (`src/simulation/simulation-engine.ts`) calcule maintenant `grounded`
  une seule fois via `isGrounded(...)` et n'appelle
  `applyFuelConsumption` que lorsque `grounded` est `false` — tant que
  le vaisseau reste cloué au sol (poussée verticale insuffisante pour
  décoller, y compris lorsque le joueur a tourné le cap loin de la
  verticale), le carburant ne diminue plus, même moteur allumé. Test
  ajouté dans `tests/simulation-engine.test.ts` ("SimulationEngine
  freezes fuel consumption while grounded") : un vaisseau au sol, cap à
  `π/2` (donc sans composante de poussée verticale) et moteur actif dès
  le départ, soumis à 20 `step(1)` — l'altitude reste à `0` et
  `fuelMass` reste strictement égal à sa valeur initiale.

- [x] `SimulationScreen.onKeyDown` détourne des raccourcis navigateur
  (Ctrl/Cmd+R, Ctrl/Cmd+P) au lieu de les laisser au navigateur

  Fait le 2026-08-11 : `onKeyDown` (`src/app/SimulationScreen.tsx`)
  regroupe désormais les trois touches discrètes (`' '`, `'p'`, `'r'`)
  sous une seule garde : si `event.ctrlKey`, `event.metaKey` ou
  `event.altKey` est vrai, la fonction retourne immédiatement sans
  appeler `applyCommand`/`togglePause`/`reset` ni `preventDefault()`,
  laissant le navigateur gérer nativement `Ctrl/Cmd+R` (rafraîchir) et
  `Ctrl/Cmd+P` (imprimer). Les touches continues (WASD/flèches) ne sont
  pas concernées par ce ticket. Tests ajoutés dans
  `tests/ui/SimulationScreen.test.tsx` : un `keydown` sur `'r'` avec
  `ctrlKey: true` puis `metaKey: true` vérifie que l'état de jeu n'est
  pas réinitialisé (le moteur reste `ENGINE ONLINE`), et un test
  équivalent sur `'p'` avec `ctrlKey`/`metaKey` vérifie que la pause
  n'est pas basculée.

- [x] `SimulationScreen.onKeyDown` réagit au key-repeat du système,
  déclenchant plusieurs actions pour une seule pression de touche

  Fait le 2026-08-11 : `onKeyDown` (`src/app/SimulationScreen.tsx`)
  ignore désormais l'événement (sans appeler `applyCommand`/
  `togglePause`/`reset` ni `preventDefault()`) quand `event.repeat` est
  vrai, pour les trois touches discrètes (`' '`, `'p'`, `'r'`) — la même
  garde que celle déjà en place pour `ctrlKey`/`metaKey`/`altKey`.
  Maintenir une touche plus longtemps que le délai de répétition du
  système ne déclenche donc plus qu'une seule action par pression
  physique. Test ajouté dans `tests/ui/SimulationScreen.test.tsx`
  ("ignores OS key-repeat on SPACE, toggling the engine only once per
  physical press") : un `keydown` initial sur `' '` suivi de deux
  `keydown` avec `repeat: true` ne fait basculer le moteur qu'une seule
  fois (`ENGINE ONLINE`).

## Features à ajouter

- [x] Aucun `ErrorBoundary` React n'existe : une exception de rendu
  imprévue fait planter toute l'application sur un écran blanc, sans
  aucun moyen de récupérer sans recharger la page manuellement

  `src/app/main.tsx` monte `<App />` directement dans `<StrictMode>`
  sans aucun composant englobant qui intercepterait une erreur de rendu
  (`grep -rn "ErrorBoundary|componentDidCatch|getDerivedStateFromError"
  src/` ne renvoie aucun résultat dans tout le projet). React démonte
  l'arbre entier dès qu'un composant lève pendant le rendu si aucun
  `ErrorBoundary` ne l'intercepte plus haut — l'utilisateur se retrouve
  alors sur une page blanche, sans message ni bouton, et doit deviner
  qu'il faut recharger manuellement. Ce projet n'a heureusement pas
  connu ce cas jusqu'ici (`npm test`/`npm run coverage` confirment 291
  tests propres et une couverture quasi totale de `src/`), mais il n'a
  jamais été audité sous cet angle précis (résilience *après* une
  erreur inattendue, plutôt que prévention d'un bug donné) : un futur
  bug de rendu (ex. une donnée corrompue en `localStorage` qui passe la
  validation mais fait planter un composant plus loin, ou une
  régression introduite par une future passe) resterait aujourd'hui
  sans aucun filet de sécurité côté utilisateur, alors que
  l'application manipule déjà des données persistées côté client
  (`mission-save.ts`, `mission-progress.ts`) qui peuvent varier d'une
  session à l'autre.

  Piste : ajouter un composant de classe `ErrorBoundary`
  (`src/ui/ErrorBoundary.tsx` ou `src/app/ErrorBoundary.tsx`, seul type
  de composant React capable d'implémenter `componentDidCatch`/
  `getDerivedStateFromError` — les hooks ne le permettent pas) qui
  encapsule `<App />` dans `main.tsx`, affiche un écran de repli simple
  et cohérent avec le reste de l'UI (titre, message court, un bouton
  qui recharge la page ou réinitialise l'état via `clearSavedMission`)
  en cas d'erreur de rendu, et journalise l'erreur dans la console pour
  le diagnostic. Rester minimal (pas de service de reporting externe,
  hors périmètre "no backend, no external API" du projet, cf.
  `README.md`). Ajouter un test dans
  `tests/ui/ErrorBoundary.test.tsx` : rendre `ErrorBoundary` avec un
  composant enfant qui lève une exception au rendu (motif standard
  React Testing Library), et vérifier que le fallback s'affiche au lieu
  de laisser l'exception remonter (attention à supprimer/vérifier le
  bruit console attendu de React en test, comme le fait déjà
  `console.error` mocké dans d'autres suites de ce projet si
  applicable).

  Fait le 2026-08-14 : nouveau composant de classe
  `src/ui/ErrorBoundary.tsx`, implémentant
  `getDerivedStateFromError`/`componentDidCatch` (seul type de
  composant React capable de le faire), qui journalise l'erreur dans la
  console puis affiche un écran de repli minimal cohérent avec le reste
  de l'UI (`.error-boundary`, styles ajoutés dans `src/app/styles.css`
  sur le même modèle que `.mission-result`) : un titre "SOMETHING WENT
  WRONG", un court message, et un bouton "Reload" qui appelle
  `clearSavedMission()` (pour éviter un nouveau crash immédiat si la
  cause était une sauvegarde corrompue) puis `window.location.reload()`.
  `src/app/main.tsx` encapsule désormais `<App />` dans
  `<ErrorBoundary>` à l'intérieur de `<StrictMode>`. Aucun service de
  reporting externe, conformément à la contrainte "no backend, no
  external API" du `README.md`. Tests ajoutés dans
  `tests/ui/ErrorBoundary.test.tsx` (rendu normal des enfants ; un
  enfant qui lève au rendu déclenche bien l'écran de repli au lieu de
  laisser l'exception remonter ; le clic sur "Reload" vide la mission
  sauvegardée et appelle `window.location.reload`), avec `console.error`
  mocké pendant ces tests pour ne pas polluer la sortie avec le log
  attendu de React/`componentDidCatch`. Vérifié aussi dans un vrai
  navigateur (Playwright headless) que l'application démarre toujours
  normalement avec ce nouvel encapsulage, sans erreur console. `npm
  test` (294 tests), `npm run lint`, `npx tsc --noEmit`, `npm run
  build` et `npm run coverage` (`ErrorBoundary.tsx` à 100 % de
  couverture, 97.92 % de couverture globale) restent propres.

- [x] Aucune commande de vol n'est accessible sur écran tactile : un
  joueur sur mobile/tablette peut configurer et lancer une mission mais
  ne peut ensuite ni allumer le moteur, ni piloter le vaisseau

  Toutes les commandes de vol (allumage moteur, throttle, rotation)
  passent exclusivement par le clavier physique : `CONTINUOUS_KEYS`/
  `onKeyDown`/`onKeyUp`/`buildCommandFromKeys`
  (`src/app/SimulationScreen.tsx:21-118`) écoutent `keydown`/`keyup` sur
  `window`, et `SimulationControls.tsx` n'expose que deux boutons
  (Pause, Restart) — aucun bouton pour allumer/éteindre le moteur ni
  pour piloter le throttle/le cap. Un `grep -rn "Touch\|Pointer"` sur
  `src/`/`tests/` ne renvoie aucun résultat : il n'existe ni gestionnaire
  tactile, ni bouton de commande de vol sur l'écran. Pourtant l'app a
  déjà une balise `<meta name="viewport" content="width=device-width,
  initial-scale=1.0">` (`index.html`) et une règle `@media (max-width:
  640px)` dédiée dans `src/app/styles.css:652-662` qui repositionne le
  panneau latéral pour petit écran — la mise en page mobile a donc déjà
  été pensée, mais pas les contrôles eux-mêmes. Un joueur sur
  smartphone/tablette peut aujourd'hui traverser tout le menu, la
  préparation de mission, le résumé et le compte à rebours, puis se
  retrouve bloqué à `LIFTOFF` : il ne peut ni activer le moteur (touche
  `SPACE`), ni orienter/accélérer le vaisseau (WASD/flèches), seuls
  Pause et Restart restent utilisables.

  Piste : ajouter un jeu de boutons tactiles (ex. un composant
  `TouchControls`, affiché uniquement sous un point de rupture proche de
  celui déjà utilisé par `@media (max-width: 640px)`, ou détecté via
  `window.matchMedia('(pointer: coarse)')`) avec au minimum un bouton
  "Engine on/off" et quatre boutons/zones pour throttle up/down et turn
  left/right. Réutiliser le mécanisme déjà en place plutôt que d'en
  inventer un nouveau : les boutons continus (throttle/turn) doivent
  ajouter/retirer une entrée dans le même ensemble que `heldKeysRef`
  (ou un état équivalent exposé par `SimulationScreen`) sur
  `pointerdown`/`pointerup`/`pointercancel`, pour que
  `buildCommandFromKeys` continue à être la seule source de vérité du
  `SimulationCommand` construit à chaque frame ; le bouton moteur doit
  appeler `engineRef.current.applyCommand({ toggleEngine: true }, 0)`,
  comme le fait déjà `onKeyDown` pour `SPACE`. Attention à
  `event.preventDefault()`/`touch-action: none` en CSS pour éviter le
  scroll/zoom du navigateur pendant un appui maintenu. Ajouter des tests
  dans `tests/ui/SimulationScreen.test.tsx` (ou un nouveau fichier de
  test dédié si un composant séparé est créé) sur le même modèle que les
  tests clavier existants : `fireEvent.pointerDown`/`fireEvent.pointerUp`
  sur le bouton "throttle up", puis vérifier via l'espion sur
  `SimulationEngine.prototype.applyCommand` que la commande appliquée a
  bien `throttleDelta: 1` tant que le bouton est maintenu et `0` après
  relâchement — même schéma que les tests `onKeyUp` existants.

  Fait le 2026-08-13 : nouveau composant `src/ui/TouchControls.tsx`,
  affiché en permanence dans le DOM mais visible uniquement sous
  `@media (pointer: coarse)` (`src/app/styles.css`, choisi plutôt que
  `window.matchMedia` en JS pour rester purement déclaratif et simple à
  tester) — quatre boutons ronds "Turn left"/"Throttle up"/"Throttle
  down"/"Turn right" en croix (D-pad) plus un bouton rectangulaire
  "Engine", tous avec `touch-action: none` pour éviter le scroll/zoom
  du navigateur pendant un appui maintenu. Réutilise exactement le
  mécanisme suggéré par la piste : les quatre boutons de mouvement
  appellent `onHoldChange(key, true/false)` sur `pointerdown`/
  `pointerup`/`pointercancel`/`pointerleave`, câblé dans
  `SimulationScreen.tsx` sur le même `heldKeysRef` que le clavier (les
  touches `'w'`/`'s'`/`'a'`/`'d'`), donc `buildCommandFromKeys` reste
  l'unique source de vérité de la commande construite à chaque frame ;
  le bouton "Engine" appelle directement
  `engineRef.current.applyCommand({ toggleEngine: true }, 0)`, comme
  `onKeyDown` pour `SPACE`. Aucune modification du moteur de
  simulation : la garde `paused`/`countdown`/mission terminée déjà
  présente dans `applyCommand` s'applique identiquement aux commandes
  tactiles. Tests ajoutés dans `tests/ui/TouchControls.test.tsx`
  (rendu des cinq boutons, clic Engine, pointerdown/pointerup,
  pointercancel, pointerleave) et deux tests d'intégration dans
  `tests/ui/SimulationScreen.test.tsx` ("toggles the engine when the
  on-screen touch Engine button is tapped", "applies a
  continuous-movement command while a touch control button is held,
  and stops once released"). Vérifié dans un vrai navigateur headless
  (Playwright, émulation iPhone 13 avec `hasTouch`/`isMobile`) : les
  cinq boutons s'affichent et fonctionnent (bascule moteur, throttle qui
  monte pendant l'appui puis s'arrête au relâchement), sans erreur
  console ; en contexte desktop (pointeur fin), `.touch-controls` reste
  présent dans le DOM mais invisible (media query), et le clavier
  WASD continue de fonctionner sans régression. `npm test` (279 tests),
  `npm run lint`, `npx tsc --noEmit` et `npm run coverage` (97.97 % de
  lignes / 97.89 % de branches globales, `TouchControls.tsx` à 100 %)
  restent propres.

- [x] `createSpacecraft` construit son `Engine` inline au lieu d'appeler
  `createEngine`

  Décidé le 2026-08-11 (voir "Divers / à clarifier" pour l'historique) :
  `createEngine` (`src/simulation/spacecraft/engine.ts:3-13`) et
  `screenToWorld` (`src/rendering/canvas/world-to-screen.ts:34`) sont
  conservées — chacune a un test dédié et une utilité crédible
  (`screenToWorld` pour une future interaction souris/canvas,
  `createEngine` pour éviter de dupliquer la forme par défaut d'un
  `Engine`) — mais `createEngine` doit avoir un vrai appelant dans
  `src/` pour que sa présence soit justifiée plutôt que théorique.
  `createSpacecraft` (`src/simulation/spacecraft/spacecraft.ts:17-32`)
  construit actuellement l'objet `engine` à la main (`{ thrust: ...,
  fuelConsumption: ..., active: false, throttle: 1 }`) au lieu d'appeler
  `createEngine({ thrust: params.engineThrust, fuelConsumption:
  params.engineFuelConsumption })`, qui produit exactement la même
  forme.

  Remplacer la construction inline par un appel à `createEngine` dans
  `createSpacecraft`. Le comportement observable ne change pas (même
  valeurs par défaut `active: false`, `throttle: 1`), donc les tests
  existants de `tests/spacecraft/spacecraft.test.ts` et
  `tests/simulation-engine.test.ts` doivent continuer à passer sans
  modification ; pas de nouveau test requis au-delà de la couverture
  déjà existante de `createEngine` elle-même
  (`tests/spacecraft/spacecraft.test.ts`). `screenToWorld` reste sans
  appelant dans `src/` pour l'instant — aucune action requise dessus, sa
  justification reste documentée ici et dans son propre commentaire de
  code.

  Fait le 2026-08-11 : `createSpacecraft`
  (`src/simulation/spacecraft/spacecraft.ts`) appelle désormais
  `createEngine({ thrust: params.engineThrust, fuelConsumption:
  params.engineFuelConsumption })` au lieu de construire l'objet
  `engine` à la main — même forme exacte (`active: false, throttle:
  1`), donc comportement observable inchangé. `createEngine` a
  maintenant un appelant réel dans `src/`, ce qui clôt la question
  laissée en suspens dans "Divers / à clarifier". Aucun nouveau test
  nécessaire (couverture déjà existante) ; `npm test` (252 tests), `npm
  run lint` et `npx tsc --noEmit` restent propres.

- [x] La difficulté du profil de mission choisi n'apparaît pas sur
  l'écran de résumé de `MissionSetup`

  Le sélecteur "Mission profile" (`src/ui/MissionSetup.tsx:83-88`)
  affiche la difficulté de chaque profil via `MISSION_DIFFICULTY_LABELS
  [profile.difficulty]` (ex. "Mission 02 — High orbit (Medium)"), mais
  une fois que le joueur valide et passe sur l'écran de résumé
  (`MissionSummary`, `src/ui/MissionSetup.tsx:152-181`), cette
  information disparaît : le `<dl className="mission-setup__summary">`
  n'affiche que Mission / Spacecraft / Rocket model / Destination /
  Objective, sans ligne "Difficulty". Le joueur perd donc de vue le
  niveau de difficulté choisi au moment précis où il confirme le
  lancement.

  Ajouter une paire `<dt>Difficulty</dt><dd>{...}</dd>` dans `dl.
  mission-setup__summary`, juste après la ligne "Destination" ou
  "Objective", en réutilisant `MISSION_DIFFICULTY_LABELS[profile.
  difficulty]` (le `profile` est déjà résolu via `findMissionProfile`
  dans `MissionSummary`). Étendre `tests/ui/MissionSetup.test.tsx` pour
  vérifier que le libellé de difficulté capitalisé apparaît sur l'écran
  de résumé.

  Fait le 2026-08-11 : `MissionSummary`
  (`src/ui/MissionSetup.tsx`) affiche désormais une paire
  `<dt>Difficulty</dt><dd>{...}</dd>` dans `dl.mission-setup__summary`,
  juste après "Destination" et avant "Objective", à partir de
  `MISSION_DIFFICULTY_LABELS[profile.difficulty]` (le `profile` résolu
  via `findMissionProfile` était déjà disponible dans le composant).
  Test ajouté dans `tests/ui/MissionSetup.test.tsx` ("shows the
  capitalized difficulty of the selected profile in the summary") :
  sélectionne le profil `high-orbit`, passe à l'écran de résumé, et
  vérifie que "Difficulty" et "Medium" y apparaissent. `npm test`
  (250 tests), `npm run lint` et `npx tsc --noEmit` restent propres.

- [x] Adapter le zoom de la caméra au profil de mission actif

  `buildCamera` (`src/rendering/canvas-renderer.ts:12`) calcule un
  `viewRadius` fixe (`centralBody.radius * 2.6`, soit environ 960 km
  au-dessus de la surface visibles sur le petit côté de l'écran),
  indépendant de la mission choisie. Ce réglage a été calibré pour
  l'unique mission d'origine (100–400 km). Depuis l'ajout de plusieurs
  profils de mission, "Mission 02 / Orbite haute" cible 600–900 km :
  à 900 km, le vaisseau est à ~96 % du rayon visible, donc proche du
  bord du cadre (voire hors champ sur une fenêtre non carrée, où le
  petit côté de l'écran est encore plus contraint).

  Faire dépendre `viewRadius` de l'altitude cible du profil de mission
  actif (`state.activeMission?.successCriteria.maxAltitude`, avec une
  marge), ou à défaut faire suivre dynamiquement le vaisseau par la
  caméra, pour que la trajectoire reste visible sur les trois profils
  existants. Ajouter/adapter les tests de `buildCamera`
  (`tests/rendering/canvas-renderer.test.ts`) pour couvrir un profil à
  plus haute altitude.

  Fait le 2026-08-11 : `buildCamera` (`src/rendering/canvas-renderer.ts`)
  calcule maintenant `viewRadius = centralBody.radius +
  targetAltitude * ALTITUDE_VIEW_MARGIN`, où `targetAltitude` vient de
  `state.activeMission?.successCriteria.maxAltitude` (repli sur une
  constante `DEFAULT_TARGET_ALTITUDE = 400_000` quand il n'y a pas de
  mission active, par ex. sur l'écran de résultat). `ALTITUDE_VIEW_MARGIN
  = 2.4` a été choisi pour reproduire exactement l'ancien calibrage sur
  la mission par défaut (`earth-orbit`, `maxAltitude = 400_000`) :
  `600_000 + 400_000 * 2.4 === 600_000 * 2.6`, donc aucun changement
  visuel pour la mission d'origine. Pour "Mission 02 / Orbite haute"
  (`maxAltitude = 900_000`), le vaisseau passe de ~96 % à ~54 % du rayon
  visible à l'altitude cible — largement dans le cadre. La caméra reste
  centrée sur le corps céleste (pas de suivi dynamique du vaisseau,
  hors périmètre de cette tâche). Tests dans
  `tests/rendering/canvas-renderer.test.ts` : un test vérifie le repli
  sans mission active, un autre compare le zoom sur `high-orbit` à celui
  de la mission par défaut et vérifie que le vaisseau reste sous 90 % du
  rayon visible à l'altitude cible du profil.

- [x] Ajouter l'écran de préparation de mission

  Un écran `MissionSetup` (`src/ui/MissionSetup.tsx`) existe déjà comme
  placeholder minimal (titre + bouton `Lancer la mission`), affiché après
  `Nouvelle mission` via la machine à états dans `src/app/app-state.ts`.
  Cette tâche consiste à l'enrichir pour qu'il affiche réellement les
  champs suivants (au lieu du texte de substitution actuel).

  Le joueur doit pouvoir définir les paramètres de base de sa mission
  avant le lancement.

  La V1 de cet écran doit permettre de choisir :

  * nom de la mission ;
  * nom de la fusée ;
  * destination ;
  * objectif principal.

  Pour la V0, les destinations disponibles peuvent être limitées à :

  ```text
  Orbite terrestre
  ```

  L'objectif initial peut être :

  ```text
  Atteindre une orbite terrestre stable
  ```

  L'écran doit également afficher un résumé :

  ```text
  MISSION
  Nom : Mission 01

  FUSÉE
  Nom : Explorer I

  DESTINATION
  Orbite terrestre

  OBJECTIF
  Atteindre une orbite stable

  [Modifier] [Lancer la mission]
  ```

  La configuration doit être représentée par un modèle de données dédié,
  plutôt que stockée directement dans les composants React.

  Exemple :

  ```ts
  interface MissionConfiguration {
    missionName: string;
    spacecraftName: string;
    destinationId: string;
    objectiveId: string;
  }
  ```

  Ajouter des tests sur la création et la validation d'une configuration.

- [x] Démarrer la mission depuis la surface de la Terre

  Modifier l'état initial du vaisseau.

  Actuellement, le vaisseau commence déjà dans une situation orbitale.
  Après validation de l'écran `MissionSetup`, la simulation doit
  commencer avec la fusée **posée sur la surface de la Terre**.

  La fusée doit :

  * être positionnée à la surface du corps céleste ;
  * avoir une vitesse initiale cohérente avec un lancement depuis la
    surface ;
  * être orientée vers le haut par rapport à la surface ;
  * avoir son carburant initial ;
  * avoir son moteur éteint.

  Le lancement ne doit plus être implicite.

  Le joueur doit devoir activer le moteur pour commencer réellement le
  vol.

  Ajouter des tests déterministes vérifiant l'état initial du vaisseau.

- [x] Ajouter une phase de compte à rebours

  Avant le début du contrôle manuel de la fusée, ajouter une courte
  phase de compte à rebours.

  Exemple :

  ```text
  MISSION READY

  T-3
  T-2
  T-1

  LIFTOFF
  ```

  Pendant le compte à rebours :

  * la simulation physique ne doit pas progresser ;
  * le joueur ne doit pas pouvoir contrôler la fusée ;
  * le HUD de vol ne doit pas être considéré comme actif.

  À `LIFTOFF`, la simulation passe à l'état actif.

  Le compte à rebours doit être basé sur le temps de simulation et être
  testable sans attendre réellement plusieurs secondes dans les tests.

- [x] Ajouter une vraie phase de lancement

  Après le compte à rebours, le joueur doit pouvoir lancer la fusée.

  Le comportement attendu :

  ```text
  Surface
     ↓
  Allumage moteur
     ↓
  Décollage
     ↓
  Montée
     ↓
  Trajectoire orbitale
  ```

  Le système doit distinguer au minimum :

  ```text
  PRE-LAUNCH
  LAUNCH
  FLIGHT
  MISSION COMPLETE
  MISSION FAILED
  ```

  Le moteur doit pouvoir déterminer si le vaisseau est encore au sol, en
  vol ou dans une situation de mission terminée.

  Les règles exactes de réussite d'une orbite restent celles du système
  de mission existant.

  Ajouter les tests couvrant les transitions principales.

- [x] Ajouter un écran de résumé de mission

  À la fin d'une mission, ne pas retourner directement au menu.

  Afficher un écran de résultat contenant au minimum :

  ```text
  MISSION COMPLETE

  Mission : Mission 01
  Fusée : Explorer I

  Temps de mission : 04:32

  Altitude maximale : 184 km
  Vitesse maximale : 7.8 km/s

  OBJECTIF
  ✓ Orbite terrestre atteinte

  [Retour au menu]
  [Rejouer]
  ```

  En cas d'échec :

  ```text
  MISSION FAILED

  Cause :
  Carburant épuisé

  [Retour au menu]
  [Rejouer]
  ```

  Les statistiques affichées doivent provenir de l'état réel de la
  simulation, pas être calculées directement dans le composant
  d'interface.

  Fait le 2026-08-11 : `GameState` suit désormais `maxAltitude` et
  `maxSpeed`, mis à jour à chaque `SimulationEngine.step`. Le composant
  `src/ui/MissionResult.tsx` lit ces valeurs (et les objectifs de la
  mission active) via `buildMissionResultStats`
  (`src/simulation/missions/mission-result.ts`), sans recalcul côté
  composant. La cause d'échec affichée reste minimale ("Fuel depleted" /
  "Spacecraft crashed", déduite de `spacecraft.fuelMass`) : le moteur de
  mission ne distingue pas encore d'autres causes d'échec.

- [x] Ajouter la sauvegarde de la configuration de mission

  Permettre de sauvegarder localement la configuration préparée par le
  joueur.

  La sauvegarde doit utiliser `localStorage`.

  Elle doit permettre à `Continuer` depuis le menu principal de
  restaurer :

  * la mission ;
  * la configuration de la fusée ;
  * les paramètres nécessaires au démarrage.

  La sauvegarde doit rester facultative pour jouer.

  Si aucune sauvegarde valide n'existe, `Continuer` doit être désactivé
  ou non affiché.

  Les données invalides ou corrompues dans `localStorage` doivent être
  ignorées proprement et ne doivent pas empêcher le jeu de démarrer.

  Ajouter des tests unitaires de la couche de persistance.

  Fait le 2026-08-11 : `src/simulation/persistence/mission-save.ts`
  expose `saveMission`, `loadSavedMission` et `clearSavedMission`, basés
  sur `localStorage`. `loadSavedMission` valide la forme des données puis
  `isValidMissionConfiguration` et renvoie `null` (jamais d'exception) sur
  donnée absente, corrompue ou invalide. `App.tsx` appelle `saveMission`
  au lancement (`MissionSetup.onLaunch`) et dérive `hasSavedMission`/la
  configuration à charger via `loadSavedMission()` ; `onContinue` déclenche
  la nouvelle transition `continueSavedMission` (`src/app/app-state.ts`),
  qui passe directement de `main-menu` à `simulation` avec la
  configuration sauvegardée. Les tests unitaires de la couche de
  persistance vivent dans `tests/persistence/mission-save.test.ts`
  (stub de `localStorage` en mémoire, cf. `tests/test-utils/memory-storage.ts` —
  nécessaire car le `localStorage` global de Node masque celui de jsdom
  dans cet environnement de test).

- [x] Ajouter plusieurs profils de mission

  Ajouter plusieurs missions prédéfinies afin que le menu de préparation
  ne soit plus limité à une seule mission.

  Exemple :

  ```text
  MISSION 01
  Orbite terrestre
  Difficulté : Facile

  MISSION 02
  Orbite haute
  Difficulté : Moyenne

  MISSION 03
  Orbite rapide
  Difficulté : Difficile
  ```

  Chaque mission doit définir :

  * son nom ;
  * sa description ;
  * sa difficulté ;
  * son objectif ;
  * ses paramètres de réussite.

  Le moteur de simulation ne doit pas contenir de logique spécifique à
  une mission particulière.

  Fait le 2026-08-11 : `src/simulation/missions/mission-configuration.ts`
  expose désormais `AVAILABLE_MISSION_PROFILES` (3 profils : `earth-orbit`
  / Facile, `high-orbit` / Moyenne, `fast-orbit` / Difficile), chacun
  portant son nom, sa destination, sa description, sa difficulté, son
  objectif et ses `successCriteria` (altitude min/max, durée de maintien).
  `MissionConfiguration.destinationId`/`objectiveId` sont remplacés par un
  seul `missionProfileId`, résolu via `findMissionProfile`.
  `MissionSetup.tsx` propose un unique sélecteur "Mission profile" (avec
  description sous forme d'indice) au lieu des anciens sélecteurs
  Destination/Objective séparés. Côté moteur, `Mission` porte maintenant
  ses propres `successCriteria` (`src/types/simulation.ts`) : `mission.ts`
  n'a plus de constantes d'orbite figées, `createOrbitMission` et
  `evaluateMission` utilisent les critères portés par l'instance de
  mission (repli sur `DEFAULT_ORBIT_SUCCESS_CRITERIA` si aucun profil
  n'est fourni) — le moteur reste générique, agnostique de toute mission
  précise. `createInitialGameState` résout le profil choisi et construit
  la mission avec ses critères. Tests mis à jour/ajoutés dans
  `tests/missions/mission-configuration.test.ts`,
  `tests/missions/mission.test.ts` et `tests/ui/MissionSetup.test.tsx`.

- [x] Séparer clairement les phases de jeu

  Fait le 2026-08-11 : `src/app/game-phase.ts` expose désormais
  `GamePhase` (`main-menu` | `mission-setup` | `pre-launch` | `launch` |
  `flight` | `mission-complete` | `mission-failed`) et
  `determineGamePhase(appPhase, gameState)`, qui combine la machine
  d'écrans existante (`AppPhase`, `src/app/app-state.ts`) avec la phase
  de vol dérivée (`FlightPhase`, `src/simulation/flight-phase.ts`) en un
  seul point d'entrée testable ("what phase is the game in right now").
  Note de nommage : le compte à rebours (`COUNTDOWN`, T-3..T-1/LIFTOFF)
  reste une information d'affichage portée par `GameState.countdown`
  plutôt qu'un état de haut niveau séparé — il se produit à l'intérieur
  de `pre-launch` (cf. `determineFlightPhase`, déjà en place avant ce
  run) ; `SimulationScreen` continue de lire `state.countdown` pour
  choisir entre `CountdownOverlay` et `Hud`. `SimulationScreen.tsx`
  n'a plus de logique ad hoc dupliquée (`activeMission?.status ===
  'succeeded' || ...`) pour décider d'afficher l'écran de résultat : il
  délègue à `determineGamePhase`. `AppPhase` (main-menu/mission-setup/
  simulation) reste inchangé côté routage React (`App.tsx`) — il reste
  la bonne granularité pour décider quel écran monter, l'engin de
  simulation restant possédé par `SimulationScreen` sur toute la durée
  des sous-phases de vol. Tests ajoutés dans
  `tests/app/game-phase.test.ts` (les 7 phases, y compris le repli
  `pre-launch` quand `gameState` est `null`) ; les transitions valides/
  invalides au niveau écran restent couvertes par
  `tests/app/app-state.test.ts` (déjà en place).

- [x] Ajouter un écran de sélection de fusée

  Faire évoluer `MissionSetup` afin de permettre au joueur de choisir
  une fusée parmi plusieurs modèles.

  Exemple :

  ```text
  Explorer I

  Masse       8.4 t
  Carburant   1000 kg
  Poussée     150 kN

  [ Sélectionner ]
  ```

  La V1 peut contenir seulement 2 ou 3 fusées prédéfinies.

  Les caractéristiques doivent être définies dans des données de
  configuration et non codées directement dans les composants UI.

  Fait le 2026-08-11 : `src/simulation/spacecraft/rocket-models.ts`
  expose `AVAILABLE_ROCKET_MODELS` (3 fusées prédéfinies : `explorer-i`,
  `stalwart`, `javelin`, chacune avec nom, description, masse à vide,
  carburant, poussée moteur et consommation) et `findRocketModel`.
  `MissionConfiguration` porte désormais un champ `rocketModelId`
  (résolu via `findRocketModel`), validé par
  `isValidMissionConfiguration` et couvert par la persistance
  (`mission-save.ts`). `MissionSetup.tsx` affiche chaque modèle sous
  forme de carte (masse totale, carburant, poussée, description) avec un
  bouton `Select`/`Selected`, et le résumé de mission affiche le modèle
  choisi. Côté moteur, `createInitialSpacecraft`
  (`simulation-engine.ts`) construit désormais le vaisseau à partir des
  caractéristiques du `RocketModel` sélectionné (repli sur le premier
  modèle disponible si la configuration est absente ou invalide) au lieu
  de constantes codées en dur — les valeurs par défaut de `explorer-i`
  reprennent exactement les anciennes constantes, donc le comportement
  par défaut (décollage, consommation de carburant) est inchangé. Tests
  ajoutés dans `tests/spacecraft/rocket-models.test.ts`,
  `tests/missions/mission-configuration.test.ts`,
  `tests/ui/MissionSetup.test.tsx` et `tests/simulation-engine.test.ts`.

- [x] Ajouter un système de progression

  Conserver localement les missions réussies.

  Le menu doit permettre de voir :

  ```text
  MISSIONS

  ✓ Orbite terrestre
  ✓ Orbite haute
  🔒 Mission lunaire
  🔒 Mission Mars
  ```

  Le système doit être conçu pour permettre l'ajout futur de nouvelles
  missions sans modifier la logique générale de progression.

  Fait le 2026-08-11 : `src/simulation/progression/mission-progress.ts`
  expose `loadCompletedMissionIds`, `markMissionCompleted` et
  `buildMissionProgress`, basés sur `localStorage` (même pattern que
  `mission-save.ts` : jamais d'exception, données corrompues ignorées).
  `SimulationScreen.tsx` appelle `markMissionCompleted(missionConfiguration
  .missionProfileId)` dans un `useEffect` déclenché quand
  `state.activeMission?.status` passe à `'succeeded'` (dépendances sur le
  statut et l'id de profil, donc un seul appel malgré le re-render à
  chaque frame). `buildMissionProgress` construit la liste affichée en
  itérant `AVAILABLE_MISSION_PROFILES` : ajouter un profil futur (mission
  lunaire, Mars, ...) l'ajoute automatiquement à l'écran sans toucher à
  cette fonction, conformément à la contrainte de conception. `MainMenu`
  reçoit `missionProgress` en prop (calculé par `App.tsx` via
  `buildMissionProgress()`) et affiche une section "Missions" sous les
  actions principales, avec ✓ pour les missions terminées et 🔒 sinon —
  vérifié visuellement (dev server + Playwright headless) dans les deux
  états. Aucune restriction de jouabilité ajoutée : la sélection de
  mission dans `MissionSetup` reste inchangée, 🔒 est un indicateur de
  progression, pas un verrou de gameplay (non demandé par ce ticket).
  Tests ajoutés dans `tests/progression/mission-progress.test.ts`
  (persistance) et étendus dans `tests/ui/MainMenu.test.tsx` (marqueurs
  ✓/🔒) et `tests/ui/SimulationScreen.test.tsx` (enregistrement au
  succès de la mission).

- [x] Le sélecteur "Mission profile" de `MissionSetup` affiche la
  difficulté brute (`easy`/`medium`/`hard`) au lieu d'un libellé lisible

  `src/ui/MissionSetup.tsx:82-87` construit le texte de chaque `<option>`
  avec `{profile.name} — {profile.destinationName} ({profile.difficulty})`,
  où `profile.difficulty` est directement la valeur de l'union
  `MissionDifficulty` (`'easy' | 'medium' | 'hard'`,
  `src/simulation/missions/mission-configuration.ts:16`). Le sélecteur
  affiche donc littéralement "Mission 02 — High orbit (medium)" en
  minuscules, alors que le reste de l'UI (HUD, panneaux, écran de
  résultat) utilise des libellés capitalisés/majuscules — aucun
  `text-transform` CSS ne s'applique aux `<option>` de `.mission-setup__field
  select` (vérifié dans `src/app/styles.css`), donc rien ne corrige
  l'affichage au rendu.

  Ajouter un petit helper (ex. une fonction `formatDifficulty` ou une
  map `MISSION_DIFFICULTY_LABELS: Record<MissionDifficulty, string>`
  dans `mission-configuration.ts`, à côté du type `MissionDifficulty`)
  qui associe à chaque valeur un libellé capitalisé ("Easy" / "Medium" /
  "Hard"), et l'utiliser dans `MissionSetup.tsx` à la place de
  `profile.difficulty` brut. Adapter `tests/ui/MissionSetup.test.tsx`
  pour vérifier que le texte des options contient le libellé capitalisé
  et non la valeur brute de l'union.

  Fait le 2026-08-11 : nouvelle map `MISSION_DIFFICULTY_LABELS: Record<
  MissionDifficulty, string>` exportée par
  `src/simulation/missions/mission-configuration.ts`, juste après le
  type `MissionDifficulty` (`easy` → `'Easy'`, `medium` → `'Medium'`,
  `hard` → `'Hard'`). `MissionSetup.tsx` utilise désormais
  `MISSION_DIFFICULTY_LABELS[profile.difficulty]` au lieu de
  `profile.difficulty` brut dans le texte de chaque `<option>` du
  sélecteur "Mission profile" — aucun autre changement d'affichage.
  Test ajouté dans `tests/ui/MissionSetup.test.tsx` ("shows capitalized
  difficulty labels instead of the raw union value") : vérifie le texte
  complet des trois `<option>` ("Mission 01 — Earth orbit (Easy)",
  etc.), donc casserait si `profile.difficulty` brut était réintroduit.

- [x] Supprimer la garde interne redondante d'`advanceCountdown`

  Décidé sous "Divers / à clarifier" (14e passe) : `advanceCountdown`
  (`src/simulation/simulation-engine.ts:173-187`) a une garde
  `if (!countdown) { return false; }` (lignes 175-177) qui est
  inatteignable en pratique — son seul appelant, dans `step`
  (`src/simulation/simulation-engine.ts:232`), est
  `if (this.state.countdown && this.advanceCountdown(deltaTime)) { ... }`,
  et le court-circuit du `&&` garantit déjà que la méthode n'est jamais
  invoquée avec `this.state.countdown === null`.

  Supprimer cette garde (elle devient
  `const countdown = this.state.countdown!;` ou équivalent, avec un
  commentaire rappelant que l'invariant "appelée seulement si
  `countdown` est non nul" est porté par l'appelant unique dans `step`)
  plutôt que de la garder comme filet de sécurité spéculatif pour un
  appelant hypothétique qui n'existe pas. Comportement observable
  inchangé (`step` produit exactement les mêmes résultats) : aucun
  nouveau test requis au-delà de la couverture déjà existante de
  `tests/simulation-engine.test.ts`. Vérifier avec `npm run coverage`
  que `simulation-engine.ts` passe à 100 % de lignes une fois la garde
  retirée.

  Fait le 2026-08-12 : la garde `if (!countdown) { return false; }`
  (`src/simulation/simulation-engine.ts:175-177`) est supprimée ;
  `advanceCountdown` lit désormais directement
  `const countdown = this.state.countdown!;`, avec un commentaire sur la
  méthode rappelant que l'invariant "appelée seulement si `countdown` est
  non nul" est garanti par son unique appelant dans `step`
  (`if (this.state.countdown && this.advanceCountdown(deltaTime))`).
  Comportement observable inchangé : aucun test modifié ou ajouté. `npm
  test` (267 tests), `npm run lint` et `npx tsc --noEmit` restent
  propres, et `npm run coverage` confirme que
  `src/simulation/simulation-engine.ts` est désormais à 100 % de lignes/
  branches/fonctions (`98.36 %` de couverture globale, en légère hausse).

- [x] Supprimer la garde interne inatteignable `spacecraft.maxFuel > 0`
  dans `Hud.tsx`

  Revue du 2026-08-14 (17e passe) : `npm run coverage` signale
  `src/ui/Hud.tsx:47` comme non couverte. C'est la branche `else` du
  ternaire calculant `fuelPercent`
  (`src/ui/Hud.tsx:44-47`) :
  `spacecraft.maxFuel > 0 ? Math.round((spacecraft.fuelMass /
  spacecraft.maxFuel) * 100) : 0`. `maxFuel` est initialisé une seule
  fois dans le moteur, à `rocketModel.fuelMass`
  (`src/simulation/simulation-engine.ts:52`), et les trois modèles de
  fusée exportés par `src/simulation/spacecraft/rocket-models.ts`
  (lignes 28, 38, 48) ont tous un `fuelMass` strictement positif
  (2 400, 4 000, 1 500) — aucun chemin de l'app ne peut donc produire un
  `Spacecraft` avec `maxFuel <= 0`, ce qui rend la branche `: 0`
  inatteignable en pratique, exactement le même schéma que la garde
  d'`advanceCountdown` déjà traitée ci-dessus (14e passe).

  Suivre la même convention déjà appliquée ici (« ne pas ajouter de
  garde pour un scénario qui ne peut pas se produire, faire confiance
  aux garanties internes du code ») : simplifier `fuelPercent` en
  `Math.round((spacecraft.fuelMass / spacecraft.maxFuel) * 100)`, sans
  garde, avec éventuellement un court commentaire rappelant que
  `maxFuel` est toujours strictement positif pour tout `Spacecraft`
  construit par `createSpacecraft`/les modèles de fusée. Comportement
  observable inchangé pour tous les cas atteignables aujourd'hui :
  aucun nouveau test requis au-delà de la couverture existante de
  `tests/ui/Hud.test.tsx`. Vérifier avec `npm run coverage` que
  `src/ui/Hud.tsx` passe à 100 % de lignes/branches une fois la garde
  retirée, et que `npm test`/`npm run lint`/`npx tsc --noEmit` restent
  propres.

  Fait le 2026-08-14 : la garde `spacecraft.maxFuel > 0 ? ... : 0` est
  supprimée dans `src/ui/Hud.tsx` ; `fuelPercent` se calcule désormais
  directement en `Math.round((spacecraft.fuelMass / spacecraft.maxFuel)
  * 100)`, avec un court commentaire rappelant que `maxFuel` est
  toujours strictement positif pour tout `Spacecraft` construit par
  `createSpacecraft`/les modèles de fusée. Comportement observable
  inchangé pour tous les cas atteignables aujourd'hui : aucun nouveau
  test requis. `npm run coverage` confirme que `src/ui/Hud.tsx` est
  désormais à 100 % de lignes/branches/fonctions (98.03 % de couverture
  globale, en légère hausse) ; les seules lignes non couvertes
  restantes sont `App.tsx:55,57` et `SimulationScreen.tsx:148-164`,
  déjà jugées trop marginales lors de passes précédentes. `npm test`
  (279 tests), `npm run lint` et `npx tsc --noEmit` restent propres.

## Tests manquants

- [x] La branche "trajectoire non liée" d'`isStrandedOutsideTargetBand`
  n'est pas exercée par les tests

  `isStrandedOutsideTargetBand` (`src/simulation/missions/mission.ts:69-94`)
  a une garde `if (!bounds) { return false; }` (lignes 83-85, repérée
  via `npm run coverage` comme non couverte) pour le cas où
  `computeOrbitRadiusBounds` renvoie `null`, c'est-à-dire une
  trajectoire d'échappement (parabolique/hyperbolique) plutôt qu'une
  orbite fermée. `tests/missions/mission.test.ts` couvre déjà ce cas
  pour `computeOrbitRadiusBounds` directement
  (`tests/physics/orbit.test.ts`), mais aucun test de `evaluateMission`
  ne construit un vaisseau à carburant nul sur une trajectoire
  d'échappement pour vérifier que la mission reste `'active'` plutôt que
  de basculer à tort en `'failed'` faute de bornes d'orbite à comparer à
  la bande cible.

  Ajouter un test dans `describe('evaluateMission', ...)` de
  `tests/missions/mission.test.ts` : un vaisseau avec `fuelMass: 0` et
  une vitesse supérieure à la vitesse de libération au rayon courant
  (`Math.sqrt(2 * centralBody.gravitationalParameter / radius)`), hors
  de la bande cible, doit laisser `evaluateMission` renvoyer un statut
  `'active'` inchangé (même schéma que les tests voisins "does not fail
  a stranded-looking orbit while fuel remains" / "does not fail a
  fuel-depleted elliptical orbit...").

  Fait le 2026-08-11 : nouveau test "does not fail a fuel-depleted
  spacecraft on an unbound (escape) trajectory" dans
  `tests/missions/mission.test.ts` (`describe('evaluateMission', ...)`)
  — construit un vaisseau `fuelMass: 0` positionné hors bande cible
  (`radius = centralBody.radius + ORBIT_MAX_ALTITUDE + 50_000`) avec une
  vitesse tangentielle légèrement supérieure à la vitesse de libération
  à ce rayon (`escapeSpeed + 1`, même formule que
  `tests/physics/orbit.test.ts`), vérifie d'abord que
  `computeOrbitRadiusBounds` renvoie bien `null` pour cette trajectoire
  (même garde qu'attendu dans `isStrandedOutsideTargetBand`), puis que
  `evaluateMission` laisse le statut de la mission à `'active'` au lieu
  de basculer à tort en `'failed'`. `npm run coverage` confirme que la
  garde `if (!bounds) { return false; }` (`mission.ts:84-85`) est
  désormais couverte. `npm test` (253 tests), `npm run lint` et `npx
  tsc --noEmit` restent propres.

- [x] La branche moteur inactif de `computeFuelConsumed` n'est pas
  testée

  `computeFuelConsumed` (`src/simulation/spacecraft/engine.ts:42-48`,
  repérée via `npm run coverage` comme non couverte aux lignes 43-45)
  renvoie `0` sans calcul quand `!engine.active`. `tests/spacecraft/
  spacecraft.test.ts` (lignes 150 et 158) n'appelle actuellement
  `computeFuelConsumed` qu'avec un moteur `active: true` ; la garde
  "moteur éteint → aucune consommation" n'est donc vérifiée qu'
  indirectement, via `applyFuelConsumption`.

  Ajouter un test direct dans `tests/spacecraft/spacecraft.test.ts` (à
  côté des tests existants de `computeFuelConsumed`) : un `Engine` avec
  `active: false` passé à `computeFuelConsumed(engine, deltaTime)` pour
  un `deltaTime` non nul doit renvoyer `0`.

  Fait le 2026-08-12 : nouveau test "consumes no fuel while the engine
  is inactive, even for a non-zero deltaTime" dans
  `tests/spacecraft/spacecraft.test.ts` (`describe('applyFuelConsumption',
  ...)`, à côté des deux tests existants de `computeFuelConsumed`) — un
  `Engine` fraîchement créé par `createEngine` (donc `active: false`)
  passé à `computeFuelConsumed(engine, 5)` doit renvoyer `0`. `npm run
  coverage` confirme que `src/simulation/spacecraft/engine.ts` est
  désormais à 100 % de couverture (lignes/branches/fonctions). `npm
  test` (254 tests), `npm run lint` et `npx tsc --noEmit` restent
  propres.

- [x] Les branches d'échec silencieux de `localStorage` ne sont testées
  dans aucune des deux couches de persistance

  `saveMission`/`clearSavedMission` (`src/simulation/persistence/
  mission-save.ts:29-35,60-66`) et `markMissionCompleted`
  (`src/simulation/progression/mission-progress.ts:42-50`) documentent
  toutes les trois la même garantie — "ne lève jamais, le stockage est
  facultatif" — via un `try { ... } catch { /* ... */ }` autour de
  l'appel à `localStorage`. `npm run coverage` montre ces blocs `catch`
  comme non couverts (`mission-save.ts:34,65`, `mission-progress.ts:49`) :
  les suites de tests existantes (`tests/persistence/
  mission-save.test.ts`, `tests/progression/mission-progress.test.ts`)
  couvrent bien les données corrompues/invalides *lues* depuis le
  stockage, mais aucun test ne simule un `localStorage.setItem`/
  `removeItem` qui lève (quota dépassé, navigation privée) pour
  vérifier que ces trois fonctions avalent bien l'exception plutôt que
  de la laisser remonter.

  Ajouter, dans chacun des deux fichiers de test, un cas où
  `localStorage.setItem` (et `removeItem` pour `clearSavedMission`) est
  remplacé par un stub qui lève (`vi.spyOn` sur l'objet renvoyé par
  `createMemoryStorage`, ou un stub dédié), et vérifier que l'appel ne
  lève pas d'exception (`expect(() => saveMission(...)).not.toThrow()`,
  etc.).

  Fait le 2026-08-12 : trois nouveaux tests utilisant `vi.spyOn` sur
  l'objet `Storage` renvoyé par `createMemoryStorage` (stubbé en
  `localStorage` global via `vi.stubGlobal` dans le `beforeEach`
  existant) pour faire lever `setItem`/`removeItem`. Dans
  `tests/persistence/mission-save.test.ts` : "does not throw when
  localStorage.setItem fails (quota, private mode, ...)" pour
  `saveMission`, et "does not throw when localStorage.removeItem fails"
  pour `clearSavedMission`. Dans `tests/progression/
  mission-progress.test.ts` : "does not throw when localStorage.setItem
  fails (quota, private mode, ...)" pour `markMissionCompleted`. `npm
  run coverage` confirme que les trois blocs `catch` visés
  (`mission-save.ts:34,65`, `mission-progress.ts:49`) sont désormais
  couverts — `mission-progress.ts` est à 100 % de couverture ;
  `mission-save.ts` reste à 95 % de lignes (lignes 17-18, une garde de
  forme dans `isMissionConfigurationShape` déjà exercée indirectement
  mais pas isolée par un test dédié — hors périmètre de cette tâche,
  qui ciblait spécifiquement les échecs silencieux de `localStorage`).
  `npm test` (257 tests), `npm run lint` et `npx tsc --noEmit` restent
  propres.

- [x] `MissionResult` ne teste jamais le rendu d'un objectif non
  complété

  Le fixture `makeStats` de `tests/ui/MissionResult.test.tsx:7-21` ne
  construit que des objectifs `completed: true`. La branche "objectif
  non complété" de `src/ui/MissionResult.tsx:52-61` (classe `objective`
  sans `--done`, marqueur `○` au lieu de `✓`) n'est donc jamais rendue
  dans les tests (`npm run coverage` la repère comme non couverte,
  lignes 56-58) — la même branche existe et est déjà testée pour
  `MissionPanel` (`src/ui/MissionPanel.tsx:34-44`), qui partage le même
  motif.

  Ajouter un cas à un objectif `completed: false` dans `makeStats` (ou
  un nouveau test dédié) et vérifier la présence du marqueur `○` et
  l'absence de la classe `objective--done` sur cet élément.

  Fait le 2026-08-12 : nouveau test "marks a not-yet-completed
  objective distinctly from a completed one" dans
  `tests/ui/MissionResult.test.tsx`, sur le même motif que le test
  homonyme existant de `tests/ui/MissionPanel.test.tsx` — rend
  `MissionResult` avec deux objectifs (`completed: false` et
  `completed: true`) et vérifie via `getAllByRole('listitem')` que le
  premier porte le marqueur `○` sans la classe `objective--done`, et le
  second `✓` avec `objective--done`. `npm run coverage` confirme que
  `src/ui/MissionResult.tsx` est désormais à 100 % de couverture
  (lignes/branches/fonctions). `npm test` (258 tests), `npm run lint`
  et `npx tsc --noEmit` restent propres.

- [x] `SimulationScreen.onKeyUp` (relâchement des touches continues
  WASD/flèches) n'est exercé par aucun test

  `onKeyUp` (`src/app/SimulationScreen.tsx:101-106`) retire une touche
  du `Set` `heldKeysRef.current` quand elle est relâchée — c'est le
  pendant de `onKeyDown`, qui l'y ajoute (ligne 72) et qui a, lui, une
  suite de tests dédiée (`tests/ui/SimulationScreen.test.tsx`, cf.
  l'item "Tests manquants" déjà coché sur `SimulationScreen`). `npm run
  coverage` repère `onKeyUp` comme non couvert. Contrairement à la
  boucle `requestAnimationFrame`/au redimensionnement du canvas (déjà
  jugés trop marginaux dans les passes précédentes), ce n'est pas une
  garde défensive DOM : `buildCommandFromKeys`
  (`src/app/SimulationScreen.tsx:31-41`) lit `heldKeysRef.current` à
  chaque frame pour dériver `throttleDelta`/`turnDelta`, donc si
  `onKeyUp` régressait (mauvaise normalisation de casse via
  `event.key.toLowerCase()`, mauvaise touche retirée du set), une
  touche relâchée par le joueur resterait "collée" et continuerait à
  piloter le throttle/cap indéfiniment — un vrai bug gameplay, pas
  seulement un défaut d'affichage.

  Ajouter un test dans `tests/ui/SimulationScreen.test.tsx` (même motif
  que les tests `keydown` existants, via `fireEvent.keyDown`/
  `fireEvent.keyUp` sur `window`) : appuyer sur `'w'` (ou une touche
  fléchée), avancer d'au moins une frame pour vérifier un effet observé
  côté throttle/état, puis relâcher la touche (`keyup`) et vérifier que
  l'effet cesse (le throttle ne continue plus d'augmenter aux frames
  suivantes).

  Fait le 2026-08-12 : deux nouveaux tests dans
  `tests/ui/SimulationScreen.test.tsx`, sur le même motif que le test
  voisin "does not apply a continuous-movement command on keydown
  itself" (espionnage de `SimulationEngine.prototype.applyCommand`) :
  "stops applying a continuous-movement command once the key is
  released" (`keydown 'w'` → `throttleDelta: 1` à la frame suivante,
  puis `keyup 'w'` → `throttleDelta: 0` à la frame d'après) et
  "normalizes key case when releasing a continuous-movement key held
  with a different case" (`keydown`/`keyup` sur `'W'` majuscule,
  vérifiant que `event.key.toLowerCase()` est bien appliqué côté
  `onKeyUp` comme côté `onKeyDown`, sans quoi la touche resterait
  "collée"). `npm run coverage` confirme que `onKeyUp`
  (`src/app/SimulationScreen.tsx:101-106`) est désormais couvert — le
  fichier passe de la ligne non couverte à 94.07 % de lignes (seules
  les lignes 143-150, la boucle `requestAnimationFrame`/le
  redimensionnement du canvas déjà jugées marginales, restent non
  couvertes). `npm test` (260 tests), `npm run lint` et `npx tsc
  --noEmit` restent propres.

- [x] La branche `id` d'objectif inconnu du `.map` d'`evaluateMission`
  n'est jamais exercée

  Dans `evaluateMission` (`src/simulation/missions/mission.ts`), le
  `mission.objectives.map(...)` qui recalcule la complétion de chaque
  objectif ne connaît que deux `id` : `'reach-altitude'` et
  `'hold-orbit'` ; toute autre valeur tombe dans la clause finale
  `return objective;` (repérée par `npm run coverage` comme non
  couverte). `MissionObjective.id` (`src/types/simulation.ts`) est typé
  `string` généraliste plutôt qu'une union littérale des deux ids
  connus, et `createOrbitMission` est le seul point de construction de
  `Mission` dans `src/` — donc cette branche est actuellement morte en
  pratique, mais reste atteignable pour tout futur troisième type
  d'objectif (voir les idées de missions futures en fin de fichier) sans
  qu'aucun test ne vérifie qu'un objectif de type inconnu traverse
  `evaluateMission` inchangé plutôt que de faire planter le calcul de
  `allCompleted`.

  Ajouter un test dans `tests/missions/mission.test.ts` : construire une
  `Mission` (via `createOrbitMission` puis en ajoutant un objectif
  `{ id: 'unknown-objective', description: '...', completed: false }`
  au tableau `objectives`) et vérifier que `evaluateMission` renvoie cet
  objectif tel quel (même `completed: false`) dans le résultat, sans
  lever ni affecter le statut des deux objectifs connus.

  Fait le 2026-08-12 : nouveau test "leaves an objective with an
  unrecognized id untouched" dans `tests/missions/mission.test.ts`
  (`describe('evaluateMission', ...)`) — construit une `Mission` via
  `createOrbitMission()` puis ajoute un objectif
  `{ id: 'unknown-objective', description: 'Some future objective',
  completed: false }` au tableau `objectives`, place le vaisseau dans la
  bande cible (donc `reach-altitude` se complète), et vérifie que
  l'objectif inconnu ressort de `evaluateMission` strictement inchangé
  (`completed: false`), sans lever ni interférer avec le calcul de
  complétion des deux objectifs connus. `npm run coverage` confirme que
  `src/simulation/missions/mission.ts` est désormais à 100 % de
  couverture (lignes/branches/fonctions). `npm test` (261 tests), `npm
  run lint` et `npx tsc --noEmit` restent propres.

- [x] `src/app/SimulationScreen.tsx` n'a aucun test dédié

  Ce composant traduit les événements clavier (WASD/flèches, `SPACE`,
  `P`, `R`) en commandes de simulation et pilote la boucle de jeu
  (`requestAnimationFrame`). C'est le seul point d'entrée du contrôle
  clavier documenté dans `ControlsPanel`, et il n'est actuellement
  couvert que très indirectement par `tests/ui/App.test.tsx` (qui teste
  seulement les transitions d'écran, pas les touches).

  Ajouter des tests (Testing Library, en simulant des `keydown`/`keyup`
  sur `window`) vérifiant au minimum :

  * `SPACE` bascule le moteur ;
  * `P` met en pause / reprend ;
  * `R` réinitialise l'état vers `createInitialGameState` ;
  * les touches continues (WASD/flèches) ne déclenchent pas d'action
    tant qu'elles ne sont pas traitées par la boucle de jeu (pas
    d'action au `keydown` seul).

- [x] Aucun outillage de couverture de tests n'est configuré

  `package.json` ne définit qu'un script `"test": "vitest run"`, sans
  variante couverture, et `@vitest/coverage-v8` (ou `@vitest/coverage-
  istanbul`) n'est pas dans `devDependencies`. `npx vitest run
  --coverage` échoue avec `MISSING DEPENDENCY 'Cannot find dependency
  "@vitest/coverage-v8"'`. Chaque revue de ce backlog (5 passes à ce
  jour) a donc dû vérifier "chaque fichier de `src/` a un fichier de
  test dédié" en comparant manuellement les deux arborescences, ce qui
  ne dit rien des branches non couvertes *à l'intérieur* d'un fichier
  testé (ex. ce run a trouvé deux fonctions exportées jamais appelées
  en dehors de leurs propres tests, voir "Divers / à clarifier"
  ci-dessous — un rapport de couverture aurait signalé leur usage nul
  en un coup d'œil).

  Ajouter `@vitest/coverage-v8` en `devDependency` et un script `"
  coverage": "vitest run --coverage"` dans `package.json` (Vitest
  utilise déjà V8 comme moteur, donc pas de configuration
  supplémentaire nécessaire au-delà du provider par défaut). Vérifier
  que `npm run coverage` produit un rapport exploitable localement ;
  l'intégration à la CI ou un seuil de couverture minimum ne sont pas
  demandés par ce ticket.

  Fait le 2026-08-11 : `@vitest/coverage-v8@^2.1.9` ajouté en
  `devDependency` (aligné sur la version de `vitest@2.1.9` réellement
  installée, cf. `npm ls vitest`, plutôt que sur le `^2.0.5` déclaré
  dans `package.json`) et nouveau script `"coverage": "vitest run
  --coverage"`. Aucune config supplémentaire dans `vite.config.ts` :
  le provider `v8` par défaut suffit. `eslint.config.js` ignore
  désormais aussi `coverage` (comme `dist`/`node_modules`), sinon
  `npm run lint` remonte des avertissements sur les fichiers HTML/JS
  générés par le rapport (`coverage/block-navigation.js`, etc.) ; le
  dossier `coverage/` est ajouté à `.gitignore` pour la même raison.
  `npm run coverage` produit un rapport exploitable en local : 250
  tests passent, 97.18 % de couverture de lignes globale, avec le
  détail par fichier (ex. `types/simulation.ts` et `app/main.tsx` à 0 %
  — attendu, ce sont respectivement des types purs et le point d'entrée
  Vite non exécuté par les tests). `npm test`, `npm run lint` et `npx
  tsc --noEmit` restent propres.

- [x] `isMissionConfigurationShape` n'est jamais testée avec une valeur
  JSON valide mais structurellement non-objet

  `isMissionConfigurationShape` (`src/simulation/persistence/
  mission-save.ts:15-26`) a une garde `if (typeof value !== 'object' ||
  value === null) { return false; }` (lignes 17-18, repérée par `npm run
  coverage` comme non couverte) pour rejeter toute valeur qui n'est pas
  un objet — par exemple si `localStorage` contient un JSON syntaxiquement
  valide mais qui se désérialise en `42`, `"une chaîne"`, `null` ou
  `[]` sous la clé `space-mission-simulator:saved-mission` (une version
  antérieure du jeu ou un script externe qui aurait écrit une forme
  différente sous la même clé, par exemple). `tests/persistence/
  mission-save.test.ts` couvre déjà un JSON syntaxiquement invalide
  (`'not valid json{'`, qui fait lever `JSON.parse` et est attrapé par
  le `catch` de `loadSavedMission`) et un objet JSON valide mais
  incomplet (`{ foo: 'bar' }`, qui échoue plus loin sur les `typeof
  candidate.xxx === 'string'`) — mais aucun test n'exerce spécifiquement
  cette garde amont pour une valeur JSON valide qui n'est pas un objet.

  Ajouter un test dans `tests/persistence/mission-save.test.ts` :
  `localStorage.setItem(STORAGE_KEY, JSON.stringify(42))` (ou `'null'`,
  ou `'[]'`), puis vérifier que `loadSavedMission()` renvoie `null` sans
  lever d'exception — même schéma que le test existant "returns null for
  corrupted JSON in storage".

  Fait le 2026-08-12 : nouveau test paramétré (`it.each`) "ignores valid
  JSON that is not an object" dans `tests/persistence/
  mission-save.test.ts`, couvrant cinq valeurs JSON valides mais
  structurellement non conformes (`42`, `'a string'`, `null`, `[]`,
  `true`) écrites brutes sous `STORAGE_KEY` — vérifie que
  `loadSavedMission()` renvoie `null` sans lever, pour chacune. `npm run
  coverage` confirme que `src/simulation/persistence/mission-save.ts`
  est désormais à 100 % de couverture (lignes/branches/fonctions),
  fermant le dernier trou de couverture connu de ce fichier. `npm test`
  (266 tests), `npm run lint` et `npx tsc --noEmit` restent propres.

- [x] Aucune intégration continue (CI) n'est configurée sur GitHub :
  les commits poussés sur `main` n'ont aucune vérification automatique
  visible, alors que quatre commandes rapides et stables existent déjà
  (`npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`)

  `git remote -v` confirme que `origin` pointe vers un vrai dépôt
  GitHub (`git@github.com:JUC0AG0G0/Space-Mission-Simulator.git`), mais
  le dépôt ne contient aucun dossier `.github/` (`ls .github` échoue
  avec "No such file or directory") — donc aucun workflow GitHub
  Actions, et par conséquent aucune coche verte/rouge sur l'historique
  des commits ni sur une éventuelle future pull request. Chaque passe
  de ce backlog (32 à ce jour) exécute déjà `npm test`, `npm run lint`
  et `npx tsc --noEmit` à la main avant de considérer le dépôt "propre"
  (et `npm run build`/`npm run coverage` régulièrement) ; `spec.md`
  (section 2, "Contexte d'usage") confirme que l'agent qui travaille
  sur ce dépôt est censé lancer ces mêmes commandes avant de pousser
  directement sur `main` (`push_mode: direct`, pas de revue humaine par
  pull request). Un workflow CI n'est donc pas un remplacement de ce
  processus, mais un filet de sécurité indépendant : il resterait
  vérifiable depuis l'interface GitHub (utile pour un humain qui
  consulte l'historique sans relancer les commandes localement), et
  détecterait tout de même une régression si un run de l'agent poussait
  malgré tout du code cassé (erreur de jugement, commande oubliée,
  interruption avant la vérification finale).

  Piste : ajouter un unique fichier `.github/workflows/ci.yml` minimal
  — déclenché sur `push`/`pull_request` vers `main`, un seul job
  `ubuntu-latest` avec `actions/checkout@v4` puis `actions/setup-node@v4`
  (version Node alignée sur `engines.node` de `package.json`, soit
  `>=20` — utiliser `node-version: 20` ou `'lts/*'`), `npm ci`, puis les
  quatre commandes déjà utilisées par chaque passe de ce backlog dans
  l'ordre `npm run lint && npx tsc --noEmit && npm test && npm run
  build` (pas besoin d'un job séparé par commande pour un projet de
  cette taille). Rester au plus simple : pas de matrice de versions
  Node, pas de cache de dépendances sophistiqué au-delà de celui déjà
  intégré à `actions/setup-node` (`cache: 'npm'`), pas de déploiement
  ni de publication d'artefact (`npm run build` sert uniquement à
  vérifier que la compilation reste propre, comme le fait déjà chaque
  passe de ce backlog — pas besoin de publier `dist/`). Vérifier après
  coup que le fichier YAML est syntaxiquement valide (`npx
  js-yaml .github/workflows/ci.yml` ou équivalent, ou simplement une
  relecture attentive de l'indentation) et que rien dans
  `.gitignore`/`eslint.config.js` n'ignore par erreur le nouveau
  dossier `.github/`. Item de configuration pure (YAML, aucun fichier
  `src/`/`tests/` modifié) : aucun test unitaire n'est attendu
  au-delà de `npm test`/`npm run lint`/`npx tsc --noEmit`/`npm run
  build`, qui doivent rester propres. La confirmation définitive que le
  workflow s'exécute réellement sur GitHub (onglet "Actions" du dépôt)
  ne peut se faire qu'après le prochain `git push` vers `origin` — hors
  du contrôle direct de ce backlog, mais la syntaxe et les commandes
  utilisées peuvent être vérifiées localement avant de pousser.

  Fait le 2026-08-14 : nouveau fichier `.github/workflows/ci.yml`,
  exactement sur le modèle suggéré par la piste — déclenché sur `push`/
  `pull_request` vers `main`, un seul job `verify` sur `ubuntu-latest`
  avec `actions/checkout@v4`, `actions/setup-node@v4` (`node-version:
  20`, alignée sur `engines.node: ">=20"` de `package.json`, avec
  `cache: npm`), `npm ci`, puis les quatre commandes déjà utilisées par
  chaque passe de ce backlog en quatre étapes séparées (`npm run lint`,
  `npx tsc --noEmit`, `npm test`, `npm run build`) plutôt qu'une seule
  commande chaînée, pour que l'onglet "Actions" de GitHub distingue
  clairement laquelle des quatre a échoué le cas échéant. Pas de
  matrice de versions Node, pas de déploiement ni de publication
  d'artefact, conformément à la piste. Vérifié que `.gitignore`
  (`node_modules/`, `dist/`, `coverage/`) et `eslint.config.js`
  (`ignores: ['dist', 'node_modules', 'coverage']`) n'excluent pas le
  nouveau dossier `.github/`, et que le YAML ne contient aucune
  tabulation. Les quatre commandes utilisées par le workflow ont été
  exécutées localement dans le même ordre pour confirmer qu'elles
  restent propres : `npm run lint`, `npx tsc --noEmit`, `npm test`
  (291 tests), `npm run build` (`tsc && vite build`, 64 modules). Item
  de configuration pure (un seul fichier YAML, aucun `src/`/`tests/`
  modifié) : aucun test unitaire ajouté, conformément à la piste. La
  confirmation que le workflow s'exécute réellement sur GitHub (onglet
  "Actions") ne pourra se faire qu'après le prochain `git push` vers
  `origin`, hors du contrôle direct de ce run.

## Documentation

- [x] `README.md` ne mentionne pas l'intégration continue (CI)
  désormais configurée sur GitHub

  `.github/workflows/ci.yml` (ajouté lors d'une passe précédente de ce
  backlog, voir l'item coché "Aucune intégration continue (CI) n'est
  configurée sur GitHub..." sous "Tests manquants" ci-dessous) exécute
  désormais `npm run lint`, `npx tsc --noEmit`, `npm test` et `npm run
  build` sur chaque `push`/`pull_request` vers `main`, via un job nommé
  `verify` dans un workflow nommé `CI`. `grep -i "badge\|workflows\|
  actions" README.md` ne renvoie aucun résultat : rien dans le
  `README.md` n'indique qu'une vérification automatique existe
  désormais côté GitHub, ni ne pointe vers l'onglet "Actions" du dépôt
  — un lecteur qui arrive sur la page du dépôt (ou son README rendu sur
  GitHub) n'a aucun moyen visuel de savoir si le dernier commit sur
  `main` passe les vérifications, alors que c'est précisément
  l'information qu'un badge de statut CI en haut de README existe pour
  donner en un coup d'œil.

  Piste : ajouter un badge de statut Markdown standard juste sous le
  titre `# Space Mission Simulator` du `README.md`, au format GitHub
  Actions habituel :
  `[![CI](https://github.com/JUC0AG0G0/Space-Mission-Simulator/actions/workflows/ci.yml/badge.svg)](https://github.com/JUC0AG0G0/Space-Mission-Simulator/actions/workflows/ci.yml)`
  (URL déduite de `git remote -v`, à vérifier après coup en ouvrant le
  lien une fois poussé sur GitHub — le badge peut afficher "no status"
  tant qu'aucun run n'a encore eu lieu sur `main` avec ce fichier de
  workflow). Item documentation pure, aucun changement de code ni de
  test attendu — comme les items déjà cochés similaires dans cette
  section, seul `npm run lint` doit rester propre.

  Fait le 2026-08-14 : badge de statut Markdown ajouté juste sous le
  titre `# Space Mission Simulator` du `README.md`, exactement au
  format suggéré par la piste — `[![CI](https://github.com/
  JUC0AG0G0/Space-Mission-Simulator/actions/workflows/ci.yml/badge.svg)]
  (https://github.com/JUC0AG0G0/Space-Mission-Simulator/actions/
  workflows/ci.yml)` — URL confirmée cohérente avec `git remote -v`
  (`git@github.com:JUC0AG0G0/Space-Mission-Simulator.git`). Le badge
  affichera "no status"/gris tant qu'aucun run n'a encore eu lieu sur
  `main` avec ce fichier de workflow, comme prévenu par la piste ; ce
  ne sera vérifiable qu'après le prochain push vers `origin`, hors du
  contrôle direct de ce run. Item documentation pure : aucun fichier de
  code ni de test modifié. `npm run lint` reste propre.

- [x] La section "Architecture" du `README.md` décrit encore `src/ui/`
  comme un ensemble de composants qui ne traduisent que les entrées
  clavier en commandes, alors que `src/ui/TouchControls.tsx` fait
  exactement la même chose à partir d'entrées tactiles

  La section "## Architecture" du `README.md` décrit `src/ui/` ainsi :

  ```text
  src/ui/           React components (HUD, panels, controls) that read
                     simulation state and turn keyboard input into commands
                     for the simulation engine.
  ```

  `grep -n "keyboard input" README.md` confirme qu'il s'agit de la
  seule occurrence : cette phrase ne mentionne que "keyboard input".
  Or `src/ui/TouchControls.tsx` (le D-pad + bouton "Engine" affiché sur
  écran tactile via la media query `pointer: coarse`, ajouté et corrigé
  au fil de plusieurs passes précédentes de ce backlog — voir les items
  cochés "Aucune commande de vol n'est accessible sur écran tactile" et
  les bugs de superposition tactile déjà résolus sous "Bugs connus")
  construit exactement le même type de commande (`SimulationCommand`,
  via `onHoldChange`/`onEngineToggle` câblés dans
  `SimulationScreen.tsx`) à partir d'événements `pointerdown`/
  `pointerup` plutôt que `keydown`/`keyup`. Les sections "## Controls"
  et "## Gameplay" du même `README.md` mentionnent déjà les commandes
  tactiles depuis la 24e passe de ce backlog (voir l'item coché
  "`README.md` ne mentionne nulle part les commandes tactiles..."
  ci-dessous), mais ce correctif n'avait pas touché la section
  "## Architecture", qui reste donc en retard sur le reste du fichier
  et sous-décrit le rôle réel de `src/ui/`.

  Piste : élargir la phrase de "## Architecture" pour couvrir les deux
  sources d'entrée, par exemple "...and turn keyboard or touch input
  into commands for the simulation engine." (ou une formulation
  équivalente), sur le même modèle que les élargissements déjà faits
  dans "## Controls"/"## Gameplay" lors de la 24e passe. Item
  documentation pure — aucun changement de code ni de test attendu.

  Fait le 2026-08-14 : la phrase de "## Architecture" décrivant
  `src/ui/` dans `README.md` est élargie exactement comme suggéré par
  la piste — "...and turn keyboard or touch input into commands for the
  simulation engine." — pour couvrir `src/ui/TouchControls.tsx` en plus
  du clavier. Item documentation pure : aucun fichier de code ni de
  test modifié. `npm run lint` reste propre.

- [x] La section "Architecture" du `README.md` attribuait encore la
  boucle de jeu (`requestAnimationFrame`, avance de `SimulationEngine`,
  appel du renderer) à `src/app/App.tsx`. Depuis l'introduction de la
  machine à états (`src/app/app-state.ts`), `App.tsx` n'est plus qu'un
  routeur entre écrans et cette responsabilité vit dans
  `src/app/SimulationScreen.tsx`. Corrigé.

- [x] `README.md` ne décrit pas le déroulé de jeu réellement implémenté

  Le `README.md` actuel s'arrête à : installation, dev, tests, lint,
  table de contrôles, et une section "Architecture" qui ne couvre que
  le découpage `src/simulation`/`src/rendering`/`src/ui` et le routage
  `App.tsx`/`SimulationScreen.tsx`. Depuis la feuille de route initiale
  (entièrement terminée, voir les items cochés de ce fichier), le jeu a
  pourtant gagné plusieurs écrans et mécaniques qu'un lecteur du README
  ne peut pas deviner à partir du texte actuel :

  * un menu principal avec une liste de progression des missions
    (`src/ui/MainMenu.tsx`, `src/simulation/progression/mission-progress.ts`) ;
  * un écran de préparation de mission avec choix du profil de mission
    et du modèle de fusée (`src/ui/MissionSetup.tsx`,
    `src/simulation/missions/mission-configuration.ts`,
    `src/simulation/spacecraft/rocket-models.ts`) ;
  * une sauvegarde locale de la configuration et un bouton "Continuer"
    (`src/simulation/persistence/mission-save.ts`) ;
  * un compte à rebours avant le décollage
    (`src/ui/CountdownOverlay.tsx`) ;
  * des phases de vol distinctes (pré-lancement / lancement / vol /
    mission terminée, `src/app/game-phase.ts`,
    `src/simulation/flight-phase.ts`) ;
  * un écran de résultat de mission (succès/échec, rejouer/menu,
    `src/ui/MissionResult.tsx`).

  Ajouter une courte section "Gameplay" au `README.md` (entre
  "Controls" et "Architecture", par exemple) résumant cet enchaînement
  d'écrans en quelques lignes, pour qu'un nouveau lecteur comprenne ce
  que fait réellement l'application avant de lire le code. Item
  documentation pure — aucun changement de code ni de test attendu.

  Fait le 2026-08-11 : nouvelle section "## Gameplay" ajoutée dans
  `README.md`, entre "Controls" et "Architecture". Elle décrit
  l'enchaînement d'écrans/phases (main menu → mission setup →
  pre-launch/countdown → launch → flight → mission complete/failed)
  sous forme de schéma texte, puis un paragraphe par étape mentionnant
  les mécaniques réellement implémentées : progression des missions et
  bouton "Continuer" sur le menu principal, choix du profil de mission
  et du modèle de fusée + sauvegarde locale sur l'écran de préparation,
  compte à rebours basé sur le temps de simulation avant le lancement,
  contrôle manuel WASD/flèches en vol, et écran de résultat
  (succès/échec, stats, objectifs, rejouer/menu). Contenu vérifié par
  lecture directe de `src/app/game-phase.ts`,
  `src/simulation/flight-phase.ts`, `src/ui/MainMenu.tsx` et
  `src/ui/MissionResult.tsx` pour rester fidèle au comportement réel.
  Item documentation pure : aucun changement de code, `npm test`
  (247 tests), `npm run lint` et `npx tsc --noEmit` restent propres
  (aucun fichier source touché).

- [x] La section "Tests" du `README.md` ne mentionne pas le script de
  couverture

  `package.json` expose un script `"coverage": "vitest run --coverage"`
  (ajouté lors d'une passe antérieure de ce backlog, voir l'item coché
  "Aucun outillage de couverture de tests n'est configuré" sous "Tests
  manquants" ci-dessous) et systématiquement utilisé depuis par chaque
  revue périodique de ce fichier pour cibler les trous de couverture.
  Pourtant la section "## Tests" du `README.md` (lignes 24-28) ne montre
  que `npm test` — un nouveau lecteur du README n'a aucun moyen de
  savoir que `npm run coverage` existe, alors que c'est déjà un script
  `npm` de premier niveau au même titre que `dev`/`build`/`test`/`lint`.

  Ajouter une ligne (ou un court exemple `bash` supplémentaire, sur le
  même modèle que la section "## Lint" juste en dessous) mentionnant
  `npm run coverage` dans la section "## Tests" du `README.md`. Item
  documentation pure — aucun changement de code ni de test attendu.

  Fait le 2026-08-13 : ajout d'une phrase ("To generate a coverage
  report:") suivie d'un bloc `bash` avec `npm run coverage`, juste après
  l'exemple `npm test` existant dans la section "## Tests" du
  `README.md`, sur le même modèle que la section "## Lint" juste en
  dessous. Item documentation pure — aucun fichier de code ni de test
  modifié.

- [x] `README.md` ne mentionne nulle part les commandes tactiles
  (`TouchControls`), déjà fonctionnelles depuis plusieurs passes

  `src/ui/TouchControls.tsx` (D-pad tactile Turn left/Throttle up/
  Throttle down/Turn right + bouton "Engine", affiché automatiquement
  sur les appareils à pointeur tactile via la media query `pointer:
  coarse` de `src/app/styles.css`) est une fonctionnalité complète et
  déjà stabilisée : ajoutée lors d'une passe antérieure (voir l'item
  coché "Aucune commande de vol n'est accessible sur écran tactile"
  sous "Features à ajouter" ci-dessus), puis deux bugs de superposition
  avec le panneau latéral (portrait, puis paysage) ont été corrigés
  dans des passes suivantes (voir les deux items cochés correspondants
  sous "Bugs connus" ci-dessus). Pourtant `grep -i "touch\|pointer"
  README.md` ne renvoie aucun résultat : la section "## Controls"
  (lignes 42-52) ne montre qu'un tableau clavier (`W`/`↑`, `S`/`↓`,
  `A`/`←`, `D`/`→`) suivi d'une note renvoyant au panneau **Controls**
  in-app comme source de vérité — panneau qui, lui non plus, ne
  documente pas les commandes tactiles (`src/ui/ControlsPanel.tsx` ne
  liste que les raccourcis clavier). Le paragraphe "Launch / Flight" de
  la section "## Gameplay" (ligne 84-88) dit explicitement "Throttle
  and heading are controlled with WASD/arrow keys", sans réserve — un
  nouveau lecteur du README n'a donc aucun moyen de savoir que le jeu
  est aussi jouable au doigt sur mobile/tablette, alors que c'est déjà
  le cas et que la mise en page mobile a été spécifiquement travaillée
  pour ça (portrait et paysage).

  Piste : ajouter une ou deux phrases mentionnant les commandes
  tactiles — par exemple une note sous le tableau "## Controls"
  (symétrique à la note déjà présente sur le panneau in-app), et/ou
  élargir la phrase "Launch / Flight" de "## Gameplay" pour mentionner
  l'alternative tactile (D-pad + bouton Engine affichés automatiquement
  sur les appareils à pointeur tactile). Item documentation pure —
  aucun changement de code ni de test attendu, sur le même modèle que
  les deux items déjà cochés ci-dessus dans cette section.

  Fait le 2026-08-14 : les deux pistes suggérées ont été appliquées dans
  `README.md`. Une note est ajoutée juste après le tableau clavier de la
  section "## Controls" ("On touch devices (phone, tablet), an on-screen
  D-pad and an **Engine** button appear automatically..."), symétrique à
  la note déjà présente sur le panneau in-app. Le paragraphe "Launch /
  Flight" de "## Gameplay" est élargi pour mentionner l'alternative
  tactile ("...WASD/arrow keys, or the on-screen touch controls on touch
  devices..."). Contenu vérifié par lecture de
  `src/ui/TouchControls.tsx` (D-pad Turn left/Throttle up/Throttle
  down/Turn right + bouton Engine, affiché via la media query `pointer:
  coarse`). Item documentation pure : aucun fichier de code ni de test
  modifié. `npm run lint` reste propre.

## Divers / à clarifier

- [x] La garde `if (!countdown) { return false; }` dans
  `SimulationEngine.advanceCountdown` est inatteignable depuis son seul
  appelant actuel

  `advanceCountdown` (`src/simulation/simulation-engine.ts:173-187`) est
  une méthode privée relisant `this.state.countdown` et retournant
  `false` immédiatement s'il vaut `null` (lignes 175-177, repérées via
  `npm run coverage` comme non couvertes). Son unique appelant, dans
  `step` (`src/simulation/simulation-engine.ts:232`), est
  `if (this.state.countdown && this.advanceCountdown(deltaTime)) { ... }`
  — le court-circuit du `&&` garantit déjà que `advanceCountdown` n'est
  jamais invoquée avec `this.state.countdown === null`. La garde interne
  est donc redondante avec l'appelant, pas un trou de couverture au sens
  habituel (une méthode privée à appelant unique n'a pas d'autre point
  d'entrée testable que `step`).

  À trancher avant d'agir, sans urgence (pure lisibilité, aucun impact
  observable) : soit simplifier `advanceCountdown` en supprimant la
  garde (et documenter dans un commentaire que l'invariant "appelée
  seulement si `countdown` est non nul" est porté par l'appelant), soit
  la garder telle quelle comme filet de sécurité si un second appelant
  apparaît un jour et ajouter un commentaire expliquant pourquoi elle
  n'est pas couverte par les tests. Ne pas toucher au comportement
  observable (`step` continue de fonctionner à l'identique dans les deux
  cas).

  Décidé le 2026-08-12 (14e passe) : simplifier plutôt que garder un
  filet de sécurité spéculatif — cette règle du projet est explicite
  ("ne pas ajouter de garde pour un scénario qui ne peut pas se
  produire, faire confiance aux garanties internes du code") et
  s'applique ici telle quelle : `advanceCountdown` est privée, son seul
  appelant (`step`) garantit déjà l'invariant via le court-circuit
  `this.state.countdown && this.advanceCountdown(...)`. Voir l'item
  correspondant sous "Features à ajouter" ci-dessus pour la tâche de
  simplification elle-même.

  Fait le 2026-08-12 : garde supprimée, voir l'item coché correspondant
  sous "Features à ajouter" ci-dessus pour le détail de l'implémentation.

- [x] Deux fonctions exportées (`screenToWorld`, `createEngine`) ont
  chacune un test dédié mais ne sont appelées nulle part dans `src/`

  `screenToWorld` (`src/rendering/canvas/world-to-screen.ts:34`,
  l'inverse de `worldToScreen`) est couverte par
  `tests/rendering/world-to-screen.test.ts`, et `createEngine`
  (`src/simulation/spacecraft/engine.ts:3`) par
  `tests/spacecraft/spacecraft.test.ts` — mais ni l'une ni l'autre
  n'est référencée ailleurs dans `src/` (`createSpacecraft`,
  `src/simulation/spacecraft/spacecraft.ts:17-33`, construit l'objet
  `engine` inline plutôt que d'appeler `createEngine`). Ce n'est pas
  forcément du code mort à supprimer : `screenToWorld` a la forme
  exacte d'un utilitaire pour une future interaction souris sur le
  canvas (ex. cliquer sur la trajectoire, sélectionner le vaisseau —
  voir "Interface" dans les idées ci-dessous), et `createEngine`
  pourrait remplacer la construction inline de `createSpacecraft` pour
  éviter la duplication du `Engine` par défaut (`active: false,
  throttle: 1`) si un second point de construction apparaît.

  À trancher avant d'agir : soit les supprimer maintenant (avec leurs
  tests) puisque rien ne les appelle aujourd'hui, soit les garder et
  documenter explicitement à quelle feature à venir elles sont
  destinées (et éventuellement faire appeler `createEngine` par
  `createSpacecraft` dès maintenant pour justifier sa présence). Ne
  pas supprimer sans confirmer qu'aucune tâche du backlog ci-dessus
  n'en a besoin.

  Décidé le 2026-08-11 (7e passe) : les deux sont conservées plutôt que
  supprimées (voir le nouvel item "Features à ajouter" ci-dessus, qui
  câble `createEngine` dans `createSpacecraft` pour lui donner un
  appelant réel ; `screenToWorld` reste documentée comme utilitaire en
  attente d'une future interaction souris sur le canvas, sans action
  requise dessus pour l'instant).

- [ ] `npm audit` signale 6 vulnérabilités dans la chaîne de
  dépendances de développement `esbuild`/`vite`/`vitest`

  `npm audit` (16e passe, jamais lancé explicitement lors des passes
  précédentes — seul `npm outdated` l'avait été) signale 3 vulnérabilités
  modérées, 1 haute et 2 critiques, toutes dans `esbuild <=0.24.2`
  (utilisé par `vite <=6.4.2`, lui-même une dépendance de `vitest
  <=3.2.5`, `@vitest/mocker`, `vite-node` et `@vitest/coverage-v8`) :
  "esbuild enables any website to send any requests to the development
  server and read the response"
  (https://github.com/advisories/GHSA-67mh-4wv8-2f99). Ce sont des
  dépendances de développement uniquement (serveur `npm run dev`,
  suite de tests) — rien de ceci n'est présent dans le bundle produit
  par `npm run build`, et le risque réel pour ce projet local est faible.
  `npm audit fix --force` propose d'installer `vite@8.2.1`, un saut de
  version majeure (`vite` 5→8, `vitest` 2→4, `@vitest/coverage-v8` 2→4)
  qui dépasse largement le périmètre "petit diff, comportement
  inchangé" visé par ce backlog — cohérent avec le traitement déjà
  réservé aux autres majeures disponibles (`npm outdated`, notées hors
  périmètre depuis la 13e passe).

  À trancher avant d'agir : soit accepter le risque tel quel (dev-only,
  faible surface d'exposition pour un projet joué localement) et
  documenter ce choix, soit planifier une tâche dédiée de montée de
  version majeure de `vite`/`vitest` (probablement plus grosse qu'un
  run habituel de ce backlog, à subdiviser si besoin — mise à jour de
  `package.json`, vérification de `vite.config.ts`, re-run complet de
  `npm test`/`npm run lint`/`npx tsc --noEmit`/`npm run coverage` pour
  détecter toute régression de compatibilité).

- [ ] La boucle `requestAnimationFrame` de `SimulationScreen` continue
  de tourner indéfiniment une fois la mission terminée, sans qu'il soit
  évident que ça vaille la peine de la stopper

  L'effet de boucle de jeu (`src/app/SimulationScreen.tsx:122-172`) est
  monté une seule fois (dépendances `[]`) pour toute la durée de vie du
  composant, et `tick` rappelle inconditionnellement
  `requestAnimationFrame(tick)` à la fin de chaque frame (ligne 167),
  sans jamais vérifier si la mission est terminée. Or `isMissionOver`
  (calculé à partir de `determineGamePhase`, ligne 191-192) ne change
  que le JSX renvoyé par le composant — il ne démonte ni ne nettoie cet
  effet, qui reste sur la même instance de composant tant que le joueur
  ne quitte pas l'écran (clic sur "Menu" ou "Replay" depuis
  `MissionResult`). Concrètement : une fois `MISSION COMPLETE`/`MISSION
  FAILED` affiché, tant que le joueur reste sur cet écran à lire ses
  statistiques sans cliquer, le navigateur continue d'appeler `tick` à
  chaque frame d'affichage (`engine.applyCommand`, `engine.step`,
  `engine.getState`), indéfiniment — vérifié en instrumentant le mock
  `requestAnimationFrame` déjà utilisé par `tests/ui/
  SimulationScreen.test.tsx` (`vi.fn` sur `requestAnimationFrame`), qui
  confirme que chaque frame re-planifie bien la suivante sans jamais
  s'arrêter.

  Cela dit, l'impact réel semble faible : une fois la mission inactive,
  `applyCommand`/`step` (`src/simulation/simulation-engine.ts:191,228`)
  retournent immédiatement (`!isMissionActive()`), `engine.getState()`
  renvoie donc la même référence d'état qu'avant, et `setState` avec une
  référence inchangée ne déclenche pas de nouveau rendu React — le
  travail par frame se limite à quelques lectures de propriétés, sans
  re-rendu ni accès au canvas (`canvasRef.current` est `null` puisque
  `<canvas>` n'est plus monté sur l'écran `MissionResult`). Corriger
  proprement demande par ailleurs plus qu'un simple arrêt de la
  planification : le bouton "Replay"/la touche `R`
  (`engineRef.current.reset(...)`, lignes 100 et 199-201) s'appuie
  justement sur le fait que la boucle continue de tourner pour détecter
  le changement d'état au tick suivant et re-basculer l'écran de
  `MissionResult` vers le vol — arrêter la planification sans
  redémarrer la boucle au moment du reset figerait l'écran sur
  `MissionResult` après un clic sur "Replay".

  À trancher avant d'agir : soit laisser tel quel (coût par frame jugé
  négligeable, code plus simple, comportement de "Replay" déjà fiable),
  soit accepter la complexité d'un correctif qui arrête la
  planification quand `isMissionOver` est vrai *et* relit
  explicitement `engine.getState()` dans les gestionnaires "Replay"/`R`
  pour rafraîchir l'état et relancer la boucle au même moment plutôt
  que d'attendre la frame suivante. Si tranché en faveur d'un
  correctif, prévoir un test sur le mock `requestAnimationFrame`
  existant vérifiant qu'aucune frame n'est re-planifiée une fois la
  mission terminée, et qu'un cycle complet Replay fonctionne toujours
  sans écran figé.

- [ ] Idées identifiées pour plus tard (non scopées, à détailler avant
  toute exécution)

  **Construction de fusées**

  * Plusieurs étages.
  * Plusieurs moteurs.
  * Réservoirs différents.
  * Boosters.
  * Capsules.
  * Découpleurs.
  * Panneaux solaires.
  * Batteries.
  * Centre de masse.
  * Centre de poussée.

  **Physique**

  * Prédiction de trajectoire.
  * Apoapside / périapside.
  * Orbites elliptiques.
  * Manœuvres orbitales.
  * Transferts orbitaux.
  * Atmosphère.
  * Traînée atmosphérique.
  * Gravité de plusieurs corps.
  * Rotation des planètes.

  **Corps célestes**

  * Lune.
  * Mars.
  * Astéroïdes.
  * Stations spatiales.
  * Plusieurs systèmes planétaires.

  **Missions**

  * Mise en orbite.
  * Rendez-vous orbital.
  * Docking.
  * Atterrissage lunaire.
  * Mission martienne.
  * Retour sur Terre.
  * Livraison de satellites.

  **Gestion**

  * Budget.
  * Coût des fusées.
  * Recherche technologique.
  * Déblocage de composants.
  * Contrats.
  * Récompenses.

  **Événements**

  * Panne moteur.
  * Fuite de carburant.
  * Panne électrique.
  * Perte de communication.
  * Collision.
  * Surchauffe.
  * Rentrée atmosphérique ratée.

  **Interface**

  * Carte spatiale.
  * Caméra libre.
  * Zoom.
  * Mode orbital.
  * Prédiction de trajectoire.
  * Timeline.
  * Journal de mission.
  * Centre de contrôle de mission.

  **Technique**

  * Web Workers.
  * Simulation accélérée.
  * WebGL.
  * WebAssembly.
  * Replay.
  * Seeds reproductibles.
  * Benchmarks.
  * Sauvegardes de missions complètes.
