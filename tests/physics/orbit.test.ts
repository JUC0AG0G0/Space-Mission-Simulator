import { describe, expect, it } from 'vitest';
import { computeOrbitRadiusBounds } from '../../src/simulation/physics/orbit';
import type { CelestialBody } from '../../src/types/simulation';

const body: CelestialBody = {
  id: 'test-body',
  name: 'Test Body',
  radius: 100,
  mass: 1,
  gravitationalParameter: 1000,
};

describe('computeOrbitRadiusBounds', () => {
  it('returns a matching periapsis and apoapsis for a circular orbit', () => {
    const radius = 500;
    const circularSpeed = Math.sqrt(body.gravitationalParameter / radius);

    const bounds = computeOrbitRadiusBounds(
      { x: radius, y: 0 },
      { x: 0, y: circularSpeed },
      body,
    );

    expect(bounds).not.toBeNull();
    expect(bounds!.periapsis).toBeCloseTo(radius, 3);
    expect(bounds!.apoapsis).toBeCloseTo(radius, 3);
  });

  it('computes periapsis and apoapsis for an elliptical orbit', () => {
    // Starting exactly at periapsis (velocity purely tangential) with more
    // than circular speed puts the object on a known ellipse: r_p = 400,
    // r_a = 1600 (worked out from the vis-viva equation for these values).
    const bounds = computeOrbitRadiusBounds(
      { x: 400, y: 0 },
      { x: 0, y: 2 },
      body,
    );

    expect(bounds).not.toBeNull();
    expect(bounds!.periapsis).toBeCloseTo(400, 6);
    expect(bounds!.apoapsis).toBeCloseTo(1600, 6);
  });

  it('returns null for an unbound (escape) trajectory', () => {
    const radius = 400;
    const escapeSpeed = Math.sqrt((2 * body.gravitationalParameter) / radius);

    const bounds = computeOrbitRadiusBounds(
      { x: radius, y: 0 },
      { x: 0, y: escapeSpeed + 1 },
      body,
    );

    expect(bounds).toBeNull();
  });
});
