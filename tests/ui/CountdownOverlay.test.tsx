import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CountdownOverlay } from '../../src/ui/CountdownOverlay';

describe('CountdownOverlay', () => {
  it('shows the mission ready header', () => {
    render(<CountdownOverlay countdown={{ remainingSeconds: 3 }} />);
    expect(screen.getByText('MISSION READY')).toBeInTheDocument();
  });

  it('rounds the remaining seconds up to the next whole T-minus count', () => {
    render(<CountdownOverlay countdown={{ remainingSeconds: 2.4 }} />);
    expect(screen.getByText('T-3')).toBeInTheDocument();
  });

  it('shows T-1 just before LIFTOFF', () => {
    render(<CountdownOverlay countdown={{ remainingSeconds: 0.2 }} />);
    expect(screen.getByText('T-1')).toBeInTheDocument();
  });

  it('shows LIFTOFF once the countdown has reached zero', () => {
    render(<CountdownOverlay countdown={{ remainingSeconds: 0 }} />);
    expect(screen.getByText('LIFTOFF')).toBeInTheDocument();
  });

  it('exposes the countdown as an assertive-free live region so screen readers announce each value', () => {
    render(<CountdownOverlay countdown={{ remainingSeconds: 3 }} />);
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveTextContent('MISSION READY');
    expect(region).toHaveTextContent('T-3');
  });

  it('keeps announcing the live region as the countdown value changes', () => {
    const { rerender } = render(
      <CountdownOverlay countdown={{ remainingSeconds: 1 }} />
    );
    expect(screen.getByRole('status')).toHaveTextContent('T-1');

    rerender(<CountdownOverlay countdown={{ remainingSeconds: 0 }} />);
    expect(screen.getByRole('status')).toHaveTextContent('LIFTOFF');
  });
});
