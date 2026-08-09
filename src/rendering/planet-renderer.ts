import type { CelestialBody } from '../types/simulation';
import type { Camera, ScreenSize } from './canvas/world-to-screen';
import { worldToScreen } from './canvas/world-to-screen';

export function renderPlanet(
  ctx: CanvasRenderingContext2D,
  body: CelestialBody,
  camera: Camera,
  screen: ScreenSize,
): void {
  const center = worldToScreen({ x: 0, y: 0 }, camera, screen);
  const radiusPx = body.radius * camera.zoom;

  const gradient = ctx.createRadialGradient(
    center.x - radiusPx * 0.3,
    center.y - radiusPx * 0.3,
    radiusPx * 0.1,
    center.x,
    center.y,
    radiusPx,
  );
  gradient.addColorStop(0, '#4f9dde');
  gradient.addColorStop(1, '#0b3d66');

  ctx.beginPath();
  ctx.fillStyle = gradient;
  ctx.arc(center.x, center.y, radiusPx, 0, Math.PI * 2);
  ctx.fill();
}
