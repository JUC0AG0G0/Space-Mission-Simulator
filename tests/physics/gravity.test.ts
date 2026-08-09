import { describe, expect, it } from 'vitest';
import { computeGravitationalAcceleration } from '../../src/simulation/physics/gravity';
import type { CelestialBody } from '../../src/types/simulation';

const body: CelestialBody = {
  id: 'test-body',
  name: 'Test Body',
  radius: 100,
  mass: 1,
  gravitationalParameter: 1000,
};

describe('computeGravitationalAcceleration', () => {
  it('points from the object towards the body center', () => {
    const acceleration = computeGravitationalAcceleration({ x: 500, y: 0 }, body);
    expect(acceleration.x).toBeLessThan(0);
    expect(acceleration.y).toBeCloseTo(0);
  });

  it('points towards the body from any direction', () => {
    const acceleration = computeGravitationalAcceleration({ x: 0, y: -500 }, body);
    expect(acceleration.y).toBeGreaterThan(0);
    expect(acceleration.x).toBeCloseTo(0);
  });

  it('follows the inverse-square law', () => {
    const near = computeGravitationalAcceleration({ x: 200, y: 0 }, body);
    const far = computeGravitationalAcceleration({ x: 400, y: 0 }, body);

    const nearMagnitude = Math.abs(near.x);
    const farMagnitude = Math.abs(far.x);

    // Doubling the distance should quarter the acceleration.
    expect(nearMagnitude / farMagnitude).toBeCloseTo(4, 5);
  });

  it('matches mu / r^2 in magnitude', () => {
    const distance = 250;
    const acceleration = computeGravitationalAcceleration({ x: distance, y: 0 }, body);
    const expectedMagnitude = body.gravitationalParameter / (distance * distance);
    expect(Math.abs(acceleration.x)).toBeCloseTo(expectedMagnitude, 8);
  });

  it('clamps to the body radius to avoid infinite acceleration at the center', () => {
    const atCenterEdge = computeGravitationalAcceleration({ x: 10, y: 0 }, body);
    const atRadius = computeGravitationalAcceleration({ x: body.radius, y: 0 }, body);
    expect(Math.abs(atCenterEdge.x)).toBeCloseTo(Math.abs(atRadius.x), 8);
  });

  it('returns zero acceleration exactly at the origin', () => {
    const acceleration = computeGravitationalAcceleration({ x: 0, y: 0 }, body);
    expect(acceleration.x).toBe(0);
    expect(acceleration.y).toBe(0);
  });
});
