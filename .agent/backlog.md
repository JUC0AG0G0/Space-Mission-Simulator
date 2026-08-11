# Backlog

Priorisation : bug connu > trous de couverture de tests sur du code pur >
gameplay/feature > polish. Chaque item est scopé pour un run indépendant
avec un diff limité (< 400 lignes), tests inclus.

L'ordre des items de la section "Features à ajouter" ci-dessous est l'ordre
de priorité recommandé pour les prochaines exécutions de
`agent-orchestrator` :

1. Écran de préparation de mission
2. Départ depuis la surface
3. Compte à rebours
4. Phase de lancement
5. Écran de résultat
6. Sauvegarde
7. Plusieurs missions
8. Machine à états complète
9. Sélection de fusée
10. Progression

Chaque tâche doit rester suffisamment petite pour être réalisée dans un
seul run et produire un diff raisonnablement limité. Une tâche peut être
subdivisée si son implémentation dépasse le périmètre raisonnable d'un run.

## Bugs connus

- [x] La configuration de mission saisie dans `MissionSetup` est ignorée
  au lancement

## Features à ajouter

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

- [ ] Ajouter la sauvegarde de la configuration de mission

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

  Note de scoping (lecture du code au 2026-08-11) : les points d'ancrage
  sont déjà en place mais non câblés. `src/ui/MainMenu.tsx` accepte déjà
  `hasSavedMission: boolean` et `onContinue: () => void` en props (et
  n'affiche le bouton `Continue` que si `hasSavedMission` est vrai), mais
  `src/app/App.tsx` (lignes ~25-27) passe actuellement
  `hasSavedMission={false}` et `onContinue={() => {}}` en dur. Il n'existe
  pour l'instant aucun fichier de persistance (`localStorage`) dans
  `src`. Cette tâche consiste donc à : (1) créer un module pur (proche de
  `src/simulation/missions/mission-configuration.ts`, ex.
  `src/simulation/persistence/mission-save.ts`) exposant des fonctions du
  type `saveMission(configuration: MissionConfiguration): void`,
  `loadSavedMission(): MissionConfiguration | null` (retourne `null` sur
  donnée absente/invalide/corrompue, jamais d'exception), et
  éventuellement `clearSavedMission()` ; (2) appeler `saveMission` au
  lancement (`startSimulation` / `MissionSetup.onLaunch`) ; (3) dans
  `App.tsx`, dériver `hasSavedMission`/la configuration à charger via
  `loadSavedMission()` et câbler `onContinue` pour démarrer directement la
  simulation avec cette configuration (probablement une nouvelle
  transition dans `src/app/app-state.ts`, à côté de `startNewMission`/
  `startSimulation`).

- [ ] Ajouter plusieurs profils de mission

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

- [ ] Séparer clairement les phases de jeu

  Refactorer la gestion du cycle de vie de l'application afin d'avoir
  une machine à états explicite.

  États visés :

  ```text
  MAIN_MENU
  MISSION_SETUP
  COUNTDOWN
  LAUNCH
  FLIGHT
  MISSION_COMPLETE
  MISSION_FAILED
  ```

  Les transitions doivent être centralisées et testables.

  Les composants React ne doivent pas décider eux-mêmes des transitions
  complexes du jeu.

  Ajouter des tests couvrant les transitions valides et les transitions
  invalides.

- [ ] Ajouter un écran de sélection de fusée

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

- [ ] Ajouter un système de progression

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
