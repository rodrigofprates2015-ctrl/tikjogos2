import { useState, useCallback } from 'react';

const LOCAL_KEY = 'tikjogos_feedback_done';

/**
 * Call checkAfterGame() whenever a game result screen is shown.
 * It queries the server to see if this visitor has played >= 5 games
 * and hasn't submitted feedback yet. If so, sets showFeedback=true.
 *
 * The check is debounced per session via sessionStorage so it only
 * fires once per browser session even if called multiple times.
 */
export function useFeedback() {
  const [showFeedback, setShowFeedback] = useState(false);

  const checkAfterGame = useCallback(async () => {
    // Already submitted — never show again
    if (localStorage.getItem(LOCAL_KEY) === '1') return;
    // Already checked this session — don't spam the server
    if (sessionStorage.getItem('tikjogos_feedback_checked') === '1') return;

    sessionStorage.setItem('tikjogos_feedback_checked', '1');

    try {
      const res = await fetch('/api/analytics/feedback/check');
      if (!res.ok) return;
      const data = await res.json();
      if (data.shouldShow) setShowFeedback(true);
    } catch {
      // Network error — silently ignore
    }
  }, []);

  const dismiss = useCallback(() => setShowFeedback(false), []);

  return { showFeedback, dismiss, checkAfterGame };
}

/** Dispatch from any game result screen to trigger the feedback check. */
export function notifyGameEnded() {
  window.dispatchEvent(new CustomEvent('tikjogos:game-ended'));
}
