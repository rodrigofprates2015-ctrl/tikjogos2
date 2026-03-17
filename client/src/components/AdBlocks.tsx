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
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    const timer = setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ins
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
export function AdBlockSquareMobile() {
  return (
    <div className="block md:hidden w-full px-4 py-4">
      <AdBlock
        slot="1234567896"
        format="rectangle"
        style={{ width: '100%', aspectRatio: '1 / 1', minHeight: '250px' }}
      />
    </div>
  );
}

// Anúncio intersticial: overlay com countdown de 5s, disparado via callback
export function useInterstitialAd() {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const pendingAction = useRef<(() => void) | null>(null);
  const pushed = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const show = useCallback((onDone: () => void) => {
    pendingAction.current = onDone;
    pushed.current = false;
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

    // Push ad once when overlay opens
    const adTimer = setTimeout(() => {
      if (!pushed.current) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          pushed.current = true;
        } catch (e) {
          console.error('InterstitialAd error:', e);
        }
      }
    }, 100);

    // Countdown tick
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
      clearTimeout(adTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visible]);

  const InterstitialAd = visible ? (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-sm mx-4 bg-[#1a1b2e] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Anúncio</span>
          <button
            onClick={dismiss}
            disabled={countdown > 0}
            className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl transition-all ${
              countdown > 0
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
            }`}
          >
            {countdown > 0 ? (
              <>
                <span className="tabular-nums">{countdown}s</span>
              </>
            ) : (
              <>
                <X size={14} />
                Fechar
              </>
            )}
          </button>
        </div>

        {/* Ad slot */}
        <div className="p-2">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', minHeight: '250px' }}
            data-ad-client="ca-pub-9927561573478881"
            data-ad-slot="1234567897"
            data-ad-format="rectangle"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </div>
  ) : null;

  return { show, InterstitialAd };
}
