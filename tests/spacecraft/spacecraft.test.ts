import { describe, expect, it } from 'vitest';
import {
  applyFuelConsumption,
  computeThrustAcceleration,
  createSpacecraft,
  totalMass,
  turnSpacecraft,
} from '../../src/simulation/spacecraft/spacecraft';
import {
  adjustThrottle,
  computeFuelConsumed,
  createEngine,
  currentThrustForce,
  setThrottle,
  toggleEngine,
} from '../../src/simulation/spacecraft/engine';

function makeSpacecraft(overrides: Partial<Parameters<typeof createSpacecraft>[0]> = {}) {
  return createSpacecraft({
    id: 'test-ship',
    name: 'Test Ship',
    position: { x: 1000, y: 0 },
    velocity: { x: 0, y: 0 },
    heading: 0,
    dryMass: 100,
    fuelMass: 50,
    maxFuel: 50,
    engineThrust: 1000,
    engineFuelConsumption: 10,
    ...overrides,
  });
}

describe('totalMass', () => {
  it('is the sum of dry mass and fuel mass', () => {
    const spacecraft = makeSpacecraft({ dryMass: 100, fuelMass: 50 });
    expect(totalMass(spacecraft)).toBe(150);
  });

  it('decreases as fuel is consumed', () => {
    const spacecraft = makeSpacecraft({ dryMass: 100, fuelMass: 10 });
    expect(totalMass(spacecraft)).toBe(110);
  });
});

describe('engine on/off', () => {
  it('produces zero thrust force while inactive', () => {
    const engine = createEngine({ thrust: 500, fuelConsumption: 5 });
    expect(currentThrustForce(engine)).toBe(0);
  });

  it('produces full thrust force at full throttle once active', () => {
    let engine = createEngine({ thrust: 500, fuelConsumption: 5 });
    engine = toggleEngine(engine);
    expect(currentThrustForce(engine)).toBe(500);
  });

  it('scales thrust force by throttle', () => {
    let engine = createEngine({ thrust: 500, fuelConsumption: 5 });
    engine = toggleEngine(engine);
    engine = setThrottle(engine, 0.5);
    expect(currentThrustForce(engine)).toBe(250);
  });

  it('clamps throttle to [0, 1]', () => {
    const engine = createEngine({ thrust: 500, fuelConsumption: 5 });
    expect(setThrottle(engine, 1.5).throttle).toBe(1);
    expect(setThrottle(engine, -0.5).throttle).toBe(0);
  });

  it('adjustThrottle nudges throttle relative to its current value', () => {
    let engine = createEngine({ thrust: 500, fuelConsumption: 5 });
    engine = setThrottle(engine, 0.5);
    const adjusted = adjustThrottle(engine, 0.2);
    expect(adjusted.throttle).toBeCloseTo(0.7, 5);
  });
});

describe('computeThrustAcceleration', () => {
  it('is zero while the engine is off', () => {
    const spacecraft = makeSpacecraft();
    const acceleration = computeThrustAcceleration(spacecraft);
    expect(acceleration).toEqual({ x: 0, y: 0 });
  });

  it('is zero once fuel is exhausted, even if the engine is marked active', () => {
    let spacecraft = makeSpacecraft({ fuelMass: 0 });
    spacecraft = { ...spacecraft, engine: toggleEngine(spacecraft.engine) };
    const acceleration = computeThrustAcceleration(spacecraft);
    expect(acceleration).toEqual({ x: 0, y: 0 });
  });

  it('applies thrust in the direction of the current heading', () => {
    let spacecraft = makeSpacecraft({ heading: 0, dryMass: 100, fuelMass: 50, engineThrust: 1500 });
    spacecraft = { ...spacecraft, engine: toggleEngine(spacecraft.engine) };

    const acceleration = computeThrustAcceleration(spacecraft);
    // heading 0 => +x direction. mass = 150, thrust = 1500 => a = 10
    expect(acceleration.x).toBeCloseTo(10, 5);
    expect(acceleration.y).toBeCloseTo(0, 5);
  });
});

describe('turnSpacecraft', () => {
  it('adds the delta to the current heading', () => {
    const spacecraft = makeSpacecraft({ heading: 1 });
    const turned = turnSpacecraft(spacecraft, 0.5);
    expect(turned.heading).toBeCloseTo(1.5, 10);
  });
});

describe('applyFuelConsumption', () => {
  it('does not change fuel while the engine is inactive', () => {
    const spacecraft = makeSpacecraft({ fuelMass: 50 });
    const result = applyFuelConsumption(spacecraft, 1);
    expect(result.fuelMass).toBe(50);
  });

  it('burns fuel proportionally to deltaTime for typical small steps', () => {
    let spacecraft = makeSpacecraft({ fuelMass: 50, engineFuelConsumption: 10 });
    spacecraft = { ...spacecraft, engine: toggleEngine(spacecraft.engine) };

    // A typical single render-frame step, well under the 0.1s sub-tick size.
    const result = applyFuelConsumption(spacecraft, 1 / 60);
    const expectedConsumed = 10 * (1 / 60);
    expect(result.fuelMass).toBeCloseTo(50 - expectedConsumed, 5);
  });

  it('never goes below zero fuel', () => {
    let spacecraft = makeSpacecraft({ fuelMass: 2, engineFuelConsumption: 10 });
    spacecraft = { ...spacecraft, engine: toggleEngine(spacecraft.engine) };

    const result = applyFuelConsumption(spacecraft, 5);
    expect(result.fuelMass).toBe(0);
  });

  it('switches the engine off once fuel is exhausted', () => {
    let spacecraft = makeSpacecraft({ fuelMass: 2, engineFuelConsumption: 10 });
    spacecraft = { ...spacecraft, engine: toggleEngine(spacecraft.engine) };

    const result = applyFuelConsumption(spacecraft, 5);
    expect(result.engine.active).toBe(false);
  });

  it('burns fuel linearly for a large deltaTime, with no under-counting', () => {
    const engine = createEngine({ thrust: 1000, fuelConsumption: 10 });
    const active = toggleEngine(engine);

    // 10 kg/s * 0.25s = 2.5 kg.
    const actual = computeFuelConsumed(active, 0.25);
    expect(actual).toBeCloseTo(2.5, 8);
  });

  it('is accurate for small deltaTime steps', () => {
    const engine = createEngine({ thrust: 1000, fuelConsumption: 10 });
    const active = toggleEngine(engine);

    const actual = computeFuelConsumed(active, 0.1);
    expect(actual).toBeCloseTo(1, 8);
  });

  it('consumes no fuel while the engine is inactive, even for a non-zero deltaTime', () => {
    const engine = createEngine({ thrust: 1000, fuelConsumption: 10 });

    const actual = computeFuelConsumed(engine, 5);
    expect(actual).toBe(0);
  });
});
