import { describe, expect, it } from 'vitest';
import { add, subtract, scale, magnitude, normalize, fromAngle, dot, ZERO_VECTOR } from '../../src/simulation/physics/vectors';

describe('add', () => {
  it('adds component-wise', () => {
    expect(add({ x: 1, y: 2 }, { x: 3, y: -4 })).toEqual({ x: 4, y: -2 });
  });

  it('is a no-op when adding the zero vector', () => {
    expect(add({ x: 5, y: -7 }, ZERO_VECTOR)).toEqual({ x: 5, y: -7 });
  });
});

describe('subtract', () => {
  it('subtracts component-wise', () => {
    expect(subtract({ x: 5, y: 2 }, { x: 3, y: 4 })).toEqual({ x: 2, y: -2 });
  });

  it('returns the zero vector when subtracting itself', () => {
    expect(subtract({ x: 5, y: -7 }, { x: 5, y: -7 })).toEqual({ x: 0, y: 0 });
  });
});

describe('scale', () => {
  it('multiplies each component by the factor', () => {
    expect(scale({ x: 2, y: -3 }, 4)).toEqual({ x: 8, y: -12 });
  });

  it('returns a zero-magnitude vector when scaling by 0', () => {
    expect(magnitude(scale({ x: 2, y: -3 }, 0))).toBe(0);
  });

  it('negates the vector when scaling by -1', () => {
    expect(scale({ x: 2, y: -3 }, -1)).toEqual({ x: -2, y: 3 });
  });
});

describe('magnitude', () => {
  it('computes the euclidean length', () => {
    expect(magnitude({ x: 3, y: 4 })).toBe(5);
  });

  it('is zero for the zero vector', () => {
    expect(magnitude(ZERO_VECTOR)).toBe(0);
  });
});

describe('dot', () => {
  it('computes the dot product of two vectors', () => {
    expect(dot({ x: 2, y: 3 }, { x: 4, y: -1 })).toBe(5);
  });

  it('is zero for perpendicular vectors', () => {
    expect(dot({ x: 1, y: 0 }, { x: 0, y: 1 })).toBe(0);
  });

  it('is the squared magnitude when dotted with itself', () => {
    expect(dot({ x: 3, y: 4 }, { x: 3, y: 4 })).toBe(25);
  });
});

describe('normalize', () => {
  it('returns a unit vector in the same direction', () => {
    const result = normalize({ x: 3, y: 4 });
    expect(result.x).toBeCloseTo(0.6, 10);
    expect(result.y).toBeCloseTo(0.8, 10);
    expect(magnitude(result)).toBeCloseTo(1, 10);
  });

  it('returns the zero vector for the zero vector instead of dividing by zero', () => {
    expect(normalize(ZERO_VECTOR)).toEqual({ x: 0, y: 0 });
  });
});

describe('fromAngle', () => {
  it('returns the unit vector pointing right for angle 0', () => {
    const result = fromAngle(0);
    expect(result.x).toBeCloseTo(1, 10);
    expect(result.y).toBeCloseTo(0, 10);
  });

  it('returns the unit vector pointing up for angle PI/2', () => {
    const result = fromAngle(Math.PI / 2);
    expect(result.x).toBeCloseTo(0, 10);
    expect(result.y).toBeCloseTo(1, 10);
  });

  it('always returns a unit vector', () => {
    const result = fromAngle(1.234);
    expect(magnitude(result)).toBeCloseTo(1, 10);
  });
});
