import type { FlightPhase, GameState } from '../types/simulation';
import { determineFlightPhase } from '../simulation/flight-phase';
import { altitudeAboveSurface } from '../simulation/missions/mission';
import { computeOrbitRadiusBounds } from '../simulation/physics/orbit';
import { magnitude } from '../simulation/physics/vectors';
import { totalMass } from '../simulation/spacecraft/spacecraft';

interface HudProps {
  state: GameState;
}

const MIN_SPEED_FOR_ORBIT_BOUNDS = 1;

function formatKm(meters: number): string {
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatAltitudeOrDash(radius: number | null, planetRadius: number): string {
  return radius === null ? '—' : formatKm(radius - planetRadius);
}

function formatKmPerSec(metersPerSecond: number): string {
  return `${(metersPerSecond / 1000).toFixed(2)} km/s`;
}

function phaseLabel(phase: FlightPhase): string {
  switch (phase) {
    case 'pre-launch':
      return 'PRE-LAUNCH';
    case 'launch':
      return 'LAUNCH';
    case 'flight':
      return 'FLIGHT';
    case 'mission-complete':
      return 'MISSION COMPLETE';
    case 'mission-failed':
      return 'MISSION FAILED';
  }
}

export function Hud({ state }: HudProps) {
  const { spacecraft, centralBody } = state;
  const altitude = altitudeAboveSurface(spacecraft, centralBody);
  const phase = determineFlightPhase({
    countdown: state.countdown,
    spacecraft,
    centralBody,
    activeMission: state.activeMission,
  });
  const speed = magnitude(spacecraft.velocity);
  // maxFuel is always strictly positive for any Spacecraft built by
  // createSpacecraft/the rocket models, so no zero-division guard is needed.
  const fuelPercent = Math.round((spacecraft.fuelMass / spacecraft.maxFuel) * 100);
  const throttlePercent = Math.round(spacecraft.engine.throttle * 100);
  const massTonnes = (totalMass(spacecraft) / 1000).toFixed(1);
  // Below this speed, the angular momentum is too close to zero for
  // periapsis/apoapsis to mean anything (e.g. sitting on the launch pad
  // with velocity {0, 0}) — treat it the same as an unbound trajectory.
  const orbitBounds =
    speed < MIN_SPEED_FOR_ORBIT_BOUNDS
      ? null
      : computeOrbitRadiusBounds(spacecraft.position, spacecraft.velocity, centralBody);
  const apoapsisLabel = formatAltitudeOrDash(orbitBounds?.apoapsis ?? null, centralBody.radius);
  const periapsisLabel = formatAltitudeOrDash(orbitBounds?.periapsis ?? null, centralBody.radius);

  return (
    <div className="hud">
      <div className="hud__mission">
        MISSION: {state.activeMission?.name ?? '—'}
      </div>
      <div
        className={`hud__phase hud__phase--${phase}`}
        role="status"
        aria-live="polite"
      >
        {phaseLabel(phase)}
      </div>
      <dl className="hud__grid">
        <dt>ALTITUDE</dt>
        <dd>{formatKm(altitude)}</dd>

        <dt>VELOCITY</dt>
        <dd>{formatKmPerSec(speed)}</dd>

        <dt>FUEL</dt>
        <dd>{fuelPercent}%</dd>

        <dt>MASS</dt>
        <dd>{massTonnes} t</dd>

        <dt>THROTTLE</dt>
        <dd>{throttlePercent}%</dd>

        <dt>APOAPSIS</dt>
        <dd>{apoapsisLabel}</dd>

        <dt>PERIAPSIS</dt>
        <dd>{periapsisLabel}</dd>
      </dl>
      <div className="hud__engine" role="status" aria-live="polite">
        ENGINE {spacecraft.engine.active ? 'ONLINE' : 'OFFLINE'}
      </div>
    </div>
  );
}
