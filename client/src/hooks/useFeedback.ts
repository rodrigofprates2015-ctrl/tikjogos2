import { useState, useCallback } from 'react';

const LOCAL_KEY = 'tikjogos_feedback_done';

/**
 * Call checkAfterGame() from a useEffect inside a game result screen.
 * Queries the server to see if this visitor has played >= 5 games
 * and hasn't submitted feedback yet.
 *
 * Unlike the previous version, this does NOT use sessionStorage to
 * gate the check — it re-checks every time a result screen mounts,
 * so the popup appears as soon as the 5th game is completed even
 * within the same session.
 */
export function useFeedback() {
  const [showFeedback, setShowFeedback] = useState(false);

  const checkAfterGame = useCallback(async () => {
    // Already submitted — never show again
    if (localStorage.getItem(LOCAL_KEY) === '1') return;
    // Already showing — don't double-trigger
    if (document.getElementById('feedback-popup-root')) return;

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
