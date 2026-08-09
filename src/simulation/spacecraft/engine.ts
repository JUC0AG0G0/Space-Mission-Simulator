import type { Engine } from '../../types/simulation';

export function createEngine(params: {
  thrust: number;
  fuelConsumption: number;
}): Engine {
  return {
    thrust: params.thrust,
    fuelConsumption: params.fuelConsumption,
    active: false,
    throttle: 1,
  };
}

export function toggleEngine(engine: Engine): Engine {
  return { ...engine, active: !engine.active };
}

export function setThrottle(engine: Engine, throttle: number): Engine {
  const clamped = Math.min(1, Math.max(0, throttle));
  return { ...engine, throttle: clamped };
}

export function adjustThrottle(engine: Engine, delta: number): Engine {
  return setThrottle(engine, engine.throttle + delta);
}

/** Current thrust force delivered by the engine, in newtons. */
export function currentThrustForce(engine: Engine): number {
  if (!engine.active) {
    return 0;
  }
  return engine.thrust * engine.throttle;
}

/**
 * Fuel mass burned over `deltaTime` seconds at the engine's current
 * throttle setting, in kilograms. Does NOT clamp against how much fuel is
 * actually available in the tank — callers are responsible for clamping
 * against the spacecraft's current `fuelMass`.
 */
export function computeFuelConsumed(engine: Engine, deltaTime: number): number {
  if (!engine.active) {
    return 0;
  }

  return engine.fuelConsumption * engine.throttle * deltaTime;
}
