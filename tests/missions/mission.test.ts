import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ORBIT_SUCCESS_CRITERIA,
  createOrbitMission,
  evaluateMission,
  isWithinOrbitRange,
} from '../../src/simulation/missions/mission';
import { createEarth } from '../../src/simulation/celestial/celestial-body';
import { computeOrbitRadiusBounds } from '../../src/simulation/physics/orbit';
import { createSpacecraft } from '../../src/simulation/spacecraft/spacecraft';
import type { Vector2 } from '../../src/types/simulation';

const centralBody = createEarth();
const { minAltitude: ORBIT_MIN_ALTITUDE, maxAltitude: ORBIT_MAX_ALTITUDE, holdDurationSeconds: ORBIT_HOLD_DURATION } =
  DEFAULT_ORBIT_SUCCESS_CRITERIA;

function spacecraftAtAltitude(altitude: number) {
  return createSpacecraft({
    id: 'ship',
    name: 'Ship',
    position: { x: centralBody.radius + altitude, y: 0 },
    velocity: { x: 0, y: 0 },
    heading: 0,
    dryMass: 100,
    fuelMass: 10,
    maxFuel: 10,
    engineThrust: 100,
    engineFuelConsumption: 1,
  });
}

function spacecraftOnOrbit(position: Vector2, velocity: Vector2, fuelMass: number) {
  return createSpacecraft({
    id: 'ship',
    name: 'Ship',
    position,
    velocity,
    heading: 0,
    dryMass: 100,
    fuelMass,
    maxFuel: 1000,
    engineThrust: 100,
    engineFuelConsumption: 1,
  });
}

function circularOrbitVelocity(radius: number): Vector2 {
  return { x: 0, y: Math.sqrt(centralBody.gravitationalParameter / radius) };
}

describe('isWithinOrbitRange', () => {
  it('is false below the minimum altitude', () => {
    expect(isWithinOrbitRange(ORBIT_MIN_ALTITUDE - 1, DEFAULT_ORBIT_SUCCESS_CRITERIA)).toBe(
      false,
    );
  });

  it('is true within the target band', () => {
    expect(
      isWithinOrbitRange(
        (ORBIT_MIN_ALTITUDE + ORBIT_MAX_ALTITUDE) / 2,
        DEFAULT_ORBIT_SUCCESS_CRITERIA,
      ),
    ).toBe(true);
  });

  it('is false above the maximum altitude', () => {
    expect(isWithinOrbitRange(ORBIT_MAX_ALTITUDE + 1, DEFAULT_ORBIT_SUCCESS_CRITERIA)).toBe(
      false,
    );
  });
});

describe('createOrbitMission', () => {
  it('uses custom success criteria when given one', () => {
    const criteria = { minAltitude: 10_000, maxAltitude: 20_000, holdDurationSeconds: 5 };

    const mission = createOrbitMission('Custom mission', criteria);

    expect(mission.successCriteria).toEqual(criteria);
    expect(mission.objectives.find((o) => o.id === 'reach-altitude')?.description).toContain(
      '10 km',
    );
  });
});

describe('evaluateMission', () => {
  it('does not complete the altitude objective while below the target band', () => {
    const mission = createOrbitMission();
    const spacecraft = spacecraftAtAltitude(ORBIT_MIN_ALTITUDE - 10_000);

    const { mission: updated } = evaluateMission(
      { mission, spacecraft, centralBody, secondsInOrbitRange: 0 },
      1,
    );

    expect(updated.objectives.find((o) => o.id === 'reach-altitude')?.completed).toBe(false);
    expect(updated.status).toBe('active');
  });

  it('completes the altitude objective once within the target band', () => {
    const mission = createOrbitMission();
    const spacecraft = spacecraftAtAltitude((ORBIT_MIN_ALTITUDE + ORBIT_MAX_ALTITUDE) / 2);

    const { mission: updated } = evaluateMission(
      { mission, spacecraft, centralBody, secondsInOrbitRange: 0 },
      1,
    );

    expect(updated.objectives.find((o) => o.id === 'reach-altitude')?.completed).toBe(true);
  });

  it('succeeds once the orbit has been held long enough', () => {
    let mission = createOrbitMission();
    const spacecraft = spacecraftAtAltitude((ORBIT_MIN_ALTITUDE + ORBIT_MAX_ALTITUDE) / 2);

    let secondsInOrbitRange = 0;
    // Step in large enough increments to cross the hold duration.
    for (let i = 0; i < 10; i += 1) {
      const result = evaluateMission(
        { mission, spacecraft, centralBody, secondsInOrbitRange },
        ORBIT_HOLD_DURATION / 9,
      );
      mission = result.mission;
      secondsInOrbitRange = result.secondsInOrbitRange;
    }

    expect(mission.status).toBe('succeeded');
    expect(mission.objectives.every((o) => o.completed)).toBe(true);
  });

  it('uses the mission-specific success criteria rather than a fixed default', () => {
    const criteria = { minAltitude: 500, maxAltitude: 1_000, holdDurationSeconds: 2 };
    const mission = createOrbitMission('Narrow mission', criteria);
    const spacecraft = spacecraftAtAltitude(750);

    const { mission: updated } = evaluateMission(
      { mission, spacecraft, centralBody, secondsInOrbitRange: 0 },
      1,
    );

    expect(updated.objectives.find((o) => o.id === 'reach-altitude')?.completed).toBe(true);
  });

  it('resets the hold timer if the ship leaves the target band', () => {
    const mission = createOrbitMission();
    const inRange = spacecraftAtAltitude((ORBIT_MIN_ALTITUDE + ORBIT_MAX_ALTITUDE) / 2);

    const first = evaluateMission(
      { mission, spacecraft: inRange, centralBody, secondsInOrbitRange: 10 },
      1,
    );
    expect(first.secondsInOrbitRange).toBeCloseTo(11, 5);

    const outOfRange = spacecraftAtAltitude(ORBIT_MAX_ALTITUDE + 50_000);
    const second = evaluateMission(
      {
        mission: first.mission,
        spacecraft: outOfRange,
        centralBody,
        secondsInOrbitRange: first.secondsInOrbitRange,
      },
      1,
    );
    expect(second.secondsInOrbitRange).toBe(0);
  });

  it('does not fail the mission for a spacecraft resting exactly on the surface', () => {
    const mission = createOrbitMission();
    const onThePad = spacecraftAtAltitude(0);

    const { mission: updated } = evaluateMission(
      { mission, spacecraft: onThePad, centralBody, secondsInOrbitRange: 0 },
      1,
    );

    expect(updated.status).toBe('active');
  });

  it('fails the mission if the spacecraft goes below the surface, tagged as a crash', () => {
    const mission = createOrbitMission();
    const crashed = spacecraftAtAltitude(-10);

    const { mission: updated } = evaluateMission(
      { mission, spacecraft: crashed, centralBody, secondsInOrbitRange: 20 },
      1,
    );

    expect(updated.status).toBe('failed');
    expect(updated.failureReason).toBe('crashed');
  });

  it('tags a ground impact as a crash even with the fuel tank already empty', () => {
    // Regression test: running out of fuel and then falling back to the
    // ground must still be reported as a crash, not fuel depletion — see
    // describeFailureCause in mission-result.ts, which reads this field
    // instead of re-deriving the cause from fuelMass.
    const mission = createOrbitMission();
    const crashed = { ...spacecraftAtAltitude(-10), fuelMass: 0 };

    const { mission: updated } = evaluateMission(
      { mission, spacecraft: crashed, centralBody, secondsInOrbitRange: 20 },
      1,
    );

    expect(updated.status).toBe('failed');
    expect(updated.failureReason).toBe('crashed');
  });

  it('fails the mission once a fuel-depleted circular orbit never reaches the target band, tagged as fuel depletion', () => {
    const radius = centralBody.radius + ORBIT_MIN_ALTITUDE - 50_000;
    const spacecraft = spacecraftOnOrbit(
      { x: radius, y: 0 },
      circularOrbitVelocity(radius),
      0,
    );

    const { mission: updated } = evaluateMission(
      { mission: createOrbitMission(), spacecraft, centralBody, secondsInOrbitRange: 0 },
      1,
    );

    expect(updated.status).toBe('failed');
    expect(updated.failureReason).toBe('fuel-depleted');
  });

  it('does not fail a stranded-looking orbit while fuel remains', () => {
    const radius = centralBody.radius + ORBIT_MIN_ALTITUDE - 50_000;
    const spacecraft = spacecraftOnOrbit(
      { x: radius, y: 0 },
      circularOrbitVelocity(radius),
      10,
    );

    const { mission: updated } = evaluateMission(
      { mission: createOrbitMission(), spacecraft, centralBody, secondsInOrbitRange: 0 },
      1,
    );

    expect(updated.status).toBe('active');
  });

  it('does not fail a fuel-depleted elliptical orbit that still periodically crosses the target band', () => {
    const periapsisRadius = centralBody.radius + ORBIT_MIN_ALTITUDE - 50_000;
    // A little faster than circular speed at this radius makes it the
    // periapsis of an ellipse whose apoapsis swings back up into the band.
    const speed = Math.sqrt(centralBody.gravitationalParameter / periapsisRadius) * 1.05;
    const spacecraft = spacecraftOnOrbit(
      { x: periapsisRadius, y: 0 },
      { x: 0, y: speed },
      0,
    );

    const bounds = computeOrbitRadiusBounds(
      spacecraft.position,
      spacecraft.velocity,
      centralBody,
    );
    expect(bounds).not.toBeNull();
    expect(bounds!.apoapsis - centralBody.radius).toBeGreaterThanOrEqual(ORBIT_MIN_ALTITUDE);

    const { mission: updated } = evaluateMission(
      { mission: createOrbitMission(), spacecraft, centralBody, secondsInOrbitRange: 0 },
      1,
    );

    expect(updated.status).toBe('active');
  });

  it('does not fail a fuel-depleted spacecraft on an unbound (escape) trajectory', () => {
    // isStrandedOutsideTargetBand only reasons about closed orbits: an
    // escape trajectory has no periapsis/apoapsis to compare against the
    // target band, so computeOrbitRadiusBounds returns null and the
    // mission must stay active rather than being wrongly failed.
    const radius = centralBody.radius + ORBIT_MAX_ALTITUDE + 50_000;
    const escapeSpeed = Math.sqrt((2 * centralBody.gravitationalParameter) / radius);
    const spacecraft = spacecraftOnOrbit(
      { x: radius, y: 0 },
      { x: 0, y: escapeSpeed + 1 },
      0,
    );

    const bounds = computeOrbitRadiusBounds(
      spacecraft.position,
      spacecraft.velocity,
      centralBody,
    );
    expect(bounds).toBeNull();

    const { mission: updated } = evaluateMission(
      { mission: createOrbitMission(), spacecraft, centralBody, secondsInOrbitRange: 0 },
      1,
    );

    expect(updated.status).toBe('active');
  });

  it('leaves a completed mission unchanged', () => {
    const mission = { ...createOrbitMission(), status: 'succeeded' as const };
    const spacecraft = spacecraftAtAltitude(0);

    const { mission: updated } = evaluateMission(
      { mission, spacecraft, centralBody, secondsInOrbitRange: 0 },
      1,
    );

    expect(updated.status).toBe('succeeded');
  });
});
