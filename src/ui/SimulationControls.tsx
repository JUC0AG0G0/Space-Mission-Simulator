import { ALLOWED_TIME_SCALES, type TimeScale } from '../simulation/simulation-engine';

interface SimulationControlsProps {
  paused: boolean;
  onTogglePause: () => void;
  onRestart: () => void;
  timeScale: TimeScale;
  onSetTimeScale: (timeScale: TimeScale) => void;
  /** Current throttle, from 0 (idle) to 1 (full thrust). */
  throttle: number;
  onSetThrottle: (throttle: number) => void;
  /** Whether the pre-flight countdown is still holding the engine back. */
  countingDown: boolean;
}

export function SimulationControls({
  paused,
  onTogglePause,
  onRestart,
  timeScale,
  onSetTimeScale,
  throttle,
  onSetThrottle,
  countingDown,
}: SimulationControlsProps) {
  const throttlePercent = Math.round(throttle * 100);

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
      <div className="simulation-controls__throttle">
        <label htmlFor="simulation-controls-throttle">Throttle ({throttlePercent}%)</label>
        <input
          id="simulation-controls-throttle"
          type="range"
          min={0}
          max={100}
          step={1}
          value={throttlePercent}
          disabled={paused || countingDown}
          onChange={(event) => onSetThrottle(Number(event.target.value) / 100)}
        />
      </div>
    </div>
  );
}
