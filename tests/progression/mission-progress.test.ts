import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildMissionProgress,
  loadCompletedMissionIds,
  markMissionCompleted,
} from '../../src/simulation/progression/mission-progress';
import { AVAILABLE_MISSION_PROFILES } from '../../src/simulation/missions/mission-configuration';
import { createMemoryStorage } from '../test-utils/memory-storage';

const STORAGE_KEY = 'space-mission-simulator:mission-progress';

describe('mission-progress', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports no completed missions initially', () => {
    expect(loadCompletedMissionIds()).toEqual([]);
  });

  it('records a mission as completed', () => {
    markMissionCompleted('earth-orbit');

    expect(loadCompletedMissionIds()).toEqual(['earth-orbit']);
  });

  it('does not duplicate an already-completed mission', () => {
    markMissionCompleted('earth-orbit');
    markMissionCompleted('earth-orbit');

    expect(loadCompletedMissionIds()).toEqual(['earth-orbit']);
  });

  it('accumulates multiple completed missions', () => {
    markMissionCompleted('earth-orbit');
    markMissionCompleted('high-orbit');

    expect(loadCompletedMissionIds().sort()).toEqual(['earth-orbit', 'high-orbit']);
  });

  it('ignores corrupted (non-JSON) stored data', () => {
    localStorage.setItem(STORAGE_KEY, 'not valid json{');

    expect(loadCompletedMissionIds()).toEqual([]);
  });

  it('ignores stored data with the wrong shape', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 'bar' }));

    expect(loadCompletedMissionIds()).toEqual([]);
  });

  it('does not throw when localStorage.setItem fails (quota, private mode, ...)', () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => markMissionCompleted('earth-orbit')).not.toThrow();
  });

  describe('buildMissionProgress', () => {
    it('lists every available mission profile as not completed by default', () => {
      const progress = buildMissionProgress();

      expect(progress).toHaveLength(AVAILABLE_MISSION_PROFILES.length);
      expect(progress.every((entry) => entry.completed === false)).toBe(true);
    });

    it('marks entries as completed based on the given completed ids', () => {
      const progress = buildMissionProgress(['earth-orbit']);

      const earthOrbit = progress.find((entry) => entry.id === 'earth-orbit');
      const highOrbit = progress.find((entry) => entry.id === 'high-orbit');

      expect(earthOrbit?.completed).toBe(true);
      expect(highOrbit?.completed).toBe(false);
    });

    it('reads from storage when no completed ids are given', () => {
      markMissionCompleted('fast-orbit');

      const progress = buildMissionProgress();

      expect(progress.find((entry) => entry.id === 'fast-orbit')?.completed).toBe(true);
    });
  });
});
