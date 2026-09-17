import { useCallback, useEffect, useRef, useState } from "react";
import { Clock3, LogOut } from "lucide-react";

const IDLE_BEFORE_WARNING_MS = 60_000;
const WARNING_DURATION_MS = 30_000;

type LobbyInactivityGuardProps = {
  active: boolean;
  onExpire: () => void | Promise<void>;
};

/** Keeps abandoned waiting lobbies from becoming ghost rooms. */
export function LobbyInactivityGuard({ active, onExpire }: LobbyInactivityGuardProps) {
  const [open, setOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const idleTimer = useRef<number | null>(null);
  const expiryTimer = useRef<number | null>(null);
  const countdownTimer = useRef<number | null>(null);
  const deadline = useRef(0);
  const expired = useRef(false);
  const openRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  const clearTimers = useCallback(() => {
    if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
    if (expiryTimer.current !== null) window.clearTimeout(expiryTimer.current);
    if (countdownTimer.current !== null) window.clearInterval(countdownTimer.current);
    idleTimer.current = null;
    expiryTimer.current = null;
    countdownTimer.current = null;
  }, []);

  const expireRoom = useCallback(() => {
    if (expired.current) return;
    expired.current = true;
    clearTimers();
    openRef.current = false;
    setOpen(false);
    void onExpireRef.current();
  }, [clearTimers]);

  const showWarning = useCallback(() => {
    if (!active || expired.current) return;
    clearTimers();
    deadline.current = Date.now() + WARNING_DURATION_MS;
    setSecondsLeft(30);
    openRef.current = true;
    setOpen(true);
    countdownTimer.current = window.setInterval(() => {
      setSecondsLeft(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
    }, 250);
    expiryTimer.current = window.setTimeout(expireRoom, WARNING_DURATION_MS);
  }, [active, clearTimers, expireRoom]);

  const scheduleWarning = useCallback(() => {
    if (!active || openRef.current || expired.current) return;
    if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(showWarning, IDLE_BEFORE_WARNING_MS);
  }, [active, showWarning]);

  useEffect(() => {
    clearTimers();
    expired.current = false;
    openRef.current = false;
    setOpen(false);
    if (!active) return;

    scheduleWarning();
    const registerActivity = () => { if (!openRef.current) scheduleWarning(); };
    const checkDeadline = () => {
      if (openRef.current && deadline.current && Date.now() >= deadline.current) expireRoom();
    };
    const events: Array<keyof WindowEventMap> = ["pointerdown", "mousemove", "keydown", "touchstart", "scroll"];
    events.forEach(event => window.addEventListener(event, registerActivity, { passive: true }));
    document.addEventListener("visibilitychange", checkDeadline);
    return () => {
      clearTimers();
      events.forEach(event => window.removeEventListener(event, registerActivity));
      document.removeEventListener("visibilitychange", checkDeadline);
    };
  }, [active, clearTimers, expireRoom, scheduleWarning]);

  const confirmPresence = () => {
    clearTimers();
    expired.current = false;
    openRef.current = false;
    setOpen(false);
    window.setTimeout(scheduleWarning, 0);
  };

  if (!active || !open) return null;

  return (
    <div className="fixed inset-0 z-[10000] grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="idle-room-title">
      <section className="w-full max-w-md rounded-3xl border border-violet-400/30 bg-[#171a2b] p-6 text-center text-white shadow-2xl">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-violet-500/15 text-violet-300"><Clock3 className="h-8 w-8" /></div>
        <p className="mt-5 text-xs font-black uppercase tracking-[.22em] text-violet-300">Sala sem atividade</p>
        <h2 id="idle-room-title" className="mt-2 text-3xl font-black">Você ainda está aí?</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">Confirme sua presença para manter esta sala ativa. Sem resposta, ela será encerrada em <strong className="text-white">{secondsLeft}s</strong>.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={expireRoom} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 font-black text-rose-200 transition hover:bg-rose-500/20"><LogOut className="h-4 w-4" /> Sair agora</button>
          <button type="button" autoFocus onClick={confirmPresence} className="min-h-12 rounded-xl bg-violet-600 px-4 font-black text-white transition hover:bg-violet-500 active:scale-[.98]">Sim, continuar</button>
        </div>
      </section>
    </div>
  );
}
