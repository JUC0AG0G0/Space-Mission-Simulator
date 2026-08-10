import type {
  CelestialBody,
  GameState,
  Spacecraft,
  SimulationCommand,
  TrajectoryPoint,
} from '../types/simulation';
import { createEarth } from './celestial/celestial-body';
import { createOrbitMission, evaluateMission } from './missions/mission';
import type { MissionConfiguration } from './missions/mission-configuration';
import { computeGravitationalAcceleration } from './physics/gravity';
import { integrate } from './physics/integration';
import { add } from './physics/vectors';
import {
  applyFuelConsumption,
  computeThrustAcceleration,
  createSpacecraft,
  turnSpacecraft,
} from './spacecraft/spacecraft';
import { adjustThrottle, toggleEngine } from './spacecraft/engine';

/** Radians per second applied while a turn command is held. */
export const TURN_RATE = 1.5;
/** Throttle change per second applied while a throttle command is held. */
export const THROTTLE_RATE = 0.5;
/** Maximum number of trajectory points retained, to bound memory usage. */
export const MAX_TRAJECTORY_POINTS = 500;

function createInitialSpacecraft(
  centralBody: CelestialBody,
  name: string,
): Spacecraft {
  // Start on a low circular-ish orbit above the surface so the player has
  // something interesting to work with immediately, rather than starting
  // on the launch pad.
  const startAltitude = 150_000;
  const startRadius = centralBody.radius + startAltitude;
  const orbitalSpeed = Math.sqrt(
    centralBody.gravitationalParameter / startRadius,
  );

  return createSpacecraft({
    id: 'spacecraft-1',
    name,
    position: { x: startRadius, y: 0 },
    velocity: { x: 0, y: orbitalSpeed * 0.85 },
    heading: Math.PI / 2,
    dryMass: 6_000,
    fuelMass: 2_400,
    maxFuel: 2_400,
    engineThrust: 45_000,
    engineFuelConsumption: 12,
  });
}

/**
 * Builds the initial game state. Given a `MissionConfiguration` (as
 * produced by `MissionSetup`), the spacecraft and active mission are named
 * after the player's choices instead of the hard-coded defaults.
 */
export function createInitialGameState(
  configuration?: MissionConfiguration,
): GameState {
  const centralBody = createEarth();

  return {
    simulationTime: 0,
    paused: false,
    centralBody,
    spacecraft: createInitialSpacecraft(
      centralBody,
      configuration?.spacecraftName ?? 'Explorer I',
    ),
    activeMission: createOrbitMission(configuration?.missionName),
    trajectory: [],
  };
}

function recordTrajectoryPoint(
  trajectory: TrajectoryPoint[],
  spacecraft: Spacecraft,
  time: number,
): TrajectoryPoint[] {
  const next = [...trajectory, { position: spacecraft.position, time }];
  if (next.length > MAX_TRAJECTORY_POINTS) {
    return next.slice(next.length - MAX_TRAJECTORY_POINTS);
  }
  return next;
}

/**
 * The simulation engine owns the authoritative `GameState` and advances it
 * in discrete, deterministic steps. It has no knowledge of React, the DOM,
 * or Canvas — see `src/rendering` and `src/ui` for those concerns.
 */
export class SimulationEngine {
  private state: GameState;
  private secondsInOrbitRange = 0;

  constructor(initialState: GameState = createInitialGameState()) {
    this.state = initialState;
  }

  getState(): GameState {
    return this.state;
  }

  setPaused(paused: boolean): void {
    this.state = { ...this.state, paused };
  }

  togglePause(): void {
    this.setPaused(!this.state.paused);
  }

  reset(initialState: GameState = createInitialGameState()): void {
    this.state = initialState;
    this.secondsInOrbitRange = 0;
  }

  /**
   * Whether the mission is still being played, i.e. flight commands and
   * physics should still apply. False once the mission has `succeeded` or
   * `failed` (until a `reset()`).
   */
  private isMissionActive(): boolean {
    const { activeMission } = this.state;
    return activeMission === null || activeMission.status === 'active';
  }

  /** Applies a single frame/tick's worth of player input to the ship. */
  applyCommand(command: SimulationCommand, deltaTime: number): void {
    if (!this.isMissionActive()) {
      return;
    }

    let spacecraft = this.state.spacecraft;

    if (command.toggleEngine) {
      spacecraft = { ...spacecraft, engine: toggleEngine(spacecraft.engine) };
    }

    if (command.throttleDelta) {
      spacecraft = {
        ...spacecraft,
        engine: adjustThrottle(
          spacecraft.engine,
          command.throttleDelta * THROTTLE_RATE * deltaTime,
        ),
      };
    }

    if (command.turnDelta) {
      spacecraft = turnSpacecraft(
        spacecraft,
        command.turnDelta * TURN_RATE * deltaTime,
      );
    }

    this.state = { ...this.state, spacecraft };
  }

  /**
   * Advances the simulation by `deltaTime` seconds. Does nothing while
   * paused, or once the active mission has succeeded or failed (the run is
   * over until `reset()`). This is the only place physics, fuel, trajectory
   * recording, and mission evaluation are combined for a tick.
   */
  step(deltaTime: number): void {
    if (this.state.paused || deltaTime <= 0 || !this.isMissionActive()) {
      return;
    }

    const { centralBody } = this.state;
    let spacecraft = this.state.spacecraft;

    const gravityAcceleration = computeGravitationalAcceleration(
      spacecraft.position,
      centralBody,
    );
    const thrustAcceleration = computeThrustAcceleration(spacecraft);
    const totalAcceleration = add(gravityAcceleration, thrustAcceleration);

    const { position, velocity } = integrate(
      spacecraft.position,
      spacecraft.velocity,
      totalAcceleration,
      deltaTime,
    );

    spacecraft = applyFuelConsumption(
      { ...spacecraft, position, velocity },
      deltaTime,
    );

    const simulationTime = this.state.simulationTime + deltaTime;
    const trajectory = recordTrajectoryPoint(
      this.state.trajectory,
      spacecraft,
      simulationTime,
    );

    let activeMission = this.state.activeMission;
    if (activeMission) {
      const evaluation = evaluateMission(
        {
          mission: activeMission,
          spacecraft,
          centralBody,
          secondsInOrbitRange: this.secondsInOrbitRange,
        },
        deltaTime,
      );
      activeMission = evaluation.mission;
      this.secondsInOrbitRange = evaluation.secondsInOrbitRange;
    }

    this.state = {
      ...this.state,
      spacecraft,
      simulationTime,
      trajectory,
      activeMission,
    };
  }
}
