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
 * Internal sub-tick size, in seconds, used to burn fuel in small
 * increments rather than a single large jump.
 */
const FUEL_SUBSTEP_SECONDS = 0.1;

/**
 * Fuel mass burned over `deltaTime` seconds at the engine's current
 * throttle setting, in kilograms. Does NOT clamp against how much fuel is
 * actually available in the tank — callers are responsible for clamping
 * against the spacecraft's current `fuelMass`.
 *
 * KNOWN ISSUE (see `.agent/backlog.md`): for `deltaTime` values larger than
 * `FUEL_SUBSTEP_SECONDS`, this only counts whole sub-ticks and silently
 * drops the remaining partial tick. This is correct for typical per-frame
 * calls (deltaTime well under a second) but under-counts fuel burned when
 * called with a large deltaTime (e.g. a catch-up step after the tab was
 * backgrounded, or a fast-forwarded simulation).
 */
export function computeFuelConsumed(engine: Engine, deltaTime: number): number {
  if (!engine.active) {
    return 0;
  }

  if (deltaTime <= FUEL_SUBSTEP_SECONDS) {
    return engine.fuelConsumption * engine.throttle * deltaTime;
  }

  const wholeSubsteps = Math.floor(deltaTime / FUEL_SUBSTEP_SECONDS);
  return engine.fuelConsumption * engine.throttle * FUEL_SUBSTEP_SECONDS * wholeSubsteps;
}
