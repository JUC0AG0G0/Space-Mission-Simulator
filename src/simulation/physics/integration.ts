import type { Vector2 } from '../../types/simulation';
import { add, scale } from './vectors';

export interface IntegrationResult {
  position: Vector2;
  velocity: Vector2;
}

/**
 * Advances position and velocity by `deltaTime` seconds using semi-implicit
 * (symplectic) Euler integration: velocity is updated from acceleration
 * first, then position is updated using the *new* velocity. This is more
 * stable for orbital mechanics than plain forward Euler while remaining
 * simple and fully deterministic.
 */
export function integrate(
  position: Vector2,
  velocity: Vector2,
  acceleration: Vector2,
  deltaTime: number,
): IntegrationResult {
  const newVelocity = add(velocity, scale(acceleration, deltaTime));
  const newPosition = add(position, scale(newVelocity, deltaTime));

  return { position: newPosition, velocity: newVelocity };
}
