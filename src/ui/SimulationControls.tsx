import { ALLOWED_TIME_SCALES, type TimeScale } from '../simulation/simulation-engine';

interface SimulationControlsProps {
  paused: boolean;
  onTogglePause: () => void;
  onRestart: () => void;
  timeScale: TimeScale;
  onSetTimeScale: (timeScale: TimeScale) => void;
}

export function SimulationControls({
  paused,
  onTogglePause,
  onRestart,
  timeScale,
  onSetTimeScale,
}: SimulationControlsProps) {
  return (
    <div className="panel simulation-controls">
      <div className="simulation-controls__actions">
        <button type="button" onClick={onTogglePause} aria-pressed={paused}>
          {paused ? 'Resume (P)' : 'Pause (P)'}
        </button>
        <button type="button" onClick={onRestart}>
          Restart mission (R)
        </button>
      </div>
      <div className="simulation-controls__speed" role="group" aria-label="Simulation speed">
        {ALLOWED_TIME_SCALES.map((scale) => (
          <button
            key={scale}
            type="button"
            aria-pressed={timeScale === scale}
            onClick={() => onSetTimeScale(scale)}
          >
            {scale}x
          </button>
        ))}
      </div>
    </div>
  );
}
