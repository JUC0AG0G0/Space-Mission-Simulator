import { useState } from 'react';
import { MainMenu } from '../ui/MainMenu';
import { MissionSetup } from '../ui/MissionSetup';
import { SimulationScreen } from './SimulationScreen';
import {
  continueSavedMission,
  createInitialAppState,
  exitSimulation,
  returnToMainMenu,
  startNewMission,
  startSimulation,
} from './app-state';
import { loadSavedMission, saveMission } from '../simulation/persistence/mission-save';

/**
 * Routes between the main menu, mission setup, and the active simulation.
 * Screen transitions live in `app-state.ts` so they are testable without
 * mounting React or starting a `requestAnimationFrame` loop.
 */
export function App() {
  const [appState, setAppState] = useState(createInitialAppState);
  const savedMission = loadSavedMission();

  switch (appState.phase) {
    case 'main-menu':
      return (
        <MainMenu
          hasSavedMission={savedMission !== null}
          onNewMission={() => setAppState(startNewMission)}
          onContinue={() => {
            if (savedMission) {
              setAppState((state) => continueSavedMission(state, savedMission));
            }
          }}
        />
      );
    case 'mission-setup':
      return (
        <MissionSetup
          onBack={() => setAppState(returnToMainMenu)}
          onLaunch={(configuration) => {
            saveMission(configuration);
            setAppState((state) => startSimulation(state, configuration));
          }}
        />
      );
    case 'simulation':
      return appState.missionConfiguration ? (
        <SimulationScreen
          missionConfiguration={appState.missionConfiguration}
          onExit={() => setAppState(exitSimulation)}
        />
      ) : null;
    default:
      return null;
  }
}
