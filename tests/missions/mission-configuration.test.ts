import { describe, expect, it } from 'vitest';
import {
  AVAILABLE_MISSION_PROFILES,
  createDefaultMissionConfiguration,
  findMissionProfile,
  isValidMissionConfiguration,
} from '../../src/simulation/missions/mission-configuration';
import { AVAILABLE_ROCKET_MODELS } from '../../src/simulation/spacecraft/rocket-models';

describe('createDefaultMissionConfiguration', () => {
  it('returns a valid, non-blank configuration', () => {
    const configuration = createDefaultMissionConfiguration();

    expect(configuration.missionName.length).toBeGreaterThan(0);
    expect(configuration.spacecraftName.length).toBeGreaterThan(0);
    expect(isValidMissionConfiguration(configuration)).toBe(true);
  });

  it('picks the first available mission profile', () => {
    const configuration = createDefaultMissionConfiguration();

    expect(configuration.missionProfileId).toBe(AVAILABLE_MISSION_PROFILES[0].id);
  });

  it('picks the first available rocket model', () => {
    const configuration = createDefaultMissionConfiguration();

    expect(configuration.rocketModelId).toBe(AVAILABLE_ROCKET_MODELS[0].id);
  });
});

describe('AVAILABLE_MISSION_PROFILES', () => {
  it('exposes several predefined mission profiles', () => {
    expect(AVAILABLE_MISSION_PROFILES.length).toBeGreaterThan(1);
  });

  it('gives each profile a unique id', () => {
    const ids = AVAILABLE_MISSION_PROFILES.map((profile) => profile.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('defines a name, destination, difficulty, objective, and success criteria for each profile', () => {
    for (const profile of AVAILABLE_MISSION_PROFILES) {
      expect(profile.name.length).toBeGreaterThan(0);
      expect(profile.destinationName.length).toBeGreaterThan(0);
      expect(profile.description.length).toBeGreaterThan(0);
      expect(['easy', 'medium', 'hard']).toContain(profile.difficulty);
      expect(profile.objectiveDescription.length).toBeGreaterThan(0);
      expect(profile.successCriteria.minAltitude).toBeLessThan(
        profile.successCriteria.maxAltitude,
      );
      expect(profile.successCriteria.holdDurationSeconds).toBeGreaterThan(0);
    }
  });
});

describe('findMissionProfile', () => {
  it('finds a known profile by id', () => {
    expect(findMissionProfile(AVAILABLE_MISSION_PROFILES[0].id)).toEqual(
      AVAILABLE_MISSION_PROFILES[0],
    );
  });

  it('returns undefined for an unknown profile', () => {
    expect(findMissionProfile('mars-landing')).toBeUndefined();
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

  it('rejects an unknown mission profile id', () => {
    const configuration = {
      ...createDefaultMissionConfiguration(),
      missionProfileId: 'mars-landing',
    };
    expect(isValidMissionConfiguration(configuration)).toBe(false);
  });

  it('rejects an unknown rocket model id', () => {
    const configuration = {
      ...createDefaultMissionConfiguration(),
      rocketModelId: 'mega-booster',
    };
    expect(isValidMissionConfiguration(configuration)).toBe(false);
  });
});
