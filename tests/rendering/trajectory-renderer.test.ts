import { describe, expect, it } from 'vitest';
import { renderTrajectory } from '../../src/rendering/trajectory-renderer';
import type { Camera, ScreenSize } from '../../src/rendering/canvas/world-to-screen';
import type { TrajectoryPoint } from '../../src/types/simulation';
import { createFakeContext } from './fake-context';

const screen: ScreenSize = { width: 800, height: 600 };
const camera: Camera = { center: { x: 0, y: 0 }, zoom: 1 };

describe('renderTrajectory', () => {
  it('draws nothing when there are fewer than two points', () => {
    const ctx = createFakeContext();

    renderTrajectory(ctx as unknown as CanvasRenderingContext2D, [], camera, screen);
    renderTrajectory(
      ctx as unknown as CanvasRenderingContext2D,
      [{ position: { x: 0, y: 0 }, time: 0 }],
      camera,
      screen,
    );

    expect(ctx.beginPath).not.toHaveBeenCalled();
    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it('moves to the first point and lines to each subsequent point, in screen space', () => {
    const ctx = createFakeContext();
    const trajectory: TrajectoryPoint[] = [
      { position: { x: 0, y: 0 }, time: 0 },
      { position: { x: 10, y: 0 }, time: 1 },
      { position: { x: 10, y: 20 }, time: 2 },
    ];

    renderTrajectory(ctx as unknown as CanvasRenderingContext2D, trajectory, camera, screen);

    expect(ctx.beginPath).toHaveBeenCalledTimes(1);
    expect(ctx.moveTo).toHaveBeenCalledTimes(1);
    expect(ctx.moveTo).toHaveBeenCalledWith(400, 300);
    expect(ctx.lineTo).toHaveBeenNthCalledWith(1, 410, 300);
    expect(ctx.lineTo).toHaveBeenNthCalledWith(2, 410, 280);
    expect(ctx.strokeStyle).toBe('rgba(120, 220, 255, 0.6)');
    expect(ctx.lineWidth).toBe(1.5);
    expect(ctx.stroke).toHaveBeenCalledTimes(1);
  });
});
