const CONTROLS: Array<{ keys: string; action: string }> = [
  { keys: 'W / ↑', action: 'Increase throttle' },
  { keys: 'S / ↓', action: 'Decrease throttle' },
  { keys: 'A / ←', action: 'Turn left' },
  { keys: 'D / →', action: 'Turn right' },
  { keys: 'SPACE', action: 'Engine ON / OFF' },
  { keys: 'P', action: 'Pause' },
  { keys: 'R', action: 'Restart mission' },
];

export function ControlsPanel() {
  return (
    <div className="panel controls-panel">
      <h2>Controls</h2>
      <ul>
        {CONTROLS.map((control) => (
          <li key={control.keys}>
            <kbd>{control.keys}</kbd>
            <span>{control.action}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
