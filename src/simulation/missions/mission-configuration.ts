/**
 * Player-facing mission setup data. Framework-agnostic so it can be
 * created and validated without mounting the `MissionSetup` UI.
 */

export interface MissionConfiguration {
  missionName: string;
  spacecraftName: string;
  destinationId: string;
  objectiveId: string;
}

export interface MissionDestination {
  id: string;
  name: string;
}

export interface MissionSetupObjective {
  id: string;
  description: string;
}

/** V0: a single destination is available. */
export const AVAILABLE_DESTINATIONS: MissionDestination[] = [
  { id: 'earth-orbit', name: 'Earth orbit' },
];

/** V0: a single objective is available. */
export const AVAILABLE_OBJECTIVES: MissionSetupObjective[] = [
  { id: 'reach-stable-orbit', description: 'Reach a stable Earth orbit' },
];

export function findDestination(id: string): MissionDestination | undefined {
  return AVAILABLE_DESTINATIONS.find((destination) => destination.id === id);
}

export function findObjective(id: string): MissionSetupObjective | undefined {
  return AVAILABLE_OBJECTIVES.find((objective) => objective.id === id);
}

export function createDefaultMissionConfiguration(): MissionConfiguration {
  return {
    missionName: 'Mission 01',
    spacecraftName: 'Explorer I',
    destinationId: AVAILABLE_DESTINATIONS[0].id,
    objectiveId: AVAILABLE_OBJECTIVES[0].id,
  };
}

/**
 * A configuration is valid when both names are non-blank and the selected
 * destination/objective are among the available ones.
 */
export function isValidMissionConfiguration(
  configuration: MissionConfiguration,
): boolean {
  return (
    configuration.missionName.trim().length > 0 &&
    configuration.spacecraftName.trim().length > 0 &&
    findDestination(configuration.destinationId) !== undefined &&
    findObjective(configuration.objectiveId) !== undefined
  );
}
