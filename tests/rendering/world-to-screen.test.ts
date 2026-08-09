import { describe, expect, it } from 'vitest';
import { worldToScreen, screenToWorld } from '../../src/rendering/canvas/world-to-screen';
import type { Camera, ScreenSize } from '../../src/rendering/canvas/world-to-screen';

const screen: ScreenSize = { width: 800, height: 600 };

describe('worldToScreen', () => {
  it('maps the camera center to the middle of the screen', () => {
    const camera: Camera = { center: { x: 100, y: -50 }, zoom: 2 };

    expect(worldToScreen({ x: 100, y: -50 }, camera, screen)).toEqual({ x: 400, y: 300 });
  });

  it('scales world offsets by the zoom factor', () => {
    const camera: Camera = { center: { x: 0, y: 0 }, zoom: 3 };

    expect(worldToScreen({ x: 10, y: 0 }, camera, screen)).toEqual({ x: 430, y: 300 });
  });

  it('flips the y axis (world +y up becomes screen -y)', () => {
    const camera: Camera = { center: { x: 0, y: 0 }, zoom: 1 };

    expect(worldToScreen({ x: 0, y: 20 }, camera, screen)).toEqual({ x: 400, y: 280 });
    expect(worldToScreen({ x: 0, y: -20 }, camera, screen)).toEqual({ x: 400, y: 320 });
  });
});

describe('screenToWorld', () => {
  it('maps the middle of the screen back to the camera center', () => {
    const camera: Camera = { center: { x: 100, y: -50 }, zoom: 2 };

    expect(screenToWorld({ x: 400, y: 300 }, camera, screen)).toEqual({ x: 100, y: -50 });
  });

  it('is the exact inverse of worldToScreen', () => {
    const camera: Camera = { center: { x: -30, y: 15 }, zoom: 4 };
    const world = { x: 12.5, y: -7.25 };

    const screenPos = worldToScreen(world, camera, screen);
    expect(screenToWorld(screenPos, camera, screen)).toEqual(world);
  });
});
