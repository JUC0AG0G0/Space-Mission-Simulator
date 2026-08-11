import type { CelestialBody, Vector2 } from '../../types/simulation';
import { magnitude } from './vectors';

export interface OrbitRadiusBounds {
  /** Closest distance from the central body's center reached over the orbit, in meters. */
  periapsis: number;
  /** Farthest distance from the central body's center reached over the orbit, in meters. */
  apoapsis: number;
}

/**
 * Computes the periapsis and apoapsis distances (from the central body's
 * center) of the unpowered Keplerian orbit an object on a two-body
 * trajectory would follow from `position`/`velocity` onward, assuming no
 * further thrust is applied.
 *
 * Returns `null` for an unbound (parabolic or hyperbolic) trajectory, which
 * has no apoapsis and never repeats a closed path.
 */
export function computeOrbitRadiusBounds(
  position: Vector2,
  velocity: Vector2,
  body: CelestialBody,
): OrbitRadiusBounds | null {
  const mu = body.gravitationalParameter;
  const distance = magnitude(position);
  const speed = magnitude(velocity);

  // Vis-viva specific orbital energy. Negative means a closed (bound)
  // ellipse; zero or positive means the trajectory escapes and never forms
  // a repeating orbit.
  const specificEnergy = (speed * speed) / 2 - mu / distance;
  if (specificEnergy >= 0) {
    return null;
  }

  const semiMajorAxis = -mu / (2 * specificEnergy);
  // z-component of the 2D specific angular momentum r x v.
  const angularMomentum = position.x * velocity.y - position.y * velocity.x;
  const semiLatusRectum = (angularMomentum * angularMomentum) / mu;
  const eccentricity = Math.sqrt(
    Math.max(0, 1 - semiLatusRectum / semiMajorAxis),
  );

  return {
    periapsis: semiMajorAxis * (1 - eccentricity),
    apoapsis: semiMajorAxis * (1 + eccentricity),
  };
}
