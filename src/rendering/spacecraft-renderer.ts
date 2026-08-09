import type { Spacecraft } from '../types/simulation';
import type { Camera, ScreenSize } from './canvas/world-to-screen';
import { worldToScreen } from './canvas/world-to-screen';

const SHIP_SIZE_PX = 14;

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
