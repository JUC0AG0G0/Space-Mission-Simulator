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

Chaque tâche doit rester suffisamment petite pour être réalisée dans un
seul run et produire un diff raisonnablement limité. Une tâche peut être
subdivisée si son implémentation dépasse le périmètre raisonnable d'un run.

## Bugs connus

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

## Documentation

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
