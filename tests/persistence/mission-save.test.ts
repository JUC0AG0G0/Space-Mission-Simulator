import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearSavedMission,
  loadSavedMission,
  saveMission,
} from '../../src/simulation/persistence/mission-save';
import { createDefaultMissionConfiguration } from '../../src/simulation/missions/mission-configuration';
import { createMemoryStorage } from '../test-utils/memory-storage';

const STORAGE_KEY = 'space-mission-simulator:saved-mission';

describe('mission-save', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null when there is no saved mission', () => {
    expect(loadSavedMission()).toBeNull();
  });

  it('round-trips a saved mission configuration', () => {
    const configuration = createDefaultMissionConfiguration();

    saveMission(configuration);

    expect(loadSavedMission()).toEqual(configuration);
  });

  it('clears the saved mission configuration', () => {
    saveMission(createDefaultMissionConfiguration());

    clearSavedMission();

    expect(loadSavedMission()).toBeNull();
  });

  it('ignores corrupted (non-JSON) stored data', () => {
    localStorage.setItem(STORAGE_KEY, 'not valid json{');

    expect(loadSavedMission()).toBeNull();
  });

  it('ignores stored data with the wrong shape', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 'bar' }));

    expect(loadSavedMission()).toBeNull();
  });

  it('ignores a stored configuration that is no longer valid', () => {
    const configuration = {
      ...createDefaultMissionConfiguration(),
      missionProfileId: 'no-longer-available',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configuration));

    expect(loadSavedMission()).toBeNull();
  });

  it('ignores a stored configuration with a blank mission name', () => {
    const configuration = { ...createDefaultMissionConfiguration(), missionName: '   ' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configuration));

    expect(loadSavedMission()).toBeNull();
  });
});
