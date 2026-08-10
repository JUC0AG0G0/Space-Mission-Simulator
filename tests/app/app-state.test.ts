import { describe, expect, it } from 'vitest';
import {
  createInitialAppState,
  returnToMainMenu,
  startNewMission,
  startSimulation,
} from '../../src/app/app-state';
import { createDefaultMissionConfiguration } from '../../src/simulation/missions/mission-configuration';

describe('app-state', () => {
  it('starts on the main menu', () => {
    expect(createInitialAppState()).toEqual({
      phase: 'main-menu',
      missionConfiguration: null,
    });
  });

  it('moves from the main menu to mission setup', () => {
    const state = startNewMission(createInitialAppState());
    expect(state.phase).toBe('mission-setup');
  });

  it('ignores startNewMission when not on the main menu', () => {
    const state = { phase: 'simulation', missionConfiguration: null } as const;
    expect(startNewMission(state)).toEqual(state);
  });

  it('moves from mission setup to the simulation, carrying the mission configuration', () => {
    const configuration = createDefaultMissionConfiguration();
    const state = startSimulation(
      { phase: 'mission-setup', missionConfiguration: null },
      configuration,
    );
    expect(state.phase).toBe('simulation');
    expect(state.missionConfiguration).toEqual(configuration);
  });

  it('ignores startSimulation when not in mission setup', () => {
    const state = createInitialAppState();
    expect(startSimulation(state, createDefaultMissionConfiguration())).toEqual(state);
  });

  it('returns to the main menu from mission setup', () => {
    const state = returnToMainMenu({ phase: 'mission-setup', missionConfiguration: null });
    expect(state.phase).toBe('main-menu');
  });

  it('ignores returnToMainMenu when not in mission setup', () => {
    const state = { phase: 'simulation', missionConfiguration: null } as const;
    expect(returnToMainMenu(state)).toEqual(state);
  });
});
