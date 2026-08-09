import { vi } from 'vitest';

/**
 * A minimal stand-in for CanvasRenderingContext2D: plain object with a
 * vi.fn() for every drawing method the renderers under test call, plus
 * writable style properties. Avoids pulling in a full canvas polyfill.
 */
export function createFakeContext() {
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
  };
}

export type FakeContext = ReturnType<typeof createFakeContext>;
