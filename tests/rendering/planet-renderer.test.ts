import { describe, expect, it } from 'vitest';
import { renderPlanet } from '../../src/rendering/planet-renderer';
import type { Camera, ScreenSize } from '../../src/rendering/canvas/world-to-screen';
import type { CelestialBody } from '../../src/types/simulation';
import { createFakeContext } from './fake-context';

const screen: ScreenSize = { width: 800, height: 600 };
const camera: Camera = { center: { x: 0, y: 0 }, zoom: 2 };
const body: CelestialBody = {
  id: 'earth',
  name: 'Earth',
  radius: 100,
  mass: 1,
  gravitationalParameter: 1,
};

describe('renderPlanet', () => {
  it('draws a filled arc at the screen-projected center with the projected radius', () => {
    const ctx = createFakeContext();

    renderPlanet(ctx as unknown as CanvasRenderingContext2D, body, camera, screen);

    // center = worldToScreen({0,0}, camera, screen); radiusPx = radius * zoom
    expect(ctx.arc).toHaveBeenCalledWith(400, 300, 200, 0, Math.PI * 2);
    expect(ctx.beginPath).toHaveBeenCalledTimes(1);
    expect(ctx.fill).toHaveBeenCalledTimes(1);
  });

  it('fills with a radial gradient offset toward the light source', () => {
    const ctx = createFakeContext();

    renderPlanet(ctx as unknown as CanvasRenderingContext2D, body, camera, screen);

    expect(ctx.createRadialGradient).toHaveBeenCalledWith(340, 240, 20, 400, 300, 200);
    expect(ctx.fillStyle).toBe(ctx.createRadialGradient.mock.results[0]?.value);
  });
});
