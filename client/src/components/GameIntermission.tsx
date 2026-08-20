import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { isNativeApp } from "@/lib/nativeApp";

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
}: {
  onContinue: () => void;
}) {
  if (isNativeApp()) return null;
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 px-3 py-5 text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Publicidade entre partidas"
    >
      <div className="w-full max-w-[380px] overflow-hidden rounded-3xl border border-white/10 bg-[#1a1b2e] shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Pausa rápida — Publicidade
          </span>
          <button
            type="button"
            onClick={onContinue}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-emerald-500"
            aria-label="Fechar anúncio e continuar"
          >
            <X size={14} /> Fechar
          </button>
        </header>

        <div className="p-3">
          <IntermissionAd />
        </div>
      </div>
    </div>
  );
}

export function useGameIntermission() {
  const [visible, setVisible] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

  const showIntermission = useCallback((action: () => void) => {
    if (isNativeApp()) {
      action();
      return;
    }
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
