import { describe, expect, it } from 'vitest';
import {
  MAX_TRAJECTORY_POINTS,
  SimulationEngine,
  createInitialGameState,
} from '../src/simulation/simulation-engine';

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
    const engine = new SimulationEngine(createInitialGameState());
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
