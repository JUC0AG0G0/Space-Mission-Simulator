import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MainMenu } from '../../src/ui/MainMenu';
import type { MissionProgressEntry } from '../../src/simulation/progression/mission-progress';

const NO_PROGRESS: MissionProgressEntry[] = [];

describe('MainMenu', () => {
  it('hides "Continue" when there is no saved mission', () => {
    render(
      <MainMenu
        hasSavedMission={false}
        missionProgress={NO_PROGRESS}
        onNewMission={() => {}}
        onContinue={() => {}}
      />,
    );

    expect(screen.getByRole('button', { name: 'New mission' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
  });

  it('shows "Continue" when a saved mission exists', () => {
    render(
      <MainMenu
        hasSavedMission={true}
        missionProgress={NO_PROGRESS}
        onNewMission={() => {}}
        onContinue={() => {}}
      />,
    );

    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('calls onNewMission when "New mission" is clicked', async () => {
    const onNewMission = vi.fn();
    const user = userEvent.setup();
    render(
      <MainMenu
        hasSavedMission={false}
        missionProgress={NO_PROGRESS}
        onNewMission={onNewMission}
        onContinue={() => {}}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'New mission' }));

    expect(onNewMission).toHaveBeenCalledTimes(1);
  });

  it('calls onContinue when "Continue" is clicked', async () => {
    const onContinue = vi.fn();
    const user = userEvent.setup();
    render(
      <MainMenu
        hasSavedMission={true}
        missionProgress={NO_PROGRESS}
        onNewMission={() => {}}
        onContinue={onContinue}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('disables the "Options" button', () => {
    render(
      <MainMenu
        hasSavedMission={false}
        missionProgress={NO_PROGRESS}
        onNewMission={() => {}}
        onContinue={() => {}}
      />,
    );

    expect(screen.getByRole('button', { name: 'Options' })).toBeDisabled();
  });

  it('shows a locked marker for missions that have not been completed', () => {
    render(
      <MainMenu
        hasSavedMission={false}
        missionProgress={[
          { id: 'earth-orbit', name: 'Mission 01', destinationName: 'Earth orbit', completed: false },
        ]}
        onNewMission={() => {}}
        onContinue={() => {}}
      />,
    );

    const entry = screen.getByText('Earth orbit').closest('li');
    expect(entry).toHaveTextContent('🔒');
    expect(entry).not.toHaveClass('main-menu__progress-entry--completed');
  });

  it('shows a completed marker for missions that have been completed', () => {
    render(
      <MainMenu
        hasSavedMission={false}
        missionProgress={[
          { id: 'earth-orbit', name: 'Mission 01', destinationName: 'Earth orbit', completed: true },
        ]}
        onNewMission={() => {}}
        onContinue={() => {}}
      />,
    );

    const entry = screen.getByText('Earth orbit').closest('li');
    expect(entry).toHaveTextContent('✓');
    expect(entry).toHaveClass('main-menu__progress-entry--completed');
  });

  it('exposes completed/locked status to assistive technology, not just visually', () => {
    render(
      <MainMenu
        hasSavedMission={false}
        missionProgress={[
          { id: 'earth-orbit', name: 'Mission 01', destinationName: 'Earth orbit', completed: true },
          { id: 'high-orbit', name: 'Mission 02', destinationName: 'High orbit', completed: false },
        ]}
        onNewMission={() => {}}
        onContinue={() => {}}
      />,
    );

    expect(screen.getByRole('listitem', { name: 'Earth orbit — Completed' })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: 'High orbit — Locked' })).toBeInTheDocument();
  });
});
