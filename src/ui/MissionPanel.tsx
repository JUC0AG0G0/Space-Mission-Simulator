import type { Mission } from '../types/simulation';

interface MissionPanelProps {
  mission: Mission | null;
}

function statusLabel(status: Mission['status']): string {
  switch (status) {
    case 'succeeded':
      return 'SUCCESS';
    case 'failed':
      return 'FAILED';
    default:
      return 'IN PROGRESS';
  }
}

export function MissionPanel({ mission }: MissionPanelProps) {
  if (!mission) {
    return (
      <div className="panel mission-panel">
        <h2>Mission</h2>
        <p>No active mission.</p>
      </div>
    );
  }

  return (
    <div className={`panel mission-panel mission-panel--${mission.status}`}>
      <h2>
        {mission.name}{' '}
        <span
          className="mission-panel__status"
          role="status"
          aria-live="polite"
        >
          {statusLabel(mission.status)}
        </span>
      </h2>
      <p>{mission.description}</p>
      <div role="status" aria-live="polite">
        <ul>
          {mission.objectives.map((objective) => (
            <li
              key={objective.id}
              className={objective.completed ? 'objective objective--done' : 'objective'}
            >
              <span className="objective__marker">{objective.completed ? '✓' : '○'}</span>
              {objective.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
