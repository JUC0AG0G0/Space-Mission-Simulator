import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../../src/ui/ErrorBoundary';
import { saveMission, loadSavedMission } from '../../src/simulation/persistence/mission-save';
import { createDefaultMissionConfiguration } from '../../src/simulation/missions/mission-configuration';
import { createMemoryStorage } from '../test-utils/memory-storage';

function ThrowingComponent(): never {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
    // React and componentDidCatch both log the caught error to the console;
    // keep test output clean instead of asserting on the exact message.
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it('renders its children normally when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('shows a fallback screen instead of a blank page when a child throws during render', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('SOMETHING WENT WRONG')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
  });

  it('clears the saved mission and reloads the page when Reload is clicked', async () => {
    saveMission(createDefaultMissionConfiguration());
    expect(loadSavedMission()).not.toBeNull();

    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadSpy },
      writable: true,
      configurable: true,
    });

    const user = userEvent.setup();
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    await user.click(screen.getByRole('button', { name: 'Reload' }));

    expect(loadSavedMission()).toBeNull();
    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });
});
