/**
 * Local progression tracking: which mission profiles the player has
 * completed. Backed by `localStorage`; never throws, since progress
 * tracking is not required to play (mirrors `mission-save.ts`).
 */

import { AVAILABLE_MISSION_PROFILES } from '../missions/mission-configuration';

const STORAGE_KEY = 'space-mission-simulator:mission-progress';

export interface MissionProgressEntry {
  id: string;
  name: string;
  destinationName: string;
  completed: boolean;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

/**
 * Reads the set of completed mission profile ids. Returns an empty array
 * when there is nothing saved, or when the stored data is missing or
 * corrupted — it is never allowed to block startup.
 */
export function loadCompletedMissionIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    return isStringArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Records the given mission profile as completed. Fails silently if storage is unavailable. */
export function markMissionCompleted(missionProfileId: string): void {
  try {
    const completed = new Set(loadCompletedMissionIds());
    completed.add(missionProfileId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
  } catch {
    // Storage unavailable (quota, private mode, ...): tracking is optional.
  }
}

/**
 * Builds the progression list shown on the main menu: one entry per known
 * mission profile. Iterating `AVAILABLE_MISSION_PROFILES` means a newly
 * added profile shows up automatically, without touching this function.
 */
export function buildMissionProgress(
  completedIds: string[] = loadCompletedMissionIds(),
): MissionProgressEntry[] {
  return AVAILABLE_MISSION_PROFILES.map((profile) => ({
    id: profile.id,
    name: profile.name,
    destinationName: profile.destinationName,
    completed: completedIds.includes(profile.id),
  }));
}
