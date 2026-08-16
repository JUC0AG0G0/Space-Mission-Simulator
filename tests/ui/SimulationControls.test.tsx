import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SimulationControls } from '../../src/ui/SimulationControls';

const noop = () => {};

describe('SimulationControls', () => {
  it('shows "Pause" when the simulation is running', () => {
    render(
      <SimulationControls
        paused={false}
        onTogglePause={noop}
        onRestart={noop}
        timeScale={1}
        onSetTimeScale={noop}
        throttle={1}
        onSetThrottle={noop}
      />,
    );
    expect(screen.getByRole('button', { name: 'Pause (P)' })).toBeInTheDocument();
  });

  it('shows "Resume" when the simulation is paused', () => {
    render(
      <SimulationControls
        paused={true}
        onTogglePause={noop}
        onRestart={noop}
        timeScale={1}
        onSetTimeScale={noop}
        throttle={1}
        onSetThrottle={noop}
      />,
    );
    expect(screen.getByRole('button', { name: 'Resume (P)' })).toBeInTheDocument();
  });

  it('marks the toggle button as not pressed while running', () => {
    render(
      <SimulationControls
        paused={false}
        onTogglePause={noop}
        onRestart={noop}
        timeScale={1}
        onSetTimeScale={noop}
        throttle={1}
        onSetThrottle={noop}
      />,
    );
    expect(screen.getByRole('button', { name: 'Pause (P)' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('marks the toggle button as pressed while paused', () => {
    render(
      <SimulationControls
        paused={true}
        onTogglePause={noop}
        onRestart={noop}
        timeScale={1}
        onSetTimeScale={noop}
        throttle={1}
        onSetThrottle={noop}
      />,
    );
    expect(screen.getByRole('button', { name: 'Resume (P)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('calls onTogglePause when the pause button is clicked', async () => {
    const onTogglePause = vi.fn();
    const user = userEvent.setup();
    render(
      <SimulationControls
        paused={false}
        onTogglePause={onTogglePause}
        onRestart={noop}
        timeScale={1}
        onSetTimeScale={noop}
        throttle={1}
        onSetThrottle={noop}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Pause (P)' }));

    expect(onTogglePause).toHaveBeenCalledTimes(1);
  });

  it('calls onRestart when the restart button is clicked', async () => {
    const onRestart = vi.fn();
    const user = userEvent.setup();
    render(
      <SimulationControls
        paused={false}
        onTogglePause={noop}
        onRestart={onRestart}
        timeScale={1}
        onSetTimeScale={noop}
        throttle={1}
        onSetThrottle={noop}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Restart mission (R)' }));

    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  it('renders one button per allowed simulation speed', () => {
    render(
      <SimulationControls
        paused={false}
        onTogglePause={noop}
        onRestart={noop}
        timeScale={1}
        onSetTimeScale={noop}
        throttle={1}
        onSetThrottle={noop}
      />,
    );

    for (const label of ['1x', '2x', '5x', '10x']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
  });

  it('marks only the current speed as pressed', () => {
    render(
      <SimulationControls
        paused={false}
        onTogglePause={noop}
        onRestart={noop}
        timeScale={5}
        onSetTimeScale={noop}
        throttle={1}
        onSetThrottle={noop}
      />,
    );

    expect(screen.getByRole('button', { name: '5x' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '1x' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: '2x' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: '10x' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onSetTimeScale with the clicked speed', async () => {
    const onSetTimeScale = vi.fn();
    const user = userEvent.setup();
    render(
      <SimulationControls
        paused={false}
        onTogglePause={noop}
        onRestart={noop}
        timeScale={1}
        onSetTimeScale={onSetTimeScale}
        throttle={1}
        onSetThrottle={noop}
      />,
    );

    await user.click(screen.getByRole('button', { name: '10x' }));

    expect(onSetTimeScale).toHaveBeenCalledTimes(1);
    expect(onSetTimeScale).toHaveBeenCalledWith(10);
  });

  it('shows the current throttle as a percentage on the slider', () => {
    render(
      <SimulationControls
        paused={false}
        onTogglePause={noop}
        onRestart={noop}
        timeScale={1}
        onSetTimeScale={noop}
        throttle={0.5}
        onSetThrottle={noop}
      />,
    );

    const slider = screen.getByRole('slider', { name: /throttle/i });
    expect(slider).toHaveValue('50');
  });

  it('calls onSetThrottle with a 0-1 value when the slider changes', () => {
    const onSetThrottle = vi.fn();
    render(
      <SimulationControls
        paused={false}
        onTogglePause={noop}
        onRestart={noop}
        timeScale={1}
        onSetTimeScale={noop}
        throttle={0}
        onSetThrottle={onSetThrottle}
      />,
    );

    const slider = screen.getByRole('slider', { name: /throttle/i });
    fireEvent.change(slider, { target: { value: '75' } });

    expect(onSetThrottle).toHaveBeenCalledTimes(1);
    expect(onSetThrottle).toHaveBeenCalledWith(0.75);
  });
});
