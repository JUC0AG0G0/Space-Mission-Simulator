import type { Vector2 } from '../../types/simulation';

export interface Camera {
  /** World-space point the camera is centered on. */
  center: Vector2;
  /** Pixels per meter. */
  zoom: number;
}

export interface ScreenSize {
  width: number;
  height: number;
}

/**
 * Converts a world-space position (meters, +y up) into a canvas-space pixel
 * position (+y down, origin top-left), given a camera and canvas size.
 */
export function worldToScreen(
  world: Vector2,
  camera: Camera,
  screen: ScreenSize,
): Vector2 {
  const dx = world.x - camera.center.x;
  const dy = world.y - camera.center.y;

  return {
    x: screen.width / 2 + dx * camera.zoom,
    y: screen.height / 2 - dy * camera.zoom,
  };
}

/** Inverse of `worldToScreen`. */
export function screenToWorld(
  screen: Vector2,
  camera: Camera,
  screenSize: ScreenSize,
): Vector2 {
  const dx = (screen.x - screenSize.width / 2) / camera.zoom;
  const dy = -(screen.y - screenSize.height / 2) / camera.zoom;

  return {
    x: camera.center.x + dx,
    y: camera.center.y + dy,
  };
}
