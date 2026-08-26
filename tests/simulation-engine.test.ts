import { describe, expect, it } from 'vitest';
import {
  COUNTDOWN_DURATION_SECONDS,
  MAX_TRAJECTORY_POINTS,
  SimulationEngine,
  createInitialGameState,
} from '../src/simulation/simulation-engine';
import { createSpacecraft } from '../src/simulation/spacecraft/spacecraft';
import type { GameState } from '../src/types/simulation';
import {
  AVAILABLE_MISSION_PROFILES,
  createDefaultMissionConfiguration,
  type MissionConfiguration,
} from '../src/simulation/missions/mission-configuration';
import { AVAILABLE_ROCKET_MODELS } from '../src/simulation/spacecraft/rocket-models';

/**
 * A game state with the pre-flight countdown already cleared, so `step()`
 * and `applyCommand()` exercise flight physics immediately instead of being
 * held back by the countdown. Used by tests that are not about the
 * countdown itself.
 */
function createFlightReadyState(): GameState {
  return { ...createInitialGameState(), countdown: null };
}

/**
 * A game state whose spacecraft sits below the surface (negative altitude),
 * so the very first `step()` causes the mission to fail (crash).
 */
function createCrashedStartState(): GameState {
  const state = createFlightReadyState();
  const { centralBody } = state;

  return {
    ...state,
    spacecraft: createSpacecraft({
      id: 'spacecraft-1',
      name: 'Explorer I',
      position: { x: centralBody.radius - 10, y: 0 },
      velocity: { x: 0, y: 0 },
      heading: 0,
      dryMass: 6_000,
      fuelMass: 2_400,
      maxFuel: 2_400,
      engineThrust: 45_000,
      engineFuelConsumption: 12,
    }),
  };
}

/**
 * A game state whose spacecraft holds a stable circular orbit below the
 * mission's target altitude range, so it neither crashes nor completes the
 * mission (which would also freeze the simulation) within a test run.
 */
function createStableOrbitState(): GameState {
  const state = createFlightReadyState();
  const { centralBody } = state;
  const radius = centralBody.radius + 50_000; // below ORBIT_MIN_ALTITUDE
  const orbitalSpeed = Math.sqrt(
    centralBody.gravitationalParameter / radius,
  );

  return {
    ...state,
    spacecraft: {
      ...state.spacecraft,
      position: { x: radius, y: 0 },
      velocity: { x: 0, y: orbitalSpeed },
    },
  };
}

describe('createInitialGameState starts the spacecraft on the surface', () => {
  it('positions the spacecraft exactly at the surface of the central body', () => {
    const state = createInitialGameState();
    const { spacecraft, centralBody } = state;

    expect(Math.hypot(spacecraft.position.x, spacecraft.position.y)).toBeCloseTo(
      centralBody.radius,
      8,
    );
  });

  it('starts with zero velocity', () => {
    const state = createInitialGameState();
    expect(state.spacecraft.velocity).toEqual({ x: 0, y: 0 });
  });

  it('is oriented radially outward, away from the surface', () => {
    const state = createInitialGameState();
    const { spacecraft } = state;

    expect(Math.cos(spacecraft.heading)).toBeCloseTo(
      spacecraft.position.x / Math.hypot(spacecraft.position.x, spacecraft.position.y),
      8,
    );
    expect(Math.sin(spacecraft.heading)).toBeCloseTo(
      spacecraft.position.y / Math.hypot(spacecraft.position.x, spacecraft.position.y),
      8,
    );
  });

  it('starts with full fuel and the engine off', () => {
    const state = createInitialGameState();
    expect(state.spacecraft.fuelMass).toBe(state.spacecraft.maxFuel);
    expect(state.spacecraft.engine.active).toBe(false);
  });

  it('starts with a pre-flight countdown', () => {
    const state = createInitialGameState();
    expect(state.countdown).toEqual({ remainingSeconds: COUNTDOWN_DURATION_SECONDS });
  });

  it('starts with zero recorded altitude and speed maxima', () => {
    const state = createInitialGameState();
    expect(state.maxAltitude).toBe(0);
    expect(state.maxSpeed).toBe(0);
  });
});

describe('SimulationEngine keeps a grounded, engine-off spacecraft parked on the pad', () => {
  it('does not move or crash the mission while resting with the engine off', () => {
    const engine = new SimulationEngine(createFlightReadyState());
    const initialSpacecraft = engine.getState().spacecraft;

    engine.step(1);
    engine.step(1);
    engine.step(1);

    expect(engine.getState().spacecraft.position).toEqual(initialSpacecraft.position);
    expect(engine.getState().spacecraft.velocity).toEqual(initialSpacecraft.velocity);
    expect(engine.getState().activeMission?.status).toBe('active');
  });

  it('lifts off once the engine is activated', () => {
    const engine = new SimulationEngine(createFlightReadyState());
    const { centralBody } = engine.getState();
    engine.applyCommand({ toggleEngine: true }, 0);

    for (let i = 0; i < 10; i += 1) {
      engine.step(0.5);
    }

    const { spacecraft } = engine.getState();
    const altitude = Math.hypot(spacecraft.position.x, spacecraft.position.y) - centralBody.radius;
    expect(altitude).toBeGreaterThan(0);
  });
});

describe('SimulationEngine freezes fuel consumption while grounded', () => {
  /**
   * A game state whose spacecraft is grounded, has its engine already on,
   * but is turned sideways (heading perpendicular to "up"): thrust has no
   * vertical component, so gravity always wins and the ship never lifts
   * off, no matter how long the engine burns.
   */
  function createGroundedSidewaysState(): GameState {
    const state = createFlightReadyState();
    const { spacecraft } = state;

    return {
      ...state,
      spacecraft: {
        ...spacecraft,
        heading: Math.PI / 2,
        engine: { ...spacecraft.engine, active: true, throttle: 1 },
      },
    };
  }

  it('does not deplete fuel while stuck on the ground with the engine on', () => {
    const engine = new SimulationEngine(createGroundedSidewaysState());
    const initialFuel = engine.getState().spacecraft.fuelMass;

    for (let i = 0; i < 20; i += 1) {
      engine.step(1);
    }

    const { spacecraft, centralBody } = engine.getState();
    const altitude = Math.hypot(spacecraft.position.x, spacecraft.position.y) - centralBody.radius;

    expect(altitude).toBe(0);
    expect(spacecraft.fuelMass).toBe(initialFuel);
  });
});

describe('createInitialGameState with a mission configuration', () => {
  it('defaults to "Explorer I" and "Orbit-01" when no configuration is given', () => {
    const state = createInitialGameState();
    expect(state.spacecraft.name).toBe('Explorer I');
    expect(state.activeMission?.name).toBe('Orbit-01');
  });

  it('names the spacecraft and mission after the given configuration', () => {
    const configuration = {
      ...createDefaultMissionConfiguration(),
      missionName: 'Ares 1',
      spacecraftName: 'Falcon',
    };

    const state = createInitialGameState(configuration);

    expect(state.spacecraft.name).toBe('Falcon');
    expect(state.activeMission?.name).toBe('Ares 1');
  });

  it('builds the spacecraft from the configured rocket model', () => {
    const rocketModel = AVAILABLE_ROCKET_MODELS[1];
    const configuration = {
      ...createDefaultMissionConfiguration(),
      rocketModelId: rocketModel.id,
    };

    const state = createInitialGameState(configuration);

    expect(state.spacecraft.dryMass).toBe(rocketModel.dryMass);
    expect(state.spacecraft.fuelMass).toBe(rocketModel.fuelMass);
    expect(state.spacecraft.maxFuel).toBe(rocketModel.fuelMass);
    expect(state.spacecraft.engine.thrust).toBe(rocketModel.engineThrust);
    expect(state.spacecraft.engine.fuelConsumption).toBe(
      rocketModel.engineFuelConsumption,
    );
  });
});

describe('SimulationEngine time progression', () => {
  it('advances simulationTime by deltaTime on each step', () => {
    const engine = new SimulationEngine(createFlightReadyState());
    engine.step(1);
    engine.step(0.5);
    expect(engine.getState().simulationTime).toBeCloseTo(1.5, 8);
  });

  it('does not advance simulationTime while paused', () => {
    const engine = new SimulationEngine(createFlightReadyState());
    engine.setPaused(true);
    engine.step(1);
    expect(engine.getState().simulationTime).toBe(0);
  });

  it('resumes advancing time after unpausing', () => {
    const engine = new SimulationEngine(createFlightReadyState());
    engine.setPaused(true);
    engine.step(1);
    engine.togglePause();
    engine.step(1);
    expect(engine.getState().simulationTime).toBeCloseTo(1, 8);
  });
});

describe('SimulationEngine time scale', () => {
  it('defaults to 1x', () => {
    const engine = new SimulationEngine(createFlightReadyState());
    expect(engine.getState().timeScale).toBe(1);
  });

  it('advances simulationTime faster once a higher speed is selected', () => {
    const engine = new SimulationEngine(createFlightReadyState());
    engine.setTimeScale(5);
    engine.step(1);
    expect(engine.getState().simulationTime).toBeCloseTo(5, 8);
  });

  it('scales fuel consumption along with simulated time', () => {
    const baseline = new SimulationEngine(createFlightReadyState());
    baseline.applyCommand({ toggleEngine: true }, 0);
    baseline.step(1);

    const spedUp = new SimulationEngine(createFlightReadyState());
    spedUp.applyCommand({ toggleEngine: true }, 0);
    spedUp.setTimeScale(2);
    spedUp.step(1);

    const baselineFuelBurned =
      createFlightReadyState().spacecraft.fuelMass - baseline.getState().spacecraft.fuelMass;
    const spedUpFuelBurned =
      createFlightReadyState().spacecraft.fuelMass - spedUp.getState().spacecraft.fuelMass;
    expect(spedUpFuelBurned).toBeCloseTo(baselineFuelBurned * 2, 6);
  });

  it('ignores an unsupported value, keeping the previous speed', () => {
    const engine = new SimulationEngine(createFlightReadyState());
    engine.setTimeScale(3 as never);
    expect(engine.getState().timeScale).toBe(1);
  });

  it('scales manual turning along with simulated time, so piloting stays proportionally responsive', () => {
    const baseline = new SimulationEngine(createFlightReadyState());
    baseline.applyCommand({ turnDelta: 1 }, 0.1);

    const spedUp = new SimulationEngine(createFlightReadyState());
    spedUp.setTimeScale(5);
    spedUp.applyCommand({ turnDelta: 1 }, 0.1);

    const initialHeading = createFlightReadyState().spacecraft.heading;
    const baselineTurn = baseline.getState().spacecraft.heading - initialHeading;
    const spedUpTurn = spedUp.getState().spacecraft.heading - initialHeading;
    expect(spedUpTurn).toBeCloseTo(baselineTurn * 5, 6);
  });

  it('scales manual throttle changes along with simulated time', () => {
    const baseline = new SimulationEngine(createFlightReadyState());
    baseline.applyCommand({ throttleDelta: -1 }, 0.1);

    const spedUp = new SimulationEngine(createFlightReadyState());
    spedUp.setTimeScale(5);
    spedUp.applyCommand({ throttleDelta: -1 }, 0.1);

    const initialThrottle = createFlightReadyState().spacecraft.engine.throttle;
    const baselineChange = initialThrottle - baseline.getState().spacecraft.engine.throttle;
    const spedUpChange = initialThrottle - spedUp.getState().spacecraft.engine.throttle;
    expect(spedUpChange).toBeCloseTo(baselineChange * 5, 6);
  });

  it('never speeds up the pre-flight countdown, only flight once it clears', () => {
    const engine = new SimulationEngine(createInitialGameState());
    engine.setTimeScale(10);

    engine.step(1);
    expect(engine.getState().countdown).toEqual({ remainingSeconds: 2 });

    engine.step(COUNTDOWN_DURATION_SECONDS);
    expect(engine.getState().countdown).toEqual({ remainingSeconds: 0 });
    expect(engine.getState().simulationTime).toBe(0);

    engine.step(1);
    expect(engine.getState().countdown).toBeNull();
    expect(engine.getState().simulationTime).toBeCloseTo(10, 8);
  });
});

describe('SimulationEngine determinism', () => {
  it('produces identical spacecraft state for two engines given identical commands', () => {
    const engineA = new SimulationEngine(createFlightReadyState());
    const engineB = new SimulationEngine(createFlightReadyState());

    const commands = [
      { throttleDelta: 1 },
      { turnDelta: 1 },
      { toggleEngine: true },
      {},
      { turnDelta: -1 },
    ];

    for (const command of commands) {
      engineA.applyCommand(command, 0.1);
      engineA.step(0.1);
      engineB.applyCommand(command, 0.1);
      engineB.step(0.1);
    }

    expect(engineA.getState().spacecraft).toEqual(engineB.getState().spacecraft);
    expect(engineA.getState().simulationTime).toEqual(engineB.getState().simulationTime);
  });
});

describe('SimulationEngine commands', () => {
  it('turns the spacecraft heading based on turnDelta over time', () => {
    const engine = new SimulationEngine(createFlightReadyState());
    const initialHeading = engine.getState().spacecraft.heading;
    engine.applyCommand({ turnDelta: 1 }, 1);
    expect(engine.getState().spacecraft.heading).toBeGreaterThan(initialHeading);
  });

  it('toggles the engine on and off', () => {
    const engine = new SimulationEngine(createFlightReadyState());
    expect(engine.getState().spacecraft.engine.active).toBe(false);
    engine.applyCommand({ toggleEngine: true }, 0);
    expect(engine.getState().spacecraft.engine.active).toBe(true);
    engine.applyCommand({ toggleEngine: true }, 0);
    expect(engine.getState().spacecraft.engine.active).toBe(false);
  });

  it('ignores toggleEngine, throttleDelta, and turnDelta while paused', () => {
    const engine = new SimulationEngine(createFlightReadyState());
    engine.setPaused(true);
    const spacecraftBefore = engine.getState().spacecraft;

    engine.applyCommand({ toggleEngine: true }, 1);
    engine.applyCommand({ throttleDelta: 1 }, 1);
    engine.applyCommand({ turnDelta: 1 }, 1);

    expect(engine.getState().spacecraft).toEqual(spacecraftBefore);
  });

  it('sets the throttle to an absolute value via setThrottle', () => {
    const engine = new SimulationEngine(createFlightReadyState());
    engine.applyCommand({ setThrottle: 0.5 }, 1);
    expect(engine.getState().spacecraft.engine.throttle).toBe(0.5);
  });

  it('clamps setThrottle to [0, 1] for out-of-range values', () => {
    const engine = new SimulationEngine(createFlightReadyState());
    engine.applyCommand({ setThrottle: 1.5 }, 1);
    expect(engine.getState().spacecraft.engine.throttle).toBe(1);
    engine.applyCommand({ setThrottle: -0.5 }, 1);
    expect(engine.getState().spacecraft.engine.throttle).toBe(0);
  });

  it('applies setThrottle immediately, independent of deltaTime or timeScale', () => {
    const engine = new SimulationEngine(createFlightReadyState());
    engine.setTimeScale(10);
    engine.applyCommand({ setThrottle: 0.3 }, 0);
    expect(engine.getState().spacecraft.engine.throttle).toBe(0.3);
  });

  it('lets a held throttleDelta continue adjusting from a value just set by setThrottle', () => {
    const engine = new SimulationEngine(createFlightReadyState());
    engine.applyCommand({ setThrottle: 0.5, throttleDelta: 1 }, 0.1);
    // THROTTLE_RATE (0.5/s) * 0.1s = 0.05 nudged up from the 0.5 baseline.
    expect(engine.getState().spacecraft.engine.throttle).toBeCloseTo(0.55);
  });

  it('ignores setThrottle while paused', () => {
    const engine = new SimulationEngine(createFlightReadyState());
    engine.applyCommand({ setThrottle: 0.4 }, 0);
    engine.setPaused(true);
    engine.applyCommand({ setThrottle: 0.9 }, 0);
    expect(engine.getState().spacecraft.engine.throttle).toBe(0.4);
  });
});

describe('SimulationEngine trajectory recording', () => {
  it('adds a trajectory point per step, in chronological order', () => {
    const engine = new SimulationEngine(createFlightReadyState());
    engine.step(1);
    engine.step(1);
    engine.step(1);

    const { trajectory } = engine.getState();
    expect(trajectory).toHaveLength(3);
    expect(trajectory[0].time).toBeLessThan(trajectory[1].time);
    expect(trajectory[1].time).toBeLessThan(trajectory[2].time);
  });

  it('caps trajectory history at MAX_TRAJECTORY_POINTS', () => {
    const engine = new SimulationEngine(createStableOrbitState());
    for (let i = 0; i < MAX_TRAJECTORY_POINTS + 50; i += 1) {
      engine.step(0.5);
    }

    expect(engine.getState().trajectory.length).toBe(MAX_TRAJECTORY_POINTS);
  });

  it('does not record a trajectory point while paused', () => {
    const engine = new SimulationEngine(createInitialGameState());
    engine.setPaused(true);
    engine.step(1);
    expect(engine.getState().trajectory).toHaveLength(0);
  });
});

describe('SimulationEngine mission end freezes the simulation', () => {
  it('stops integrating physics once the mission fails', () => {
    const engine = new SimulationEngine(createCrashedStartState());

    engine.step(1);
    expect(engine.getState().activeMission?.status).toBe('failed');

    const frozenState = engine.getState();
    engine.step(1);
    engine.step(1);

    expect(engine.getState().simulationTime).toBe(frozenState.simulationTime);
    expect(engine.getState().spacecraft).toEqual(frozenState.spacecraft);
    expect(engine.getState().trajectory).toEqual(frozenState.trajectory);
  });

  it('ignores flight commands once the mission fails', () => {
    const engine = new SimulationEngine(createCrashedStartState());
    engine.step(1);
    expect(engine.getState().activeMission?.status).toBe('failed');

    const headingBefore = engine.getState().spacecraft.heading;
    engine.applyCommand({ turnDelta: 1, toggleEngine: true }, 1);

    expect(engine.getState().spacecraft.heading).toBe(headingBefore);
    expect(engine.getState().spacecraft.engine.active).toBe(false);
  });

  it('resumes accepting commands and physics after reset', () => {
    const engine = new SimulationEngine(createCrashedStartState());
    engine.step(1);
    expect(engine.getState().activeMission?.status).toBe('failed');

    engine.reset(createFlightReadyState());

    expect(engine.getState().activeMission?.status).toBe('active');
    engine.applyCommand({ toggleEngine: true }, 0);
    expect(engine.getState().spacecraft.engine.active).toBe(true);
  });
});

describe('SimulationEngine reset', () => {
  it('restores a fresh initial state', () => {
    const engine = new SimulationEngine(createInitialGameState());
    engine.step(5);
    engine.applyCommand({ toggleEngine: true }, 0);

    engine.reset();

    const state = engine.getState();
    expect(state.simulationTime).toBe(0);
    expect(state.trajectory).toHaveLength(0);
    expect(state.spacecraft.engine.active).toBe(false);
  });
});

describe('SimulationEngine tracks altitude and speed maxima', () => {
  /**
   * A spacecraft placed at the apoapsis of an eccentric orbit (tangential
   * speed slightly below circular speed for that radius): altitude and
   * speed both decrease from the very first step as it falls toward
   * periapsis, letting us verify the recorded maxima hold steady instead of
   * tracking the instantaneous, decreasing values.
   */
  function createDecayingOrbitState(): GameState {
    const state = createFlightReadyState();
    const { centralBody } = state;
    const radius = centralBody.radius + 50_000;
    const circularSpeed = Math.sqrt(centralBody.gravitationalParameter / radius);

    return {
      ...state,
      spacecraft: {
        ...state.spacecraft,
        position: { x: radius, y: 0 },
        velocity: { x: 0, y: circularSpeed * 0.9 },
      },
    };
  }

  it('never decrease, even while the instantaneous altitude and speed fall', () => {
    const engine = new SimulationEngine(createDecayingOrbitState());
    const { centralBody } = engine.getState();

    // Mirrors `altitudeAboveSurface`/`magnitude` exactly (sqrt(x^2 + y^2), not
    // `Math.hypot`) so the recomputed values here never differ from the
    // engine's own by a rounding ULP.
    function altitudeOf(position: { x: number; y: number }): number {
      return Math.sqrt(position.x ** 2 + position.y ** 2) - centralBody.radius;
    }
    function speedOf(velocity: { x: number; y: number }): number {
      return Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
    }

    let sawAltitudeDrop = false;
    let previousAltitude = altitudeOf(engine.getState().spacecraft.position);
    let previousMaxAltitude = engine.getState().maxAltitude;
    let previousMaxSpeed = engine.getState().maxSpeed;

    for (let i = 0; i < 200; i += 1) {
      engine.step(1);
      const { spacecraft, maxAltitude, maxSpeed } = engine.getState();
      const altitude = altitudeOf(spacecraft.position);
      const speed = speedOf(spacecraft.velocity);

      if (altitude < previousAltitude) {
        sawAltitudeDrop = true;
      }
      expect(maxAltitude).toBeGreaterThanOrEqual(previousMaxAltitude);
      expect(maxSpeed).toBeGreaterThanOrEqual(previousMaxSpeed);
      expect(maxAltitude).toBeGreaterThanOrEqual(altitude);
      expect(maxSpeed).toBeGreaterThanOrEqual(speed);

      previousAltitude = altitude;
      previousMaxAltitude = maxAltitude;
      previousMaxSpeed = maxSpeed;
    }

    expect(sawAltitudeDrop).toBe(true);
  });

  it('does not advance while counting down', () => {
    const engine = new SimulationEngine(createInitialGameState());
    engine.step(1);
    expect(engine.getState().maxAltitude).toBe(0);
    expect(engine.getState().maxSpeed).toBe(0);
  });
});

describe('SimulationEngine countdown', () => {
  it('counts down toward LIFTOFF as the simulation steps, without waiting in real time', () => {
    const engine = new SimulationEngine(createInitialGameState());

    engine.step(1);
    expect(engine.getState().countdown).toEqual({ remainingSeconds: 2 });

    engine.step(1);
    expect(engine.getState().countdown).toEqual({ remainingSeconds: 1 });
  });

  it('does not move the spacecraft or advance simulationTime while counting down', () => {
    const engine = new SimulationEngine(createInitialGameState());
    const initialSpacecraft = engine.getState().spacecraft;

    engine.step(1);
    engine.step(1);

    expect(engine.getState().spacecraft).toEqual(initialSpacecraft);
    expect(engine.getState().simulationTime).toBe(0);
    expect(engine.getState().trajectory).toHaveLength(0);
  });

  it('ignores player commands while counting down', () => {
    const engine = new SimulationEngine(createInitialGameState());

    engine.applyCommand({ toggleEngine: true }, 0);
    engine.applyCommand({ turnDelta: 1 }, 1);

    expect(engine.getState().spacecraft.engine.active).toBe(false);
    expect(engine.getState().spacecraft.heading).toBe(0);
  });

  it('clears the countdown and starts flight once T-0 (LIFTOFF) has passed', () => {
    const engine = new SimulationEngine(createInitialGameState());

    engine.step(COUNTDOWN_DURATION_SECONDS);
    expect(engine.getState().countdown).toEqual({ remainingSeconds: 0 });
    expect(engine.getState().simulationTime).toBe(0);

    engine.step(1);
    expect(engine.getState().countdown).toBeNull();
    expect(engine.getState().simulationTime).toBeCloseTo(1, 8);

    engine.applyCommand({ toggleEngine: true }, 0);
    expect(engine.getState().spacecraft.engine.active).toBe(true);
  });
});

describe('SimulationEngine stays numerically sound across every rocket model x mission profile combination', () => {
  /**
   * Not a gameplay/balance test (no piloting, constant full-vertical
   * thrust): just a robustness sweep across the 9 combinations
   * `MissionSetup` actually lets the player pick, to catch a future
   * regression (e.g. a division involving a particular model's
   * dryMass/fuelMass) that would only surface for some of them.
   */
  for (const rocketModel of AVAILABLE_ROCKET_MODELS) {
    for (const missionProfile of AVAILABLE_MISSION_PROFILES) {
      it(`keeps state finite and fuel within bounds for ${rocketModel.name} on ${missionProfile.name}`, () => {
        const configuration: MissionConfiguration = {
          missionName: 'Robustness sweep',
          spacecraftName: rocketModel.name,
          missionProfileId: missionProfile.id,
          rocketModelId: rocketModel.id,
        };
        const engine = new SimulationEngine({
          ...createInitialGameState(configuration),
          countdown: null,
        });

        engine.applyCommand({ toggleEngine: true, setThrottle: 1 }, 0);
        for (let i = 0; i < 300; i += 1) {
          engine.step(0.1);
        }

        const { spacecraft } = engine.getState();

        expect(Number.isFinite(spacecraft.position.x)).toBe(true);
        expect(Number.isFinite(spacecraft.position.y)).toBe(true);
        expect(Number.isFinite(spacecraft.velocity.x)).toBe(true);
        expect(Number.isFinite(spacecraft.velocity.y)).toBe(true);
        expect(Number.isFinite(spacecraft.heading)).toBe(true);
        expect(Number.isFinite(spacecraft.fuelMass)).toBe(true);

        expect(spacecraft.fuelMass).toBeGreaterThanOrEqual(0);
        expect(spacecraft.fuelMass).toBeLessThanOrEqual(spacecraft.maxFuel);
      });
    }
  }
});
