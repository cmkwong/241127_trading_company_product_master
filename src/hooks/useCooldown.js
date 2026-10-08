import { useCallback, useEffect, useState } from 'react';

/**
 * Format a number of whole seconds as a `M:SS` countdown string, e.g. 45 -> "0:45".
 * Kept here so the cooldown display stays consistent everywhere it is shown.
 * @param {number} totalSeconds
 * @returns {string}
 */
export const formatCooldown = (totalSeconds) => {
  const safe = Math.max(0, Number(totalSeconds) || 0);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

/**
 * useCooldown
 * Lightweight, self-cleaning countdown used to throttle repeated actions (e.g.
 * resending a magic-link email). Owned by the parent so the timestamp survives
 * navigation/mode toggles and cannot be bypassed by re-rendering the notice.
 *
 * @param {number} durationMs — length of each cooldown window in milliseconds.
 * @returns {{
 *   secondsLeft: number,   // whole seconds remaining (0 while idle)
 *   isCoolingDown: boolean,
 *   start: () => void,     // begin a fresh cooldown window
 *   reset: () => void,     // clear the cooldown immediately
 * }}
 */
const useCooldown = (durationMs) => {
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!cooldownUntil) return undefined;

    let id;
    const tick = () => {
      const remaining = cooldownUntil - Date.now();
      setNow(Date.now());
      if (remaining <= 0) clearInterval(id);
    };

    id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const secondsLeft = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
  const isCoolingDown = secondsLeft > 0;

  const start = useCallback(() => {
    setCooldownUntil(Date.now() + durationMs);
    setNow(Date.now());
  }, [durationMs]);

  const reset = useCallback(() => {
    setCooldownUntil(0);
    setNow(Date.now());
  }, []);

  return { secondsLeft, isCoolingDown, start, reset };
};

export default useCooldown;
