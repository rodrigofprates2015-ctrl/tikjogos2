import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  Globe,
  EyeOff,
  Wallet,
  Rocket
} from "lucide-react";
import logoImpostor from "@assets/logo site impostor.png";

type PaymentState = {
  status: 'idle' | 'loading' | 'awaiting_payment' | 'success' | 'error';
  paymentId?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  accessCode?: string;
  error?: string;
};

const MIN_PALAVRAS = 7;
const TOTAL_PALAVRAS = 25;
const THEME_PRICE = "3,00";

export default function CriarTema() {
  const { toast } = useToast();
  
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [palavras, setPalavras] = useState<string[]>(Array(TOTAL_PALAVRAS).fill(''));
  const [isPublic, setIsPublic] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [payment, setPayment] = useState<PaymentState>({ status: 'idle' });

  useEffect(() => {
    if (payment.status !== 'awaiting_payment' || !payment.paymentId) return;
    
    let intervalId: NodeJS.Timeout | null = null;
    let isActive = true;
    
    const pollPaymentStatus = async () => {
      try {
        const res = await fetch(`/api/payments/status/${payment.paymentId}`);
        if (res.ok && isActive) {
          const data = await res.json();
          if (data.status === 'approved' && data.accessCode) {
            if (intervalId) clearInterval(intervalId);
            setPayment(prev => ({
              ...prev,
              status: 'success',
              accessCode: data.accessCode
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

  const handlePalavraChange = (index: number, value: string) => {
    const newPalavras = [...palavras];
    newPalavras[index] = value;
    setPalavras(newPalavras);
  };

  const validPalavrasCount = palavras.filter(p => p.trim().length > 0).length;
  const isFormComplete = validPalavrasCount >= MIN_PALAVRAS && titulo.trim() && autor.trim();
  const canSubmit = isFormComplete && termsAccepted;

  const handleCreateTheme = async () => {
    if (!titulo.trim()) {
      toast({ title: "Erro", description: "Digite um título para o tema", variant: "destructive" });
      return;
    }
    if (!autor.trim()) {
      toast({ title: "Erro", description: "Digite o nome do autor", variant: "destructive" });
      return;
    }
    
    const validPalavras = palavras.filter(p => p.trim().length > 0);
    if (validPalavras.length < MIN_PALAVRAS) {
      toast({ title: "Erro", description: `Digite no mínimo ${MIN_PALAVRAS} palavras (${validPalavras.length}/${MIN_PALAVRAS})`, variant: "destructive" });
      return;
    }
    
    if (!termsAccepted) {
      toast({ title: "Erro", description: "Você precisa aceitar os termos para continuar", variant: "destructive" });
      return;
    }
    
    setPayment({ status: 'loading' });
    
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: titulo.trim(),
          autor: autor.trim(),
          palavras: validPalavras.map(p => p.trim()),
          isPublic
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

  const copyPixCode = () => {
    if (payment.qrCode) {
      navigator.clipboard.writeText(payment.qrCode);
      toast({ title: "Copiado!", description: "Código PIX copiado para a área de transferência." });
    }
  };

  const copyAccessCode = () => {
    if (payment.accessCode) {
      navigator.clipboard.writeText(payment.accessCode);
      toast({ title: "Copiado!", description: "Código de acesso copiado." });
    }
  };

  const resetForm = () => {
    setTitulo('');
    setAutor('');
    setPalavras(Array(TOTAL_PALAVRAS).fill(''));
    setIsPublic(true);
    setTermsAccepted(false);
    setPayment({ status: 'idle' });
  };

  // Form Screen
  const renderFormScreen = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <button className="p-3 rounded-xl bg-slate-800 border-b-4 border-slate-900 text-slate-400 hover:text-white active:border-b-0 active:translate-y-1 transition-all">
            <ArrowLeft size={24} strokeWidth={3} />
          </button>
        </Link>
        <h2 className="text-2xl font-black text-white">Novo Tema</h2>
      </div>

      {/* Main Inputs */}
      <div className="bg-[#242642] p-6 rounded-[2rem] border-4 border-[#2f3252] shadow-xl space-y-4">
        <div>
          <label className="text-slate-400 text-sm font-bold ml-2 mb-1 block">NOME DO TEMA</label>
          <input 
            type="text" 
            placeholder="Ex: Minha Família, Coisas da Escola..."
            maxLength={30}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full bg-[#1a1b2e] border-4 border-slate-900 rounded-2xl p-4 text-white font-bold text-lg focus:border-purple-500 focus:outline-none transition-colors placeholder:text-slate-600"
            data-testid="input-theme-titulo"
          />
        </div>
        <div>
          <label className="text-slate-400 text-sm font-bold ml-2 mb-1 block">CRIADO POR</label>
          <input 
            type="text" 
            placeholder="Seu Apelido"
            maxLength={20}
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            className="w-full bg-[#1a1b2e] border-4 border-slate-900 rounded-2xl p-4 text-white font-bold text-lg focus:border-purple-500 focus:outline-none transition-colors placeholder:text-slate-600"
            data-testid="input-theme-autor"
          />
        </div>
      </div>
      
      {/* Visibility Section */}
      <div className="bg-[#242642] p-6 rounded-[2rem] border-4 border-[#2f3252] shadow-xl">
        <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2">
          VISIBILIDADE DO TEMA
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Public Option */}
          <button
            type="button"
            onClick={() => setIsPublic(true)}
            className={`relative p-4 rounded-2xl border-4 text-left transition-all ${
              isPublic 
                ? 'bg-purple-600/20 border-purple-500' 
                : 'bg-[#1a1b2e] border-slate-800 opacity-60 hover:opacity-100'
            }`}
            data-testid="button-visibility-public"
          >
             <div className="flex justify-between items-start mb-2">
               <Globe className={`w-8 h-8 ${isPublic ? 'text-purple-400' : 'text-slate-500'}`} />
               {isPublic && <div className="bg-purple-500 rounded-full p-1"><Check size={12} className="text-white"/></div>}
             </div>
             <p className={`font-black text-lg ${isPublic ? 'text-white' : 'text-slate-400'}`}>Galeria Pública</p>
             <p className="text-xs text-slate-400 mt-1 leading-relaxed">
               Seu tema aparecerá na lista geral para todos os jogadores do site usarem.
             </p>
          </button>

          {/* Private Option */}
          <button
            type="button"
            onClick={() => setIsPublic(false)}
            className={`relative p-4 rounded-2xl border-4 text-left transition-all ${
              !isPublic 
                ? 'bg-emerald-600/20 border-emerald-500' 
                : 'bg-[#1a1b2e] border-slate-800 opacity-60 hover:opacity-100'
            }`}
            data-testid="button-visibility-private"
          >
             <div className="flex justify-between items-start mb-2">
               <EyeOff className={`w-8 h-8 ${!isPublic ? 'text-emerald-400' : 'text-slate-500'}`} />
               {!isPublic && <div className="bg-emerald-500 rounded-full p-1"><Check size={12} className="text-white"/></div>}
             </div>
             <p className={`font-black text-lg ${!isPublic ? 'text-white' : 'text-slate-400'}`}>Apenas com Código</p>
             <p className="text-xs text-slate-400 mt-1 leading-relaxed">
               O tema fica oculto. Você receberá um código secreto para compartilhar com amigos.
             </p>
          </button>
        </div>
      </div>

      {/* Words Grid */}
      <div className="bg-[#242642] p-6 rounded-[2rem] border-4 border-[#2f3252] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-black text-xl flex items-center gap-2">
            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-lg">MÍN. {MIN_PALAVRAS} PALAVRAS</span>
          </h3>
          <span className={`text-sm font-bold ${validPalavrasCount >= MIN_PALAVRAS ? 'text-green-400' : 'text-slate-400'}`}>
            {validPalavrasCount} / {TOTAL_PALAVRAS} Preenchidas {validPalavrasCount >= MIN_PALAVRAS && '✓'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 max-h-[400px] overflow-y-auto pr-2">
          {palavras.map((word, index) => (
            <div key={index} className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-black text-xs pointer-events-none">
                {index + 1}
              </span>
              <input 
                type="text"
                value={word}
                onChange={(e) => handlePalavraChange(index, e.target.value)}
                placeholder={`Palavra ${index + 1}`}
                maxLength={30}
                className="w-full bg-[#1a1b2e] border-2 border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white font-medium focus:border-purple-500 focus:outline-none transition-all focus:bg-[#151625]"
                data-testid={`input-palavra-${index}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Terms / Warning Area */}
      <div className="bg-red-500/10 border-4 border-red-500/30 p-6 rounded-[2rem] space-y-4">
        <div className="flex gap-3">
          <div className="bg-red-500 p-2 rounded-xl h-min">
            <AlertTriangle className="text-white w-6 h-6" />
          </div>
          <div>
            <h4 className="text-red-400 font-black text-lg">LEIA COM ATENÇÃO</h4>
            <p className="text-red-200/70 text-sm leading-relaxed">
              Palavras de baixo calão, racismo, homofobia ou qualquer discurso de ódio resultarão no <strong>banimento imediato</strong> do tema.
            </p>
            <p className="text-red-400 font-bold text-sm mt-2 uppercase">
              Não haverá reembolso do valor pago.
            </p>
          </div>
        </div>

        <label className="flex items-start gap-3 p-4 bg-black/20 rounded-xl cursor-pointer hover:bg-black/30 transition-colors border-2 border-transparent hover:border-red-500/30">
          <div className="relative flex items-center">
            <input 
              type="checkbox" 
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-slate-500 bg-slate-800 transition-all checked:border-red-500 checked:bg-red-500 hover:border-slate-400"
              data-testid="checkbox-terms"
            />
            <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={4} />
          </div>
          <span className="text-sm font-medium text-slate-300 pt-0.5 select-none">
            Li e concordo que perderei meu dinheiro se violar as regras.
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <button 
        onClick={handleCreateTheme}
        disabled={!canSubmit || payment.status === 'loading'}
        className={`w-full py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl ${
          canSubmit && payment.status !== 'loading'
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2 cursor-pointer' 
            : 'bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed opacity-50'
        }`}
        data-testid="button-submit-theme"
      >
        {payment.status === 'loading' ? (
          <Loader2 size={24} className="animate-spin" />
        ) : (
          <>
            <Wallet size={24} />
            IR PARA PAGAMENTO
          </>
        )}
      </button>

      {payment.status === 'error' && (
        <p className="text-sm text-red-400 text-center">{payment.error}</p>
      )}
    </div>
  );

  // Payment Screen
  const renderPaymentScreen = () => (
    <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setPayment({ status: 'idle' })}
          className="p-3 rounded-xl bg-slate-800 border-b-4 border-slate-900 text-slate-400 hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-black text-white">Pagamento Seguro</h2>
      </div>

      <div className="bg-[#242642] p-8 rounded-[2.5rem] border-4 border-slate-800 shadow-2xl flex flex-col items-center text-center space-y-6">
        
        <div className="space-y-1">
          <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Valor a pagar</p>
          <p className="text-5xl font-black text-white flex items-start justify-center gap-1">
            <span className="text-lg mt-2 text-slate-500">R$</span>
            {THEME_PRICE}
          </p>
        </div>

        {/* QR Code Area */}
        <div className="relative p-4 bg-white rounded-3xl border-4 border-slate-200 shadow-inner w-64 h-64 flex items-center justify-center">
          {payment.qrCodeBase64 ? (
            <img 
              src={`data:image/png;base64,${payment.qrCodeBase64}`}
              alt="QR Code PIX" 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
          )}
        </div>

        <div className="w-full space-y-3">
          <p className="text-slate-400 text-sm font-medium">
            Escaneie o QR Code ou copie o código Pix abaixo:
          </p>
          
          <button 
            onClick={copyPixCode}
            className="w-full bg-[#1a1b2e] border-2 border-dashed border-slate-600 rounded-xl p-4 flex items-center justify-between group hover:border-purple-500 hover:bg-[#1e2036] transition-all"
            data-testid="button-copy-pix"
          >
            <span className="text-slate-500 text-sm font-mono truncate max-w-[200px]">
              {payment.qrCode ? `${payment.qrCode.substring(0, 30)}...` : 'Carregando...'}
            </span>
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm group-hover:text-purple-300">
              <Copy size={16} /> COPIAR
            </div>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-yellow-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <p className="text-sm font-medium">
          Aguardando confirmação do pagamento...
        </p>
      </div>

      <button
        onClick={resetForm}
        className="w-full text-sm text-slate-400 hover:text-white transition-colors underline text-center"
        data-testid="button-cancel-payment"
      >
        Cancelar e voltar
      </button>

      <p className="text-center text-slate-500 text-xs">
        Ambiente seguro. Processado por Mercado Pago.
      </p>
    </div>
  );

  // Success Screen
  const renderSuccessScreen = () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8 animate-scale-in p-6">
      <div className="relative">
        <div className="absolute inset-0 bg-green-500 blur-[60px] opacity-20 animate-pulse"></div>
        <div className="relative w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-[2rem] border-4 border-emerald-300 shadow-2xl flex items-center justify-center rotate-3 hover:rotate-6 transition-transform">
          <Check size={64} className="text-white drop-shadow-md" strokeWidth={4} />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-4xl font-black text-white">Tudo Pronto!</h2>
        <p className="text-slate-400 text-lg max-w-md mx-auto">
          {isPublic 
            ? "Seu tema foi publicado e já está disponível na Galeria Pública."
            : "Seu tema privado foi criado. Guarde o código abaixo!"}
        </p>
      </div>

      {/* Theme Info Box */}
      <div className="bg-[#242642] p-4 rounded-2xl border-4 border-slate-800 w-full max-w-sm">
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white font-black text-xl uppercase">
             {titulo.substring(0, 2)}
           </div>
           <div className="text-left">
             <p className="text-white font-bold">{titulo || "Novo Tema"}</p>
             <p className="text-slate-500 text-xs font-bold uppercase">
               {TOTAL_PALAVRAS} Palavras • {isPublic ? "Público" : "Privado"}
             </p>
           </div>
           <div className="ml-auto">
             <div className="bg-green-500/20 text-green-400 p-2 rounded-lg">
                <Check size={20} />
             </div>
           </div>
        </div>

        {/* Access Code for private themes */}
        {!isPublic && payment.accessCode && (
          <div className="mt-4 pt-4 border-t-2 border-slate-800">
            <p className="text-slate-400 text-xs font-bold uppercase mb-2">CÓDIGO DE ACESSO</p>
            <button 
              onClick={copyAccessCode}
              className="w-full bg-[#1a1b2e] p-3 rounded-xl border-2 border-dashed border-emerald-500/50 flex items-center justify-between text-emerald-400 font-black text-xl hover:bg-emerald-900/10 transition-colors group"
              data-testid="button-copy-access-code"
            >
              <span className="tracking-widest mx-auto">{payment.accessCode}</span>
              <Copy size={20} className="text-emerald-500/50 group-hover:text-emerald-500" />
            </button>
          </div>
        )}

        {/* Access Code for public themes */}
        {isPublic && payment.accessCode && (
          <div className="mt-4 pt-4 border-t-2 border-slate-800">
            <p className="text-slate-400 text-xs font-bold uppercase mb-2">CÓDIGO DE ACESSO (OPCIONAL)</p>
            <button 
              onClick={copyAccessCode}
              className="w-full bg-[#1a1b2e] p-3 rounded-xl border-2 border-dashed border-purple-500/50 flex items-center justify-between text-purple-400 font-black text-xl hover:bg-purple-900/10 transition-colors group"
              data-testid="button-copy-access-code"
            >
              <span className="tracking-widest mx-auto">{payment.accessCode}</span>
              <Copy size={20} className="text-purple-500/50 group-hover:text-purple-500" />
            </button>
            <p className="text-slate-500 text-xs mt-2">
              Você também pode encontrar seu tema na galeria pública.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <button 
          onClick={resetForm}
          className="flex-1 px-6 py-4 rounded-2xl bg-slate-700 border-b-[6px] border-slate-900 text-white font-black text-lg shadow-xl active:border-b-0 active:translate-y-2 transition-all hover:bg-slate-600"
          data-testid="button-create-another"
        >
          Criar Outro
        </button>
        <Link href="/" className="flex-1">
          <button 
            className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 border-b-[6px] border-indigo-900 text-white font-black text-lg shadow-xl active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center gap-2 hover:brightness-110"
            data-testid="button-go-play"
          >
            <Rocket size={20} />
            {isPublic ? "IR PARA GALERIA" : "ENTRAR NA SALA"}
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen w-full flex flex-col relative"
      style={{
        backgroundColor: '#1a1b2e'
      }}
    >
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1000ms' }}></div>
      </div>

      <div className="flex-1 flex flex-col items-center pt-6 pb-10 px-4 relative z-10">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img 
              src={logoImpostor} 
              alt="Logo Jogo do Impostor" 
              width={575} height={133}
              className="h-20 md:h-24 object-contain" 
            />
          </div>

          {/* Render current screen based on payment status */}
          {payment.status === 'idle' || payment.status === 'loading' || payment.status === 'error' ? (
            renderFormScreen()
          ) : payment.status === 'awaiting_payment' ? (
            renderPaymentScreen()
          ) : payment.status === 'success' ? (
            renderSuccessScreen()
          ) : null}
        </div>
      </div>
    </div>
  );
}
