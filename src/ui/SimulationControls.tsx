interface SimulationControlsProps {
  paused: boolean;
  onTogglePause: () => void;
  onRestart: () => void;
}

export function SimulationControls({
  paused,
  onTogglePause,
  onRestart,
}: SimulationControlsProps) {
  return (
    <div className="panel simulation-controls">
      <button type="button" onClick={onTogglePause}>
        {paused ? 'Resume (P)' : 'Pause (P)'}
      </button>
      <button type="button" onClick={onRestart}>
        Restart mission (R)
      </button>
    </div>
  );
}
