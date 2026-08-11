/**
 * Optional local persistence for the player's mission configuration, so the
 * main menu's "Continue" action can resume where they left off. Backed by
 * `localStorage`; never throws, since saving/loading is not required to
 * play.
 */

import {
  isValidMissionConfiguration,
  type MissionConfiguration,
} from '../missions/mission-configuration';

const STORAGE_KEY = 'space-mission-simulator:saved-mission';

function isMissionConfigurationShape(value: unknown): value is MissionConfiguration {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.missionName === 'string' &&
    typeof candidate.spacecraftName === 'string' &&
    typeof candidate.destinationId === 'string' &&
    typeof candidate.objectiveId === 'string'
  );
}

/** Persists the given mission configuration. Fails silently if storage is unavailable. */
export function saveMission(configuration: MissionConfiguration): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configuration));
  } catch {
    // Storage unavailable (quota, private mode, ...): saving is optional.
  }
}

/**
 * Reads the saved mission configuration, if any. Returns `null` when there
 * is nothing saved, or when the stored data is missing, corrupted, or no
 * longer a valid configuration — it is never allowed to block startup.
 */
export function loadSavedMission(): MissionConfiguration | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isMissionConfigurationShape(parsed) || !isValidMissionConfiguration(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Removes any saved mission configuration. */
export function clearSavedMission(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable: nothing to clear.
  }
}
