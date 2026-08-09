interface MissionSetupProps {
  onBack: () => void;
  onLaunch: () => void;
}

export function MissionSetup({ onBack, onLaunch }: MissionSetupProps) {
  return (
    <div className="mission-setup">
      <h1 className="mission-setup__title">Mission setup</h1>
      <p className="mission-setup__placeholder">
        Mission configuration is coming soon. For now, launch with the default
        mission.
      </p>
      <div className="mission-setup__actions">
        <button type="button" onClick={onBack}>
          Back
        </button>
        <button type="button" onClick={onLaunch}>
          Launch mission
        </button>
      </div>
    </div>
  );
}
