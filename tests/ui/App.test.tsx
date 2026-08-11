import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../src/app/App';
import { createMemoryStorage } from '../test-utils/memory-storage';

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

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

  it('carries the mission name entered in setup into the running simulation', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'New mission' }));
    await user.clear(screen.getByLabelText('Mission name'));
    await user.type(screen.getByLabelText('Mission name'), 'Ares 1');
    await user.click(screen.getByRole('button', { name: 'Review mission' }));
    await user.click(screen.getByRole('button', { name: 'Launch mission' }));

    expect(screen.getByRole('heading', { name: /Ares 1/ })).toBeInTheDocument();
  });

  it('does not show "Continue" before any mission has been launched', () => {
    render(<App />);

    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
  });

  it('saves the mission on launch and offers to continue it after returning to the menu', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.click(screen.getByRole('button', { name: 'New mission' }));
    await user.clear(screen.getByLabelText('Mission name'));
    await user.type(screen.getByLabelText('Mission name'), 'Ares 1');
    await user.click(screen.getByRole('button', { name: 'Review mission' }));
    await user.click(screen.getByRole('button', { name: 'Launch mission' }));

    expect(screen.getByRole('heading', { name: /Ares 1/ })).toBeInTheDocument();
    unmount();

    render(<App />);

    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('resumes the saved mission directly into the simulation when "Continue" is clicked', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.click(screen.getByRole('button', { name: 'New mission' }));
    await user.clear(screen.getByLabelText('Mission name'));
    await user.type(screen.getByLabelText('Mission name'), 'Ares 1');
    await user.click(screen.getByRole('button', { name: 'Review mission' }));
    await user.click(screen.getByRole('button', { name: 'Launch mission' }));
    unmount();

    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByRole('heading', { name: /Ares 1/ })).toBeInTheDocument();
  });
});
