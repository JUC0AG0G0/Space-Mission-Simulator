import { useState } from 'react';
import { MainMenu } from '../ui/MainMenu';
import { MissionSetup } from '../ui/MissionSetup';
import { SimulationScreen } from './SimulationScreen';
import {
  createInitialAppState,
  returnToMainMenu,
  startNewMission,
  startSimulation,
} from './app-state';

/**
 * Routes between the main menu, mission setup, and the active simulation.
 * Screen transitions live in `app-state.ts` so they are testable without
 * mounting React or starting a `requestAnimationFrame` loop.
 */
export function App() {
  const [appState, setAppState] = useState(createInitialAppState);

  switch (appState.phase) {
    case 'main-menu':
      return (
        <MainMenu
          hasSavedMission={false}
          onNewMission={() => setAppState(startNewMission)}
          onContinue={() => {}}
        />
      );
    case 'mission-setup':
      return (
        <MissionSetup
          onBack={() => setAppState(returnToMainMenu)}
          onLaunch={(configuration) =>
            setAppState((state) => startSimulation(state, configuration))
          }
        />
      );
    case 'simulation':
      return appState.missionConfiguration ? (
        <SimulationScreen missionConfiguration={appState.missionConfiguration} />
      ) : null;
    default:
      return null;
  }
}
