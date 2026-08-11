import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { SimulationScreen } from '../../src/app/SimulationScreen';
import { SimulationEngine } from '../../src/simulation/simulation-engine';
import { createDefaultMissionConfiguration } from '../../src/simulation/missions/mission-configuration';

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

function renderScreen() {
  const frame = mockAnimationFrame();
  render(<SimulationScreen missionConfiguration={createDefaultMissionConfiguration()} />);
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
});
