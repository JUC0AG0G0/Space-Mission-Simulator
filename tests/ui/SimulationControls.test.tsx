import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SimulationControls } from '../../src/ui/SimulationControls';

describe('SimulationControls', () => {
  it('shows "Pause" when the simulation is running', () => {
    render(
      <SimulationControls paused={false} onTogglePause={() => {}} onRestart={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Pause (P)' })).toBeInTheDocument();
  });

  it('shows "Resume" when the simulation is paused', () => {
    render(
      <SimulationControls paused={true} onTogglePause={() => {}} onRestart={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Resume (P)' })).toBeInTheDocument();
  });

  it('calls onTogglePause when the pause button is clicked', async () => {
    const onTogglePause = vi.fn();
    const user = userEvent.setup();
    render(
      <SimulationControls paused={false} onTogglePause={onTogglePause} onRestart={() => {}} />,
    );

    await user.click(screen.getByRole('button', { name: 'Pause (P)' }));

    expect(onTogglePause).toHaveBeenCalledTimes(1);
  });

  it('calls onRestart when the restart button is clicked', async () => {
    const onRestart = vi.fn();
    const user = userEvent.setup();
    render(
      <SimulationControls paused={false} onTogglePause={() => {}} onRestart={onRestart} />,
    );

    await user.click(screen.getByRole('button', { name: 'Restart mission (R)' }));

    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});
