# Spec — Space mission simulator

## 1. Objectif

Le projet est un **Space Mission Simulator jouable directement dans un navigateur web**.

Ce n'est pas un produit commercial et il n'est pas nécessaire de chercher à reproduire Kerbal Space Program, Orbiter ou un simulateur spatial professionnel. La priorité est de disposer d'un projet :

* visuel ;
* immédiatement jouable ;
* suffisamment simple pour être généré initialement en une passe ;
* suffisamment riche pour offrir de nombreuses évolutions ;
* déterministe au niveau du moteur de simulation ;
* testable automatiquement ;
* facile à comprendre par un agent sans mémoire longue ;
* architecturé pour permettre l'ajout progressif de fonctionnalités.

Le projet doit volontairement commencer comme une **version très simplifiée d'un simulateur de mission spatiale**, puis servir de terrain de test pour des évolutions successives : physique, vaisseaux, trajectoires, missions, interface, instrumentation, sauvegardes, événements, pannes, etc.

---

# 2. Contexte d'usage

Ce repo sera cloné/pull par `auto-code` avec `push_mode: direct`.

Chaque exécution de l'agent doit pouvoir :

1. Lire `.agent/backlog.md`
2. Comprendre rapidement l'état actuel du projet
3. Sélectionner une tâche
4. Implémenter cette tâche
5. Ajouter ou modifier les tests nécessaires
6. Lancer `npm test`
7. Lancer `npm run lint`
8. Lancer `npm run build`
9. Committer et pousser directement sur `main` si tout est vert

Il faut donc privilégier :

* des fonctionnalités relativement indépendantes ;
* des interfaces de modules claires ;
* des tests rapides ;
* une simulation déterministe ;
* des données de test contrôlées ;
* une séparation stricte entre moteur de simulation et interface utilisateur.

Le projet doit être suffisamment intéressant pour qu'un agent puisse travailler dessus pendant de nombreuses itérations.

---

# 3. Stack technique imposée

## Langage

* TypeScript
* Node.js >= 20

## Frontend

* React
* Vite
* TypeScript
* HTML Canvas pour le rendu de la simulation

## Tests

* Vitest

## Lint

* ESLint avec configuration TypeScript

## Build

* Vite pour le frontend
* TypeScript strict

## Contraintes

Le projet doit :

* fonctionner entièrement dans un navigateur ;
* ne dépendre d'aucune API externe ;
* ne nécessiter aucune clé API ;
* ne nécessiter aucun backend ;
* ne nécessiter aucune base de données ;
* fonctionner hors ligne après installation des dépendances ;
* pouvoir être lancé avec `npm run dev` ;
* pouvoir être compilé avec `npm run build`.

Les données de jeu peuvent être sauvegardées localement avec `localStorage`.

---

# 4. Concept du jeu

Le joueur contrôle une petite mission spatiale.

Le but initial est extrêmement simple :

> Construire une fusée basique et réussir à la placer sur une orbite stable autour d'une planète.

La simulation doit progressivement permettre de gérer :

* fusées ;
* moteurs ;
* réservoirs ;
* carburant ;
* masse ;
* poussée ;
* gravité ;
* vitesse ;
* altitude ;
* trajectoire ;
* orbites ;
* missions ;
* ressources ;
* événements ;
* pannes.

Le projet doit être conçu de manière à pouvoir évoluer vers un véritable petit laboratoire de simulation spatiale.

---

# 5. Boucle de gameplay initiale

La boucle principale est :

```text
Construire une fusée
       ↓
Choisir une mission
       ↓
Lancer
       ↓
Contrôler la poussée
       ↓
Observer la trajectoire
       ↓
Atteindre l'objectif
       ↓
Réussite / échec
```

Le joueur doit pouvoir comprendre le fonctionnement sans documentation externe.

---

# 6. Fonctionnalités V0 à générer

La V0 doit rester volontairement petite.

## 6.1 Monde

Le jeu contient une planète centrale.

La planète est représentée comme un cercle dans le Canvas.

Elle possède :

```ts
interface CelestialBody {
  id: string;
  name: string;
  radius: number;
  mass: number;
  gravitationalParameter: number;
}
```

La V0 ne nécessite qu'un seul corps céleste :

```text
Earth
```

---

# 7. Physique minimale

La V0 doit implémenter une simulation physique simplifiée.

Le vaisseau possède :

* position ;
* vitesse ;
* masse ;
* carburant ;
* poussée moteur.

À chaque tick de simulation :

1. calculer la gravité ;
2. calculer l'accélération du moteur ;
3. calculer la nouvelle vitesse ;
4. calculer la nouvelle position ;
5. consommer le carburant lorsque le moteur fonctionne.

La simulation doit utiliser un **pas de temps contrôlé**.

Exemple :

```ts
simulation.step(deltaTime);
```

Le moteur ne doit pas dépendre directement du FPS du navigateur.

La simulation doit être aussi déterministe que possible.

Deux simulations démarrées avec :

* les mêmes paramètres ;
* le même état initial ;
* les mêmes commandes ;

doivent produire le même résultat.

---

# 8. Vaisseau spatial

La V0 doit disposer d'un seul type de vaisseau.

Structure minimale :

```ts
interface Spacecraft {
  id: string;
  name: string;

  position: Vector2;
  velocity: Vector2;

  dryMass: number;
  fuelMass: number;

  maxFuel: number;

  engine: Engine;
}
```

Moteur :

```ts
interface Engine {
  thrust: number;
  fuelConsumption: number;
  active: boolean;
}
```

Le moteur peut être activé ou désactivé.

La poussée doit être appliquée dans la direction actuelle du vaisseau.

---

# 9. Contrôles

Le joueur doit pouvoir contrôler le vaisseau avec le clavier.

Contrôles initiaux :

```text
W / ↑  : augmenter la poussée
S / ↓  : diminuer la poussée
A / ←  : tourner à gauche
D / →  : tourner à droite
SPACE  : moteur ON/OFF
P      : pause
R      : recommencer la mission
```

Les contrôles doivent être documentés dans l'interface.

---

# 10. Interface utilisateur

L'application doit être composée de plusieurs zones.

## Vue principale

Un grand Canvas affiche :

* planète ;
* vaisseau ;
* trajectoire ;
* direction du vaisseau ;
* éventuellement un vecteur de vitesse.

Exemple conceptuel :

```text
┌─────────────────────────────────────────────┐
│                                             │
│                  ╭───────╮                  │
│               .-'         '-.               │
│             .'      🌍       '.             │
│            /                   \             │
│            \                   /             │
│             '.               .'              │
│               '-._________.-'                │
│                       🚀                     │
│                        ╲                     │
│                         ╲                    │
│                          ╲                   │
│                                             │
└─────────────────────────────────────────────┘
```

---

# 11. Instrumentation

Une interface HUD doit afficher en permanence :

```text
MISSION: ORBIT-01

ALTITUDE       142 km
VELOCITY       7.21 km/s
FUEL           62 %
MASS           8.4 t
THRUST         78 %
APOAPSIS       181 km
PERIAPSIS      96 km

ENGINE         ONLINE
```

Les valeurs peuvent être simplifiées dans la V0.

Le système doit être conçu pour permettre l'ajout de nouvelles métriques ultérieurement.

---

# 12. Trajectoire

Le moteur doit conserver un historique récent de la position du vaisseau afin de dessiner sa trajectoire.

Exemple :

```ts
interface TrajectoryPoint {
  position: Vector2;
  time: number;
}
```

La trajectoire doit être affichée derrière le vaisseau.

La longueur maximale de l'historique doit être configurable afin d'éviter une croissance infinie de la mémoire.

---

# 13. Missions

La V0 contient une seule mission :

## ORBIT-01

Objectif :

> Atteindre une altitude minimale et maintenir une orbite pendant une durée donnée.

La mission possède :

```ts
interface Mission {
  id: string;
  name: string;
  description: string;

  objectives: MissionObjective[];
}
```

Exemple :

```ts
interface MissionObjective {
  id: string;
  description: string;
  completed: boolean;
}
```

La mission doit pouvoir être réussie ou échouée.

---

# 14. État global du jeu

Le jeu doit disposer d'un état centralisé clairement défini.

Exemple :

```ts
interface GameState {
  simulationTime: number;
  paused: boolean;

  spacecraft: Spacecraft;

  activeMission: Mission | null;

  trajectory: TrajectoryPoint[];
}
```

Le moteur de simulation ne doit pas dépendre directement de React.

---

# 15. Architecture imposée

La séparation suivante doit être respectée :

```text
src/
├── app/
│
├── simulation/
│   ├── physics/
│   ├── spacecraft/
│   ├── celestial/
│   ├── missions/
│   └── simulation-engine/
│
├── rendering/
│   ├── canvas/
│   ├── spacecraft-renderer.ts
│   ├── planet-renderer.ts
│   └── trajectory-renderer.ts
│
├── ui/
│   ├── hud/
│   ├── controls/
│   ├── mission/
│   └── panels/
│
├── types/
│
└── main.tsx
```

Cette séparation est importante.

Le moteur de simulation doit pouvoir fonctionner sans React et sans Canvas.

---

# 16. Tests

Les tests doivent principalement couvrir la logique pure.

## Physique

Tester :

* gravité ;
* accélération ;
* déplacement ;
* conservation correcte du signe des vecteurs ;
* consommation de carburant ;
* masse du vaisseau ;
* moteur actif/inactif.

## Simulation

Tester :

* progression du temps ;
* pause ;
* reprise ;
* déterminisme ;
* application des commandes ;
* mise à jour du vaisseau.

## Missions

Tester :

* objectif non atteint ;
* objectif atteint ;
* réussite ;
* échec.

## Trajectoire

Tester :

* ajout de points ;
* limite de taille ;
* ordre chronologique.

Les tests ne doivent pas dépendre du temps réel du navigateur.

---

# 17. Défauts volontaires à intégrer dans le V0

Le projet livré ne doit volontairement **pas être parfait**.

Ces défauts doivent être réels, reproductibles et explicitement documentés dans `.agent/backlog.md`.

## 17.1 Bug réel

Introduire un bug de logique dans la simulation.

Exemple recommandé :

> La consommation de carburant est calculée correctement pour une poussée normale mais devient incorrecte lorsque le deltaTime est supérieur à une certaine valeur.

Le bug doit :

* ne pas provoquer d'erreur TypeScript ;
* ne pas provoquer d'erreur ESLint ;
* être reproductible ;
* pouvoir être corrigé par un test déterministe.

---

## 17.2 Feature absente

Ne pas implémenter une fonctionnalité volontairement.

Exemple :

> Le joueur ne peut pas encore modifier la puissance du moteur avec précision depuis l'interface.

Le backlog doit demander l'ajout d'un throttle configurable de 0 à 100 %.

---

## 17.3 Zone sans tests

Une partie du rendu Canvas ou une fonction de conversion monde → écran peut volontairement ne pas avoir de tests.

Exemple :

```text
src/rendering/canvas/world-to-screen.ts
```

L'agent devra ajouter une suite de tests appropriée.

---

## 17.4 Documentation incomplète

Le README doit volontairement omettre une partie de l'explication.

Par exemple :

* les contrôles clavier ne sont pas tous documentés ;
* ou la procédure de build production est absente.

---

## 17.5 Backlog incomplet

Le backlog initial doit contenir plusieurs tâches dont une tâche volontairement légèrement ambiguë afin de tester la capacité de l'agent à analyser et reformuler le besoin.

---

# 18. Backlog initial

Le fichier `.agent/backlog.md` doit être livré avec un contenu similaire à :

```md
# Backlog

## Bugs connus

- [ ] La consommation de carburant devient incorrecte lorsque le deltaTime est important. Reproduire avec un pas de simulation volontairement élevé et corriger le calcul.

## Features

- [ ] Ajouter un contrôle précis de la poussée moteur de 0 à 100 %.
- [ ] Ajouter un indicateur visuel de l'état du moteur.
- [ ] Ajouter une vue permettant de sélectionner différentes missions.

## Tests manquants

- [ ] Ajouter des tests pour les fonctions de conversion entre coordonnées du monde et coordonnées Canvas.
- [ ] Ajouter des tests supplémentaires sur les calculs de consommation de carburant.

## Documentation

- [ ] Documenter tous les contrôles clavier dans le README.
- [ ] Ajouter une section expliquant comment lancer le build de production.

## Planning / exploration

- [ ] Améliorer la visualisation de la trajectoire et étudier différentes possibilités d'affichage.
- [ ] Étudier l'ajout futur d'un système de plusieurs corps célestes.

## Futur

- [ ] Ajouter plusieurs moteurs.
- [ ] Ajouter différents réservoirs.
- [ ] Ajouter un système de construction de fusées.
- [ ] Ajouter plusieurs corps célestes.
- [ ] Ajouter des orbites prédites.
```

Le backlog ne doit pas contenir une roadmap exhaustive du projet. Il doit conserver suffisamment de place pour que les futurs agents puissent ajouter eux-mêmes des tâches.

---

# 19. Persistance

La V0 peut utiliser `localStorage`.

Les éléments pouvant être sauvegardés :

* paramètres de simulation ;
* configuration du vaisseau ;
* dernière mission ;
* préférences utilisateur.

La persistance ne doit pas être nécessaire pour jouer.

Si le stockage est indisponible ou corrompu, le jeu doit pouvoir démarrer avec un état par défaut.

---

# 20. Gestion du temps

Le moteur doit distinguer :

```text
temps réel
     ↓
boucle de rendu

temps de simulation
     ↓
moteur physique
```

Le FPS du navigateur ne doit pas modifier arbitrairement la physique.

Le moteur doit permettre ultérieurement d'ajouter :

```text
Simulation x1
Simulation x2
Simulation x5
Simulation x10
Pause
```

---

# 21. Rendu

Le rendu doit utiliser HTML Canvas.

Le moteur de simulation ne doit jamais dessiner directement sur le Canvas.

Architecture :

```text
Simulation State
       │
       ▼
Renderer
       │
       ├── Planet
       ├── Spacecraft
       ├── Trajectory
       └── HUD data
```

Cela permettra éventuellement d'ajouter plus tard :

* rendu 3D ;
* WebGL ;
* effets visuels ;
* caméra libre ;
* zoom ;
* plusieurs corps célestes.

---

# 22. Ergonomie

L'interface doit être suffisamment propre pour être réellement jouable.

Elle doit notamment permettre :

* pause/reprise ;
* restart ;
* affichage clair des métriques ;
* indication des commandes ;
* indication de la mission active ;
* indication claire de la réussite ou de l'échec.

Le design n'a pas besoin d'être spectaculaire en V0.

Il doit surtout être :

* lisible ;
* cohérent ;
* responsive ;
* fonctionnel.

---

# 23. README.md

Le README doit contenir au minimum :

## Description

Présentation du Space Mission Simulator.

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Tests

```bash
npm test
```

## Lint

```bash
npm run lint
```

## Contrôles

Documenter les contrôles clavier.

## Architecture

Expliquer brièvement la séparation :

```text
Simulation
Rendering
UI
```

La documentation doit rester courte et utile à un agent autonome.

---

# 24. package.json

Les scripts suivants sont obligatoires :

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest run",
    "lint": "eslint ."
  }
}
```

Les dépendances doivent rester raisonnables.

Aucune bibliothèque inutile ne doit être ajoutée simplement pour résoudre un problème trivial.

---

# 25. Déterminisme

Le moteur de simulation doit être conçu pour être testable de manière déterministe.

Éviter autant que possible :

* `Date.now()` dans les calculs physiques ;
* `Math.random()` directement dans le moteur ;
* dépendance au FPS ;
* timers réels dans les tests.

Si une source d'aléatoire est nécessaire ultérieurement, elle devra pouvoir être remplacée par une source pseudo-aléatoire contrôlée par une seed.

---

# 26. Performance

La V0 n'a pas besoin d'être optimisée prématurément.

Cependant :

* ne pas créer inutilement des milliers d'objets par frame ;
* ne pas faire dépendre la simulation de React ;
* éviter les re-render React inutiles ;
* garder la boucle de simulation indépendante de la boucle de rendu.

Le projet doit rester fluide avec la simulation V0.

---

# 27. Critères d'acceptation de la livraison

La V0 est considérée comme terminée si :

* [ ] `npm install` fonctionne ;
* [ ] `npm test` passe ;
* [ ] `npm run lint` passe ;
* [ ] `npm run build` passe ;
* [ ] `npm run dev` démarre l'application ;
* [ ] l'application est jouable dans un navigateur ;
* [ ] une planète est visible ;
* [ ] un vaisseau est visible ;
* [ ] le vaisseau peut être contrôlé au clavier ;
* [ ] le moteur applique la gravité ;
* [ ] le moteur applique la poussée ;
* [ ] le carburant est consommé ;
* [ ] la trajectoire est affichée ;
* [ ] la simulation peut être mise en pause ;
* [ ] la mission ORBIT-01 existe ;
* [ ] la réussite/échec de la mission fonctionne ;
* [ ] les tests couvrent la majorité de la logique physique ;
* [ ] le bug volontaire du backlog est réellement présent ;
* [ ] le README est présent ;
* [ ] `.agent/backlog.md` est présent ;
* [ ] `.agent/changelog.md` existe ;
* [ ] `.agent/state.json` existe et est initialisé ;
* [ ] le repo Git est initialisé ;
* [ ] un premier commit propre est créé.

---

# 28. Structure de fichiers attendue

```text
space-mission-simulator/
│
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── simulation/
│   │   ├── physics/
│   │   │   ├── gravity.ts
│   │   │   ├── integration.ts
│   │   │   └── vectors.ts
│   │   │
│   │   ├── spacecraft/
│   │   │   ├── spacecraft.ts
│   │   │   └── engine.ts
│   │   │
│   │   ├── celestial/
│   │   │   └── celestial-body.ts
│   │   │
│   │   ├── missions/
│   │   │   └── mission.ts
│   │   │
│   │   └── simulation-engine.ts
│   │
│   ├── rendering/
│   │   ├── canvas-renderer.ts
│   │   ├── planet-renderer.ts
│   │   ├── spacecraft-renderer.ts
│   │   └── trajectory-renderer.ts
│   │
│   ├── ui/
│   │   ├── Hud.tsx
│   │   ├── ControlsPanel.tsx
│   │   ├── MissionPanel.tsx
│   │   └── SimulationControls.tsx
│   │
│   └── types/
│       └── simulation.ts
│
├── tests/
│   ├── physics/
│   │   ├── gravity.test.ts
│   │   └── integration.test.ts
│   │
│   ├── spacecraft/
│   │   └── spacecraft.test.ts
│   │
│   ├── missions/
│   │   └── mission.test.ts
│   │
│   └── simulation-engine.test.ts
│
├── .agent/
│   ├── backlog.md
│   ├── changelog.md
│   └── state.json
│
├── public/
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
├── index.html
├── .gitignore
└── README.md
```

Cette structure peut évoluer si nécessaire, mais toute modification importante de l'architecture doit être justifiée dans le changelog.

---

# 29. Règles importantes pour les futurs agents

Les agents travaillant sur ce projet doivent respecter les règles suivantes :

1. Ne pas implémenter plusieurs fonctionnalités majeures dans une même tâche.
2. Ne pas modifier inutilement l'architecture existante.
3. Toute nouvelle logique métier doit avoir des tests.
4. Toute correction de bug doit idéalement être accompagnée d'un test reproduisant le bug.
5. Le moteur de simulation ne doit pas dépendre de React.
6. Le moteur de simulation ne doit pas dépendre du Canvas.
7. Les tests ne doivent pas dépendre du navigateur réel lorsque cela peut être évité.
8. `npm test`, `npm run lint` et `npm run build` doivent rester verts.
9. Ne pas masquer ou supprimer un test simplement parce qu'il échoue après une modification.
10. Ne pas ajouter de dépendance externe sans justification.
11. Ne pas implémenter une fonctionnalité située très loin dans la roadmap si elle n'est pas nécessaire à la tâche actuelle.
12. Garder les fonctions de simulation petites et testables.
13. Les modifications importantes doivent être documentées dans `.agent/changelog.md`.
14. Après chaque tâche, mettre à jour `.agent/state.json` si l'état du projet change de manière significative.
15. Ne jamais modifier le backlog pour faire disparaître artificiellement une tâche non résolue.

---

# 30. Vision d'évolution

Le projet doit être conçu pour permettre, au fil des futures tâches, l'ajout de fonctionnalités comme :

### Construction

* plusieurs moteurs ;
* réservoirs ;
* boosters ;
* capsules ;
* panneaux solaires ;
* batteries ;
* découplage des étages ;
* assemblage de fusées ;
* masse et centre de gravité.

### Physique

* orbites ;
* apoapside ;
* périapside ;
* impulsion ;
* manœuvres orbitales ;
* transfert de Hohmann ;
* gravité de plusieurs corps ;
* atmosphère ;
* traînée ;
* température.

### Corps célestes

* Lune ;
* Mars ;
* astéroïdes ;
* stations ;
* plusieurs systèmes planétaires.

### Missions

* mise en orbite ;
* rendez-vous orbital ;
* docking ;
* atterrissage ;
* mission lunaire ;
* mission martienne ;
* retour sur Terre.

### Gestion

* budget ;
* recherche ;
* développement ;
* contrats ;
* récompenses ;
* progression.

### Événements

* panne moteur ;
* perte de communication ;
* fuite de carburant ;
* problème électrique ;
* collision ;
* rentrée atmosphérique ratée.

### Interface

* carte spatiale ;
* caméra libre ;
* zoom ;
* prédiction de trajectoire ;
* timeline ;
* instruments ;
* journal de mission ;
* mode spectateur.

### Technique

* Web Workers ;
* WebGL ;
* WebAssembly ;
* simulation accélérée ;
* replay ;
* seeds reproductibles ;
* sauvegardes ;
* benchmarks.

Ces fonctionnalités ne doivent **pas** être implémentées dans la V0.

Elles servent uniquement à garantir que l'architecture initiale ne ferme pas prématurément la porte aux évolutions futures.

---

# 31. Philosophie générale

Le projet doit privilégier :

**Simplicité > sophistication**

**Déterminisme > réalisme physique**

**Testabilité > optimisation prématurée**

**Architecture claire > abstraction excessive**

**Petites évolutions successives > gros refactorings**

Le but n'est pas de créer le meilleur simulateur spatial possible.

Le but est de créer un projet suffisamment intéressant pour permettre à `agent-orchestrator` de démontrer sa capacité à :

* comprendre un codebase ;
* identifier un problème ;
* modifier proprement le code ;
* écrire des tests ;
* corriger des régressions ;
* ajouter progressivement des fonctionnalités ;
* maintenir la documentation ;
* faire évoluer une architecture sur le long terme.

---

# 32. État final attendu après génération initiale

Après la génération initiale, le projet doit être **immédiatement jouable** mais volontairement incomplet.

Un utilisateur doit pouvoir :

```text
ouvrir le navigateur
      ↓
lancer le jeu
      ↓
voir la planète
      ↓
voir la fusée
      ↓
activer le moteur
      ↓
piloter la fusée
      ↓
voir sa trajectoire
      ↓
tenter d'atteindre l'orbite
```

Le projet doit donner l'impression d'une **V0 fonctionnelle d'un simulateur spatial**, et non d'un simple prototype technique.

Il doit ensuite rester suffisamment de travail intéressant dans `.agent/backlog.md` pour permettre à `agent-orchestrator` de faire évoluer progressivement le projet.
