import { describe, expect, it } from 'vitest';
import { createCelestialBody, createEarth } from '../../src/simulation/celestial/celestial-body';

const GRAVITATIONAL_CONSTANT = 6.6743e-11;

describe('createCelestialBody', () => {
  it('copies id, name, radius and mass through unchanged', () => {
    const body = createCelestialBody({ id: 'moon', name: 'Moon', radius: 1_737_000, mass: 7.34e22 });

    expect(body.id).toBe('moon');
    expect(body.name).toBe('Moon');
    expect(body.radius).toBe(1_737_000);
    expect(body.mass).toBe(7.34e22);
  });

  it('computes gravitationalParameter as G * mass', () => {
    const mass = 5e24;
    const body = createCelestialBody({ id: 'x', name: 'X', radius: 1, mass });

    expect(body.gravitationalParameter).toBeCloseTo(GRAVITATIONAL_CONSTANT * mass, 5);
  });

  it('returns a zero gravitationalParameter for zero mass', () => {
    const body = createCelestialBody({ id: 'x', name: 'X', radius: 1, mass: 0 });

    expect(body.gravitationalParameter).toBe(0);
  });
});

describe('createEarth', () => {
  it('uses the scaled-down V0 preset values', () => {
    const earth = createEarth();

    expect(earth.id).toBe('earth');
    expect(earth.name).toBe('Earth');
    expect(earth.radius).toBe(600_000);
    expect(earth.mass).toBe(5.972e22);
  });

  it('derives gravitationalParameter from the preset mass', () => {
    const earth = createEarth();

    expect(earth.gravitationalParameter).toBeCloseTo(GRAVITATIONAL_CONSTANT * 5.972e22, 5);
  });
});
