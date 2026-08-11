import type { Spacecraft, Vector2 } from '../../types/simulation';
import { computeFuelConsumed, createEngine, currentThrustForce } from './engine';
import { fromAngle, scale } from '../physics/vectors';

export function createSpacecraft(params: {
  id: string;
  name: string;
  position: Vector2;
  velocity: Vector2;
  heading: number;
  dryMass: number;
  fuelMass: number;
  maxFuel: number;
  engineThrust: number;
  engineFuelConsumption: number;
}): Spacecraft {
  return {
    id: params.id,
    name: params.name,
    position: params.position,
    velocity: params.velocity,
    heading: params.heading,
    dryMass: params.dryMass,
    fuelMass: params.fuelMass,
    maxFuel: params.maxFuel,
    engine: createEngine({
      thrust: params.engineThrust,
      fuelConsumption: params.engineFuelConsumption,
    }),
  };
}

/** Total current mass of the spacecraft: dry mass plus remaining fuel. */
export function totalMass(spacecraft: Spacecraft): number {
  return spacecraft.dryMass + spacecraft.fuelMass;
}

/**
 * Acceleration produced by the engine over this instant, in the direction
 * the spacecraft is currently facing. Thrust is zero once fuel is
 * exhausted.
 */
export function computeThrustAcceleration(spacecraft: Spacecraft): Vector2 {
  if (spacecraft.fuelMass <= 0) {
    return { x: 0, y: 0 };
  }

  const force = currentThrustForce(spacecraft.engine);
  if (force === 0) {
    return { x: 0, y: 0 };
  }

  const mass = totalMass(spacecraft);
  const accelerationMagnitude = force / mass;
  const direction = fromAngle(spacecraft.heading);
  return scale(direction, accelerationMagnitude);
}

/**
 * Returns the spacecraft's fuel mass after burning fuel for `deltaTime`
 * seconds. Always clamped to the [0, maxFuel] range. The engine is
 * automatically switched off once fuel reaches zero.
 */
export function applyFuelConsumption(
  spacecraft: Spacecraft,
  deltaTime: number,
): Spacecraft {
  if (!spacecraft.engine.active || spacecraft.fuelMass <= 0) {
    return spacecraft;
  }

  const consumed = computeFuelConsumed(spacecraft.engine, deltaTime);
  const newFuelMass = Math.max(0, spacecraft.fuelMass - consumed);

  return {
    ...spacecraft,
    fuelMass: newFuelMass,
    engine:
      newFuelMass <= 0
        ? { ...spacecraft.engine, active: false }
        : spacecraft.engine,
  };
}

export function turnSpacecraft(spacecraft: Spacecraft, deltaHeading: number): Spacecraft {
  return { ...spacecraft, heading: spacecraft.heading + deltaHeading };
}
