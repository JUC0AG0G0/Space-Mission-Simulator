import type { CelestialBody, Vector2 } from '../../types/simulation';
import { magnitude, scale } from './vectors';

/**
 * Computes the gravitational acceleration exerted on an object at `position`
 * by `body`, assuming `body` is fixed at the world origin (0, 0).
 *
 * a = -mu / r^2 * unit(position)
 */
export function computeGravitationalAcceleration(
  position: Vector2,
  body: CelestialBody,
): Vector2 {
  const distance = magnitude(position);

  // Avoid division by zero / infinite acceleration at the center of the
  // body. Clamp to the body's radius, which is the closest a spacecraft
  // should ever physically be able to get.
  const safeDistance = Math.max(distance, body.radius);

  const accelerationMagnitude =
    body.gravitationalParameter / (safeDistance * safeDistance);

  if (distance === 0) {
    // Undefined direction at the exact center; no lateral pull.
    return { x: 0, y: 0 };
  }

  const directionTowardsBody = scale(position, -1 / distance);
  return scale(directionTowardsBody, accelerationMagnitude);
}
