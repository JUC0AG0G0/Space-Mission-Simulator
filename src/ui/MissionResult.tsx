import type { MissionResultStats } from '../simulation/missions/mission-result';

interface MissionResultProps {
  stats: MissionResultStats;
  onMenu: () => void;
  onReplay: () => void;
}

function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

/**
 * Shown once the active mission has succeeded or failed, in place of the
 * flight `Hud`. All figures come from `MissionResultStats`, itself derived
 * from `GameState` — nothing here is recomputed from raw simulation data.
 */
export function MissionResult({ stats, onMenu, onReplay }: MissionResultProps) {
  return (
    <div className="mission-result">
      <h1
        className={`mission-result__title mission-result__title--${
          stats.succeeded ? 'success' : 'failure'
        }`}
      >
        {stats.succeeded ? 'MISSION COMPLETE' : 'MISSION FAILED'}
      </h1>

      {!stats.succeeded && stats.failureCause && (
        <div className="mission-result__cause">
          <span>Cause</span>
          <p>{stats.failureCause}</p>
        </div>
      )}

      <dl className="mission-result__summary">
        <dt>Mission</dt>
        <dd>{stats.missionName}</dd>
        <dt>Spacecraft</dt>
        <dd>{stats.spacecraftName}</dd>
        <dt>Mission time</dt>
        <dd>{formatDuration(stats.missionTimeSeconds)}</dd>
        <dt>Max altitude</dt>
        <dd>{(stats.maxAltitude / 1000).toFixed(0)} km</dd>
        <dt>Max speed</dt>
        <dd>{(stats.maxSpeed / 1000).toFixed(1)} km/s</dd>
      </dl>

      <ul className="mission-result__objectives">
        {stats.objectives.map((objective) => (
          <li
            key={objective.id}
            className={objective.completed ? 'objective objective--done' : 'objective'}
          >
            <span className="objective__marker">{objective.completed ? '✓' : '○'}</span>
            {objective.description}
          </li>
        ))}
      </ul>

      <div className="mission-result__actions">
        <button type="button" onClick={onMenu}>
          Back to menu
        </button>
        <button type="button" onClick={onReplay}>
          Replay
        </button>
      </div>
    </div>
  );
}
