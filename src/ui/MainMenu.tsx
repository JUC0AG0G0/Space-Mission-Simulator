interface MainMenuProps {
  hasSavedMission: boolean;
  onNewMission: () => void;
  onContinue: () => void;
}

export function MainMenu({ hasSavedMission, onNewMission, onContinue }: MainMenuProps) {
  return (
    <div className="main-menu">
      <h1 className="main-menu__title">Space Mission Simulator</h1>
      <nav className="main-menu__actions">
        <button type="button" onClick={onNewMission}>
          New mission
        </button>
        {hasSavedMission && (
          <button type="button" onClick={onContinue}>
            Continue
          </button>
        )}
        <button type="button" disabled>
          Options
        </button>
      </nav>
    </div>
  );
}
