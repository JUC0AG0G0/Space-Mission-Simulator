/**
 * Player-facing mission setup data. Framework-agnostic so it can be
 * created and validated without mounting the `MissionSetup` UI.
 */

import type { OrbitSuccessCriteria } from '../../types/simulation';
import { AVAILABLE_ROCKET_MODELS, findRocketModel } from '../spacecraft/rocket-models';

export interface MissionConfiguration {
  missionName: string;
  spacecraftName: string;
  missionProfileId: string;
  rocketModelId: string;
}

export type MissionDifficulty = 'easy' | 'medium' | 'hard';

/**
 * A predefined mission the player can pick in `MissionSetup`. Bundles the
 * destination, objective, and success parameters together so the
 * simulation engine (`src/simulation/missions/mission.ts`) never has to
 * know about any mission in particular — it only evaluates whatever
 * `successCriteria` the chosen profile attaches to the active `Mission`.
 */
export interface MissionProfile {
  id: string;
  name: string;
  destinationName: string;
  description: string;
  difficulty: MissionDifficulty;
  objectiveDescription: string;
  successCriteria: OrbitSuccessCriteria;
}

export const AVAILABLE_MISSION_PROFILES: MissionProfile[] = [
  {
    id: 'earth-orbit',
    name: 'Mission 01',
    destinationName: 'Earth orbit',
    description: 'A first flight to a forgiving low Earth orbit.',
    difficulty: 'easy',
    objectiveDescription: 'Reach a stable Earth orbit',
    successCriteria: {
      minAltitude: 100_000,
      maxAltitude: 400_000,
      holdDurationSeconds: 30,
    },
  },
  {
    id: 'high-orbit',
    name: 'Mission 02',
    destinationName: 'High orbit',
    description: 'Climb further out to a higher orbit that takes more fuel to reach.',
    difficulty: 'medium',
    objectiveDescription: 'Reach a stable high orbit',
    successCriteria: {
      minAltitude: 600_000,
      maxAltitude: 900_000,
      holdDurationSeconds: 30,
    },
  },
  {
    id: 'fast-orbit',
    name: 'Mission 03',
    destinationName: 'Fast orbit',
    description: 'Thread a narrow orbital band and hold it despite the tighter margin.',
    difficulty: 'hard',
    objectiveDescription: 'Reach a stable narrow-band orbit',
    successCriteria: {
      minAltitude: 250_000,
      maxAltitude: 280_000,
      holdDurationSeconds: 45,
    },
  },
];

export function findMissionProfile(id: string): MissionProfile | undefined {
  return AVAILABLE_MISSION_PROFILES.find((profile) => profile.id === id);
}

export function createDefaultMissionConfiguration(): MissionConfiguration {
  return {
    missionName: 'Mission 01',
    spacecraftName: 'Explorer I',
    missionProfileId: AVAILABLE_MISSION_PROFILES[0].id,
    rocketModelId: AVAILABLE_ROCKET_MODELS[0].id,
  };
}

/**
 * A configuration is valid when both names are non-blank and the selected
 * mission profile and rocket model are among the available ones.
 */
export function isValidMissionConfiguration(
  configuration: MissionConfiguration,
): boolean {
  return (
    configuration.missionName.trim().length > 0 &&
    configuration.spacecraftName.trim().length > 0 &&
    findMissionProfile(configuration.missionProfileId) !== undefined &&
    findRocketModel(configuration.rocketModelId) !== undefined
  );
}
