import { describe, expect, it } from 'vitest';
import { integrate } from '../../src/simulation/physics/integration';

describe('integrate', () => {
  it('applies acceleration to velocity, and updated velocity to position', () => {
    const result = integrate(
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      1,
    );

    expect(result.velocity).toEqual({ x: 10, y: 0 });
    // semi-implicit Euler uses the *new* velocity for the position update
    expect(result.position).toEqual({ x: 10, y: 0 });
  });

  it('leaves position and velocity unchanged with zero deltaTime', () => {
    const result = integrate(
      { x: 5, y: 5 },
      { x: 2, y: -2 },
      { x: 1, y: 1 },
      0,
    );

    expect(result.position).toEqual({ x: 5, y: 5 });
    expect(result.velocity).toEqual({ x: 2, y: -2 });
  });

  it('is consistent for a constant-velocity object with no acceleration', () => {
    const result = integrate(
      { x: 0, y: 0 },
      { x: 3, y: 4 },
      { x: 0, y: 0 },
      2,
    );

    expect(result.position).toEqual({ x: 6, y: 8 });
    expect(result.velocity).toEqual({ x: 3, y: 4 });
  });

  it('produces the same result for two identical calls (determinism)', () => {
    const a = integrate({ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }, 0.5);
    const b = integrate({ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }, 0.5);
    expect(a).toEqual(b);
  });
});
