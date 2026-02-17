import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
    __adsLoaded?: boolean;
  }
}

function waitForAdsense(cb: () => void) {
  if (window.__adsLoaded) {
    const raf = requestAnimationFrame(() => cb());
    return () => cancelAnimationFrame(raf);
  }
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    if (window.__adsLoaded || attempts > 30) {
      clearInterval(interval);
      setTimeout(cb, 200);
    }
  }, 500);
  return () => clearInterval(interval);
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
    const cleanup = waitForAdsense(() => {
      if (pushed.current) return;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch (error) {
        console.error('AdSense error:', error);
      }
    });
    return cleanup;
  }, []);

  return (
    <div className="adsense-container overflow-hidden" style={{ minHeight: "90px", contain: "layout style" }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-9927561573478881"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

export function AdBlockTop() {
  return (
    <div className="w-full py-6 px-4" style={{ minHeight: "100px" }}>
      <AdBlock slot="1234567890" format="horizontal" />
    </div>
  );
}

export function AdBlockBottom() {
  return (
    <div className="w-full py-6 px-4" style={{ minHeight: "100px" }}>
      <AdBlock slot="1234567891" format="horizontal" />
    </div>
  );
}

export function AdBlockSidebarMiddle() {
  return (
    <div className="w-full py-2" style={{ minHeight: "250px" }}>
      <AdBlock slot="1234567892" format="rectangle" />
    </div>
  );
}

export function AdBlockSidebarBottom() {
  return (
    <div className="w-full py-2" style={{ minHeight: "250px" }}>
      <AdBlock slot="1234567893" format="rectangle" />
    </div>
  );
}

export function AdBlockSidebarFloating() {
  return (
    <div className="hidden lg:block fixed right-4 top-20 w-64 z-40" style={{ width: "250px", height: "600px" }}>
      <AdBlock slot="1234567894" format="vertical" responsive={false} style={{ width: '250px', height: '600px' }} />
    </div>
  );
}

export function AdBlockInContent() {
  return (
    <div className="w-full py-6 px-4" style={{ minHeight: "100px" }}>
      <AdBlock slot="1234567895" format="fluid" />
    </div>
  );
}
