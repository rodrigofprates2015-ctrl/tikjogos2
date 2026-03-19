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


// Calcula a largura do slot antes de montar o overlay.
// iOS Safari não resolve minWidth/width:100% para offsetWidth até depois
// de um reflow completo — passar a largura como valor fixo em px evita
// que o AdSense leia offsetWidth=0 no momento do push.
function resolveAdWidth(): number {
  // innerWidth é sempre disponível, mesmo antes do primeiro paint
  return Math.min(window.innerWidth - 32, 380);
}

// Componente interno do overlay intersticial — mantém ref estável no <ins>
function InterstitialOverlay({
  countdown,
  onDismiss,
}: {
  countdown: number;
  onDismiss: () => void;
}) {
  const insRef = useRef<HTMLModElement>(null);
  // Largura calculada uma vez, antes do mount, para que o <ins> já
  // tenha width explícito em px desde o primeiro render.
  const adWidth = useRef(resolveAdWidth());

  useEffect(() => {
    const el = insRef.current;
    if (!el || el.dataset.adsbygoogleStatus) return;

    let pushed = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const doPush = () => {
      if (pushed || el.dataset.adsbygoogleStatus) return;
      // offsetWidth deve ser não-zero porque o style inline já tem width em px.
      // Se por algum motivo ainda for 0 (ex: display:none herdado), aborta.
      if (el.offsetWidth <= 0) return;
      pushed = true;
      if (timer) clearTimeout(timer);
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('InterstitialAd error:', e);
      }
    };

    // Dois rAFs: o primeiro garante que o React commitou o DOM,
    // o segundo garante que o browser calculou o layout.
    // O setTimeout de 150 ms é um buffer extra para o iOS Safari,
    // que pode atrasar o reflow em overlays com backdrop-filter.
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        timer = setTimeout(doPush, 150);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/85">
      <div className="relative bg-[#1a1b2e] rounded-3xl shadow-2xl border border-white/10"
           style={{ width: adWidth.current, maxWidth: 'calc(100vw - 32px)' }}>
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

        {/* Ad slot — largura fixa em px para que offsetWidth seja não-zero
            no iOS Safari antes do primeiro reflow do overlay */}
        <div className="p-2" style={{ minHeight: '260px' }}>
          <ins
            ref={insRef}
            className="adsbygoogle"
            style={{
              display: 'block',
              width: adWidth.current,
              minHeight: '250px',
            }}
            data-ad-client="ca-pub-9927561573478881"
            data-ad-slot="9101189574"
            data-ad-format="rectangle"
            data-full-width-responsive="false"
          />
        </div>
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
