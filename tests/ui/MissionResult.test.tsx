import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MissionResult } from '../../src/ui/MissionResult';
import type { MissionResultStats } from '../../src/simulation/missions/mission-result';

function makeStats(overrides: Partial<MissionResultStats> = {}): MissionResultStats {
  return {
    missionName: 'Mission 01',
    spacecraftName: 'Explorer I',
    succeeded: true,
    missionTimeSeconds: 272,
    maxAltitude: 184_000,
    maxSpeed: 7_800,
    objectives: [
      { id: 'reach-altitude', description: 'Reach target altitude', completed: true },
    ],
    failureCause: null,
    ...overrides,
  };
}

describe('MissionResult', () => {
  it('shows a success title and the mission stats', () => {
    render(<MissionResult stats={makeStats()} onMenu={() => {}} onReplay={() => {}} />);

    expect(screen.getByText('MISSION COMPLETE')).toBeInTheDocument();
    expect(screen.getByText('Mission 01')).toBeInTheDocument();
    expect(screen.getByText('Explorer I')).toBeInTheDocument();
    expect(screen.getByText('04:32')).toBeInTheDocument();
    expect(screen.getByText('184 km')).toBeInTheDocument();
    expect(screen.getByText('7.8 km/s')).toBeInTheDocument();
  });

  it('does not show a failure cause on success', () => {
    render(<MissionResult stats={makeStats()} onMenu={() => {}} onReplay={() => {}} />);

    expect(screen.queryByText('Cause')).not.toBeInTheDocument();
  });

  it('shows a failure title and cause when the mission failed', () => {
    render(
      <MissionResult
        stats={makeStats({ succeeded: false, failureCause: 'Fuel depleted' })}
        onMenu={() => {}}
        onReplay={() => {}}
      />,
    );

    expect(screen.getByText('MISSION FAILED')).toBeInTheDocument();
    expect(screen.getByText('Cause')).toBeInTheDocument();
    expect(screen.getByText('Fuel depleted')).toBeInTheDocument();
  });

  it('calls onMenu when "Back to menu" is clicked', async () => {
    const onMenu = vi.fn();
    const user = userEvent.setup();
    render(<MissionResult stats={makeStats()} onMenu={onMenu} onReplay={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Back to menu' }));

    expect(onMenu).toHaveBeenCalledTimes(1);
  });

  it('calls onReplay when "Replay" is clicked', async () => {
    const onReplay = vi.fn();
    const user = userEvent.setup();
    render(<MissionResult stats={makeStats()} onMenu={() => {}} onReplay={onReplay} />);

    await user.click(screen.getByRole('button', { name: 'Replay' }));

    expect(onReplay).toHaveBeenCalledTimes(1);
  });
});
