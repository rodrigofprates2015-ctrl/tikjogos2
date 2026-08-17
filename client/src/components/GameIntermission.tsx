import { useCallback, useEffect, useRef, useState } from "react";
import { Clock3, Play } from "lucide-react";

const DEFAULT_WAIT_SECONDS = 6;

function IntermissionAd() {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const element = insRef.current;
    if (!element || element.dataset.adsbygoogleStatus) return;

    const frame = window.requestAnimationFrame(() => {
      if (!element.isConnected || element.getBoundingClientRect().width <= 0) return;
      try {
        const adWindow = window as typeof window & { adsbygoogle: any[] };
        (adWindow.adsbygoogle = adWindow.adsbygoogle || []).push({});
      } catch (error) {
        console.error("GameIntermissionAd error:", error);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="w-full" aria-label="Publicidade">
      <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
        Publicidade
      </p>
      <div className="mx-auto flex min-h-[250px] w-full max-w-[336px] items-center justify-center overflow-hidden rounded-2xl bg-white/[0.03]">
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: "block", width: "100%", minHeight: 250 }}
          data-ad-client="ca-pub-9927561573478881"
          data-ad-slot="7536067322"
          data-ad-format="rectangle"
          data-full-width-responsive="true"
        />
      </div>
    </section>
  );
}

export function GameIntermissionScreen({
  onContinue,
  seconds = DEFAULT_WAIT_SECONDS,
}: {
  onContinue: () => void;
  seconds?: number;
}) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = window.setTimeout(() => setRemaining(value => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [remaining]);

  return (
    <main className="min-h-screen w-full bg-[#15172a] px-4 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center gap-6">
        <header className="text-center">
          <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-300">
            <Clock3 size={14} /> Intervalo da partida
          </span>
          <h1 className="text-2xl font-black">Prepare-se para a próxima rodada</h1>
          <p className="mt-2 text-sm text-slate-400">O anúncio é opcional para interação. Você nunca precisa clicar para continuar.</p>
        </header>

        <IntermissionAd />

        <div className="border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={onContinue}
            disabled={remaining > 0}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-800 bg-emerald-500 px-6 py-4 text-base font-black text-white transition enabled:hover:bg-emerald-400 enabled:active:translate-y-1 enabled:active:border-b-0 disabled:cursor-wait disabled:bg-slate-700 disabled:text-slate-400 disabled:border-slate-900"
          >
            <Play size={19} fill="currentColor" />
            {remaining > 0 ? `Continuar em ${remaining}s` : "Continuar para a próxima rodada"}
          </button>
        </div>
      </div>
    </main>
  );
}

export function useGameIntermission() {
  const [visible, setVisible] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

  const showIntermission = useCallback((action: () => void) => {
    pendingAction.current = action;
    setVisible(true);
  }, []);

  const continueGame = useCallback(() => {
    setVisible(false);
    const action = pendingAction.current;
    pendingAction.current = null;
    action?.();
  }, []);

  return {
    showIntermission,
    intermissionScreen: visible ? <GameIntermissionScreen onContinue={continueGame} /> : null,
  };
}
