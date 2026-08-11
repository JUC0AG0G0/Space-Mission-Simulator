import { describe, expect, it } from 'vitest';
import { determineGamePhase } from '../../src/app/game-phase';
import { createInitialGameState } from '../../src/simulation/simulation-engine';
import type { GameState } from '../../src/types/simulation';

function groundedState(engineActive: boolean): GameState {
  const state = createInitialGameState();
  return {
    ...state,
    countdown: null,
    spacecraft: {
      ...state.spacecraft,
      engine: { ...state.spacecraft.engine, active: engineActive },
    },
  };
}

function airborneState(): GameState {
  const state = createInitialGameState();
  return {
    ...state,
    countdown: null,
    spacecraft: {
      ...state.spacecraft,
      position: { x: state.centralBody.radius + 1_000, y: 0 },
      velocity: { x: 0, y: 100 },
    },
  };
}

function stateWithMissionStatus(status: 'succeeded' | 'failed'): GameState {
  const state = airborneState();
  return {
    ...state,
    activeMission: state.activeMission ? { ...state.activeMission, status } : null,
  };
}

describe('determineGamePhase', () => {
  it('is main-menu on the main menu screen, regardless of any game state', () => {
    expect(determineGamePhase('main-menu', null)).toBe('main-menu');
    expect(determineGamePhase('main-menu', createInitialGameState())).toBe('main-menu');
  });

  it('is mission-setup on the mission setup screen, regardless of any game state', () => {
    expect(determineGamePhase('mission-setup', null)).toBe('mission-setup');
    expect(determineGamePhase('mission-setup', createInitialGameState())).toBe('mission-setup');
  });

  it('falls back to pre-launch in the simulation screen with no game state yet', () => {
    expect(determineGamePhase('simulation', null)).toBe('pre-launch');
  });

  it('is pre-launch while the countdown is running', () => {
    const state: GameState = { ...groundedState(false), countdown: { remainingSeconds: 2 } };
    expect(determineGamePhase('simulation', state)).toBe('pre-launch');
  });

  it('is pre-launch once grounded with the engine off and the countdown cleared', () => {
    expect(determineGamePhase('simulation', groundedState(false))).toBe('pre-launch');
  });

  it('is launch once grounded with the engine on', () => {
    expect(determineGamePhase('simulation', groundedState(true))).toBe('launch');
  });

  it('is flight once airborne', () => {
    expect(determineGamePhase('simulation', airborneState())).toBe('flight');
  });

  it('is mission-complete once the active mission succeeds', () => {
    expect(determineGamePhase('simulation', stateWithMissionStatus('succeeded'))).toBe(
      'mission-complete',
    );
  });

  it('is mission-failed once the active mission fails', () => {
    expect(determineGamePhase('simulation', stateWithMissionStatus('failed'))).toBe(
      'mission-failed',
    );
  });
});
