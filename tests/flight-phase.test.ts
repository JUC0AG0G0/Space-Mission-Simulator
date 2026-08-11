import { describe, expect, it } from 'vitest';
import { determineFlightPhase } from '../src/simulation/flight-phase';
import { createEarth } from '../src/simulation/celestial/celestial-body';
import { createOrbitMission } from '../src/simulation/missions/mission';
import { createSpacecraft } from '../src/simulation/spacecraft/spacecraft';
import type { Mission, Spacecraft } from '../src/types/simulation';

const centralBody = createEarth();

function spacecraftOnPad(engineActive: boolean): Spacecraft {
  const spacecraft = createSpacecraft({
    id: 'ship',
    name: 'Ship',
    position: { x: centralBody.radius, y: 0 },
    velocity: { x: 0, y: 0 },
    heading: 0,
    dryMass: 100,
    fuelMass: 10,
    maxFuel: 10,
    engineThrust: 100,
    engineFuelConsumption: 1,
  });

  return { ...spacecraft, engine: { ...spacecraft.engine, active: engineActive } };
}

function spacecraftAirborne(): Spacecraft {
  return createSpacecraft({
    id: 'ship',
    name: 'Ship',
    position: { x: centralBody.radius + 1_000, y: 0 },
    velocity: { x: 0, y: 100 },
    heading: 0,
    dryMass: 100,
    fuelMass: 10,
    maxFuel: 10,
    engineThrust: 100,
    engineFuelConsumption: 1,
  });
}

function missionWithStatus(status: Mission['status']): Mission {
  return { ...createOrbitMission(), status };
}

describe('determineFlightPhase', () => {
  it('is PRE-LAUNCH while the countdown is running, regardless of ground state', () => {
    const phase = determineFlightPhase({
      countdown: { remainingSeconds: 2 },
      spacecraft: spacecraftOnPad(false),
      centralBody,
      activeMission: missionWithStatus('active'),
    });

    expect(phase).toBe('pre-launch');
  });

  it('is PRE-LAUNCH once the countdown clears while grounded with the engine off', () => {
    const phase = determineFlightPhase({
      countdown: null,
      spacecraft: spacecraftOnPad(false),
      centralBody,
      activeMission: missionWithStatus('active'),
    });

    expect(phase).toBe('pre-launch');
  });

  it('is LAUNCH once the engine ignites while still grounded', () => {
    const phase = determineFlightPhase({
      countdown: null,
      spacecraft: spacecraftOnPad(true),
      centralBody,
      activeMission: missionWithStatus('active'),
    });

    expect(phase).toBe('launch');
  });

  it('is FLIGHT once the spacecraft is airborne', () => {
    const phase = determineFlightPhase({
      countdown: null,
      spacecraft: spacecraftAirborne(),
      centralBody,
      activeMission: missionWithStatus('active'),
    });

    expect(phase).toBe('flight');
  });

  it('is MISSION_COMPLETE once the active mission succeeds, even mid-flight', () => {
    const phase = determineFlightPhase({
      countdown: null,
      spacecraft: spacecraftAirborne(),
      centralBody,
      activeMission: missionWithStatus('succeeded'),
    });

    expect(phase).toBe('mission-complete');
  });

  it('is MISSION_FAILED once the active mission fails, even mid-flight', () => {
    const phase = determineFlightPhase({
      countdown: null,
      spacecraft: spacecraftAirborne(),
      centralBody,
      activeMission: missionWithStatus('failed'),
    });

    expect(phase).toBe('mission-failed');
  });

  it('ignores the countdown once the mission has already ended', () => {
    const phase = determineFlightPhase({
      countdown: { remainingSeconds: 1 },
      spacecraft: spacecraftOnPad(false),
      centralBody,
      activeMission: missionWithStatus('failed'),
    });

    expect(phase).toBe('mission-failed');
  });

  it('is PRE-LAUNCH with no active mission when grounded and the engine is off', () => {
    const phase = determineFlightPhase({
      countdown: null,
      spacecraft: spacecraftOnPad(false),
      centralBody,
      activeMission: null,
    });

    expect(phase).toBe('pre-launch');
  });
});
