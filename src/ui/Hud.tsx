import type { FlightPhase, GameState } from '../types/simulation';
import { determineFlightPhase } from '../simulation/flight-phase';
import { altitudeAboveSurface } from '../simulation/missions/mission';
import { magnitude } from '../simulation/physics/vectors';
import { totalMass } from '../simulation/spacecraft/spacecraft';

interface HudProps {
  state: GameState;
}

function formatKm(meters: number): string {
  return `${(meters / 1000).toFixed(1)} km`;
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
      </dl>
      <div className="hud__engine" role="status" aria-live="polite">
        ENGINE {spacecraft.engine.active ? 'ONLINE' : 'OFFLINE'}
      </div>
    </div>
  );
}
