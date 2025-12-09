import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Loader2,
  Zap,
  Copy,
  Check,
  FileText
} from "lucide-react";
import backgroundImg from "@assets/background_natal_1765071997985.png";
import logoImpostor from "@assets/logo_site_impostor_1765071990526.png";

type PaymentState = {
  status: 'idle' | 'loading' | 'awaiting_payment' | 'success' | 'error';
  paymentId?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  accessCode?: string;
  error?: string;
};

const MIN_PALAVRAS = 10;
const MAX_PALAVRAS = 20;

export default function CriarTema() {
  const { toast } = useToast();
  
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [palavras, setPalavras] = useState<string[]>(Array(MAX_PALAVRAS).fill(''));
  const [isPublic, setIsPublic] = useState(true);
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
    if (validPalavras.length > MAX_PALAVRAS) {
      toast({ title: "Erro", description: `Máximo de ${MAX_PALAVRAS} palavras permitidas`, variant: "destructive" });
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

  const resetForm = () => {
    setTitulo('');
    setAutor('');
    setPalavras(Array(MAX_PALAVRAS).fill(''));
    setIsPublic(true);
    setPayment({ status: 'idle' });
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center relative py-6 px-4"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="w-full max-w-lg z-10">
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-[#4a90a4]/20 border-2 border-[#4a90a4] rounded-xl text-[#4a90a4] hover:bg-[#4a90a4]/30 transition-all font-semibold" data-testid="button-back-home">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar para Home</span>
        </Link>

        <div className="card-retro p-5 md:p-6 animate-fade-in">
          <div className="flex justify-center mb-4">
            <img src={logoImpostor} alt="Impostor" className="h-20 md:h-24 object-contain" />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#6b4ba3] flex items-center justify-center gap-2 mb-2">
              <FileText className="w-6 h-6" />
              Criar Tema Personalizado
            </h1>
            <p className="text-sm text-gray-300">
              Crie seu próprio tema com {MIN_PALAVRAS} a {MAX_PALAVRAS} palavras personalizadas!
            </p>
            <p className="text-xs text-[#e9c46a] mt-1">
              Valor: R$ 1,50 via PIX
            </p>
          </div>

          {payment.status === 'idle' || payment.status === 'loading' || payment.status === 'error' ? (
            <div className="space-y-4">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Título do tema (ex: Animais da Fazenda)"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  maxLength={50}
                  className="input-dark w-full"
                  data-testid="input-theme-titulo"
                />
                
                <input
                  type="text"
                  placeholder="Seu nome (autor)"
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  maxLength={30}
                  className="input-dark w-full"
                  data-testid="input-theme-autor"
                />
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#1a2a3a] border-2 border-[#4a6a8a] cursor-pointer accent-[#6b4ba3]"
                    data-testid="checkbox-is-public"
                  />
                  <span className="text-sm text-[#8aa0b0]">Disponibilizar na galeria pública</span>
                </label>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-300 font-medium">
                    Palavras ({validPalavrasCount}/{MIN_PALAVRAS}-{MAX_PALAVRAS})
                    {validPalavrasCount >= MIN_PALAVRAS && (
                      <span className="text-green-400 ml-2">
                        <Check className="w-4 h-4 inline" />
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">
                    Digite entre {MIN_PALAVRAS} e {MAX_PALAVRAS} palavras
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-2">
                    {palavras.map((palavra, i) => (
                      <input
                        key={i}
                        type="text"
                        placeholder={`Palavra ${i + 1}${i < MIN_PALAVRAS ? ' *' : ''}`}
                        value={palavra}
                        onChange={(e) => handlePalavraChange(i, e.target.value)}
                        maxLength={30}
                        className="input-dark text-sm py-2"
                        data-testid={`input-palavra-${i}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleCreateTheme}
                disabled={payment.status === 'loading'}
                className="btn-orange w-full"
                data-testid="button-create-theme"
              >
                {payment.status === 'loading' ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Zap size={20} />
                    GERAR PIX (R$ 1,50)
                  </>
                )}
              </button>
              
              {payment.status === 'error' && (
                <p className="text-sm text-red-400 text-center">{payment.error}</p>
              )}
            </div>
          ) : payment.status === 'awaiting_payment' ? (
            <div className="space-y-4 text-center">
              <div className="bg-[#16213e]/50 rounded-xl p-4 border border-[#3d4a5c]">
                <p className="text-sm text-gray-300 mb-3">
                  Escaneie o QR Code ou copie o código PIX
                </p>
                
                {payment.qrCodeBase64 && (
                  <div className="bg-white rounded-xl p-3 mx-auto w-fit mb-3">
                    <img 
                      src={`data:image/png;base64,${payment.qrCodeBase64}`}
                      alt="QR Code PIX" 
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                )}
                
                <button
                  onClick={copyPixCode}
                  className="btn-green w-full"
                  data-testid="button-copy-pix"
                >
                  <Copy className="w-4 h-4" />
                  Copiar Código PIX
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-[#e9c46a]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p className="text-xs">
                  Aguardando confirmação do pagamento...
                </p>
              </div>
              
              <button
                onClick={resetForm}
                className="text-sm text-gray-400 hover:text-white transition-colors underline"
                data-testid="button-cancel-payment"
              >
                Cancelar e voltar
              </button>
            </div>
          ) : payment.status === 'success' ? (
            <div className="space-y-4 text-center">
              <div className="bg-[#16213e]/50 rounded-xl p-4 border border-green-500/50">
                <div className="flex items-center justify-center gap-2 text-green-400 mb-3">
                  <Check className="w-6 h-6" />
                  <p className="text-lg font-bold">Tema criado com sucesso!</p>
                </div>
                
                <p className="text-sm text-gray-300 mb-4">
                  Seu código de acesso:
                </p>
                
                <div className="bg-black/50 rounded-xl p-4 border border-[#6b4ba3]">
                  <p className="text-2xl font-mono font-bold text-[#6b4ba3] tracking-widest" data-testid="text-access-code">
                    {payment.accessCode}
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    if (payment.accessCode) {
                      navigator.clipboard.writeText(payment.accessCode);
                      toast({ title: "Copiado!", description: "Código de acesso copiado." });
                    }
                  }}
                  className="btn-green w-full mt-3"
                  data-testid="button-copy-access-code"
                >
                  <Copy className="w-4 h-4" />
                  Copiar Código
                </button>
              </div>
              
              <p className="text-xs text-gray-400">
                Use este código ao iniciar uma partida no modo Palavra Secreta para jogar com seu tema personalizado.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={resetForm}
                  className="btn-orange flex-1"
                  data-testid="button-create-another"
                >
                  Criar outro tema
                </button>
                <Link href="/" className="btn-green flex-1 inline-flex items-center justify-center" data-testid="button-go-play">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Ir jogar
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
