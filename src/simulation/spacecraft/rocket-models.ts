/**
 * Predefined rocket models the player can choose from in `MissionSetup`.
 * Specs live here as data rather than being hard-coded in either the UI or
 * `createInitialSpacecraft` (`simulation-engine.ts`), so adding a new rocket
 * never requires touching either of those.
 */

export interface RocketModel {
  id: string;
  name: string;
  description: string;
  /** Mass of the spacecraft without any fuel, in kilograms. */
  dryMass: number;
  /** Fuel carried at launch, and maximum fuel capacity, in kilograms. */
  fuelMass: number;
  /** Maximum thrust force, in newtons, at 100% throttle. */
  engineThrust: number;
  /** Fuel burned per second, in kilograms, at 100% throttle. */
  engineFuelConsumption: number;
}

export const AVAILABLE_ROCKET_MODELS: RocketModel[] = [
  {
    id: 'explorer-i',
    name: 'Explorer I',
    description: 'A balanced all-rounder, forgiving enough for a first flight.',
    dryMass: 6_000,
    fuelMass: 2_400,
    engineThrust: 120_000,
    engineFuelConsumption: 12,
  },
  {
    id: 'stalwart',
    name: 'Stalwart',
    description:
      'Heavier and slower to accelerate, but carries far more fuel for long burns.',
    dryMass: 8_000,
    fuelMass: 4_000,
    engineThrust: 150_000,
    engineFuelConsumption: 14,
  },
  {
    id: 'javelin',
    name: 'Javelin',
    description:
      'Light and powerful, with a high thrust-to-weight ratio but a small fuel tank.',
    dryMass: 4_500,
    fuelMass: 1_500,
    engineThrust: 130_000,
    engineFuelConsumption: 11,
  },
];

export function findRocketModel(id: string): RocketModel | undefined {
  return AVAILABLE_ROCKET_MODELS.find((model) => model.id === id);
}
