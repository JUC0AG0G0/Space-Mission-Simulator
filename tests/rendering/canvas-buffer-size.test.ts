import { describe, expect, it } from 'vitest';
import { computeCanvasBufferSize } from '../../src/rendering/canvas/canvas-buffer-size';

describe('computeCanvasBufferSize', () => {
  it('leaves the buffer size unchanged for a standard-density display', () => {
    expect(computeCanvasBufferSize(800, 600, 1)).toEqual({ width: 800, height: 600 });
  });

  it('scales the buffer size up for a Retina/high-density display', () => {
    expect(computeCanvasBufferSize(800, 600, 2)).toEqual({ width: 1600, height: 1200 });
  });

  it('supports fractional device pixel ratios, rounding to whole pixels', () => {
    expect(computeCanvasBufferSize(800, 600, 1.5)).toEqual({ width: 1200, height: 900 });
    expect(computeCanvasBufferSize(801, 601, 1.5)).toEqual({ width: 1202, height: 902 });
  });
});
