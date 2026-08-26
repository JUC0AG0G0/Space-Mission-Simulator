import type { Spacecraft } from '../types/simulation';
import type { Camera, ScreenSize } from './canvas/world-to-screen';
import { worldToScreen } from './canvas/world-to-screen';
import { magnitude, normalize } from '../simulation/physics/vectors';

const SHIP_SIZE_PX = 14;
const VELOCITY_VECTOR_LENGTH_PX = 40;
/** Below this speed, direction is too noisy to be worth drawing (matches the
 * threshold `Hud.tsx` uses before showing apoapsis/periapsis). */
const MIN_SPEED_FOR_VELOCITY_VECTOR = 1;

export function renderSpacecraft(
  ctx: CanvasRenderingContext2D,
  spacecraft: Spacecraft,
  camera: Camera,
  screen: ScreenSize,
): void {
  const center = worldToScreen(spacecraft.position, camera, screen);

  ctx.save();
  ctx.translate(center.x, center.y);
  // Canvas y is flipped relative to world y, so negate heading here.
  ctx.rotate(-spacecraft.heading);

  ctx.beginPath();
  ctx.moveTo(SHIP_SIZE_PX, 0);
  ctx.lineTo(-SHIP_SIZE_PX * 0.6, SHIP_SIZE_PX * 0.6);
  ctx.lineTo(-SHIP_SIZE_PX * 0.3, 0);
  ctx.lineTo(-SHIP_SIZE_PX * 0.6, -SHIP_SIZE_PX * 0.6);
  ctx.closePath();
  ctx.fillStyle = spacecraft.engine.active ? '#ffb454' : '#f2f2f2';
  ctx.fill();
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (spacecraft.engine.active) {
    const flameLength = SHIP_SIZE_PX * (0.6 + spacecraft.engine.throttle);
    ctx.beginPath();
    ctx.moveTo(-SHIP_SIZE_PX * 0.3, 0);
    ctx.lineTo(-SHIP_SIZE_PX * 0.3 - flameLength, SHIP_SIZE_PX * 0.25);
    ctx.lineTo(-SHIP_SIZE_PX * 0.3 - flameLength, -SHIP_SIZE_PX * 0.25);
    ctx.closePath();
    ctx.fillStyle = '#ff6b3d';
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draws a fixed-length segment from the spacecraft pointing in the direction
 * of its current velocity, distinct from the heading shown by the hull. The
 * two diverge as soon as the player turns without realigning thrust with the
 * trajectory (common in orbit), making it hard to judge where the spacecraft
 * is actually headed from the hull alone.
 */
export function renderVelocityVector(
  ctx: CanvasRenderingContext2D,
  spacecraft: Spacecraft,
  camera: Camera,
  screen: ScreenSize,
): void {
  if (magnitude(spacecraft.velocity) < MIN_SPEED_FOR_VELOCITY_VECTOR) {
    return;
  }

  const origin = worldToScreen(spacecraft.position, camera, screen);
  const direction = normalize(spacecraft.velocity);

  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  // Canvas y is flipped relative to world y, so negate the y component here.
  ctx.lineTo(
    origin.x + direction.x * VELOCITY_VECTOR_LENGTH_PX,
    origin.y - direction.y * VELOCITY_VECTOR_LENGTH_PX,
  );
  ctx.strokeStyle = '#7cffb2';
  ctx.lineWidth = 2;
  ctx.stroke();
}
