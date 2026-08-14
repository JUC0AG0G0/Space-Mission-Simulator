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

  it('shows the active mission name', () => {
    render(<Hud state={makeState()} />);

    expect(screen.getByText(/MISSION: /)).toHaveTextContent('MISSION: Orbit-01');
  });

  it('shows the custom mission name when the mission was renamed', () => {
    const state = makeState();
    const renamedState: GameState = {
      ...state,
      activeMission: state.activeMission
        ? { ...state.activeMission, name: 'Mission 01' }
        : null,
    };
    render(<Hud state={renamedState} />);

    expect(screen.getByText(/MISSION: /)).toHaveTextContent('MISSION: Mission 01');
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

  it('shows the apoapsis and periapsis of a closed orbit', () => {
    const state = makeState();
    const { centralBody } = state;
    // Circular orbit: periapsis and apoapsis both equal the current radius.
    const radius = centralBody.radius + 100_000;
    const circularSpeed = Math.sqrt(centralBody.gravitationalParameter / radius);
    const circularState: GameState = {
      ...state,
      spacecraft: {
        ...state.spacecraft,
        position: { x: radius, y: 0 },
        velocity: { x: 0, y: circularSpeed },
      },
    };

    render(<Hud state={circularState} />);

    expect(screen.getByText('APOAPSIS')).toBeInTheDocument();
    expect(screen.getByText('PERIAPSIS')).toBeInTheDocument();
    expect(screen.getAllByText('100.0 km').length).toBeGreaterThanOrEqual(2);
  });

  it('shows a dash placeholder for apoapsis/periapsis on an escape trajectory', () => {
    const state = makeState();
    const { centralBody } = state;
    const radius = centralBody.radius + 100_000;
    const escapeSpeed = Math.sqrt((2 * centralBody.gravitationalParameter) / radius);
    const escapingState: GameState = {
      ...state,
      spacecraft: {
        ...state.spacecraft,
        position: { x: radius, y: 0 },
        velocity: { x: 0, y: escapeSpeed + 1 },
      },
    };

    render(<Hud state={escapingState} />);

    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
  });

  it('shows a dash placeholder for apoapsis/periapsis while sitting still on the pad', () => {
    // The exact state a player sees right at LIFTOFF, before touching the
    // controls: velocity is {0, 0}, so angular momentum is zero and orbit
    // bounds are degenerate (periapsis 0 / apoapsis at the planet's center).
    const state = createInitialGameState();

    render(<Hud state={{ ...state, countdown: null }} />);

    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
  });

  it('exposes the flight phase as an assertive-free live region so screen readers announce it', () => {
    render(<Hud state={makeState()} />);
    const regions = screen.getAllByRole('status');
    const phaseRegion = regions.find((region) => region.textContent === 'FLIGHT');
    expect(phaseRegion).toHaveAttribute('aria-live', 'polite');
    expect(phaseRegion).toHaveTextContent('FLIGHT');
  });

  it('keeps announcing the live region as the flight phase changes', () => {
    const state = makeState();
    const { rerender } = render(<Hud state={state} />);
    expect(
      screen.getAllByRole('status').find((region) => region.textContent === 'FLIGHT'),
    ).toBeDefined();

    const failedState: GameState = {
      ...state,
      activeMission: state.activeMission
        ? { ...state.activeMission, status: 'failed' }
        : null,
    };
    rerender(<Hud state={failedState} />);
    expect(
      screen.getAllByRole('status').find((region) => region.textContent === 'MISSION FAILED'),
    ).toBeDefined();
  });

  it('exposes the engine status as a live region so screen readers announce automatic shutdowns', () => {
    render(<Hud state={makeState()} />);
    const regions = screen.getAllByRole('status');
    const engineRegion = regions.find((region) => region.textContent === 'ENGINE ONLINE');
    expect(engineRegion).toHaveAttribute('aria-live', 'polite');
    expect(engineRegion).toHaveTextContent('ENGINE ONLINE');
  });

  it('keeps announcing the engine live region when the engine turns off automatically', () => {
    const state = makeState();
    const { rerender } = render(<Hud state={state} />);
    expect(
      screen.getAllByRole('status').find((region) => region.textContent === 'ENGINE ONLINE'),
    ).toBeDefined();

    const offState: GameState = {
      ...state,
      spacecraft: { ...state.spacecraft, engine: { ...state.spacecraft.engine, active: false } },
    };
    rerender(<Hud state={offState} />);
    expect(
      screen.getAllByRole('status').find((region) => region.textContent === 'ENGINE OFFLINE'),
    ).toBeDefined();
  });
});
