import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { isNativeApp } from "@/lib/nativeApp";
import { showNativeInterstitial } from "@/lib/nativeAdMob";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-contrib-ads";
import "videojs-contrib-ads/dist/videojs.ads.css";
import "videojs-ima";
import "videojs-ima/dist/videojs.ima.css";

const INTERMISSION_AD_TAG = "https://youradexchange.com/video/select.php?r=12215622";
const CONTENT_VIDEO = "https://storage.googleapis.com/gvabox/media/samples/stock.mp4";

function IntermissionAd() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [adError, setAdError] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: "muted",
      muted: true,
      preload: "auto",
      responsive: true,
      fluid: true,
      sources: [{ src: CONTENT_VIDEO, type: "video/mp4" }],
    });

    const imaPlayer = player as typeof player & {
      ima: ((options: { adTagUrl: string; locale: string; showCountdown: boolean }) => void) & {
        initializeAdDisplayContainer?: () => void;
      };
    };

    const handleAdError = () => {
      player.pause();
      setAdError(true);
    };
    player.on("adserror", handleAdError);
    player.on("ima3error", handleAdError);
    player.on("ads-ad-ended", () => player.pause());

    try {
      imaPlayer.ima({
        adTagUrl: INTERMISSION_AD_TAG,
        locale: "pt_br",
        showCountdown: true,
      });
      player.ready(() => {
        try { imaPlayer.ima.initializeAdDisplayContainer?.(); } catch {}
        void player.play()?.catch(() => {
          // Browsers may require the user to press play; controls remain visible.
        });
      });
    } catch (error) {
      console.error("GameIntermission IMA initialization error:", error);
      setAdError(true);
    }

    return () => {
      player.off("adserror", handleAdError);
      player.off("ima3error", handleAdError);
      player.dispose();
    };
  }, []);

  return (
    <section className="w-full" aria-label="Publicidade">
      <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
        Publicidade
      </p>
      <div data-vjs-player className="mx-auto aspect-video w-full max-w-[336px] overflow-hidden rounded-2xl bg-black">
        <video ref={videoRef} className="video-js vjs-default-skin h-full w-full" playsInline />
      </div>
      {adError && <p className="mt-2 text-center text-xs font-semibold text-slate-400">Anúncio indisponível no momento. Você pode continuar a partida.</p>}
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
