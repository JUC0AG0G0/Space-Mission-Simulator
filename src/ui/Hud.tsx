import type { GameState } from '../types/simulation';
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

export function Hud({ state }: HudProps) {
  const { spacecraft, centralBody } = state;
  const altitude = altitudeAboveSurface(spacecraft, centralBody);
  const speed = magnitude(spacecraft.velocity);
  const fuelPercent =
    spacecraft.maxFuel > 0
      ? Math.round((spacecraft.fuelMass / spacecraft.maxFuel) * 100)
      : 0;
  const throttlePercent = Math.round(spacecraft.engine.throttle * 100);
  const massTonnes = (totalMass(spacecraft) / 1000).toFixed(1);

  return (
    <div className="hud">
      <div className="hud__mission">
        MISSION: {state.activeMission?.id ?? '—'}
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
      <div className="hud__engine">
        ENGINE {spacecraft.engine.active ? 'ONLINE' : 'OFFLINE'}
      </div>
    </div>
  );
}
