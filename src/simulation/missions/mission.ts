import type {
  CelestialBody,
  Mission,
  OrbitSuccessCriteria,
  Spacecraft,
} from '../../types/simulation';
import { computeOrbitRadiusBounds } from '../physics/orbit';
import { magnitude, subtract } from '../physics/vectors';

/** Success criteria used when a mission is created without a `MissionProfile`. */
export const DEFAULT_ORBIT_SUCCESS_CRITERIA: OrbitSuccessCriteria = {
  minAltitude: 100_000, // meters
  maxAltitude: 400_000, // meters
  holdDurationSeconds: 30,
};
/** Below this altitude above the surface, the mission is considered a crash. */
export const CRASH_ALTITUDE = 0;

export function createOrbitMission(
  name = 'Orbit-01',
  successCriteria: OrbitSuccessCriteria = DEFAULT_ORBIT_SUCCESS_CRITERIA,
): Mission {
  return {
    id: 'ORBIT-01',
    name,
    description:
      'Reach a stable orbit altitude and maintain it for a sustained period.',
    status: 'active',
    successCriteria,
    failureReason: null,
    objectives: [
      {
        id: 'reach-altitude',
        description: `Reach an altitude between ${successCriteria.minAltitude / 1000} km and ${
          successCriteria.maxAltitude / 1000
        } km`,
        completed: false,
      },
      {
        id: 'hold-orbit',
        description: `Maintain that altitude range for ${successCriteria.holdDurationSeconds} seconds`,
        completed: false,
      },
    ],
  };
}

export function altitudeAboveSurface(
  spacecraft: Spacecraft,
  body: CelestialBody,
): number {
  return magnitude(subtract(spacecraft.position, { x: 0, y: 0 })) - body.radius;
}

export function isWithinOrbitRange(
  altitude: number,
  criteria: OrbitSuccessCriteria,
): boolean {
  return altitude >= criteria.minAltitude && altitude <= criteria.maxAltitude;
}

/**
 * True once a spacecraft that has run out of fuel is locked onto an
 * unpowered orbit that never crosses the mission's target altitude band —
 * the player has no thrust left to correct course, so the mission can never
 * be completed from here. `false` for an orbit that still periodically
 * dips into (or is currently inside) the band, and for unbound trajectories
 * (no repeating orbit to reason about).
 */
function isStrandedOutsideTargetBand(
  spacecraft: Spacecraft,
  centralBody: CelestialBody,
  criteria: OrbitSuccessCriteria,
): boolean {
  if (spacecraft.fuelMass > 0) {
    return false;
  }

  const bounds = computeOrbitRadiusBounds(
    spacecraft.position,
    spacecraft.velocity,
    centralBody,
  );
  if (!bounds) {
    return false;
  }

  const lowestAltitudeReached = bounds.periapsis - centralBody.radius;
  const highestAltitudeReached = bounds.apoapsis - centralBody.radius;

  return (
    highestAltitudeReached < criteria.minAltitude ||
    lowestAltitudeReached > criteria.maxAltitude
  );
}

export interface MissionEvaluationInput {
  mission: Mission;
  spacecraft: Spacecraft;
  centralBody: CelestialBody;
  /** Consecutive seconds spent within the target orbit range so far. */
  secondsInOrbitRange: number;
}

export interface MissionEvaluationResult {
  mission: Mission;
  secondsInOrbitRange: number;
}

/**
 * Evaluates mission objectives and status given the current spacecraft
 * state. This is a pure function: it returns a new `Mission` and updated
 * "seconds in orbit range" counter rather than mutating its inputs.
 */
export function evaluateMission(
  input: MissionEvaluationInput,
  deltaTime: number,
): MissionEvaluationResult {
  const { mission, spacecraft, centralBody } = input;

  if (mission.status !== 'active') {
    return { mission, secondsInOrbitRange: input.secondsInOrbitRange };
  }

  const altitude = altitudeAboveSurface(spacecraft, centralBody);

  if (altitude < CRASH_ALTITUDE) {
    return {
      mission: { ...mission, status: 'failed', failureReason: 'crashed' },
      secondsInOrbitRange: 0,
    };
  }

  const inRange = isWithinOrbitRange(altitude, mission.successCriteria);
  const secondsInOrbitRange = inRange
    ? input.secondsInOrbitRange + deltaTime
    : 0;

  const objectives = mission.objectives.map((objective) => {
    if (objective.id === 'reach-altitude') {
      return { ...objective, completed: objective.completed || inRange };
    }
    if (objective.id === 'hold-orbit') {
      return {
        ...objective,
        completed:
          objective.completed ||
          secondsInOrbitRange >= mission.successCriteria.holdDurationSeconds,
      };
    }
    return objective;
  });

  const allCompleted = objectives.every((objective) => objective.completed);
  const stranded =
    !allCompleted &&
    isStrandedOutsideTargetBand(spacecraft, centralBody, mission.successCriteria);

  return {
    mission: {
      ...mission,
      objectives,
      status: allCompleted ? 'succeeded' : stranded ? 'failed' : 'active',
      failureReason: stranded ? 'fuel-depleted' : mission.failureReason,
    },
    secondsInOrbitRange,
  };
}
