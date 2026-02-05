import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { SideAds, BottomAd } from "@/components/AdSense";
import { 
  ArrowLeft,
  Loader2,
  Heart,
  Copy,
  Check,
  Coffee,
  Zap
} from "lucide-react";

type PaymentState = {
  status: 'idle' | 'loading' | 'awaiting_payment' | 'success' | 'error';
  paymentId?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  error?: string;
};

const PRESET_AMOUNTS = [5, 10, 20, 50];

export default function Doacoes() {
  const { toast } = useToast();
  
  const [donorName, setDonorName] = useState('');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState('');
  const [payment, setPayment] = useState<PaymentState>({ status: 'idle' });

  useEffect(() => {
    if (payment.status !== 'awaiting_payment' || !payment.paymentId) return;
    
    let intervalId: NodeJS.Timeout | null = null;
    let isActive = true;
    
    const pollPaymentStatus = async () => {
      try {
        const res = await fetch(`/api/donations/status/${payment.paymentId}`);
        if (res.ok && isActive) {
          const data = await res.json();
          if (data.status === 'approved') {
            if (intervalId) clearInterval(intervalId);
            setPayment(prev => ({
              ...prev,
              status: 'success'
            }));
          }
        }
      } catch (err) {
        console.error('Error polling payment status:', err);
      }
    };
    
    intervalId = setInterval(pollPaymentStatus, 5000);
    
    return () => {
      isActive = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [payment.status, payment.paymentId]);

  const finalAmount = customAmount ? parseFloat(customAmount) : amount;

  const handleDonate = async () => {
    if (!donorName.trim()) {
      toast({ title: "Erro", description: "Digite seu nome", variant: "destructive" });
      return;
    }
    
    if (!finalAmount || finalAmount < 1) {
      toast({ title: "Erro", description: "Valor mínimo é R$ 1,00", variant: "destructive" });
      return;
    }

    if (finalAmount > 1000) {
      toast({ title: "Erro", description: "Valor máximo é R$ 1.000,00", variant: "destructive" });
      return;
    }
    
    setPayment({ status: 'loading' });
    
    try {
      const res = await fetch('/api/donations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: donorName.trim(),
          message: message.trim() || undefined,
          amount: finalAmount
        })
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
        qrCodeBase64: data.qrCodeBase64
      });
      
    } catch (err: any) {
      setPayment({ status: 'error', error: err.message });
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    if (value) {
      setAmount(0);
    }
  };

  const copyPixCode = () => {
    if (payment.qrCode) {
      navigator.clipboard.writeText(payment.qrCode);
      toast({ title: "Copiado!", description: "Código PIX copiado para a área de transferência." });
    }
  };

  const resetForm = () => {
    setDonorName('');
    setMessage('');
    setAmount(5);
    setCustomAmount('');
    setPayment({ status: 'idle' });
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center relative overflow-hidden"
      style={{ backgroundColor: '#1a1b2e' }}
    >
      {/* Side Ads */}
      <SideAds />

      {/* Bottom Ad */}
      <BottomAd />

      {/* Background blur effects */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px]" />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 md:py-10 px-4 relative z-20 w-full">
        {/* Back button */}
        <div className="w-full max-w-4xl mb-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 border-2 border-slate-700 rounded-xl text-white hover:bg-slate-700 transition-all font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Home
          </Link>
        </div>

        {/* Main card */}
        <div className="bg-[#242642] rounded-[2rem] md:rounded-[3rem] p-5 md:p-8 shadow-2xl border-4 border-[#2f3252] w-full max-w-4xl animate-fade-in overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            
            {/* Left side - Character image */}
            <div className="flex-shrink-0 flex items-center justify-center">
              <img 
                src="https://raw.githubusercontent.com/rodrigofprates2015-ctrl/tikjogos2/main/client/public/Gemini_Generated_Image_ekoppaekoppaekop.png" 
                alt="Personagem" 
                className="w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 object-contain"
              />
            </div>

            {/* Right side - Content */}
            <div className="flex-1 w-full min-w-0">
              {/* Title */}
              <div className="text-center lg:text-left mb-4">
                <h1 className="text-2xl md:text-3xl font-black text-white flex items-center justify-center lg:justify-start gap-2 mb-1">
                  <Heart className="w-6 h-6 md:w-7 md:h-7 text-rose-500 fill-rose-500 flex-shrink-0" />
                  <span>APOIE O TIKJOGOS</span>
                </h1>
                <p className="text-slate-400 text-sm">
                  Ajude a manter o jogo online e gratuito!
                </p>
              </div>

              {payment.status === 'idle' || payment.status === 'loading' || payment.status === 'error' ? (
                <div className="space-y-4">
                  {/* Why donate - compact */}
                  <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                    <div className="flex items-center gap-2 text-[#facc15] mb-1">
                      <Coffee className="w-4 h-4 flex-shrink-0" />
                      <span className="font-black text-xs">POR QUE DOAR?</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Servidores • Novos modos • Melhorias • Jogo 100% gratuito
                    </p>
                  </div>

                  {/* Amount selection */}
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 font-bold">ESCOLHA O VALOR:</p>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_AMOUNTS.map((value) => (
                        <button
                          key={value}
                          onClick={() => handleAmountSelect(value)}
                          className={`px-3 py-2 rounded-lg font-black text-sm transition-all border-2 ${
                            amount === value && !customAmount
                              ? 'bg-rose-500 border-rose-600 text-white'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          R$ {value}
                        </button>
                      ))}
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">R$</span>
                        <input
                          type="number"
                          placeholder="Outro"
                          value={customAmount}
                          onChange={(e) => handleCustomAmountChange(e.target.value)}
                          min="1"
                          max="1000"
                          className={`w-20 pl-8 pr-2 py-2 rounded-lg font-bold text-sm transition-all border-2 bg-slate-800 text-white placeholder-slate-500 focus:outline-none ${
                            customAmount
                              ? 'border-rose-500'
                              : 'border-slate-700 focus:border-slate-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Seu nickname"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      maxLength={50}
                      className="w-full px-4 py-3 bg-[#1a2a3a] border-2 border-[#3a5a7a] rounded-xl text-white text-sm placeholder-[#6a8aaa] focus:outline-none focus:border-[#7ec8e3] transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Mensagem (opcional)"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={100}
                      className="w-full px-4 py-3 bg-[#1a2a3a] border-2 border-[#3a5a7a] rounded-xl text-white text-sm placeholder-[#6a8aaa] focus:outline-none focus:border-[#7ec8e3] transition-all"
                    />
                  </div>
                  
                  {/* Donate button */}
                  <button
                    onClick={handleDonate}
                    disabled={payment.status === 'loading' || !finalAmount || finalAmount < 1}
                    className="w-full px-6 py-4 rounded-xl font-black text-base md:text-lg tracking-wide flex items-center justify-center gap-2 transition-all duration-300 border-b-[5px] shadow-xl bg-gradient-to-r from-rose-500 to-pink-500 border-rose-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-1 disabled:bg-slate-700 disabled:border-slate-900 disabled:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {payment.status === 'loading' ? (
                      <Loader2 size={22} className="animate-spin" />
                    ) : (
                      <Heart size={22} className="fill-current" />
                    )}
                    DOAR R$ {finalAmount ? finalAmount.toFixed(2).replace('.', ',') : '0,00'} VIA PIX
                  </button>
                  
                  {payment.status === 'error' && (
                    <p className="text-sm text-rose-400 text-center font-bold">{payment.error}</p>
                  )}
                </div>
              ) : payment.status === 'awaiting_payment' ? (
                <div className="space-y-4">
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {payment.qrCodeBase64 && (
                        <div className="bg-white rounded-xl p-2 flex-shrink-0">
                          <img 
                            src={`data:image/png;base64,${payment.qrCodeBase64}`}
                            alt="QR Code PIX" 
                            className="w-32 h-32 sm:w-36 sm:h-36 object-contain"
                          />
                        </div>
                      )}
                      <div className="flex-1 w-full text-center sm:text-left">
                        <p className="text-sm text-slate-300 mb-3 font-bold">
                          Escaneie o QR Code ou copie o código PIX
                        </p>
                        <p className="text-lg font-black text-[#facc15] mb-3">
                          R$ {finalAmount.toFixed(2).replace('.', ',')}
                        </p>
                        <button
                          onClick={copyPixCode}
                          className="w-full px-4 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all border-b-[4px] bg-gradient-to-r from-emerald-500 to-green-500 border-emerald-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-1"
                        >
                          <Copy className="w-4 h-4" />
                          COPIAR CÓDIGO PIX
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-[#facc15]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <p className="text-xs font-bold">Aguardando pagamento...</p>
                    </div>
                    <button
                      onClick={resetForm}
                      className="text-xs text-slate-400 hover:text-white transition-colors underline font-bold"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : payment.status === 'success' ? (
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                      <Check className="w-6 h-6 flex-shrink-0" />
                      <p className="text-lg font-black">OBRIGADO, {donorName}!</p>
                    </div>
                    <p className="text-sm text-slate-300">
                      Sua contribuição ajuda a manter o TikJogos online e gratuito para todos.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={resetForm}
                      className="px-4 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all border-b-[4px] bg-gradient-to-r from-rose-500 to-pink-500 border-rose-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-1"
                    >
                      <Heart className="w-4 h-4" />
                      Doar novamente
                    </button>
                    <Link 
                      href="/" 
                      className="px-4 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all border-b-[4px] bg-gradient-to-r from-emerald-500 to-green-500 border-emerald-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-1"
                    >
                      <Zap className="w-4 h-4" />
                      Ir jogar
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
