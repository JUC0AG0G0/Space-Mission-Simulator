import type { GameState } from '../types/simulation';
import type { Camera, ScreenSize } from './canvas/world-to-screen';
import { renderPlanet } from './planet-renderer';
import { renderSpacecraft } from './spacecraft-renderer';
import { renderTrajectory } from './trajectory-renderer';

/**
 * Builds a camera centered on the world origin (the central body), sized so
 * the planet and typical low-orbit altitudes both fit comfortably on
 * screen.
 */
export function buildCamera(state: GameState, screen: ScreenSize): Camera {
  const viewRadius = state.centralBody.radius * 2.6;
  const zoom = (Math.min(screen.width, screen.height) / 2) / viewRadius;

  return {
    center: { x: 0, y: 0 },
    zoom,
  };
}

export function renderScene(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  screen: ScreenSize,
): void {
  ctx.clearRect(0, 0, screen.width, screen.height);
  ctx.fillStyle = '#050914';
  ctx.fillRect(0, 0, screen.width, screen.height);

  const camera = buildCamera(state, screen);

  renderTrajectory(ctx, state.trajectory, camera, screen);
  renderPlanet(ctx, state.centralBody, camera, screen);
  renderSpacecraft(ctx, state.spacecraft, camera, screen);
}
