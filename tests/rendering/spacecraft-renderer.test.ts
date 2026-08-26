import { describe, expect, it } from 'vitest';
import { renderSpacecraft, renderVelocityVector } from '../../src/rendering/spacecraft-renderer';
import type { Camera, ScreenSize } from '../../src/rendering/canvas/world-to-screen';
import type { Vector2 } from '../../src/types/simulation';
import { createSpacecraft } from '../../src/simulation/spacecraft/spacecraft';
import { createFakeContext } from './fake-context';

const screen: ScreenSize = { width: 800, height: 600 };
const camera: Camera = { center: { x: 0, y: 0 }, zoom: 1 };

function buildSpacecraft(overrides: { active: boolean; throttle: number }) {
  const spacecraft = createSpacecraft({
    id: 'spacecraft-1',
    name: 'Explorer I',
    position: { x: 10, y: 20 },
    velocity: { x: 0, y: 0 },
    heading: Math.PI / 4,
    dryMass: 1_000,
    fuelMass: 500,
    maxFuel: 500,
    engineThrust: 1_000,
    engineFuelConsumption: 1,
  });

  return {
    ...spacecraft,
    engine: { ...spacecraft.engine, active: overrides.active, throttle: overrides.throttle },
  };
}

function buildSpacecraftWithVelocity(velocity: Vector2) {
  return createSpacecraft({
    id: 'spacecraft-1',
    name: 'Explorer I',
    position: { x: 10, y: 20 },
    velocity,
    heading: 0,
    dryMass: 1_000,
    fuelMass: 500,
    maxFuel: 500,
    engineThrust: 1_000,
    engineFuelConsumption: 1,
  });
}

describe('renderSpacecraft', () => {
  it('translates and rotates the canvas to the screen-projected position and heading', () => {
    const ctx = createFakeContext();
    const spacecraft = buildSpacecraft({ active: false, throttle: 1 });

    renderSpacecraft(ctx as unknown as CanvasRenderingContext2D, spacecraft, camera, screen);

    // center = worldToScreen({10,20}, camera, screen) = {410, 280}
    expect(ctx.save).toHaveBeenCalledTimes(1);
    expect(ctx.translate).toHaveBeenCalledWith(410, 280);
    expect(ctx.rotate).toHaveBeenCalledWith(-Math.PI / 4);
    expect(ctx.restore).toHaveBeenCalledTimes(1);
  });

  it('draws the hull in idle color and no flame when the engine is off', () => {
    const ctx = createFakeContext();
    const spacecraft = buildSpacecraft({ active: false, throttle: 1 });

    renderSpacecraft(ctx as unknown as CanvasRenderingContext2D, spacecraft, camera, screen);

    expect(ctx.moveTo).toHaveBeenCalledWith(14, 0);
    expect(ctx.lineTo).toHaveBeenCalledWith(-8.4, 8.4);
    expect(ctx.lineTo).toHaveBeenCalledWith(-4.2, 0);
    expect(ctx.lineTo).toHaveBeenCalledWith(-8.4, -8.4);
    expect(ctx.fillStyle).toBe('#f2f2f2');
    expect(ctx.strokeStyle).toBe('#1a1a1a');
    expect(ctx.stroke).toHaveBeenCalledTimes(1);
    // Only the hull path (4 points), no extra flame triangle.
    expect(ctx.moveTo).toHaveBeenCalledTimes(1);
  });

  it('draws the hull in thrust color and a flame scaled by throttle when the engine is active', () => {
    const ctx = createFakeContext();
    const spacecraft = buildSpacecraft({ active: true, throttle: 0.5 });

    renderSpacecraft(ctx as unknown as CanvasRenderingContext2D, spacecraft, camera, screen);

    expect(ctx.fillStyle).toBe('#ff6b3d');
    // flameLength = 14 * (0.6 + 0.5) = 15.4
    expect(ctx.moveTo).toHaveBeenCalledWith(-4.2, 0);
    expect(ctx.lineTo).toHaveBeenCalledWith(-19.6, 3.5);
    expect(ctx.lineTo).toHaveBeenCalledWith(-19.6, -3.5);
    expect(ctx.moveTo).toHaveBeenCalledTimes(2);
    expect(ctx.fill).toHaveBeenCalledTimes(2);
  });
});

describe('renderVelocityVector', () => {
  it('draws a fixed-length segment from the screen-projected position, in the direction of travel', () => {
    const ctx = createFakeContext();
    const spacecraft = buildSpacecraftWithVelocity({ x: 100, y: 0 });

    renderVelocityVector(ctx as unknown as CanvasRenderingContext2D, spacecraft, camera, screen);

    // origin = worldToScreen({10,20}, camera, screen) = {410, 280}
    // direction = {1, 0}; length is fixed at 40px regardless of the 100 m/s speed.
    expect(ctx.moveTo).toHaveBeenCalledWith(410, 280);
    expect(ctx.lineTo).toHaveBeenCalledWith(450, 280);
    expect(ctx.strokeStyle).toBe('#7cffb2');
    expect(ctx.stroke).toHaveBeenCalledTimes(1);
  });

  it('flips the y component of the direction, since canvas y is inverted relative to world y', () => {
    const ctx = createFakeContext();
    const spacecraft = buildSpacecraftWithVelocity({ x: 0, y: 50 });

    renderVelocityVector(ctx as unknown as CanvasRenderingContext2D, spacecraft, camera, screen);

    expect(ctx.moveTo).toHaveBeenCalledWith(410, 280);
    expect(ctx.lineTo).toHaveBeenCalledWith(410, 240);
  });

  it('draws nothing when the spacecraft is nearly stationary', () => {
    const ctx = createFakeContext();
    const spacecraft = buildSpacecraftWithVelocity({ x: 0.2, y: 0 });

    renderVelocityVector(ctx as unknown as CanvasRenderingContext2D, spacecraft, camera, screen);

    expect(ctx.beginPath).not.toHaveBeenCalled();
    expect(ctx.moveTo).not.toHaveBeenCalled();
    expect(ctx.lineTo).not.toHaveBeenCalled();
    expect(ctx.stroke).not.toHaveBeenCalled();
  });
});
