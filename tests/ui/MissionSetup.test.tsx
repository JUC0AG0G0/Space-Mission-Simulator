import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MissionSetup } from '../../src/ui/MissionSetup';

describe('MissionSetup', () => {
  it('calls onBack when "Back" is clicked', async () => {
    const onBack = vi.fn();
    const user = userEvent.setup();
    render(<MissionSetup onBack={onBack} onLaunch={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('calls onLaunch when "Launch mission" is clicked', async () => {
    const onLaunch = vi.fn();
    const user = userEvent.setup();
    render(<MissionSetup onBack={() => {}} onLaunch={onLaunch} />);

    await user.click(screen.getByRole('button', { name: 'Launch mission' }));

    expect(onLaunch).toHaveBeenCalledTimes(1);
  });
});
