import { useEffect, useRef, useState, useCallback } from "react";
import { X, Heart, Copy, Loader2, Check } from "lucide-react";


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
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
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

// Bloco entre form e footer.
// Usa window.innerWidth para decidir qual variante montar — apenas um
// <ins> existe no DOM por vez, evitando push em elemento com width=0.
// Mobile (<768px): auto responsivo 1:1
// Desktop (>=768px): leaderboard 728×90
export function AdBlockBetweenFormAndFooter() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    const timer = setTimeout(() => {
      try {
        if (!insRef.current) return;
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {}
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  if (isMobile) {
    return (
      <div className="w-full bg-[#13142a] py-4 px-4">
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-9927561573478881"
          data-ad-slot="7536067322"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-[#13142a] py-4 flex justify-center">
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '728px', height: '90px' }}
        data-ad-client="ca-pub-9927561573478881"
        data-ad-slot="7536067322"
        data-ad-format="horizontal"
        data-full-width-responsive="false"
      />
    </div>
  );
}

type PaymentState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'awaiting_payment'; paymentId: string; qrCode: string; qrCodeBase64?: string }
  | { status: 'success' }
  | { status: 'error'; error: string };

const PRESET_AMOUNTS = [2, 5, 10];

// Popup de doação via PIX — substitui o intersticial de anúncio
function DonationInterstitial({
  onDismiss,
}: {
  onDismiss: () => void;
}) {
  const [amount, setAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [payment, setPayment] = useState<PaymentState>({ status: 'idle' });
  const [copied, setCopied] = useState(false);

  const finalAmount = customAmount ? parseFloat(customAmount) : amount;

  // Polling de status do pagamento
  useEffect(() => {
    if (payment.status !== 'awaiting_payment') return;
    let active = true;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/donations/status/${payment.paymentId}`);
        if (res.ok && active) {
          const data = await res.json();
          if (data.status === 'approved') {
            clearInterval(id);
            setPayment({ status: 'success' });
          }
        }
      } catch {}
    }, 5000);
    return () => { active = false; clearInterval(id); };
  }, [payment]);

  const handleDonate = async () => {
    if (!finalAmount || finalAmount < 1) return;
    setPayment({ status: 'loading' });
    try {
      const res = await fetch('/api/donations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: donorName.trim() || 'Anônimo',
          amount: finalAmount,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Falha ao criar pagamento');
      }
      const data = await res.json();
      setPayment({
        status: 'awaiting_payment',
        paymentId: data.paymentId,
        qrCode: data.qrCode,
        qrCodeBase64: data.qrCodeBase64,
      });
    } catch (err: any) {
      setPayment({ status: 'error', error: err.message });
    }
  };

  const copyPix = () => {
    if (payment.status !== 'awaiting_payment') return;
    navigator.clipboard.writeText(payment.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 px-4">
      <div className="relative bg-[#1a1b2e] rounded-3xl shadow-2xl border border-white/10 w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 flex-shrink-0" />
            <span className="text-xs text-white font-black uppercase tracking-wider">Apoie o TikJogos</span>
          </div>
          <button
            onClick={onDismiss}
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all"
          >
            <X size={12} />
            Agora não
          </button>
        </div>

        <div className="p-4 space-y-4">
          {payment.status === 'success' ? (
            <div className="space-y-3 text-center py-2">
              <div className="flex items-center justify-center gap-2 text-emerald-400">
                <Check className="w-6 h-6" />
                <p className="text-lg font-black">OBRIGADO!</p>
              </div>
              <p className="text-sm text-slate-400">Sua contribuição mantém o TikJogos gratuito para todos.</p>
              <button
                onClick={onDismiss}
                className="w-full px-4 py-3 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:brightness-110 transition-all border-b-[4px] border-emerald-800 active:border-b-0 active:translate-y-1"
              >
                Ir jogar!
              </button>
            </div>
          ) : payment.status === 'awaiting_payment' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 text-center font-bold">Escaneie o QR Code ou copie o código PIX</p>
              <p className="text-center text-lg font-black text-[#facc15]">
                R$ {finalAmount.toFixed(2).replace('.', ',')}
              </p>
              {payment.qrCodeBase64 && (
                <div className="flex justify-center">
                  <div className="bg-white rounded-xl p-2">
                    <img
                      src={`data:image/png;base64,${payment.qrCodeBase64}`}
                      alt="QR Code PIX"
                      className="w-36 h-36 object-contain"
                    />
                  </div>
                </div>
              )}
              <button
                onClick={copyPix}
                className="w-full px-4 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all border-b-[4px] bg-gradient-to-r from-emerald-500 to-green-500 border-emerald-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-1"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'COPIAR CÓDIGO PIX'}
              </button>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#facc15]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-xs font-bold">Aguardando pagamento...</span>
                </div>
                <button
                  onClick={() => setPayment({ status: 'idle' })}
                  className="text-xs text-slate-500 hover:text-white underline transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="https://raw.githubusercontent.com/rodrigofprates2015-ctrl/tikjogos2/main/client/public/Gemini_Generated_Image_ekoppaekoppaekop.png"
                  alt="Personagem TikJogos"
                  className="w-16 h-16 object-contain flex-shrink-0"
                />
                <p className="text-xs text-slate-300 leading-relaxed">
                  Gostou do jogo? Ajude a manter o TikJogos online e gratuito com qualquer valor! 💜
                </p>
              </div>

              {/* Preset amounts */}
              <div className="space-y-1.5">
                <p className="text-xs text-slate-500 font-bold">ESCOLHA O VALOR:</p>
                <div className="flex gap-2">
                  {PRESET_AMOUNTS.map((v) => (
                    <button
                      key={v}
                      onClick={() => { setAmount(v); setCustomAmount(''); }}
                      className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all border-2 ${
                        amount === v && !customAmount
                          ? 'bg-rose-500 border-rose-600 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      R$ {v}
                    </button>
                  ))}
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">R$</span>
                    <input
                      type="number"
                      placeholder="Outro"
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); if (e.target.value) setAmount(0); }}
                      min="1"
                      max="1000"
                      className={`w-full pl-7 pr-2 py-2.5 rounded-xl font-bold text-sm border-2 bg-slate-800 text-white placeholder-slate-500 focus:outline-none transition-all ${
                        customAmount ? 'border-rose-500' : 'border-slate-700 focus:border-slate-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Nome (opcional) */}
              <input
                type="text"
                placeholder="Seu nickname (opcional)"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                maxLength={50}
                className="w-full px-3 py-2.5 bg-slate-800 border-2 border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-all"
              />

              {payment.status === 'error' && (
                <p className="text-xs text-rose-400 font-bold text-center">{payment.error}</p>
              )}

              <button
                onClick={handleDonate}
                disabled={payment.status === 'loading' || !finalAmount || finalAmount < 1}
                className="w-full px-4 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all border-b-[4px] bg-gradient-to-r from-rose-500 to-pink-500 border-rose-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {payment.status === 'loading' ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Heart size={16} className="fill-current" />
                )}
                DOAR VIA PIX — R$ {finalAmount ? finalAmount.toFixed(2).replace('.', ',') : '0,00'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook intersticial: exibe popup de doação antes de executar a ação
export function useInterstitialAd() {
  const [visible, setVisible] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

  const show = useCallback((onDone: () => void) => {
    pendingAction.current = onDone;
    setVisible(true);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    const action = pendingAction.current;
    pendingAction.current = null;
    action?.();
  }, []);

  const InterstitialAd = visible ? (
    <DonationInterstitial onDismiss={dismiss} />
  ) : null;

  return { show, InterstitialAd };
}
