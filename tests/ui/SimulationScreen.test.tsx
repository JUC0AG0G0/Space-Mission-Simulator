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
    // The Hud (with its "ENGINE ONLINE"/"ENGINE OFFLINE" status) is swapped
    // out for the CountdownOverlay during the countdown; the on-screen touch
    // Engine button is unrelated and stays mounted throughout, so it's not
    // a signal of the flight HUD being active.
    expect(screen.queryByText('ENGINE ONLINE')).not.toBeInTheDocument();
    expect(screen.queryByText('ENGINE OFFLINE')).not.toBeInTheDocument();
  });

  it('exposes the flight canvas to assistive technology by its accessible name', () => {
    renderScreen();

    expect(
      screen.getByRole('img', { name: /flight visualization/i }),
    ).toBeInTheDocument();
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

  it('does not hijack Ctrl/Cmd+A, +S, or +D, leaving the browser shortcuts alone', () => {
    const frame = renderScreen();
    clearCountdown(frame);

    const applyCommandSpy = vi.spyOn(SimulationEngine.prototype, 'applyCommand');
    applyCommandSpy.mockClear();

    fireEvent.keyDown(window, { key: 'a', ctrlKey: true });
    fireEvent.keyDown(window, { key: 's', metaKey: true });
    fireEvent.keyDown(window, { key: 'd', metaKey: true });
    frame.advance(16);

    expect(applyCommandSpy).toHaveBeenCalledTimes(1);
    const [command] = applyCommandSpy.mock.calls[0];
    expect(command.throttleDelta).toBe(0);
    expect(command.turnDelta).toBe(0);

    applyCommandSpy.mockRestore();
  });

  it('ignores OS key-repeat on SPACE, toggling the engine only once per physical press', () => {
    const frame = renderScreen();
    clearCountdown(frame);
    expect(screen.getByText('ENGINE OFFLINE')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: ' ' });
    fireEvent.keyDown(window, { key: ' ', repeat: true });
    fireEvent.keyDown(window, { key: ' ', repeat: true });
    frame.advance(16);

    expect(screen.getByText('ENGINE ONLINE')).toBeInTheDocument();
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

  it('stops applying a continuous-movement command once the key is released', () => {
    const frame = renderScreen();
    clearCountdown(frame);

    const applyCommandSpy = vi.spyOn(SimulationEngine.prototype, 'applyCommand');
    applyCommandSpy.mockClear();

    fireEvent.keyDown(window, { key: 'w' });
    frame.advance(16);

    expect(applyCommandSpy).toHaveBeenCalledTimes(1);
    expect(applyCommandSpy.mock.calls[0][0].throttleDelta).toBe(1);

    fireEvent.keyUp(window, { key: 'w' });
    frame.advance(16);

    expect(applyCommandSpy).toHaveBeenCalledTimes(2);
    expect(applyCommandSpy.mock.calls[1][0].throttleDelta).toBe(0);

    applyCommandSpy.mockRestore();
  });

  it('normalizes key case when releasing a continuous-movement key held with a different case', () => {
    const frame = renderScreen();
    clearCountdown(frame);

    const applyCommandSpy = vi.spyOn(SimulationEngine.prototype, 'applyCommand');
    applyCommandSpy.mockClear();

    fireEvent.keyDown(window, { key: 'W' });
    frame.advance(16);
    expect(applyCommandSpy.mock.calls[0][0].throttleDelta).toBe(1);

    fireEvent.keyUp(window, { key: 'W' });
    frame.advance(16);
    expect(applyCommandSpy.mock.calls[1][0].throttleDelta).toBe(0);

    applyCommandSpy.mockRestore();
  });

  it('clears held movement keys when the window loses focus, so a key that never receives keyup does not stay stuck', () => {
    const frame = renderScreen();
    clearCountdown(frame);

    const applyCommandSpy = vi.spyOn(SimulationEngine.prototype, 'applyCommand');
    applyCommandSpy.mockClear();

    // Simulate holding "W" while alt-tabbing away: the browser never fires
    // `keyup` for a key still physically held when focus leaves the window.
    fireEvent.keyDown(window, { key: 'w' });
    frame.advance(16);
    expect(applyCommandSpy.mock.calls[0][0].throttleDelta).toBe(1);

    fireEvent(window, new Event('blur'));
    frame.advance(16);

    expect(applyCommandSpy.mock.calls[1][0].throttleDelta).toBe(0);

    applyCommandSpy.mockRestore();
  });

  it('toggles the engine when the on-screen touch Engine button is tapped, and the button reflects the new state', () => {
    const frame = renderScreen();
    clearCountdown(frame);
    expect(screen.getByText('ENGINE OFFLINE')).toBeInTheDocument();
    const engineButton = screen.getByRole('button', { name: 'ENGINE OFF' });
    expect(engineButton).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(engineButton);
    frame.advance(16);

    expect(screen.getByText('ENGINE ONLINE')).toBeInTheDocument();
    const toggledButton = screen.getByRole('button', { name: 'ENGINE ON' });
    expect(toggledButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('applies a continuous-movement command while a touch control button is held, and stops once released', () => {
    const frame = renderScreen();
    clearCountdown(frame);

    const applyCommandSpy = vi.spyOn(SimulationEngine.prototype, 'applyCommand');
    applyCommandSpy.mockClear();

    const throttleUp = screen.getByRole('button', { name: 'Throttle up' });
    fireEvent.pointerDown(throttleUp);
    frame.advance(16);

    expect(applyCommandSpy).toHaveBeenCalledTimes(1);
    expect(applyCommandSpy.mock.calls[0][0].throttleDelta).toBe(1);

    fireEvent.pointerUp(throttleUp);
    frame.advance(16);

    expect(applyCommandSpy).toHaveBeenCalledTimes(2);
    expect(applyCommandSpy.mock.calls[1][0].throttleDelta).toBe(0);

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
        failureReason: 'crashed',
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

  it('stops scheduling animation frames once the mission is over, instead of looping forever', () => {
    const frame = renderScreen();

    const failedState: GameState = {
      ...createInitialGameState(createDefaultMissionConfiguration()),
      countdown: null,
      activeMission: {
        id: 'ORBIT-01',
        name: 'Mission 01',
        description: 'Reach a stable orbit.',
        status: 'failed',
        objectives: [],
        successCriteria: DEFAULT_ORBIT_SUCCESS_CRITERIA,
        failureReason: 'crashed',
      },
    };
    const getStateSpy = vi
      .spyOn(SimulationEngine.prototype, 'getState')
      .mockReturnValue(failedState);

    frame.advance(16);
    expect(screen.getByText('MISSION FAILED')).toBeInTheDocument();

    // No frame was re-scheduled from within `tick` once the mission ended,
    // so this second `advance()` has no pending callback to run at all.
    const stepSpy = vi.spyOn(SimulationEngine.prototype, 'step');
    frame.advance(16);
    expect(stepSpy).not.toHaveBeenCalled();

    stepSpy.mockRestore();
    getStateSpy.mockRestore();
  });

  it('resumes the game loop after "Replay" is clicked, making the ship controllable again', () => {
    const frame = renderScreen();

    const failedState: GameState = {
      ...createInitialGameState(createDefaultMissionConfiguration()),
      countdown: null,
      activeMission: {
        id: 'ORBIT-01',
        name: 'Mission 01',
        description: 'Reach a stable orbit.',
        status: 'failed',
        objectives: [],
        successCriteria: DEFAULT_ORBIT_SUCCESS_CRITERIA,
        failureReason: 'crashed',
      },
    };
    const getStateSpy = vi
      .spyOn(SimulationEngine.prototype, 'getState')
      .mockReturnValue(failedState);
    frame.advance(16);
    expect(screen.getByText('MISSION FAILED')).toBeInTheDocument();

    // Restore the real `getState` before replaying so the freshly reset
    // engine state (not the stale failed one) drives the next render.
    getStateSpy.mockRestore();

    fireEvent.click(screen.getByRole('button', { name: 'Replay' }));
    expect(screen.getByText('MISSION READY')).toBeInTheDocument();

    // The loop must actually be running again (not stuck since it stopped
    // scheduling frames when the previous mission ended) for the countdown
    // to clear and manual control to resume.
    clearCountdown(frame);
    expect(screen.getByText('PRE-LAUNCH')).toBeInTheDocument();
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
        failureReason: null,
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
        failureReason: null,
      },
    };
    const getStateSpy = vi
      .spyOn(SimulationEngine.prototype, 'getState')
      .mockReturnValue(succeededState);
    frame.advance(16);

    expect(loadCompletedMissionIds()).toContain(missionConfiguration.missionProfileId);

    getStateSpy.mockRestore();
  });

  it('moves keyboard focus to the mission result heading once the flight ends', () => {
    const frame = renderScreen();

    const failedState: GameState = {
      ...createInitialGameState(createDefaultMissionConfiguration()),
      countdown: null,
      activeMission: {
        id: 'ORBIT-01',
        name: 'Mission 01',
        description: 'Reach a stable orbit.',
        status: 'failed',
        objectives: [],
        successCriteria: DEFAULT_ORBIT_SUCCESS_CRITERIA,
        failureReason: 'crashed',
      },
    };
    const getStateSpy = vi
      .spyOn(SimulationEngine.prototype, 'getState')
      .mockReturnValue(failedState);

    frame.advance(16);

    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();

    getStateSpy.mockRestore();
  });
});
