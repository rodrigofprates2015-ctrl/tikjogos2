import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window { adsbygoogle: any[]; }
}

function AdProbe({ label, slot, format, responsive, extraStyle = {} }: {
  label: string;
  slot: string;
  format: string;
  responsive: boolean;
  extraStyle?: React.CSSProperties;
}) {
  const insRef = useRef<HTMLModElement>(null);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) =>
    setLog(prev => [...prev, `${new Date().toISOString().slice(11, 23)} ${msg}`]);

  useEffect(() => {
    const el = insRef.current;
    if (!el) { addLog('ref is null'); return; }

    addLog(`el.offsetWidth=${el.offsetWidth}`);
    addLog(`parent.offsetWidth=${el.parentElement?.offsetWidth ?? 'n/a'}`);
    addLog(`window.innerWidth=${window.innerWidth}`);
    addLog(`status before: ${el.dataset.adsbygoogleStatus ?? 'none'}`);

    if (el.dataset.adsbygoogleStatus) { addLog('already pushed'); return; }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      addLog('push() OK');
    } catch (e: any) {
      addLog(`push() ERROR: ${e?.message}`);
    }

    const t = setTimeout(() => {
      addLog(`status after: ${el.dataset.adsbygoogleStatus ?? 'none'}`);
      addLog(`ad-status: ${el.dataset.adStatus ?? 'none'}`);
      addLog(`height after: ${el.offsetHeight}`);
    }, 2500);

    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ marginBottom: 28, border: '1px solid #334155', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: '#1e293b', padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>
        {label}
      </div>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', ...extraStyle }}
        data-ad-client="ca-pub-9927561573478881"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
      <div style={{ background: '#020617', padding: '8px 12px', fontFamily: 'monospace', fontSize: 11, color: '#64748b', whiteSpace: 'pre-wrap' }}>
        {log.join('\n') || '...'}
      </div>
    </div>
  );
}

export default function AdTest() {
  const [info, setInfo] = useState('');

  useEffect(() => {
    setInfo([
      `UA: ${navigator.userAgent}`,
      `innerWidth: ${window.innerWidth}`,
      `innerHeight: ${window.innerHeight}`,
      `dpr: ${window.devicePixelRatio}`,
      `adsbygoogle: ${typeof window.adsbygoogle !== 'undefined' ? 'loaded' : 'NOT loaded'}`,
      `queue length: ${(window.adsbygoogle || []).length}`,
    ].join('\n'));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>AdSense Diagnostics</h1>

      <pre style={{ background: '#1e293b', borderRadius: 8, padding: 12, marginBottom: 24, fontSize: 11, color: '#34d399', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {info}
      </pre>

      <AdProbe
        label="Slot 7536067322 — auto + full-width-responsive (padrao AdSense)"
        slot="7536067322"
        format="auto"
        responsive={true}
      />

      <AdProbe
        label="Slot 7536067322 — auto + width:320px fixo"
        slot="7536067322"
        format="auto"
        responsive={false}
        extraStyle={{ width: 320, minHeight: 50 }}
      />

      <AdProbe
        label="Slot 9101189574 — auto + full-width-responsive (intersticial)"
        slot="9101189574"
        format="auto"
        responsive={true}
      />

      <p style={{ fontSize: 11, color: '#475569', marginTop: 16 }}>
        Acesse tikjogos.com.br/ad-test no celular e tire screenshot do log.
      </p>
    </div>
  );
}
