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
});
