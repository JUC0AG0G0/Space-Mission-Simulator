import { useEffect, useRef } from 'react';
import type { MissionProgressEntry } from '../simulation/progression/mission-progress';

interface MainMenuProps {
  hasSavedMission: boolean;
  missionProgress: MissionProgressEntry[];
  onNewMission: () => void;
  onContinue: () => void;
}

export function MainMenu({
  hasSavedMission,
  missionProgress,
  onNewMission,
  onContinue,
}: MainMenuProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move keyboard focus to this screen's heading as soon as it mounts, so a
  // keyboard/screen reader user isn't left stranded on a button that no
  // longer exists in the previous screen's DOM.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="main-menu">
      <h1 className="main-menu__title" ref={headingRef} tabIndex={-1}>
        Space Mission Simulator
      </h1>
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
      <section className="main-menu__progress">
        <h2 className="main-menu__progress-title">Missions</h2>
        <ul className="main-menu__progress-list">
          {missionProgress.map((entry) => (
            <li
              key={entry.id}
              className={
                entry.completed
                  ? 'main-menu__progress-entry main-menu__progress-entry--completed'
                  : 'main-menu__progress-entry'
              }
              aria-label={`${entry.destinationName} — ${entry.completed ? 'Completed' : 'Locked'}`}
            >
              <span className="main-menu__progress-marker" aria-hidden="true">
                {entry.completed ? '✓' : '🔒'}
              </span>
              <span aria-hidden="true">{entry.destinationName}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
