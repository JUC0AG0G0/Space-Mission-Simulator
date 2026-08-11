import type { GameState, MissionObjective } from '../../types/simulation';

export interface MissionResultStats {
  missionName: string;
  spacecraftName: string;
  succeeded: boolean;
  missionTimeSeconds: number;
  maxAltitude: number;
  maxSpeed: number;
  objectives: MissionObjective[];
  /** Non-null only when the mission failed. */
  failureCause: string | null;
}

function describeFailureCause(state: GameState): string {
  switch (state.activeMission?.failureReason) {
    case 'fuel-depleted':
      return 'Fuel depleted';
    case 'crashed':
    default:
      return 'Spacecraft crashed';
  }
}

/**
 * Builds the read-only stats shown on the mission result screen from
 * `GameState`, so the UI never has to recompute them itself.
 */
export function buildMissionResultStats(state: GameState): MissionResultStats {
  const succeeded = state.activeMission?.status === 'succeeded';

  return {
    missionName: state.activeMission?.name ?? '',
    spacecraftName: state.spacecraft.name,
    succeeded,
    missionTimeSeconds: state.simulationTime,
    maxAltitude: state.maxAltitude,
    maxSpeed: state.maxSpeed,
    objectives: state.activeMission?.objectives ?? [],
    failureCause: succeeded ? null : describeFailureCause(state),
  };
}
