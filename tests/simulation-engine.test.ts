import { describe, expect, it } from 'vitest';
import {
  MAX_TRAJECTORY_POINTS,
  SimulationEngine,
  createInitialGameState,
} from '../src/simulation/simulation-engine';
import { createSpacecraft } from '../src/simulation/spacecraft/spacecraft';
import type { GameState } from '../src/types/simulation';
import { createDefaultMissionConfiguration } from '../src/simulation/missions/mission-configuration';

/**
 * A game state whose spacecraft sits below the surface (negative altitude),
 * so the very first `step()` causes the mission to fail (crash).
 */
function createCrashedStartState(): GameState {
  const state = createInitialGameState();
  const { centralBody } = state;

  return {
    ...state,
    spacecraft: createSpacecraft({
      id: 'spacecraft-1',
      name: 'Explorer I',
      position: { x: centralBody.radius - 10, y: 0 },
      velocity: { x: 0, y: 0 },
      heading: 0,
      dryMass: 6_000,
      fuelMass: 2_400,
      maxFuel: 2_400,
      engineThrust: 45_000,
      engineFuelConsumption: 12,
    }),
  };
}

/**
 * A game state whose spacecraft holds a stable circular orbit below the
 * mission's target altitude range, so it neither crashes nor completes the
 * mission (which would also freeze the simulation) within a test run.
 */
function createStableOrbitState(): GameState {
  const state = createInitialGameState();
  const { centralBody } = state;
  const radius = centralBody.radius + 50_000; // below ORBIT_MIN_ALTITUDE
  const orbitalSpeed = Math.sqrt(
    centralBody.gravitationalParameter / radius,
  );

  return {
    ...state,
    spacecraft: {
      ...state.spacecraft,
      position: { x: radius, y: 0 },
      velocity: { x: 0, y: orbitalSpeed },
    },
  };
}

describe('createInitialGameState starts the spacecraft on the surface', () => {
  it('positions the spacecraft exactly at the surface of the central body', () => {
    const state = createInitialGameState();
    const { spacecraft, centralBody } = state;

    expect(Math.hypot(spacecraft.position.x, spacecraft.position.y)).toBeCloseTo(
      centralBody.radius,
      8,
    );
  });

  it('starts with zero velocity', () => {
    const state = createInitialGameState();
    expect(state.spacecraft.velocity).toEqual({ x: 0, y: 0 });
  });

  it('is oriented radially outward, away from the surface', () => {
    const state = createInitialGameState();
    const { spacecraft } = state;

    expect(Math.cos(spacecraft.heading)).toBeCloseTo(
      spacecraft.position.x / Math.hypot(spacecraft.position.x, spacecraft.position.y),
      8,
    );
    expect(Math.sin(spacecraft.heading)).toBeCloseTo(
      spacecraft.position.y / Math.hypot(spacecraft.position.x, spacecraft.position.y),
      8,
    );
  });

  it('starts with full fuel and the engine off', () => {
    const state = createInitialGameState();
    expect(state.spacecraft.fuelMass).toBe(state.spacecraft.maxFuel);
    expect(state.spacecraft.engine.active).toBe(false);
  });
});

describe('SimulationEngine keeps a grounded, engine-off spacecraft parked on the pad', () => {
  it('does not move or crash the mission while resting with the engine off', () => {
    const engine = new SimulationEngine(createInitialGameState());
    const initialSpacecraft = engine.getState().spacecraft;

    engine.step(1);
    engine.step(1);
    engine.step(1);

    expect(engine.getState().spacecraft.position).toEqual(initialSpacecraft.position);
    expect(engine.getState().spacecraft.velocity).toEqual(initialSpacecraft.velocity);
    expect(engine.getState().activeMission?.status).toBe('active');
  });

  it('lifts off once the engine is activated', () => {
    const engine = new SimulationEngine(createInitialGameState());
    const { centralBody } = engine.getState();
    engine.applyCommand({ toggleEngine: true }, 0);

    for (let i = 0; i < 10; i += 1) {
      engine.step(0.5);
    }

    const { spacecraft } = engine.getState();
    const altitude = Math.hypot(spacecraft.position.x, spacecraft.position.y) - centralBody.radius;
    expect(altitude).toBeGreaterThan(0);
  });
});

describe('createInitialGameState with a mission configuration', () => {
  it('defaults to "Explorer I" and "Orbit-01" when no configuration is given', () => {
    const state = createInitialGameState();
    expect(state.spacecraft.name).toBe('Explorer I');
    expect(state.activeMission?.name).toBe('Orbit-01');
  });

  it('names the spacecraft and mission after the given configuration', () => {
    const configuration = {
      ...createDefaultMissionConfiguration(),
      missionName: 'Ares 1',
      spacecraftName: 'Falcon',
    };

    const state = createInitialGameState(configuration);

    expect(state.spacecraft.name).toBe('Falcon');
    expect(state.activeMission?.name).toBe('Ares 1');
  });
});

describe('SimulationEngine time progression', () => {
  it('advances simulationTime by deltaTime on each step', () => {
    const engine = new SimulationEngine(createInitialGameState());
    engine.step(1);
    engine.step(0.5);
    expect(engine.getState().simulationTime).toBeCloseTo(1.5, 8);
  });

  it('does not advance simulationTime while paused', () => {
    const engine = new SimulationEngine(createInitialGameState());
    engine.setPaused(true);
    engine.step(1);
    expect(engine.getState().simulationTime).toBe(0);
  });

  it('resumes advancing time after unpausing', () => {
    const engine = new SimulationEngine(createInitialGameState());
    engine.setPaused(true);
    engine.step(1);
    engine.togglePause();
    engine.step(1);
    expect(engine.getState().simulationTime).toBeCloseTo(1, 8);
  });
});

describe('SimulationEngine determinism', () => {
  it('produces identical spacecraft state for two engines given identical commands', () => {
    const engineA = new SimulationEngine(createInitialGameState());
    const engineB = new SimulationEngine(createInitialGameState());

    const commands = [
      { throttleDelta: 1 },
      { turnDelta: 1 },
      { toggleEngine: true },
      {},
      { turnDelta: -1 },
    ];

    for (const command of commands) {
      engineA.applyCommand(command, 0.1);
      engineA.step(0.1);
      engineB.applyCommand(command, 0.1);
      engineB.step(0.1);
    }

    expect(engineA.getState().spacecraft).toEqual(engineB.getState().spacecraft);
    expect(engineA.getState().simulationTime).toEqual(engineB.getState().simulationTime);
  });
});

describe('SimulationEngine commands', () => {
  it('turns the spacecraft heading based on turnDelta over time', () => {
    const engine = new SimulationEngine(createInitialGameState());
    const initialHeading = engine.getState().spacecraft.heading;
    engine.applyCommand({ turnDelta: 1 }, 1);
    expect(engine.getState().spacecraft.heading).toBeGreaterThan(initialHeading);
  });

  it('toggles the engine on and off', () => {
    const engine = new SimulationEngine(createInitialGameState());
    expect(engine.getState().spacecraft.engine.active).toBe(false);
    engine.applyCommand({ toggleEngine: true }, 0);
    expect(engine.getState().spacecraft.engine.active).toBe(true);
    engine.applyCommand({ toggleEngine: true }, 0);
    expect(engine.getState().spacecraft.engine.active).toBe(false);
  });
});

describe('SimulationEngine trajectory recording', () => {
  it('adds a trajectory point per step, in chronological order', () => {
    const engine = new SimulationEngine(createInitialGameState());
    engine.step(1);
    engine.step(1);
    engine.step(1);

    const { trajectory } = engine.getState();
    expect(trajectory).toHaveLength(3);
    expect(trajectory[0].time).toBeLessThan(trajectory[1].time);
    expect(trajectory[1].time).toBeLessThan(trajectory[2].time);
  });

  it('caps trajectory history at MAX_TRAJECTORY_POINTS', () => {
    const engine = new SimulationEngine(createStableOrbitState());
    for (let i = 0; i < MAX_TRAJECTORY_POINTS + 50; i += 1) {
      engine.step(0.5);
    }

    expect(engine.getState().trajectory.length).toBe(MAX_TRAJECTORY_POINTS);
  });

  it('does not record a trajectory point while paused', () => {
    const engine = new SimulationEngine(createInitialGameState());
    engine.setPaused(true);
    engine.step(1);
    expect(engine.getState().trajectory).toHaveLength(0);
  });
});

describe('SimulationEngine mission end freezes the simulation', () => {
  it('stops integrating physics once the mission fails', () => {
    const engine = new SimulationEngine(createCrashedStartState());

    engine.step(1);
    expect(engine.getState().activeMission?.status).toBe('failed');

    const frozenState = engine.getState();
    engine.step(1);
    engine.step(1);

    expect(engine.getState().simulationTime).toBe(frozenState.simulationTime);
    expect(engine.getState().spacecraft).toEqual(frozenState.spacecraft);
    expect(engine.getState().trajectory).toEqual(frozenState.trajectory);
  });

  it('ignores flight commands once the mission fails', () => {
    const engine = new SimulationEngine(createCrashedStartState());
    engine.step(1);
    expect(engine.getState().activeMission?.status).toBe('failed');

    const headingBefore = engine.getState().spacecraft.heading;
    engine.applyCommand({ turnDelta: 1, toggleEngine: true }, 1);

    expect(engine.getState().spacecraft.heading).toBe(headingBefore);
    expect(engine.getState().spacecraft.engine.active).toBe(false);
  });

  it('resumes accepting commands and physics after reset', () => {
    const engine = new SimulationEngine(createCrashedStartState());
    engine.step(1);
    expect(engine.getState().activeMission?.status).toBe('failed');

    engine.reset();

    expect(engine.getState().activeMission?.status).toBe('active');
    engine.applyCommand({ toggleEngine: true }, 0);
    expect(engine.getState().spacecraft.engine.active).toBe(true);
  });
});

describe('SimulationEngine reset', () => {
  it('restores a fresh initial state', () => {
    const engine = new SimulationEngine(createInitialGameState());
    engine.step(5);
    engine.applyCommand({ toggleEngine: true }, 0);

    engine.reset();

    const state = engine.getState();
    expect(state.simulationTime).toBe(0);
    expect(state.trajectory).toHaveLength(0);
    expect(state.spacecraft.engine.active).toBe(false);
  });
});
