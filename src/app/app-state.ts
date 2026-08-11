/**
 * Top-level screen flow for the application, kept separate from the
 * simulation engine's `GameState`. Pure data + pure transition functions so
 * it is testable without mounting React or starting a `requestAnimationFrame`
 * loop.
 */

import type { MissionConfiguration } from '../simulation/missions/mission-configuration';

export type AppPhase = 'main-menu' | 'mission-setup' | 'simulation';

export interface AppState {
  phase: AppPhase;
  /** The configuration validated in `MissionSetup`, carried into `simulation`. */
  missionConfiguration: MissionConfiguration | null;
}

export function createInitialAppState(): AppState {
  return { phase: 'main-menu', missionConfiguration: null };
}

/** From the main menu, starts configuring a new mission. */
export function startNewMission(state: AppState): AppState {
  if (state.phase !== 'main-menu') {
    return state;
  }
  return { ...state, phase: 'mission-setup' };
}

/** From mission setup, launches the simulation with the chosen configuration. */
export function startSimulation(
  state: AppState,
  configuration: MissionConfiguration,
): AppState {
  if (state.phase !== 'mission-setup') {
    return state;
  }
  return { ...state, phase: 'simulation', missionConfiguration: configuration };
}

/** From the main menu, resumes the simulation with a previously saved mission configuration. */
export function continueSavedMission(
  state: AppState,
  configuration: MissionConfiguration,
): AppState {
  if (state.phase !== 'main-menu') {
    return state;
  }
  return { ...state, phase: 'simulation', missionConfiguration: configuration };
}

/** Returns to the main menu from mission setup. */
export function returnToMainMenu(state: AppState): AppState {
  if (state.phase !== 'mission-setup') {
    return state;
  }
  return { ...state, phase: 'main-menu', missionConfiguration: null };
}

/** Leaves the simulation (e.g. from the mission result screen) for the main menu. */
export function exitSimulation(state: AppState): AppState {
  if (state.phase !== 'simulation') {
    return state;
  }
  return { ...state, phase: 'main-menu', missionConfiguration: null };
}
