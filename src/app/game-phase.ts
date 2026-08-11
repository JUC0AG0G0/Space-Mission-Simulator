/**
 * Single, explicit state machine spanning the whole application lifecycle:
 * it combines the screen-level `AppPhase` (`src/app/app-state.ts`, which
 * screen React mounts) with the flight-level `FlightPhase`
 * (`src/simulation/flight-phase.ts`, derived from `GameState` while a
 * mission is running) into one flat, ordered set of phases.
 *
 * `determineGamePhase` is the single source of truth for "what phase is the
 * game in right now" — components should read the phase from here instead
 * of re-deriving it from ad hoc `GameState` checks (e.g. comparing
 * `activeMission?.status` directly).
 */
import type { AppPhase } from './app-state';
import type { GameState } from '../types/simulation';
import { determineFlightPhase } from '../simulation/flight-phase';

export type GamePhase =
  | 'main-menu'
  | 'mission-setup'
  | 'pre-launch'
  | 'launch'
  | 'flight'
  | 'mission-complete'
  | 'mission-failed';

/**
 * `gameState` is only consulted while `appPhase` is `'simulation'`; it is
 * ignored (and may be `null`) for the menu/setup screens, which have no
 * running simulation yet.
 */
export function determineGamePhase(
  appPhase: AppPhase,
  gameState: GameState | null,
): GamePhase {
  if (appPhase === 'main-menu') {
    return 'main-menu';
  }
  if (appPhase === 'mission-setup') {
    return 'mission-setup';
  }

  if (!gameState) {
    return 'pre-launch';
  }

  return determineFlightPhase({
    countdown: gameState.countdown,
    spacecraft: gameState.spacecraft,
    centralBody: gameState.centralBody,
    activeMission: gameState.activeMission,
  });
}
