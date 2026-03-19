import { useEffect, useRef, useState, useCallback } from "react";
import { X } from "lucide-react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdBlockProps {
  slot: string;
  format?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
}

export function AdBlock({ slot, format = "auto", responsive = true, style }: AdBlockProps) {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const el = insRef.current;
    if (!el || el.dataset.adsbygoogleStatus) return;

    let rafId: number;
    let attempts = 0;
    const MAX_ATTEMPTS = 60;

    const tryPush = () => {
      if (el.dataset.adsbygoogleStatus) return;
      attempts++;

      // Prefer the element's own width; fall back to its parent's width
      let width = el.getBoundingClientRect().width;
      if (width <= 0 && el.parentElement) {
        width = el.parentElement.getBoundingClientRect().width;
      }

      if (width > 0) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
          console.error('AdSense error:', error);
        }
        return;
      }

      if (attempts < MAX_ATTEMPTS) {
        rafId = requestAnimationFrame(tryPush);
      }
    };

    rafId = requestAnimationFrame(tryPush);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <ins
      ref={insRef}
      className="adsbygoogle"
      style={{ display: 'block', ...style }}
      data-ad-client="ca-pub-9927561573478881"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
    />
  );
}

export function AdBlockTop() {
  return (
    <div className="w-full py-6 px-4">
      <AdBlock slot="1234567890" format="horizontal" />
    </div>
  );
}

export function AdBlockBottom() {
  return (
    <div className="w-full py-6 px-4">
      <AdBlock slot="1234567891" format="horizontal" />
    </div>
  );
}

export function AdBlockSidebarMiddle() {
  return (
    <div className="w-full py-2">
      <AdBlock slot="1234567892" format="rectangle" />
    </div>
  );
}

export function AdBlockSidebarBottom() {
  return (
    <div className="w-full py-2">
      <AdBlock slot="1234567893" format="rectangle" />
    </div>
  );
}

export function AdBlockSidebarFloating() {
  return (
    <div className="hidden lg:block fixed right-4 top-20 w-64 z-40">
      <AdBlock slot="1234567894" format="vertical" responsive={false} style={{ width: '250px', height: '600px' }} />
    </div>
  );
}

export function AdBlockInContent() {
  return (
    <div className="w-full py-6 px-4">
      <AdBlock slot="1234567895" format="fluid" />
    </div>
  );
}

// Bloco 1:1 visível apenas em mobile, entre o form e o footer


// Componente interno do overlay intersticial — mantém ref estável no <ins>
function InterstitialOverlay({
  countdown,
  onDismiss,
}: {
  countdown: number;
  onDismiss: () => void;
}) {
  const insRef = useRef<HTMLModElement>(null);

  // Largura calculada sincronamente antes do primeiro render.
  // window.innerWidth está sempre disponível; não depende de layout pós-mount.
  // O <ins> recebe esse valor como width fixo em px, igual ao padrão do
  // AdSense em outros sites (ex: ssstik.io usa 377px fixo no style inline).
  const slotWidth = useRef(Math.min(window.innerWidth, 380));

  useEffect(() => {
    const el = insRef.current;
    if (!el || el.dataset.adsbygoogleStatus) return;

    let pushed = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const doPush = () => {
      if (pushed || el.dataset.adsbygoogleStatus) return;
      if (el.offsetWidth <= 0) return; // segurança: nunca push com width=0
      pushed = true;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('InterstitialAd error:', e);
      }
    };

    // Dois rAFs garantem que React commitou o DOM e o browser calculou layout.
    // setTimeout 100ms é buffer extra para iOS Safari em overlays fixed.
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        timer = setTimeout(doPush, 100);
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const w = slotWidth.current;

  return (
    // Sem backdrop-filter: cria compositing layer separado no iOS que
    // atrasa o reflow e faz offsetWidth=0 no momento do push.
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/85">

      {/* Container com largura fixa em px — sem padding lateral para que
          o <ins> ocupe exatamente a largura que o AdSense vai medir */}
      <div
        className="relative bg-[#1a1b2e] rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
        style={{ width: w }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Anúncio</span>
          <button
            onClick={onDismiss}
            disabled={countdown > 0}
            className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl transition-all ${
              countdown > 0
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
            }`}
          >
            {countdown > 0 ? (
              <span className="tabular-nums">{countdown}s</span>
            ) : (
              <><X size={14} />Fechar</>
            )}
          </button>
        </div>

        {/* Slot sem padding — width fixo em px igual ao container,
            data-ad-format="auto" + data-full-width-responsive="true"
            igual ao padrão que o AdSense usa em intersticial nativo */}
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: 'block', width: w, minHeight: 250 }}
          data-ad-client="ca-pub-9927561573478881"
          data-ad-slot="9101189574"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}

// Anúncio intersticial: overlay com countdown de 5s, disparado via callback
export function useInterstitialAd() {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const pendingAction = useRef<(() => void) | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const show = useCallback((onDone: () => void) => {
    pendingAction.current = onDone;
    setCountdown(5);
    setVisible(true);
  }, []);

  const dismiss = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setVisible(false);
    const action = pendingAction.current;
    pendingAction.current = null;
    action?.();
  }, []);

  useEffect(() => {
    if (!visible) return;

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visible]);

  const InterstitialAd = visible ? (
    <InterstitialOverlay countdown={countdown} onDismiss={dismiss} />
  ) : null;

  return { show, InterstitialAd };
}
