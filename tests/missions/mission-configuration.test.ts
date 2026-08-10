import { describe, expect, it } from 'vitest';
import {
  AVAILABLE_DESTINATIONS,
  AVAILABLE_OBJECTIVES,
  createDefaultMissionConfiguration,
  findDestination,
  findObjective,
  isValidMissionConfiguration,
} from '../../src/simulation/missions/mission-configuration';

describe('createDefaultMissionConfiguration', () => {
  it('returns a valid, non-blank configuration', () => {
    const configuration = createDefaultMissionConfiguration();

    expect(configuration.missionName.length).toBeGreaterThan(0);
    expect(configuration.spacecraftName.length).toBeGreaterThan(0);
    expect(isValidMissionConfiguration(configuration)).toBe(true);
  });

  it('picks the first available destination and objective', () => {
    const configuration = createDefaultMissionConfiguration();

    expect(configuration.destinationId).toBe(AVAILABLE_DESTINATIONS[0].id);
    expect(configuration.objectiveId).toBe(AVAILABLE_OBJECTIVES[0].id);
  });
});

describe('findDestination / findObjective', () => {
  it('finds a known destination by id', () => {
    expect(findDestination(AVAILABLE_DESTINATIONS[0].id)).toEqual(
      AVAILABLE_DESTINATIONS[0],
    );
  });

  it('returns undefined for an unknown destination', () => {
    expect(findDestination('mars-orbit')).toBeUndefined();
  });

  it('finds a known objective by id', () => {
    expect(findObjective(AVAILABLE_OBJECTIVES[0].id)).toEqual(
      AVAILABLE_OBJECTIVES[0],
    );
  });

  it('returns undefined for an unknown objective', () => {
    expect(findObjective('land-on-moon')).toBeUndefined();
  });
});

describe('isValidMissionConfiguration', () => {
  it('rejects a blank mission name', () => {
    const configuration = { ...createDefaultMissionConfiguration(), missionName: '   ' };
    expect(isValidMissionConfiguration(configuration)).toBe(false);
  });

  it('rejects a blank spacecraft name', () => {
    const configuration = {
      ...createDefaultMissionConfiguration(),
      spacecraftName: '',
    };
    expect(isValidMissionConfiguration(configuration)).toBe(false);
  });

  it('rejects an unknown destination id', () => {
    const configuration = {
      ...createDefaultMissionConfiguration(),
      destinationId: 'mars-orbit',
    };
    expect(isValidMissionConfiguration(configuration)).toBe(false);
  });

  it('rejects an unknown objective id', () => {
    const configuration = {
      ...createDefaultMissionConfiguration(),
      objectiveId: 'land-on-moon',
    };
    expect(isValidMissionConfiguration(configuration)).toBe(false);
  });
});
