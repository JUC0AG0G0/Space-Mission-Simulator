# Backlog

Priorisation : bug connu > trous de couverture de tests sur du code pur >
gameplay/feature > polish. Chaque item est scopé pour un run indépendant
avec un diff limité (< 400 lignes), tests inclus.

## 1. [feature] Ajouter un menu principal et un état de préparation de mission

Actuellement, le jeu démarre directement avec une fusée déjà en orbite.
Modifier le flux de démarrage afin que l'application commence sur un
**menu principal** au lieu de démarrer immédiatement la simulation.

Le menu doit proposer au minimum :

* `Nouvelle mission`
* `Continuer` uniquement si une sauvegarde existe
* `Options` (peut être non fonctionnel dans un premier temps)

Lorsqu'une nouvelle mission est sélectionnée, le jeu doit entrer dans un
nouvel état `mission-setup` plutôt que démarrer immédiatement la simulation.

Ajouter une machine à états ou un équivalent simple permettant de distinguer
clairement les états :

```text
main-menu
    ↓
mission-setup
    ↓
simulation
```

Le moteur physique ne doit pas être modifié inutilement dans cette tâche.

Le menu et les changements d'état doivent être testables sans démarrer
une boucle `requestAnimationFrame`.

Ajouter les tests correspondant à la nouvelle logique d'état.

## 2. [feature] Ajouter l'écran de préparation de mission

Créer un écran `MissionSetup` affiché après `Nouvelle mission`.

Le joueur doit pouvoir définir les paramètres de base de sa mission avant
le lancement.

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

## 3. [feature] Démarrer la mission depuis la surface de la Terre

Modifier l'état initial du vaisseau.

Actuellement, le vaisseau commence déjà dans une situation orbitale.
Après validation de l'écran `MissionSetup`, la simulation doit commencer
avec la fusée **posée sur la surface de la Terre**.

La fusée doit :

* être positionnée à la surface du corps céleste ;
* avoir une vitesse initiale cohérente avec un lancement depuis la surface ;
* être orientée vers le haut par rapport à la surface ;
* avoir son carburant initial ;
* avoir son moteur éteint.

Le lancement ne doit plus être implicite.

Le joueur doit devoir activer le moteur pour commencer réellement le vol.

Ajouter des tests déterministes vérifiant l'état initial du vaisseau.

## 4. [feature] Ajouter une phase de compte à rebours

Avant le début du contrôle manuel de la fusée, ajouter une courte phase de
compte à rebours.

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

## 5. [feature] Ajouter une vraie phase de lancement

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

Le moteur doit pouvoir déterminer si le vaisseau est encore au sol,
en vol ou dans une situation de mission terminée.

Les règles exactes de réussite d'une orbite restent celles du système
de mission existant.

Ajouter les tests couvrant les transitions principales.

## 6. [feature] Ajouter un écran de résumé de mission

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

Les statistiques affichées doivent provenir de l'état réel de la simulation,
pas être calculées directement dans le composant d'interface.

## 7. [feature] Ajouter la sauvegarde de la configuration de mission

Permettre de sauvegarder localement la configuration préparée par le joueur.

La sauvegarde doit utiliser `localStorage`.

Elle doit permettre à `Continuer` depuis le menu principal de restaurer :

* la mission ;
* la configuration de la fusée ;
* les paramètres nécessaires au démarrage.

La sauvegarde doit rester facultative pour jouer.

Si aucune sauvegarde valide n'existe, `Continuer` doit être désactivé ou
non affiché.

Les données invalides ou corrompues dans `localStorage` doivent être
ignorées proprement et ne doivent pas empêcher le jeu de démarrer.

Ajouter des tests unitaires de la couche de persistance.

## 8. [feature] Ajouter plusieurs profils de mission

Ajouter plusieurs missions prédéfinies afin que le menu de préparation ne
soit plus limité à une seule mission.

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

Le moteur de simulation ne doit pas contenir de logique spécifique à une
mission particulière.

## 9. [feature] Séparer clairement les phases de jeu

Refactorer la gestion du cycle de vie de l'application afin d'avoir une
machine à états explicite.

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

## 10. [feature] Ajouter un écran de sélection de fusée

Faire évoluer `MissionSetup` afin de permettre au joueur de choisir une
fusée parmi plusieurs modèles.

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

## 11. [feature] Ajouter un système de progression

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

---

## Idées identifiées pour plus tard

### Construction de fusées

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

### Physique

* Prédiction de trajectoire.
* Apoapside / périapside.
* Orbites elliptiques.
* Manœuvres orbitales.
* Transferts orbitaux.
* Atmosphère.
* Traînée atmosphérique.
* Gravité de plusieurs corps.
* Rotation des planètes.

### Corps célestes

* Lune.
* Mars.
* Astéroïdes.
* Stations spatiales.
* Plusieurs systèmes planétaires.

### Missions

* Mise en orbite.
* Rendez-vous orbital.
* Docking.
* Atterrissage lunaire.
* Mission martienne.
* Retour sur Terre.
* Livraison de satellites.

### Gestion

* Budget.
* Coût des fusées.
* Recherche technologique.
* Déblocage de composants.
* Contrats.
* Récompenses.

### Événements

* Panne moteur.
* Fuite de carburant.
* Panne électrique.
* Perte de communication.
* Collision.
* Surchauffe.
* Rentrée atmosphérique ratée.

### Interface

* Carte spatiale.
* Caméra libre.
* Zoom.
* Mode orbital.
* Prédiction de trajectoire.
* Timeline.
* Journal de mission.
* Centre de contrôle de mission.

### Technique

* Web Workers.
* Simulation accélérée.
* WebGL.
* WebAssembly.
* Replay.
* Seeds reproductibles.
* Benchmarks.
* Sauvegardes de missions complètes.

---

## Priorité actuelle

L'ordre recommandé pour les prochaines exécutions de `agent-orchestrator` est :

1. Menu principal + machine à états minimale
2. Écran de préparation de mission
3. Départ depuis la surface
4. Compte à rebours
5. Phase de lancement
6. Écran de résultat
7. Sauvegarde
8. Plusieurs missions
9. Machine à états complète
10. Sélection de fusée
11. Progression

Chaque tâche doit rester suffisamment petite pour être réalisée dans un
seul run et produire un diff raisonnablement limité.

Une tâche peut être subdivisée si son implémentation dépasse le périmètre
raisonnable d'un run.
