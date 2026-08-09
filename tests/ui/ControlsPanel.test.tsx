import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ControlsPanel } from '../../src/ui/ControlsPanel';

describe('ControlsPanel', () => {
  it('renders the panel title', () => {
    render(<ControlsPanel />);
    expect(screen.getByRole('heading', { name: 'Controls' })).toBeInTheDocument();
  });

  it('lists every documented shortcut with its action', () => {
    render(<ControlsPanel />);

    expect(screen.getByText('W / ↑')).toBeInTheDocument();
    expect(screen.getByText('Increase throttle')).toBeInTheDocument();
    expect(screen.getByText('SPACE')).toBeInTheDocument();
    expect(screen.getByText('Engine ON / OFF')).toBeInTheDocument();
    expect(screen.getByText('R')).toBeInTheDocument();
    expect(screen.getByText('Restart mission')).toBeInTheDocument();
  });
});
