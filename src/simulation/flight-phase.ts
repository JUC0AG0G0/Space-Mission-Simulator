import type {
  CelestialBody,
  Countdown,
  FlightPhase,
  Mission,
  Spacecraft,
} from '../types/simulation';
import { altitudeAboveSurface } from './missions/mission';

export interface FlightPhaseInput {
  countdown: Countdown | null;
  spacecraft: Spacecraft;
  centralBody: CelestialBody;
  activeMission: Mission | null;
}

/**
 * Determines the current high-level flight phase from the rest of the
 * simulation state:
 *
 *   Surface (engine off)  -> PRE-LAUNCH
 *   Surface (engine on)   -> LAUNCH
 *   Airborne               -> FLIGHT
 *   Mission succeeded       -> MISSION_COMPLETE
 *   Mission failed          -> MISSION_FAILED
 *
 * Pure and derived: nothing about the phase is stored on `GameState`, it is
 * always recomputed from the spacecraft's position, engine state, and the
 * active mission's status, so it can never drift out of sync.
 */
export function determineFlightPhase(input: FlightPhaseInput): FlightPhase {
  const { countdown, spacecraft, centralBody, activeMission } = input;

  if (activeMission?.status === 'succeeded') {
    return 'mission-complete';
  }
  if (activeMission?.status === 'failed') {
    return 'mission-failed';
  }

  if (countdown) {
    return 'pre-launch';
  }

  if (altitudeAboveSurface(spacecraft, centralBody) > 0) {
    return 'flight';
  }

  return spacecraft.engine.active ? 'launch' : 'pre-launch';
}
