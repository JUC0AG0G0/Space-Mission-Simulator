import { describe, expect, it } from 'vitest';
import {
  AVAILABLE_ROCKET_MODELS,
  findRocketModel,
} from '../../src/simulation/spacecraft/rocket-models';

describe('AVAILABLE_ROCKET_MODELS', () => {
  it('exposes several predefined rocket models', () => {
    expect(AVAILABLE_ROCKET_MODELS.length).toBeGreaterThan(1);
  });

  it('gives each model a unique id', () => {
    const ids = AVAILABLE_ROCKET_MODELS.map((model) => model.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('defines a name, description, and positive specs for each model', () => {
    for (const model of AVAILABLE_ROCKET_MODELS) {
      expect(model.name.length).toBeGreaterThan(0);
      expect(model.description.length).toBeGreaterThan(0);
      expect(model.dryMass).toBeGreaterThan(0);
      expect(model.fuelMass).toBeGreaterThan(0);
      expect(model.engineThrust).toBeGreaterThan(0);
      expect(model.engineFuelConsumption).toBeGreaterThan(0);
    }
  });
});

describe('findRocketModel', () => {
  it('finds a known model by id', () => {
    expect(findRocketModel(AVAILABLE_ROCKET_MODELS[0].id)).toEqual(
      AVAILABLE_ROCKET_MODELS[0],
    );
  });

  it('returns undefined for an unknown model', () => {
    expect(findRocketModel('mega-booster')).toBeUndefined();
  });
});
