import {
  ALLOWED_TIME_SCALES,
  type CelestialBody,
  type GameState,
  type Spacecraft,
  type SimulationCommand,
  type TimeScale,
  type TrajectoryPoint,
  type Vector2,
} from '../types/simulation';
import { createEarth } from './celestial/celestial-body';
import { altitudeAboveSurface, createOrbitMission, evaluateMission } from './missions/mission';
import {
  findMissionProfile,
  type MissionConfiguration,
} from './missions/mission-configuration';
import { computeGravitationalAcceleration } from './physics/gravity';
import { integrate } from './physics/integration';
import { add, dot, magnitude, normalize } from './physics/vectors';
import {
  applyFuelConsumption,
  computeThrustAcceleration,
  createSpacecraft,
  turnSpacecraft,
} from './spacecraft/spacecraft';
import { adjustThrottle, toggleEngine } from './spacecraft/engine';
import { AVAILABLE_ROCKET_MODELS, findRocketModel, type RocketModel } from './spacecraft/rocket-models';

/** Radians per second applied while a turn command is held. */
export const TURN_RATE = 1.5;
/** Throttle change per second applied while a throttle command is held. */
export const THROTTLE_RATE = 0.5;
/** Maximum number of trajectory points retained, to bound memory usage. */
export const MAX_TRAJECTORY_POINTS = 500;
/** Length of the pre-flight countdown, in simulated seconds (T-3, T-2, T-1). */
export const COUNTDOWN_DURATION_SECONDS = 3;

export type { TimeScale };
export { ALLOWED_TIME_SCALES };

function createInitialSpacecraft(
  centralBody: CelestialBody,
  name: string,
  rocketModel: RocketModel,
): Spacecraft {
  // Start on the launch pad: resting on the surface, no initial velocity
  // (the central body doesn't rotate in this simulation), facing straight
  // up away from the surface. The launch itself is left to the player.
  return createSpacecraft({
    id: 'spacecraft-1',
    name,
    position: { x: centralBody.radius, y: 0 },
    velocity: { x: 0, y: 0 },
    heading: 0,
    dryMass: rocketModel.dryMass,
    fuelMass: rocketModel.fuelMass,
    maxFuel: rocketModel.fuelMass,
    // Every predefined rocket model keeps a thrust-to-weight ratio above 1
    // at the surface, so the ship is always able to lift off against
    // gravity.
    engineThrust: rocketModel.engineThrust,
    engineFuelConsumption: rocketModel.engineFuelConsumption,
  });
}

/**
 * True while the spacecraft is resting on the surface and the combined
 * gravity + thrust acceleration isn't enough to lift it off yet. While
 * grounded, physics integration is skipped so the ship stays parked on the
 * pad instead of sinking through the ground under gravity alone.
 */
function isGrounded(
  spacecraft: Spacecraft,
  centralBody: CelestialBody,
  totalAcceleration: Vector2,
): boolean {
  if (altitudeAboveSurface(spacecraft, centralBody) > 0) {
    return false;
  }
  const up = normalize(spacecraft.position);
  return dot(totalAcceleration, up) <= 0;
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
  const missionProfile = configuration
    ? findMissionProfile(configuration.missionProfileId)
    : undefined;
  const rocketModel =
    (configuration ? findRocketModel(configuration.rocketModelId) : undefined) ??
    AVAILABLE_ROCKET_MODELS[0];

  return {
    simulationTime: 0,
    paused: false,
    timeScale: 1,
    centralBody,
    spacecraft: createInitialSpacecraft(
      centralBody,
      configuration?.spacecraftName ?? 'Explorer I',
      rocketModel,
    ),
    activeMission: createOrbitMission(
      configuration?.missionName,
      missionProfile?.successCriteria,
    ),
    trajectory: [],
    countdown: { remainingSeconds: COUNTDOWN_DURATION_SECONDS },
    maxAltitude: 0,
    maxSpeed: 0,
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

  /** Ignores anything outside `ALLOWED_TIME_SCALES`, leaving the current speed untouched. */
  setTimeScale(timeScale: TimeScale): void {
    if (!ALLOWED_TIME_SCALES.includes(timeScale)) {
      return;
    }
    this.state = { ...this.state, timeScale };
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

  /**
   * Advances the pre-flight countdown by `deltaTime`. Returns true while the
   * countdown is still holding the simulation back (including the LIFTOFF
   * frame, where `remainingSeconds` reaches exactly 0), false once it has
   * cleared and flight physics should run for this same tick.
   *
   * Only called from `step` while `this.state.countdown` is non-null (see
   * its call site below), so no null guard is needed here.
   */
  private advanceCountdown(deltaTime: number): boolean {
    const countdown = this.state.countdown!;

    if (countdown.remainingSeconds <= 0) {
      this.state = { ...this.state, countdown: null };
      return false;
    }

    const remainingSeconds = Math.max(0, countdown.remainingSeconds - deltaTime);
    this.state = { ...this.state, countdown: { remainingSeconds } };
    return true;
  }

  /** Applies a single frame/tick's worth of player input to the ship. */
  applyCommand(command: SimulationCommand, deltaTime: number): void {
    if (this.state.paused || !this.isMissionActive() || this.state.countdown) {
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

    if (this.state.countdown && this.advanceCountdown(deltaTime)) {
      return;
    }

    // The countdown above always runs at real-time speed; flight physics
    // from here on advance at the player-selected simulation speed.
    const scaledDeltaTime = deltaTime * this.state.timeScale;

    const { centralBody } = this.state;
    let spacecraft = this.state.spacecraft;

    const gravityAcceleration = computeGravitationalAcceleration(
      spacecraft.position,
      centralBody,
    );
    const thrustAcceleration = computeThrustAcceleration(spacecraft);
    const totalAcceleration = add(gravityAcceleration, thrustAcceleration);

    const grounded = isGrounded(spacecraft, centralBody, totalAcceleration);
    const { position, velocity } = grounded
      ? { position: spacecraft.position, velocity: spacecraft.velocity }
      : integrate(spacecraft.position, spacecraft.velocity, totalAcceleration, scaledDeltaTime);

    spacecraft = { ...spacecraft, position, velocity };
    if (!grounded) {
      spacecraft = applyFuelConsumption(spacecraft, scaledDeltaTime);
    }

    const simulationTime = this.state.simulationTime + scaledDeltaTime;
    const trajectory = recordTrajectoryPoint(
      this.state.trajectory,
      spacecraft,
      simulationTime,
    );

    const maxAltitude = Math.max(
      this.state.maxAltitude,
      altitudeAboveSurface(spacecraft, centralBody),
    );
    const maxSpeed = Math.max(this.state.maxSpeed, magnitude(spacecraft.velocity));

    let activeMission = this.state.activeMission;
    if (activeMission) {
      const evaluation = evaluateMission(
        {
          mission: activeMission,
          spacecraft,
          centralBody,
          secondsInOrbitRange: this.secondsInOrbitRange,
        },
        scaledDeltaTime,
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
      maxAltitude,
      maxSpeed,
    };
  }
}
