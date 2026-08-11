import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SimulationScreen } from '../../src/app/SimulationScreen';
import { SimulationEngine, createInitialGameState } from '../../src/simulation/simulation-engine';
import { createDefaultMissionConfiguration } from '../../src/simulation/missions/mission-configuration';
import { DEFAULT_ORBIT_SUCCESS_CRITERIA } from '../../src/simulation/missions/mission';
import { loadCompletedMissionIds } from '../../src/simulation/progression/mission-progress';
import { createMemoryStorage } from '../test-utils/memory-storage';
import type { GameState } from '../../src/types/simulation';

/**
 * Replaces `requestAnimationFrame`/`cancelAnimationFrame` with a
 * manually-driven stand-in so the game loop can be advanced by exact,
 * deterministic amounts instead of waiting on real animation frames (which
 * would make clearing the multi-second pre-flight countdown far too slow
 * and flaky in tests).
 */
function mockAnimationFrame() {
  let pending: FrameRequestCallback | null = null;
  let time = 0;

  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((callback: FrameRequestCallback) => {
      pending = callback;
      return 1;
    }),
  );
  vi.stubGlobal(
    'cancelAnimationFrame',
    vi.fn(() => {
      pending = null;
    }),
  );

  return {
    /** Runs the next queued frame with the clock advanced by `deltaMs`. */
    advance(deltaMs: number) {
      time += deltaMs;
      const callback = pending;
      pending = null;
      act(() => {
        callback?.(time);
      });
    },
  };
}

function renderScreen(onExit: () => void = () => {}) {
  const frame = mockAnimationFrame();
  render(
    <SimulationScreen
      missionConfiguration={createDefaultMissionConfiguration()}
      onExit={onExit}
    />,
  );
  return frame;
}

/** Runs enough frames to clear the pre-flight countdown, each capped at the
 * screen's per-frame delta limit, well past the 3-second countdown. */
function clearCountdown(frame: ReturnType<typeof mockAnimationFrame>) {
  frame.advance(0);
  for (let i = 0; i < 15; i++) {
    frame.advance(300);
  }
}

describe('SimulationScreen', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('gates the flight HUD behind the pre-flight countdown', () => {
    renderScreen();

    expect(screen.getByText('MISSION READY')).toBeInTheDocument();
    expect(screen.queryByText(/ENGINE/)).not.toBeInTheDocument();
  });

  it('does not toggle the engine on SPACE while the countdown is still running', () => {
    renderScreen();

    fireEvent.keyDown(window, { key: ' ' });

    expect(screen.getByText('MISSION READY')).toBeInTheDocument();
  });

  it('toggles the engine on SPACE once the countdown has cleared', () => {
    const frame = renderScreen();
    clearCountdown(frame);
    expect(screen.getByText('ENGINE OFFLINE')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: ' ' });
    frame.advance(16);

    expect(screen.getByText('ENGINE ONLINE')).toBeInTheDocument();
  });

  it('pauses and resumes on P regardless of the countdown', () => {
    const frame = renderScreen();
    expect(screen.getByRole('button', { name: 'Pause (P)' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'p' });
    frame.advance(16);
    expect(screen.getByRole('button', { name: 'Resume (P)' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'p' });
    frame.advance(16);
    expect(screen.getByRole('button', { name: 'Pause (P)' })).toBeInTheDocument();
  });

  it('resets to the launch-pad state on R, including the countdown', () => {
    const frame = renderScreen();
    clearCountdown(frame);

    fireEvent.keyDown(window, { key: ' ' });
    frame.advance(16);
    expect(screen.getByText('ENGINE ONLINE')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'r' });
    frame.advance(16);

    expect(screen.getByText('MISSION READY')).toBeInTheDocument();
  });

  it('does not reset on Ctrl+R / Cmd+R, leaving the browser refresh shortcut alone', () => {
    const frame = renderScreen();
    clearCountdown(frame);

    fireEvent.keyDown(window, { key: ' ' });
    frame.advance(16);
    expect(screen.getByText('ENGINE ONLINE')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'r', ctrlKey: true });
    frame.advance(16);
    expect(screen.getByText('ENGINE ONLINE')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'r', metaKey: true });
    frame.advance(16);
    expect(screen.getByText('ENGINE ONLINE')).toBeInTheDocument();
  });

  it('does not toggle pause on Ctrl+P / Cmd+P, leaving the browser print shortcut alone', () => {
    const frame = renderScreen();
    clearCountdown(frame);
    expect(screen.getByRole('button', { name: 'Pause (P)' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'p', ctrlKey: true });
    frame.advance(16);
    expect(screen.getByRole('button', { name: 'Pause (P)' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'p', metaKey: true });
    frame.advance(16);
    expect(screen.getByRole('button', { name: 'Pause (P)' })).toBeInTheDocument();
  });

  it('transitions from PRE-LAUNCH to FLIGHT once the engine ignites and the ship clears the pad', () => {
    const frame = renderScreen();
    clearCountdown(frame);
    expect(screen.getByText('PRE-LAUNCH')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: ' ' });
    for (let i = 0; i < 30; i += 1) {
      frame.advance(200);
    }

    expect(screen.getByText('FLIGHT')).toBeInTheDocument();
  });

  it('does not apply a continuous-movement command on keydown itself, only once the game loop processes it', () => {
    const frame = renderScreen();
    clearCountdown(frame);

    const applyCommandSpy = vi.spyOn(SimulationEngine.prototype, 'applyCommand');
    applyCommandSpy.mockClear();

    fireEvent.keyDown(window, { key: 'w' });
    expect(applyCommandSpy).not.toHaveBeenCalled();

    frame.advance(16);

    expect(applyCommandSpy).toHaveBeenCalledTimes(1);
    const [command] = applyCommandSpy.mock.calls[0];
    expect(command.throttleDelta).toBe(1);

    applyCommandSpy.mockRestore();
  });

  it('shows the mission result screen once the mission fails, and returns to the menu from it', async () => {
    const user = userEvent.setup();
    const onExit = vi.fn();
    const frame = renderScreen(onExit);

    const failedState: GameState = {
      ...createInitialGameState(createDefaultMissionConfiguration()),
      countdown: null,
      simulationTime: 42,
      maxAltitude: 1_000,
      maxSpeed: 50,
      activeMission: {
        id: 'ORBIT-01',
        name: 'Mission 01',
        description: 'Reach a stable orbit.',
        status: 'failed',
        objectives: [],
        successCriteria: DEFAULT_ORBIT_SUCCESS_CRITERIA,
      },
    };
    const getStateSpy = vi
      .spyOn(SimulationEngine.prototype, 'getState')
      .mockReturnValue(failedState);

    frame.advance(16);

    expect(screen.getByText('MISSION FAILED')).toBeInTheDocument();
    expect(screen.queryByText(/ENGINE/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back to menu' }));
    expect(onExit).toHaveBeenCalledTimes(1);

    getStateSpy.mockRestore();
  });

  it('resets the engine when "Replay" is clicked from the mission result screen', () => {
    const frame = renderScreen();

    const succeededState: GameState = {
      ...createInitialGameState(createDefaultMissionConfiguration()),
      countdown: null,
      activeMission: {
        id: 'ORBIT-01',
        name: 'Mission 01',
        description: 'Reach a stable orbit.',
        status: 'succeeded',
        objectives: [],
        successCriteria: DEFAULT_ORBIT_SUCCESS_CRITERIA,
      },
    };
    const getStateSpy = vi
      .spyOn(SimulationEngine.prototype, 'getState')
      .mockReturnValue(succeededState);
    frame.advance(16);
    expect(screen.getByText('MISSION COMPLETE')).toBeInTheDocument();

    const resetSpy = vi.spyOn(SimulationEngine.prototype, 'reset');
    fireEvent.click(screen.getByRole('button', { name: 'Replay' }));
    expect(resetSpy).toHaveBeenCalledTimes(1);

    resetSpy.mockRestore();
    getStateSpy.mockRestore();
  });

  it('records the mission profile as completed once the mission succeeds', () => {
    const frame = renderScreen();
    const missionConfiguration = createDefaultMissionConfiguration();

    expect(loadCompletedMissionIds()).not.toContain(missionConfiguration.missionProfileId);

    const succeededState: GameState = {
      ...createInitialGameState(missionConfiguration),
      countdown: null,
      activeMission: {
        id: 'ORBIT-01',
        name: 'Mission 01',
        description: 'Reach a stable orbit.',
        status: 'succeeded',
        objectives: [],
        successCriteria: DEFAULT_ORBIT_SUCCESS_CRITERIA,
      },
    };
    const getStateSpy = vi
      .spyOn(SimulationEngine.prototype, 'getState')
      .mockReturnValue(succeededState);
    frame.advance(16);

    expect(loadCompletedMissionIds()).toContain(missionConfiguration.missionProfileId);

    getStateSpy.mockRestore();
  });
});
