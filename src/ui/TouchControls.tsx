type HoldKey = 'w' | 's' | 'a' | 'd';

interface TouchControlsProps {
  /** Whether the spacecraft engine is currently on, mirrored from `Hud`. */
  engineActive: boolean;
  onEngineToggle: () => void;
  onHoldChange: (key: HoldKey, active: boolean) => void;
}

const HOLD_BUTTONS: Array<{ key: HoldKey; label: string; symbol: string; className: string }> = [
  { key: 'a', label: 'Turn left', symbol: '◀', className: 'left' },
  { key: 'w', label: 'Throttle up', symbol: '▲', className: 'up' },
  { key: 's', label: 'Throttle down', symbol: '▼', className: 'down' },
  { key: 'd', label: 'Turn right', symbol: '▶', className: 'right' },
];

/**
 * On-screen touch equivalent of the keyboard flight controls (WASD/arrows +
 * SPACE). Only visible on coarse-pointer devices, via the `pointer: coarse`
 * media query in styles.css — the DOM is always present so it stays simple
 * to test, but a mouse-driven desktop never sees it.
 */
export function TouchControls({ engineActive, onEngineToggle, onHoldChange }: TouchControlsProps) {
  return (
    <div className="touch-controls">
      <div className="touch-controls__movement">
        {HOLD_BUTTONS.map(({ key, label, symbol, className }) => (
          <button
            key={key}
            type="button"
            className={`touch-controls__button touch-controls__button--${className}`}
            aria-label={label}
            onPointerDown={(event) => {
              event.preventDefault();
              onHoldChange(key, true);
            }}
            onPointerUp={() => onHoldChange(key, false)}
            onPointerCancel={() => onHoldChange(key, false)}
            onPointerLeave={() => onHoldChange(key, false)}
          >
            <span aria-hidden="true">{symbol}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className={`touch-controls__button touch-controls__button--engine${
          engineActive ? ' touch-controls__button--engine-active' : ''
        }`}
        aria-pressed={engineActive}
        onClick={onEngineToggle}
      >
        {engineActive ? 'ENGINE ON' : 'ENGINE OFF'}
      </button>
    </div>
  );
}
