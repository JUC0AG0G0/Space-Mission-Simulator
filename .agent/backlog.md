# Backlog

Priorisation : bug connu > trous de couverture de tests sur du code pur >
gameplay/feature > polish. Chaque item est scopé pour un run indépendant
avec un diff limité (< 400 lignes), tests inclus.

La feuille de route initiale (écran de préparation de mission, départ
depuis la surface, compte à rebours, phase de lancement, écran de
résultat, sauvegarde, plusieurs missions, machine à états complète,
sélection de fusée, progression) est entièrement terminée — voir les
items cochés ci-dessous pour l'historique et les notes d'implémentation.

Revue du 2026-08-11 : code, tests (`npm test`), lint (`npm run lint`) et
typecheck (`npx tsc --noEmit`) sont tous propres, aucun `TODO`/`FIXME`
dans le code, et chaque module de `src/simulation` a un fichier de test
dédié. Deux items concrets ont été identifiés en lisant le code (voir
"Bugs connus" et "Features à ajouter" ci-dessous) ; aucun trou de
couverture ni doc obsolète trouvé cette fois-ci.

Chaque tâche doit rester suffisamment petite pour être réalisée dans un
seul run et produire un diff raisonnablement limité. Une tâche peut être
subdivisée si son implémentation dépasse le périmètre raisonnable d'un run.

## Bugs connus

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

## Features à ajouter

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

## Tests manquants

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

## Documentation

- [x] La section "Architecture" du `README.md` attribuait encore la
  boucle de jeu (`requestAnimationFrame`, avance de `SimulationEngine`,
  appel du renderer) à `src/app/App.tsx`. Depuis l'introduction de la
  machine à états (`src/app/app-state.ts`), `App.tsx` n'est plus qu'un
  routeur entre écrans et cette responsabilité vit dans
  `src/app/SimulationScreen.tsx`. Corrigé.

## Divers / à clarifier

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
