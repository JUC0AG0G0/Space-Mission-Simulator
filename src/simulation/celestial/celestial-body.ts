import type { CelestialBody } from '../../types/simulation';

const GRAVITATIONAL_CONSTANT = 6.6743e-11; // m^3 kg^-1 s^-2

export function createCelestialBody(params: {
  id: string;
  name: string;
  radius: number;
  mass: number;
}): CelestialBody {
  return {
    id: params.id,
    name: params.name,
    radius: params.radius,
    mass: params.mass,
    gravitationalParameter: GRAVITATIONAL_CONSTANT * params.mass,
  };
}

/**
 * A simplified, scaled-down "Earth" used for the V0 simulation. Real-world
 * Earth values would put orbital velocities and altitudes in a range that's
 * awkward to visualize and pilot by hand in a browser game, so this body
 * uses a reduced radius and mass while keeping the same overall physical
 * character (surface gravity in the same order of magnitude as Earth's).
 */
export function createEarth(): CelestialBody {
  return createCelestialBody({
    id: 'earth',
    name: 'Earth',
    radius: 600_000, // meters
    mass: 5.972e22, // kilograms (scaled down from real Earth)
  });
}
