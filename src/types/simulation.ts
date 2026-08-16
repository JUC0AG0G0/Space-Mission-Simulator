/**
 * Shared type definitions for the simulation engine.
 *
 * These types are intentionally framework-agnostic: nothing in this file
 * (or in `src/simulation/**`) may import React or the Canvas API.
 */

export interface Vector2 {
  x: number;
  y: number;
}

export interface CelestialBody {
  id: string;
  name: string;
  /** Radius of the body, in meters. */
  radius: number;
  /** Mass of the body, in kilograms. */
  mass: number;
  /**
   * Standard gravitational parameter (mu = G * mass), in m^3/s^2.
   * Precomputed so the physics code never needs the gravitational
   * constant directly.
   */
  gravitationalParameter: number;
}

export interface Engine {
  /** Maximum thrust force, in newtons, at 100% throttle. */
  thrust: number;
  /** Fuel burned per second, in kilograms, at 100% throttle. */
  fuelConsumption: number;
  /** Whether the engine is currently firing. */
  active: boolean;
  /** Throttle setting, from 0 (idle) to 1 (full thrust). */
  throttle: number;
}

export interface Spacecraft {
  id: string;
  name: string;

  position: Vector2;
  velocity: Vector2;
  /** Heading, in radians, measured counter-clockwise from the +x axis. */
  heading: number;

  /** Mass of the spacecraft without any fuel, in kilograms. */
  dryMass: number;
  /** Current fuel mass, in kilograms. */
  fuelMass: number;
  /** Maximum fuel capacity, in kilograms. */
  maxFuel: number;

  engine: Engine;
}

export interface TrajectoryPoint {
  position: Vector2;
  time: number;
}

export interface MissionObjective {
  id: string;
  description: string;
  completed: boolean;
}

export type MissionStatus = 'active' | 'succeeded' | 'failed';

/**
 * The measurable conditions a mission's orbit objectives are checked
 * against. Carried on `Mission` itself (rather than hard-coded in the
 * evaluation logic) so the simulation engine stays mission-agnostic and a
 * different `MissionProfile` can supply stricter or looser numbers.
 */
export interface OrbitSuccessCriteria {
  minAltitude: number;
  maxAltitude: number;
  holdDurationSeconds: number;
}

/**
 * Why a mission's `status` became `'failed'`. `null` while the mission is
 * active or succeeded. Carried on the `Mission` itself, set at the moment
 * `evaluateMission` fails it, so the result screen doesn't have to
 * re-derive *which* failure branch fired from unrelated state (see
 * `describeFailureCause` in `src/simulation/missions/mission-result.ts`).
 */
export type MissionFailureReason = 'crashed' | 'fuel-depleted';

export interface Mission {
  id: string;
  name: string;
  description: string;
  objectives: MissionObjective[];
  status: MissionStatus;
  successCriteria: OrbitSuccessCriteria;
  failureReason: MissionFailureReason | null;
}

export interface Countdown {
  /**
   * Seconds remaining until LIFTOFF. Reaches exactly 0 for one step (the
   * LIFTOFF frame) before the countdown clears and flight begins.
   */
  remainingSeconds: number;
}

/**
 * High-level flight phase, derived from the rest of `GameState` rather than
 * stored on it directly (see `determineFlightPhase` in
 * `src/simulation/flight-phase.ts`).
 */
export type FlightPhase =
  | 'pre-launch'
  | 'launch'
  | 'flight'
  | 'mission-complete'
  | 'mission-failed';

/** Simulation speed multipliers the player can choose between, per `spec.md`. */
export const ALLOWED_TIME_SCALES = [1, 2, 5, 10] as const;
export type TimeScale = (typeof ALLOWED_TIME_SCALES)[number];

export interface GameState {
  simulationTime: number;
  paused: boolean;
  /**
   * Multiplier applied to real elapsed time while advancing flight physics
   * (see `SimulationEngine.step`); never applied to the pre-flight
   * countdown, which always runs at real-time speed.
   */
  timeScale: TimeScale;

  centralBody: CelestialBody;
  spacecraft: Spacecraft;

  activeMission: Mission | null;

  trajectory: TrajectoryPoint[];

  /**
   * Non-null before LIFTOFF: physics is frozen and player commands are
   * ignored. Null once flight has started.
   */
  countdown: Countdown | null;

  /** Highest altitude above the surface reached so far, in meters. */
  maxAltitude: number;
  /** Highest speed reached so far, in meters per second. */
  maxSpeed: number;
}

/** Player-issued commands applied on every simulation step. */
export interface SimulationCommand {
  throttleDelta?: number;
  turnDelta?: number;
  toggleEngine?: boolean;
  /**
   * Sets the throttle to an absolute value (0 to 1), clamped. Applied
   * immediately, independent of `deltaTime`/simulation speed, unlike
   * `throttleDelta` (a per-second rate meant to be held down) — this is a
   * one-shot "set throttle to X" instruction, e.g. from a slider.
   */
  setThrottle?: number;
}
