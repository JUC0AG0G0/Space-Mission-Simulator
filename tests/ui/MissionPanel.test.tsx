import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MissionPanel } from '../../src/ui/MissionPanel';
import { DEFAULT_ORBIT_SUCCESS_CRITERIA } from '../../src/simulation/missions/mission';
import type { Mission } from '../../src/types/simulation';

function makeMission(overrides: Partial<Mission> = {}): Mission {
  return {
    id: 'mission-1',
    name: 'Reach Orbit',
    description: 'Achieve a stable orbit around Earth.',
    objectives: [
      { id: 'altitude', description: 'Reach target altitude', completed: false },
      { id: 'speed', description: 'Reach orbital speed', completed: true },
    ],
    status: 'active',
    successCriteria: DEFAULT_ORBIT_SUCCESS_CRITERIA,
    failureReason: null,
    ...overrides,
  };
}

describe('MissionPanel', () => {
  it('renders a placeholder when there is no active mission', () => {
    render(<MissionPanel mission={null} />);

    expect(screen.getByText('No active mission.')).toBeInTheDocument();
  });

  it('renders the mission name, description and status', () => {
    render(<MissionPanel mission={makeMission()} />);

    expect(screen.getByText('Reach Orbit')).toBeInTheDocument();
    expect(screen.getByText('Achieve a stable orbit around Earth.')).toBeInTheDocument();
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
  });

  it('marks completed objectives distinctly from pending ones', () => {
    render(<MissionPanel mission={makeMission()} />);
    const items = screen.getAllByRole('listitem');

    expect(items[0]).toHaveTextContent('○Reach target altitude');
    expect(items[0]).not.toHaveClass('objective--done');
    expect(items[1]).toHaveTextContent('✓Reach orbital speed');
    expect(items[1]).toHaveClass('objective--done');
  });

  it.each([
    ['succeeded', 'SUCCESS'],
    ['failed', 'FAILED'],
  ] as const)('shows "%s" mission status as "%s"', (status, label) => {
    render(<MissionPanel mission={makeMission({ status })} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('exposes the mission status as a live region so screen readers announce success/failure', () => {
    render(<MissionPanel mission={makeMission()} />);
    const regions = screen.getAllByRole('status');
    const statusRegion = regions.find((region) => region.textContent === 'IN PROGRESS');

    expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    expect(statusRegion).toHaveTextContent('IN PROGRESS');
  });

  it('keeps announcing the status live region when the mission succeeds', () => {
    const mission = makeMission();
    const { rerender } = render(<MissionPanel mission={mission} />);
    expect(
      screen.getAllByRole('status').find((region) => region.textContent === 'IN PROGRESS'),
    ).toBeDefined();

    rerender(<MissionPanel mission={{ ...mission, status: 'succeeded' }} />);
    expect(
      screen.getAllByRole('status').find((region) => region.textContent === 'SUCCESS'),
    ).toBeDefined();
  });

  it('exposes the objectives list as a live region so screen readers announce completion', () => {
    render(<MissionPanel mission={makeMission()} />);
    const regions = screen.getAllByRole('status');
    const objectivesRegion = regions.find((region) => region.querySelector('li'));

    expect(objectivesRegion).toHaveAttribute('aria-live', 'polite');
    expect(objectivesRegion).toHaveTextContent('Reach target altitude');
  });

  it('keeps announcing the objectives live region when an objective completes', () => {
    const mission = makeMission();
    const { rerender } = render(<MissionPanel mission={mission} />);
    const initialRegion = screen
      .getAllByRole('status')
      .find((region) => region.querySelector('li'));
    expect(initialRegion).toHaveTextContent('○Reach target altitude');

    rerender(
      <MissionPanel
        mission={{
          ...mission,
          objectives: mission.objectives.map((objective) =>
            objective.id === 'altitude' ? { ...objective, completed: true } : objective,
          ),
        }}
      />,
    );
    const updatedRegion = screen
      .getAllByRole('status')
      .find((region) => region.querySelector('li'));
    expect(updatedRegion).toHaveTextContent('✓Reach target altitude');
  });
});
