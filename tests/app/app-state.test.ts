import { describe, expect, it } from 'vitest';
import {
  createInitialAppState,
  returnToMainMenu,
  startNewMission,
  startSimulation,
} from '../../src/app/app-state';

describe('app-state', () => {
  it('starts on the main menu', () => {
    expect(createInitialAppState()).toEqual({ phase: 'main-menu' });
  });

  it('moves from the main menu to mission setup', () => {
    const state = startNewMission(createInitialAppState());
    expect(state.phase).toBe('mission-setup');
  });

  it('ignores startNewMission when not on the main menu', () => {
    const state = { phase: 'simulation' } as const;
    expect(startNewMission(state)).toEqual(state);
  });

  it('moves from mission setup to the simulation', () => {
    const state = startSimulation({ phase: 'mission-setup' });
    expect(state.phase).toBe('simulation');
  });

  it('ignores startSimulation when not in mission setup', () => {
    const state = createInitialAppState();
    expect(startSimulation(state)).toEqual(state);
  });

  it('returns to the main menu from mission setup', () => {
    const state = returnToMainMenu({ phase: 'mission-setup' });
    expect(state.phase).toBe('main-menu');
  });

  it('ignores returnToMainMenu when not in mission setup', () => {
    const state = { phase: 'simulation' } as const;
    expect(returnToMainMenu(state)).toEqual(state);
  });
});
