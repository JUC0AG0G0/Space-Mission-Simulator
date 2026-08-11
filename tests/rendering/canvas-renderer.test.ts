import { describe, expect, it } from 'vitest';
import { buildCamera, renderScene } from '../../src/rendering/canvas-renderer';
import type { ScreenSize } from '../../src/rendering/canvas/world-to-screen';
import type { GameState } from '../../src/types/simulation';
import { createEarth } from '../../src/simulation/celestial/celestial-body';
import { createOrbitMission } from '../../src/simulation/missions/mission';
import { createSpacecraft } from '../../src/simulation/spacecraft/spacecraft';
import { createFakeContext } from './fake-context';

function buildState(): GameState {
  const centralBody = createEarth();

  return {
    simulationTime: 0,
    paused: false,
    centralBody,
    spacecraft: createSpacecraft({
      id: 'spacecraft-1',
      name: 'Explorer I',
      position: { x: centralBody.radius + 150_000, y: 0 },
      velocity: { x: 0, y: 0 },
      heading: 0,
      dryMass: 6_000,
      fuelMass: 2_400,
      maxFuel: 2_400,
      engineThrust: 45_000,
      engineFuelConsumption: 12,
    }),
    activeMission: createOrbitMission(),
    trajectory: [
      { position: { x: 0, y: 0 }, time: 0 },
      { position: { x: 10, y: 0 }, time: 1 },
    ],
    countdown: null,
    maxAltitude: 150_000,
    maxSpeed: 0,
  };
}

describe('buildCamera', () => {
  it('centers on the world origin and sizes the zoom so the planet fits on screen', () => {
    const state = buildState();
    const screen: ScreenSize = { width: 1000, height: 800 };

    const camera = buildCamera(state, screen);

    const viewRadius = state.centralBody.radius * 2.6;
    expect(camera.center).toEqual({ x: 0, y: 0 });
    expect(camera.zoom).toBeCloseTo((Math.min(1000, 800) / 2) / viewRadius);
  });
});

describe('renderScene', () => {
  it('clears the canvas, paints the background, and delegates to each layer renderer', () => {
    const ctx = createFakeContext();
    const state = buildState();
    const screen: ScreenSize = { width: 800, height: 600 };

    renderScene(ctx as unknown as CanvasRenderingContext2D, state, screen);

    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
    // renderTrajectory draws a line (2 points), renderPlanet draws an arc,
    // renderSpacecraft draws the ship hull: all three delegate calls ran.
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalledTimes(1);
    expect(ctx.translate).toHaveBeenCalledTimes(1);
  });
});
