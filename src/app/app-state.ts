/**
 * Top-level screen flow for the application, kept separate from the
 * simulation engine's `GameState`. Pure data + pure transition functions so
 * it is testable without mounting React or starting a `requestAnimationFrame`
 * loop.
 */

export type AppPhase = 'main-menu' | 'mission-setup' | 'simulation';

export interface AppState {
  phase: AppPhase;
}

export function createInitialAppState(): AppState {
  return { phase: 'main-menu' };
}

/** From the main menu, starts configuring a new mission. */
export function startNewMission(state: AppState): AppState {
  if (state.phase !== 'main-menu') {
    return state;
  }
  return { ...state, phase: 'mission-setup' };
}

/** From mission setup, launches the simulation. */
export function startSimulation(state: AppState): AppState {
  if (state.phase !== 'mission-setup') {
    return state;
  }
  return { ...state, phase: 'simulation' };
}

/** Returns to the main menu from mission setup. */
export function returnToMainMenu(state: AppState): AppState {
  if (state.phase !== 'mission-setup') {
    return state;
  }
  return { ...state, phase: 'main-menu' };
}
