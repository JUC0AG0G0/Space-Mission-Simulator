import { describe, expect, it } from 'vitest';
import { buildCamera, renderScene } from '../../src/rendering/canvas-renderer';
import type { ScreenSize } from '../../src/rendering/canvas/world-to-screen';
import type { GameState, Mission } from '../../src/types/simulation';
import { createEarth } from '../../src/simulation/celestial/celestial-body';
import { createOrbitMission } from '../../src/simulation/missions/mission';
import { AVAILABLE_MISSION_PROFILES } from '../../src/simulation/missions/mission-configuration';
import { createSpacecraft } from '../../src/simulation/spacecraft/spacecraft';
import { createFakeContext } from './fake-context';

function buildState(activeMission: Mission | null = createOrbitMission()): GameState {
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
    activeMission,
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
  it('centers on the world origin and sizes the zoom so the default mission fits on screen', () => {
    const state = buildState();
    const screen: ScreenSize = { width: 1000, height: 800 };

    const camera = buildCamera(state, screen);

    // Matches the legacy hard-coded `radius * 2.6` view for the default
    // (earth-orbit, 400km) mission's target altitude.
    const viewRadius = state.centralBody.radius * 2.6;
    expect(camera.center).toEqual({ x: 0, y: 0 });
    expect(camera.zoom).toBeCloseTo((Math.min(1000, 800) / 2) / viewRadius);
  });

  it('falls back to the default target altitude when there is no active mission', () => {
    const state = buildState(null);
    const screen: ScreenSize = { width: 1000, height: 800 };

    const camera = buildCamera(state, screen);

    const viewRadius = state.centralBody.radius * 2.6;
    expect(camera.zoom).toBeCloseTo((Math.min(1000, 800) / 2) / viewRadius);
  });

  it('zooms out further for a higher-altitude mission profile so the ship stays in frame', () => {
    const highOrbitProfile = AVAILABLE_MISSION_PROFILES.find(
      (profile) => profile.id === 'high-orbit',
    );
    if (!highOrbitProfile) {
      throw new Error('Expected the high-orbit mission profile to exist.');
    }

    const defaultState = buildState();
    const highOrbitState = buildState({
      ...createOrbitMission(),
      successCriteria: highOrbitProfile.successCriteria,
    });
    const screen: ScreenSize = { width: 1000, height: 800 };

    const defaultCamera = buildCamera(defaultState, screen);
    const highOrbitCamera = buildCamera(highOrbitState, screen);

    // A larger view radius means a smaller zoom factor.
    expect(highOrbitCamera.zoom).toBeLessThan(defaultCamera.zoom);

    // At the mission's own target altitude, the ship should sit well within
    // the visible radius (not pinned to the edge of the frame).
    const centralBodyRadius = createEarth().radius;
    const viewRadius = centralBodyRadius + highOrbitProfile.successCriteria.maxAltitude * 2.4;
    const shipDistanceFromCenter = centralBodyRadius + highOrbitProfile.successCriteria.maxAltitude;
    expect(shipDistanceFromCenter / viewRadius).toBeLessThan(0.9);
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
