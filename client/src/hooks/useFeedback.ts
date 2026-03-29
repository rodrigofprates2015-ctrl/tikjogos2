import { useState, useEffect } from 'react';

const KEY_DONE = 'tikjogos_feedback_done';
const KEY_DISMISSED_AT = 'tikjogos_feedback_dismissed_at';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 4000;

/**
 * Shows the feedback popup on site entry.
 * - If the user submitted feedback: never shows again (localStorage KEY_DONE).
 * - If the user dismissed/skipped: shows again after 24 hours.
 * - Otherwise: shows after a short delay on first visit.
 */
export function useFeedback() {
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(KEY_DONE) === '1') return;

    const dismissedAt = localStorage.getItem(KEY_DISMISSED_AT);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < ONE_DAY_MS) return;
    }

    const timer = setTimeout(() => setShowFeedback(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    localStorage.setItem(KEY_DISMISSED_AT, String(Date.now()));
    setShowFeedback(false);
  };

  const markDone = () => {
    localStorage.setItem(KEY_DONE, '1');
    setShowFeedback(false);
  };

  return { showFeedback, dismiss, markDone };
}

/** @deprecated No longer used — popup is triggered on site entry, not per game. */
export function notifyGameEnded() {}
