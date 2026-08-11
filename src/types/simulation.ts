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

export interface Mission {
  id: string;
  name: string;
  description: string;
  objectives: MissionObjective[];
  status: MissionStatus;
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

export interface GameState {
  simulationTime: number;
  paused: boolean;

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
}
