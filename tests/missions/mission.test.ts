import { describe, expect, it } from 'vitest';
import {
  ORBIT_HOLD_DURATION,
  ORBIT_MAX_ALTITUDE,
  ORBIT_MIN_ALTITUDE,
  createOrbitMission,
  evaluateMission,
  isWithinOrbitRange,
} from '../../src/simulation/missions/mission';
import { createEarth } from '../../src/simulation/celestial/celestial-body';
import { createSpacecraft } from '../../src/simulation/spacecraft/spacecraft';

const centralBody = createEarth();

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

describe('isWithinOrbitRange', () => {
  it('is false below the minimum altitude', () => {
    expect(isWithinOrbitRange(ORBIT_MIN_ALTITUDE - 1)).toBe(false);
  });

  it('is true within the target band', () => {
    expect(isWithinOrbitRange((ORBIT_MIN_ALTITUDE + ORBIT_MAX_ALTITUDE) / 2)).toBe(true);
  });

  it('is false above the maximum altitude', () => {
    expect(isWithinOrbitRange(ORBIT_MAX_ALTITUDE + 1)).toBe(false);
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

  it('fails the mission if the spacecraft reaches or goes below the surface', () => {
    const mission = createOrbitMission();
    const crashed = spacecraftAtAltitude(0);

    const { mission: updated } = evaluateMission(
      { mission, spacecraft: crashed, centralBody, secondsInOrbitRange: 20 },
      1,
    );

    expect(updated.status).toBe('failed');
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
