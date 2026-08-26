import { useEffect, useRef, useState } from 'react';
import type { GameState, SimulationCommand } from '../types/simulation';
import { SimulationEngine, createInitialGameState } from '../simulation/simulation-engine';
import type { MissionConfiguration } from '../simulation/missions/mission-configuration';
import { buildMissionResultStats } from '../simulation/missions/mission-result';
import { markMissionCompleted } from '../simulation/progression/mission-progress';
import { determineGamePhase } from './game-phase';
import { renderScene } from '../rendering/canvas-renderer';
import { computeCanvasBufferSize } from '../rendering/canvas/canvas-buffer-size';
import { Hud } from '../ui/Hud';
import { CountdownOverlay } from '../ui/CountdownOverlay';
import { MissionResult } from '../ui/MissionResult';
import { ControlsPanel } from '../ui/ControlsPanel';
import { MissionPanel } from '../ui/MissionPanel';
import { SimulationControls } from '../ui/SimulationControls';
import { TouchControls } from '../ui/TouchControls';

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

function isMissionOverState(gameState: GameState): boolean {
  const phase = determineGamePhase('simulation', gameState);
  return phase === 'mission-complete' || phase === 'mission-failed';
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
  // Bumped on every reset to make the main game loop effect below re-run:
  // the loop stops scheduling frames once the mission is over (see `tick`),
  // so restarting it after a reset needs an explicit signal rather than a
  // one-time `[]` effect.
  const [loopGeneration, setLoopGeneration] = useState(0);

  // Resets the engine, immediately reflects the fresh state in React state
  // (so the UI doesn't stay stuck on the mission result screen), and
  // restarts the game loop if it had stopped because the previous mission
  // was over.
  function performReset(config: MissionConfiguration) {
    engineRef.current.reset(createInitialGameState(config));
    setState(engineRef.current.getState());
    setLoopGeneration((generation) => generation + 1);
  }

  // Keyboard input: continuous movement keys are tracked in a ref and
  // sampled every frame; discrete actions (toggle engine, pause, restart)
  // fire once on keydown.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();

      // Don't hijack browser/OS shortcuts that happen to share these keys
      // (Ctrl/Cmd+A select-all, Ctrl/Cmd+S save, Ctrl/Cmd+D bookmark,
      // Ctrl/Cmd+R refresh, Ctrl/Cmd+P print, Alt combos, etc.). Checked
      // first so it covers both the continuous and discrete key branches
      // below without duplicating the guard.
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      // Don't hijack a focused form control's own keyboard interaction —
      // e.g. the Throttle <input type="range"> in SimulationControls relies
      // on the browser's native Arrow Left/Right/Up/Down stepping, which
      // this window-level listener would otherwise suppress via
      // preventDefault() below before it ever runs.
      if (event.target instanceof HTMLInputElement) {
        return;
      }

      if (CONTINUOUS_KEYS.has(key)) {
        heldKeysRef.current.add(key);
        event.preventDefault();
        return;
      }

      if (key === ' ' || key === 'p' || key === 'r') {
        // Ignore OS key-repeat: holding the key down should fire the
        // action once, not once per repeat event.
        if (event.repeat) {
          return;
        }

        if (key === ' ') {
          engineRef.current.applyCommand({ toggleEngine: true }, 0);
        } else if (key === 'p') {
          engineRef.current.togglePause();
        } else {
          performReset(missionConfigurationRef.current);
        }
        event.preventDefault();
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if (CONTINUOUS_KEYS.has(key)) {
        heldKeysRef.current.delete(key);
      }
    }

    // The browser never fires `keyup` for a key that's still physically held
    // when the window loses focus (e.g. Alt/Cmd+Tab away while holding W) —
    // without this, the key stays "stuck" in `heldKeysRef` and keeps steering
    // the ship after focus returns, until the same key is pressed again.
    function onWindowBlur() {
      heldKeysRef.current.clear();
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onWindowBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onWindowBlur);
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
          const clientWidth = canvas.clientWidth;
          const clientHeight = canvas.clientHeight;
          const devicePixelRatio = window.devicePixelRatio || 1;
          const { width, height } = computeCanvasBufferSize(
            clientWidth,
            clientHeight,
            devicePixelRatio,
          );
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
          }
          // The buffer is sized in device pixels; scale the context so the
          // rest of the render pipeline keeps reasoning in CSS pixels.
          ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
          renderScene(ctx, nextState, { width: clientWidth, height: clientHeight });
        }
      }

      // Stop the loop once the mission is over instead of scheduling
      // another frame that would just re-apply no-op commands: a reset
      // (Replay/Restart/R) bumps `loopGeneration` to restart it.
      if (isMissionOverState(nextState)) {
        return;
      }

      animationFrame = requestAnimationFrame(tick);
    }

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [loopGeneration]);

  // Record progression once the active mission succeeds. `state` changes on
  // every frame, but the effect only fires again when the mission status or
  // the profile actually changes, so this runs exactly once per success.
  useEffect(() => {
    if (state.activeMission?.status === 'succeeded') {
      markMissionCompleted(missionConfiguration.missionProfileId);
    }
  }, [state.activeMission?.status, missionConfiguration.missionProfileId]);

  function handleTouchHoldChange(key: 'w' | 's' | 'a' | 'd', active: boolean) {
    if (active) {
      heldKeysRef.current.add(key);
    } else {
      heldKeysRef.current.delete(key);
    }
  }

  if (isMissionOverState(state)) {
    return (
      <MissionResult
        stats={buildMissionResultStats(state)}
        onMenu={onExit}
        onReplay={() => performReset(missionConfiguration)}
      />
    );
  }

  return (
    <div className="app">
      <canvas
        ref={canvasRef}
        className="app__canvas"
        role="img"
        aria-label="Live spacecraft flight visualization"
      />
      {state.countdown ? <CountdownOverlay countdown={state.countdown} /> : <Hud state={state} />}
      <div className="app__sidebar">
        <MissionPanel mission={state.activeMission} />
        <SimulationControls
          paused={state.paused}
          onTogglePause={() => engineRef.current.togglePause()}
          onRestart={() => performReset(missionConfiguration)}
          timeScale={state.timeScale}
          onSetTimeScale={(scale) => engineRef.current.setTimeScale(scale)}
          throttle={state.spacecraft.engine.throttle}
          onSetThrottle={(throttle) => engineRef.current.applyCommand({ setThrottle: throttle }, 0)}
          countingDown={state.countdown !== null}
        />
        <ControlsPanel />
      </div>
      <TouchControls
        engineActive={state.spacecraft.engine.active}
        onEngineToggle={() => engineRef.current.applyCommand({ toggleEngine: true }, 0)}
        onHoldChange={handleTouchHoldChange}
      />
    </div>
  );
}
