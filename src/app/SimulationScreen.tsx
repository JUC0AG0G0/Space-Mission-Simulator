import { useEffect, useRef, useState } from 'react';
import type { GameState, SimulationCommand } from '../types/simulation';
import { SimulationEngine, createInitialGameState } from '../simulation/simulation-engine';
import type { MissionConfiguration } from '../simulation/missions/mission-configuration';
import { buildMissionResultStats } from '../simulation/missions/mission-result';
import { determineGamePhase } from './game-phase';
import { renderScene } from '../rendering/canvas-renderer';
import { Hud } from '../ui/Hud';
import { CountdownOverlay } from '../ui/CountdownOverlay';
import { MissionResult } from '../ui/MissionResult';
import { ControlsPanel } from '../ui/ControlsPanel';
import { MissionPanel } from '../ui/MissionPanel';
import { SimulationControls } from '../ui/SimulationControls';

/** Upper bound on a single simulation step, in seconds, to avoid huge
 * physics jumps if the browser tab was backgrounded or stalled. */
const MAX_FRAME_DELTA = 0.25;

const CONTINUOUS_KEYS = new Set([
  'w',
  'arrowup',
  's',
  'arrowdown',
  'a',
  'arrowleft',
  'd',
  'arrowright',
]);

function buildCommandFromKeys(held: Set<string>): SimulationCommand {
  let throttleDelta = 0;
  let turnDelta = 0;

  if (held.has('w') || held.has('arrowup')) throttleDelta += 1;
  if (held.has('s') || held.has('arrowdown')) throttleDelta -= 1;
  if (held.has('a') || held.has('arrowleft')) turnDelta += 1;
  if (held.has('d') || held.has('arrowright')) turnDelta -= 1;

  return { throttleDelta, turnDelta };
}

interface SimulationScreenProps {
  missionConfiguration: MissionConfiguration;
  /** Called when the player leaves the simulation from the mission result screen. */
  onExit: () => void;
}

/**
 * Owns the active simulation's game loop: it advances the
 * `SimulationEngine` on every animation frame using a deterministic
 * `deltaTime`, and calls the renderer to draw the current state.
 */
export function SimulationScreen({ missionConfiguration, onExit }: SimulationScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<SimulationEngine>(
    new SimulationEngine(createInitialGameState(missionConfiguration)),
  );
  const heldKeysRef = useRef<Set<string>>(new Set());
  const missionConfigurationRef = useRef(missionConfiguration);
  missionConfigurationRef.current = missionConfiguration;
  const [state, setState] = useState<GameState>(() => engineRef.current.getState());

  // Keyboard input: continuous movement keys are tracked in a ref and
  // sampled every frame; discrete actions (toggle engine, pause, restart)
  // fire once on keydown.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();

      if (CONTINUOUS_KEYS.has(key)) {
        heldKeysRef.current.add(key);
        event.preventDefault();
        return;
      }

      if (key === ' ') {
        engineRef.current.applyCommand({ toggleEngine: true }, 0);
        event.preventDefault();
        return;
      }

      if (key === 'p') {
        engineRef.current.togglePause();
        event.preventDefault();
        return;
      }

      if (key === 'r') {
        engineRef.current.reset(createInitialGameState(missionConfigurationRef.current));
        event.preventDefault();
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if (CONTINUOUS_KEYS.has(key)) {
        heldKeysRef.current.delete(key);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Main game loop.
  useEffect(() => {
    let animationFrame: number;
    let lastTimestamp: number | null = null;

    function tick(timestamp: number) {
      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
      }
      const deltaSeconds = Math.min(
        (timestamp - lastTimestamp) / 1000,
        MAX_FRAME_DELTA,
      );
      lastTimestamp = timestamp;

      const engine = engineRef.current;
      const command = buildCommandFromKeys(heldKeysRef.current);
      engine.applyCommand(command, deltaSeconds);
      engine.step(deltaSeconds);

      const nextState = engine.getState();
      setState(nextState);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.clientWidth;
          const height = canvas.clientHeight;
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
          }
          renderScene(ctx, nextState, { width: canvas.width, height: canvas.height });
        }
      }

      animationFrame = requestAnimationFrame(tick);
    }

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const gamePhase = determineGamePhase('simulation', state);
  const isMissionOver = gamePhase === 'mission-complete' || gamePhase === 'mission-failed';

  if (isMissionOver) {
    return (
      <MissionResult
        stats={buildMissionResultStats(state)}
        onMenu={onExit}
        onReplay={() =>
          engineRef.current.reset(createInitialGameState(missionConfiguration))
        }
      />
    );
  }

  return (
    <div className="app">
      <canvas ref={canvasRef} className="app__canvas" />
      {state.countdown ? <CountdownOverlay countdown={state.countdown} /> : <Hud state={state} />}
      <div className="app__sidebar">
        <MissionPanel mission={state.activeMission} />
        <SimulationControls
          paused={state.paused}
          onTogglePause={() => engineRef.current.togglePause()}
          onRestart={() => engineRef.current.reset(createInitialGameState(missionConfiguration))}
        />
        <ControlsPanel />
      </div>
    </div>
  );
}
