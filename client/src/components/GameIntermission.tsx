import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { isNativeApp } from "@/lib/nativeApp";
import { showNativeInterstitial } from "@/lib/nativeAdMob";

function IntermissionAd() {
  useEffect(() => {
    const adWindow = window as typeof window & {
      aclib?: { runVideoSlider: (options: { zoneId: string }) => void };
    };

    const runVideoSlider = () => {
      if (!adWindow.aclib?.runVideoSlider) return false;
      try {
        adWindow.aclib.runVideoSlider({ zoneId: "12215562" });
        return true;
      } catch (error) {
        console.error("GameIntermissionVideoSlider error:", error);
        return true;
      }
    };

    if (runVideoSlider()) return;
    const retry = window.setInterval(() => {
      if (runVideoSlider()) window.clearInterval(retry);
    }, 250);
    const stopRetry = window.setTimeout(() => window.clearInterval(retry), 5_000);

    return () => {
      window.clearInterval(retry);
      window.clearTimeout(stopRetry);
    };
  }, []);

  return (
    <section className="w-full" aria-label="Publicidade">
      <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
        Publicidade
      </p>
      <div className="mx-auto flex min-h-28 w-full max-w-[336px] items-center justify-center overflow-hidden rounded-2xl bg-white/[0.03] px-5 text-center">
        <p className="text-sm font-semibold leading-relaxed text-slate-300">
          O vídeo será exibido para apoiar o TikJogos.
        </p>
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
      <div className="tj-surface w-full max-w-[380px] overflow-hidden">
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
  const nativeAdInProgress = useRef(false);

  const showIntermission = useCallback((action: () => void) => {
    if (isNativeApp()) {
      if (nativeAdInProgress.current) return;
      nativeAdInProgress.current = true;

      void showNativeInterstitial()
        .catch((error) => {
          // Sem rede ou sem preenchimento, a partida deve continuar normalmente.
          console.warn("Native interstitial was skipped:", error);
        })
        .finally(() => {
          nativeAdInProgress.current = false;
          action();
        });
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
