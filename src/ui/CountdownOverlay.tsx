import type { Countdown } from '../types/simulation';

interface CountdownOverlayProps {
  countdown: Countdown;
}

/**
 * Shown instead of the flight `Hud` before LIFTOFF. The flight HUD only
 * becomes relevant once physics starts, so it stays hidden while the
 * countdown is running.
 */
export function CountdownOverlay({ countdown }: CountdownOverlayProps) {
  const label =
    countdown.remainingSeconds > 0
      ? `T-${Math.ceil(countdown.remainingSeconds)}`
      : 'LIFTOFF';

  return (
    <div className="countdown-overlay">
      <div className="countdown-overlay__status">MISSION READY</div>
      <div className="countdown-overlay__value">{label}</div>
    </div>
  );
}
