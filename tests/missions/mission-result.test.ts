import { describe, expect, it } from 'vitest';
import { buildMissionResultStats } from '../../src/simulation/missions/mission-result';
import { DEFAULT_ORBIT_SUCCESS_CRITERIA } from '../../src/simulation/missions/mission';
import { createInitialGameState } from '../../src/simulation/simulation-engine';
import type { GameState } from '../../src/types/simulation';

function baseState(overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialGameState(), countdown: null, ...overrides };
}

describe('buildMissionResultStats', () => {
  it('reports a successful mission with no failure cause', () => {
    const state = baseState({
      simulationTime: 272,
      maxAltitude: 184_000,
      maxSpeed: 7_800,
      activeMission: {
        id: 'ORBIT-01',
        name: 'Mission 01',
        description: 'Reach orbit.',
        status: 'succeeded',
        objectives: [{ id: 'reach-altitude', description: 'Reach altitude', completed: true }],
        successCriteria: DEFAULT_ORBIT_SUCCESS_CRITERIA,
      },
    });

    const stats = buildMissionResultStats(state);

    expect(stats.succeeded).toBe(true);
    expect(stats.failureCause).toBeNull();
    expect(stats.missionName).toBe('Mission 01');
    expect(stats.spacecraftName).toBe(state.spacecraft.name);
    expect(stats.missionTimeSeconds).toBe(272);
    expect(stats.maxAltitude).toBe(184_000);
    expect(stats.maxSpeed).toBe(7_800);
    expect(stats.objectives).toEqual(state.activeMission?.objectives);
  });

  it('reports "Fuel depleted" when the mission failed with no fuel left', () => {
    const state = baseState({
      spacecraft: { ...createInitialGameState().spacecraft, fuelMass: 0 },
      activeMission: {
        id: 'ORBIT-01',
        name: 'Mission 01',
        description: 'Reach orbit.',
        status: 'failed',
        objectives: [],
        successCriteria: DEFAULT_ORBIT_SUCCESS_CRITERIA,
      },
    });

    const stats = buildMissionResultStats(state);

    expect(stats.succeeded).toBe(false);
    expect(stats.failureCause).toBe('Fuel depleted');
  });

  it('reports "Spacecraft crashed" when the mission failed with fuel remaining', () => {
    const state = baseState({
      spacecraft: { ...createInitialGameState().spacecraft, fuelMass: 500 },
      activeMission: {
        id: 'ORBIT-01',
        name: 'Mission 01',
        description: 'Reach orbit.',
        status: 'failed',
        objectives: [],
        successCriteria: DEFAULT_ORBIT_SUCCESS_CRITERIA,
      },
    });

    const stats = buildMissionResultStats(state);

    expect(stats.failureCause).toBe('Spacecraft crashed');
  });

  it('falls back to an empty mission name when there is no active mission', () => {
    const state = baseState({ activeMission: null });

    const stats = buildMissionResultStats(state);

    expect(stats.succeeded).toBe(false);
    expect(stats.missionName).toBe('');
    expect(stats.objectives).toEqual([]);
  });
});
