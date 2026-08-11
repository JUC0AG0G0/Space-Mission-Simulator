import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hud } from '../../src/ui/Hud';
import { createInitialGameState } from '../../src/simulation/simulation-engine';
import { createSpacecraft } from '../../src/simulation/spacecraft/spacecraft';
import type { GameState } from '../../src/types/simulation';

function makeState(): GameState {
  const state = createInitialGameState();
  const { centralBody } = state;

  return {
    ...state,
    countdown: null,
    spacecraft: {
      ...createSpacecraft({
        id: 'spacecraft-1',
        name: 'Explorer I',
        position: { x: centralBody.radius + 100_000, y: 0 },
        velocity: { x: 0, y: 7_800 },
        heading: 0,
        dryMass: 6_000,
        fuelMass: 1_200,
        maxFuel: 2_400,
        engineThrust: 45_000,
        engineFuelConsumption: 12,
      }),
      engine: {
        thrust: 45_000,
        fuelConsumption: 12,
        active: true,
        throttle: 0.75,
      },
    },
  };
}

describe('Hud', () => {
  it('renders altitude, velocity, fuel, mass and throttle', () => {
    render(<Hud state={makeState()} />);

    expect(screen.getByText('100.0 km')).toBeInTheDocument();
    expect(screen.getByText('7.80 km/s')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('7.2 t')).toBeInTheDocument();
  });

  it('shows the active mission id', () => {
    render(<Hud state={makeState()} />);

    expect(screen.getByText(/MISSION: /)).toHaveTextContent('MISSION: ORBIT-01');
  });

  it('shows a placeholder when there is no active mission', () => {
    render(<Hud state={{ ...makeState(), activeMission: null }} />);

    expect(screen.getByText('MISSION: —')).toBeInTheDocument();
  });

  it('reflects the engine status', () => {
    const state = makeState();
    const { rerender } = render(<Hud state={state} />);
    expect(screen.getByText('ENGINE ONLINE')).toBeInTheDocument();

    const offState: GameState = {
      ...state,
      spacecraft: { ...state.spacecraft, engine: { ...state.spacecraft.engine, active: false } },
    };
    rerender(<Hud state={offState} />);
    expect(screen.getByText('ENGINE OFFLINE')).toBeInTheDocument();
  });

  it('shows FLIGHT once airborne', () => {
    render(<Hud state={makeState()} />);
    expect(screen.getByText('FLIGHT')).toBeInTheDocument();
  });

  it('shows LAUNCH while grounded with the engine on', () => {
    const state = makeState();
    const { centralBody } = state;

    const groundedState: GameState = {
      ...state,
      spacecraft: { ...state.spacecraft, position: { x: centralBody.radius, y: 0 } },
    };
    render(<Hud state={groundedState} />);
    expect(screen.getByText('LAUNCH')).toBeInTheDocument();
  });

  it('shows MISSION COMPLETE once the active mission succeeds', () => {
    const state = makeState();
    const succeededState: GameState = {
      ...state,
      activeMission: state.activeMission
        ? { ...state.activeMission, status: 'succeeded' }
        : null,
    };
    render(<Hud state={succeededState} />);
    expect(screen.getByText('MISSION COMPLETE')).toBeInTheDocument();
  });

  it('shows MISSION FAILED once the active mission fails', () => {
    const state = makeState();
    const failedState: GameState = {
      ...state,
      activeMission: state.activeMission
        ? { ...state.activeMission, status: 'failed' }
        : null,
    };
    render(<Hud state={failedState} />);
    expect(screen.getByText('MISSION FAILED')).toBeInTheDocument();
  });
});
