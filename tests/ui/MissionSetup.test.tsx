import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MissionSetup } from '../../src/ui/MissionSetup';
import { MISSION_NAME_MAX_LENGTH } from '../../src/simulation/missions/mission-configuration';

describe('MissionSetup', () => {
  it('calls onBack when "Back" is clicked from the form', async () => {
    const onBack = vi.fn();
    const user = userEvent.setup();
    render(<MissionSetup onBack={onBack} onLaunch={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('pre-fills the form with a default configuration', () => {
    render(<MissionSetup onBack={() => {}} onLaunch={() => {}} />);

    expect(screen.getByLabelText('Mission name')).toHaveValue('Mission 01');
    expect(screen.getByLabelText('Spacecraft name')).toHaveValue('Explorer I');
    expect(screen.getByLabelText('Mission profile')).toHaveValue('earth-orbit');
    expect(screen.getByRole('button', { name: 'Select Explorer I' })).toHaveTextContent(
      'Selected',
    );
  });

  it('caps the mission name and spacecraft name inputs to a reasonable length', () => {
    render(<MissionSetup onBack={() => {}} onLaunch={() => {}} />);

    expect(screen.getByLabelText('Mission name')).toHaveAttribute(
      'maxLength',
      String(MISSION_NAME_MAX_LENGTH),
    );
    expect(screen.getByLabelText('Spacecraft name')).toHaveAttribute(
      'maxLength',
      String(MISSION_NAME_MAX_LENGTH),
    );
  });

  it('shows specs and a select button for each rocket model', () => {
    render(<MissionSetup onBack={() => {}} onLaunch={() => {}} />);

    expect(screen.getByText('Stalwart')).toBeInTheDocument();
    expect(screen.getByText('Javelin')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select Stalwart' })).toHaveTextContent(
      'Select',
    );
  });

  it('switches the selected rocket model when another one is chosen', async () => {
    const user = userEvent.setup();
    render(<MissionSetup onBack={() => {}} onLaunch={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Select Stalwart' }));

    expect(screen.getByRole('button', { name: 'Select Stalwart' })).toHaveTextContent(
      'Selected',
    );
    expect(screen.getByRole('button', { name: 'Select Explorer I' })).toHaveTextContent(
      'Select',
    );
  });

  it('reflects the selected rocket model in the summary', async () => {
    const user = userEvent.setup();
    render(<MissionSetup onBack={() => {}} onLaunch={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Select Stalwart' }));
    await user.click(screen.getByRole('button', { name: 'Review mission' }));

    expect(screen.getByText('Rocket model')).toBeInTheDocument();
    expect(screen.getAllByText('Stalwart').length).toBeGreaterThan(0);
  });

  it('disables "Review mission" when the mission name is blank', async () => {
    const user = userEvent.setup();
    render(<MissionSetup onBack={() => {}} onLaunch={() => {}} />);

    await user.clear(screen.getByLabelText('Mission name'));

    expect(screen.getByRole('button', { name: 'Review mission' })).toBeDisabled();
  });

  it('shows a summary of the entered configuration after "Review mission"', async () => {
    const user = userEvent.setup();
    render(<MissionSetup onBack={() => {}} onLaunch={() => {}} />);

    await user.clear(screen.getByLabelText('Mission name'));
    await user.type(screen.getByLabelText('Mission name'), 'Ares 1');
    await user.clear(screen.getByLabelText('Spacecraft name'));
    await user.type(screen.getByLabelText('Spacecraft name'), 'Falcon');
    await user.click(screen.getByRole('button', { name: 'Review mission' }));

    expect(screen.getByText('Ares 1')).toBeInTheDocument();
    expect(screen.getByText('Falcon')).toBeInTheDocument();
    expect(screen.getByText('Earth orbit')).toBeInTheDocument();
    expect(screen.getByText('Reach a stable Earth orbit')).toBeInTheDocument();
  });

  it('shows capitalized difficulty labels instead of the raw union value', () => {
    render(<MissionSetup onBack={() => {}} onLaunch={() => {}} />);

    const select = screen.getByLabelText('Mission profile');
    const optionLabels = Array.from(select.querySelectorAll('option')).map(
      (option) => option.textContent,
    );

    expect(optionLabels).toEqual([
      'Mission 01 — Earth orbit (Easy)',
      'Mission 02 — High orbit (Medium)',
      'Mission 03 — Fast orbit (Hard)',
    ]);
  });

  it('exposes the selected mission profile description as an accessible description', () => {
    render(<MissionSetup onBack={() => {}} onLaunch={() => {}} />);

    expect(
      screen.getByRole('combobox', {
        name: 'Mission profile',
        description: 'A first flight to a forgiving low Earth orbit.',
      }),
    ).toBeInTheDocument();
  });

  it('updates the accessible description of the mission profile select when another profile is chosen', async () => {
    const user = userEvent.setup();
    render(<MissionSetup onBack={() => {}} onLaunch={() => {}} />);

    await user.selectOptions(screen.getByLabelText('Mission profile'), 'high-orbit');

    expect(
      screen.getByRole('combobox', {
        name: 'Mission profile',
        description: 'Climb further out to a higher orbit that takes more fuel to reach.',
      }),
    ).toBeInTheDocument();
  });

  it('reflects the selected mission profile in the summary', async () => {
    const user = userEvent.setup();
    render(<MissionSetup onBack={() => {}} onLaunch={() => {}} />);

    await user.selectOptions(screen.getByLabelText('Mission profile'), 'high-orbit');
    await user.click(screen.getByRole('button', { name: 'Review mission' }));

    expect(screen.getByText('High orbit')).toBeInTheDocument();
    expect(screen.getByText('Reach a stable high orbit')).toBeInTheDocument();
  });

  it('shows the capitalized difficulty of the selected profile in the summary', async () => {
    const user = userEvent.setup();
    render(<MissionSetup onBack={() => {}} onLaunch={() => {}} />);

    await user.selectOptions(screen.getByLabelText('Mission profile'), 'high-orbit');
    await user.click(screen.getByRole('button', { name: 'Review mission' }));

    expect(screen.getByText('Difficulty')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('returns to the editable form when "Edit" is clicked from the summary', async () => {
    const user = userEvent.setup();
    render(<MissionSetup onBack={() => {}} onLaunch={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Review mission' }));
    await user.click(screen.getByRole('button', { name: 'Edit' }));

    expect(screen.getByLabelText('Mission name')).toHaveValue('Mission 01');
  });

  it('trims leading/trailing whitespace from mission and spacecraft names on review', async () => {
    const onLaunch = vi.fn();
    const user = userEvent.setup();
    render(<MissionSetup onBack={() => {}} onLaunch={onLaunch} />);

    await user.clear(screen.getByLabelText('Mission name'));
    await user.type(screen.getByLabelText('Mission name'), '  Mission 01  ');
    await user.clear(screen.getByLabelText('Spacecraft name'));
    await user.type(screen.getByLabelText('Spacecraft name'), '  Falcon  ');
    await user.click(screen.getByRole('button', { name: 'Review mission' }));

    expect(screen.queryByLabelText('Mission name')).not.toBeInTheDocument();
    expect(screen.getByText('Mission 01')).toBeInTheDocument();
    expect(screen.getByText('Falcon')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Launch mission' }));

    expect(onLaunch).toHaveBeenCalledWith(
      expect.objectContaining({ missionName: 'Mission 01', spacecraftName: 'Falcon' }),
    );
  });

  it('moves keyboard focus to the screen heading on mount', () => {
    render(<MissionSetup onBack={() => {}} onLaunch={() => {}} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();
  });

  it('moves keyboard focus to the heading when reviewing, and back when editing', async () => {
    const user = userEvent.setup();
    render(<MissionSetup onBack={() => {}} onLaunch={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Review mission' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();
  });

  it('calls onLaunch with the reviewed configuration when "Launch mission" is clicked', async () => {
    const onLaunch = vi.fn();
    const user = userEvent.setup();
    render(<MissionSetup onBack={() => {}} onLaunch={onLaunch} />);

    await user.clear(screen.getByLabelText('Mission name'));
    await user.type(screen.getByLabelText('Mission name'), 'Ares 1');
    await user.click(screen.getByRole('button', { name: 'Review mission' }));
    await user.click(screen.getByRole('button', { name: 'Launch mission' }));

    expect(onLaunch).toHaveBeenCalledTimes(1);
    expect(onLaunch).toHaveBeenCalledWith(
      expect.objectContaining({ missionName: 'Ares 1' }),
    );
  });
});
