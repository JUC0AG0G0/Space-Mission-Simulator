import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MainMenu } from '../../src/ui/MainMenu';

describe('MainMenu', () => {
  it('hides "Continue" when there is no saved mission', () => {
    render(
      <MainMenu hasSavedMission={false} onNewMission={() => {}} onContinue={() => {}} />,
    );

    expect(screen.getByRole('button', { name: 'New mission' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
  });

  it('shows "Continue" when a saved mission exists', () => {
    render(
      <MainMenu hasSavedMission={true} onNewMission={() => {}} onContinue={() => {}} />,
    );

    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('calls onNewMission when "New mission" is clicked', async () => {
    const onNewMission = vi.fn();
    const user = userEvent.setup();
    render(
      <MainMenu hasSavedMission={false} onNewMission={onNewMission} onContinue={() => {}} />,
    );

    await user.click(screen.getByRole('button', { name: 'New mission' }));

    expect(onNewMission).toHaveBeenCalledTimes(1);
  });

  it('calls onContinue when "Continue" is clicked', async () => {
    const onContinue = vi.fn();
    const user = userEvent.setup();
    render(
      <MainMenu hasSavedMission={true} onNewMission={() => {}} onContinue={onContinue} />,
    );

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('disables the "Options" button', () => {
    render(
      <MainMenu hasSavedMission={false} onNewMission={() => {}} onContinue={() => {}} />,
    );

    expect(screen.getByRole('button', { name: 'Options' })).toBeDisabled();
  });
});
