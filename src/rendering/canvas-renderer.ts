import type { GameState } from '../types/simulation';
import type { Camera, ScreenSize } from './canvas/world-to-screen';
import { renderPlanet } from './planet-renderer';
import { renderSpacecraft } from './spacecraft-renderer';
import { renderTrajectory } from './trajectory-renderer';

/**
 * Fallback target altitude used when there is no active mission (e.g. the
 * result screen) to size the camera against. Matches the original
 * `earth-orbit` profile's `maxAltitude`, so the default view is unchanged.
 */
const DEFAULT_TARGET_ALTITUDE = 400_000;

/**
 * How far beyond the mission's target altitude the camera should show, as a
 * multiple of that altitude. Reproduces the original hard-coded `radius *
 * 2.6` view for the default mission (`600_000 + 400_000 * 2.4 === 600_000 *
 * 2.6`), while scaling with higher- or lower-altitude mission profiles so
 * the trajectory stays comfortably in frame on every profile.
 */
const ALTITUDE_VIEW_MARGIN = 2.4;

/**
 * Builds a camera centered on the world origin (the central body), sized so
 * the planet and the active mission's target altitude both fit comfortably
 * on screen.
 */
export function buildCamera(state: GameState, screen: ScreenSize): Camera {
  const targetAltitude =
    state.activeMission?.successCriteria.maxAltitude ?? DEFAULT_TARGET_ALTITUDE;
  const viewRadius = state.centralBody.radius + targetAltitude * ALTITUDE_VIEW_MARGIN;
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
