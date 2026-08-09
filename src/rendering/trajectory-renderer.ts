import type { TrajectoryPoint } from '../types/simulation';
import type { Camera, ScreenSize } from './canvas/world-to-screen';
import { worldToScreen } from './canvas/world-to-screen';

export function renderTrajectory(
  ctx: CanvasRenderingContext2D,
  trajectory: TrajectoryPoint[],
  camera: Camera,
  screen: ScreenSize,
): void {
  if (trajectory.length < 2) {
    return;
  }

  ctx.beginPath();
  trajectory.forEach((point, index) => {
    const screenPoint = worldToScreen(point.position, camera, screen);
    if (index === 0) {
      ctx.moveTo(screenPoint.x, screenPoint.y);
    } else {
      ctx.lineTo(screenPoint.x, screenPoint.y);
    }
  });

  ctx.strokeStyle = 'rgba(120, 220, 255, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}
