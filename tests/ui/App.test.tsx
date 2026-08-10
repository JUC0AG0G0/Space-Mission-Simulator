import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../src/app/App';

describe('App', () => {
  it('starts on the main menu', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Space Mission Simulator' })).toBeInTheDocument();
  });

  it('moves to mission setup when "New mission" is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'New mission' }));

    expect(screen.getByRole('heading', { name: 'Mission setup' })).toBeInTheDocument();
  });

  it('returns to the main menu when "Back" is clicked from mission setup', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'New mission' }));
    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByRole('heading', { name: 'Space Mission Simulator' })).toBeInTheDocument();
  });

  it('starts the simulation when "Launch mission" is clicked from the summary', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.click(screen.getByRole('button', { name: 'New mission' }));
    await user.click(screen.getByRole('button', { name: 'Review mission' }));
    await user.click(screen.getByRole('button', { name: 'Launch mission' }));

    expect(container.querySelector('canvas.app__canvas')).toBeInTheDocument();
  });
});
