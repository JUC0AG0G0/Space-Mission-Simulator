import type {
  CelestialBody,
  Mission,
  Spacecraft,
} from '../../types/simulation';
import { magnitude, subtract } from '../physics/vectors';

export const ORBIT_MIN_ALTITUDE = 100_000; // meters
export const ORBIT_MAX_ALTITUDE = 400_000; // meters
export const ORBIT_HOLD_DURATION = 30; // seconds the orbit must be maintained
/** Below this altitude above the surface, the mission is considered a crash. */
export const CRASH_ALTITUDE = 0;

export function createOrbitMission(name = 'Orbit-01'): Mission {
  return {
    id: 'ORBIT-01',
    name,
    description:
      'Reach a stable orbit altitude and maintain it for a sustained period.',
    status: 'active',
    objectives: [
      {
        id: 'reach-altitude',
        description: `Reach an altitude between ${ORBIT_MIN_ALTITUDE / 1000} km and ${
          ORBIT_MAX_ALTITUDE / 1000
        } km`,
        completed: false,
      },
      {
        id: 'hold-orbit',
        description: `Maintain that altitude range for ${ORBIT_HOLD_DURATION} seconds`,
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

export function isWithinOrbitRange(altitude: number): boolean {
  return altitude >= ORBIT_MIN_ALTITUDE && altitude <= ORBIT_MAX_ALTITUDE;
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

  if (altitude <= CRASH_ALTITUDE) {
    return {
      mission: { ...mission, status: 'failed' },
      secondsInOrbitRange: 0,
    };
  }

  const inRange = isWithinOrbitRange(altitude);
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
          objective.completed || secondsInOrbitRange >= ORBIT_HOLD_DURATION,
      };
    }
    return objective;
  });

  const allCompleted = objectives.every((objective) => objective.completed);

  return {
    mission: {
      ...mission,
      objectives,
      status: allCompleted ? 'succeeded' : 'active',
    },
    secondsInOrbitRange,
  };
}
