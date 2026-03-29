import { useState, useEffect } from 'react';

const LOCAL_KEY = 'tikjogos_feedback_done';
const SESSION_KEY = 'tikjogos_feedback_skipped';

/**
 * Controls when to show the feedback popup.
 * - Never shows if localStorage marks it as done or sessionStorage marks it skipped.
 * - Calls /api/analytics/feedback/check (which counts room_join events server-side).
 * - Returns showFeedback=true only when the server says the visitor qualifies.
 */
export function useFeedback() {
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    // Already submitted or skipped this session — bail immediately
    if (
      localStorage.getItem(LOCAL_KEY) === '1' ||
      sessionStorage.getItem(SESSION_KEY) === '1'
    ) {
      return;
    }

    // Delay check slightly so it doesn't fire on initial page load
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/analytics/feedback/check');
        if (!res.ok) return;
        const data = await res.json();
        if (data.shouldShow) setShowFeedback(true);
      } catch {
        // Network error — silently ignore
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => setShowFeedback(false);

  return { showFeedback, dismiss };
}
