import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TouchControls } from '../../src/ui/TouchControls';

describe('TouchControls', () => {
  it('renders a button for each movement direction and the engine toggle', () => {
    render(<TouchControls onEngineToggle={() => {}} onHoldChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'Turn left' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Throttle up' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Throttle down' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Turn right' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Engine' })).toBeInTheDocument();
  });

  it('calls onEngineToggle when the engine button is clicked', async () => {
    const onEngineToggle = vi.fn();
    const user = userEvent.setup();
    render(<TouchControls onEngineToggle={onEngineToggle} onHoldChange={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Engine' }));

    expect(onEngineToggle).toHaveBeenCalledTimes(1);
  });

  it('reports a movement key as held on pointerdown and released on pointerup', () => {
    const onHoldChange = vi.fn();
    render(<TouchControls onEngineToggle={() => {}} onHoldChange={onHoldChange} />);

    const throttleUp = screen.getByRole('button', { name: 'Throttle up' });
    fireEvent.pointerDown(throttleUp);
    expect(onHoldChange).toHaveBeenNthCalledWith(1, 'w', true);

    fireEvent.pointerUp(throttleUp);
    expect(onHoldChange).toHaveBeenNthCalledWith(2, 'w', false);
  });

  it('releases the held key if the pointer is cancelled mid-press', () => {
    const onHoldChange = vi.fn();
    render(<TouchControls onEngineToggle={() => {}} onHoldChange={onHoldChange} />);

    const turnLeft = screen.getByRole('button', { name: 'Turn left' });
    fireEvent.pointerDown(turnLeft);
    expect(onHoldChange).toHaveBeenNthCalledWith(1, 'a', true);

    fireEvent.pointerCancel(turnLeft);
    expect(onHoldChange).toHaveBeenNthCalledWith(2, 'a', false);
  });

  it('releases the held key if the pointer leaves the button while still pressed', () => {
    const onHoldChange = vi.fn();
    render(<TouchControls onEngineToggle={() => {}} onHoldChange={onHoldChange} />);

    const turnRight = screen.getByRole('button', { name: 'Turn right' });
    fireEvent.pointerDown(turnRight);
    fireEvent.pointerLeave(turnRight);

    expect(onHoldChange).toHaveBeenNthCalledWith(1, 'd', true);
    expect(onHoldChange).toHaveBeenNthCalledWith(2, 'd', false);
  });
});
