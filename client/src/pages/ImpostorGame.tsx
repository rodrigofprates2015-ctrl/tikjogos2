import { useState, useEffect } from "react";
import { useGameStore, type GameModeType, type PlayerVote, type PlayerAnswer } from "@/lib/gameStore";
import { Link } from "wouter";
import PalavraSuperSecretaSubmodeScreen from "@/pages/PalavraSuperSecretaSubmodeScreen";
import { NotificationCenter } from "@/components/NotificationCenter";
import { SpeakingOrderWithVotingStage } from "@/components/RoundStageContent";
import { SiDiscord } from "react-icons/si";
import { 
  User, 
  Users,
  Zap, 
  Copy, 
  LogOut, 
  Play, 
  Crown,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  Rocket,
  MapPin,
  Swords,
  Target,
  HelpCircle,
  FileText,
  Heart,
  X,
  Send,
  RotateCcw,
  Smartphone,
  MessageSquare,
  Home,
  Check,
  Vote,
  Skull,
  Trophy,
  UserX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import backgroundImg from "@assets/background_natal_1764991979853.webp";
import logoTikjogos from "@assets/logo tikjogos_1764616571363.png";
import logoImpostor from "@assets/logo3_1764640096962.png";
import tripulanteImg from "@assets/tripulante_natal_1764991976186.webp";
import impostorImg from "@assets/impostor_natal_1764991977974.webp";

const PIX_KEY = "48492456-23f1-4edc-b739-4e36547ef90e";

const MIN_PALAVRAS = 10;
const MAX_PALAVRAS = 20;

type ThemeWorkshopTab = 'galeria' | 'criar';

type PaymentState = {
  status: 'idle' | 'loading' | 'awaiting_payment' | 'success' | 'error';
  paymentId?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  accessCode?: string;
  error?: string;
};

const ThemeWorkshopModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ThemeWorkshopTab>('galeria');
  const [publicThemes, setPublicThemes] = useState<PublicTheme[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(false);
  
  // Form state for creating new theme
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [palavras, setPalavras] = useState<string[]>(Array(MAX_PALAVRAS).fill(''));
  const [isPublic, setIsPublic] = useState(true);
  
  // Payment state
  const [payment, setPayment] = useState<PaymentState>({ status: 'idle' });
  
  // Load public themes when gallery tab is active
  useEffect(() => {
    if (isOpen && activeTab === 'galeria') {
      loadPublicThemes();
    }
  }, [isOpen, activeTab]);
  
  // Poll payment status when awaiting payment
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
  
  const loadPublicThemes = async () => {
    setIsLoadingThemes(true);
    try {
      const res = await fetch('/api/themes/public');
      if (res.ok) {
        const themes = await res.json();
        setPublicThemes(themes);
      }
    } catch (err) {
      console.error('Failed to load themes:', err);
    } finally {
      setIsLoadingThemes(false);
    }
  };
  
  const handlePalavraChange = (index: number, value: string) => {
    const newPalavras = [...palavras];
    newPalavras[index] = value;
    setPalavras(newPalavras);
  };
  
  const handleCreateTheme = async () => {
    // Validate form
    if (!titulo.trim()) {
      toast({ title: "Erro", description: "Digite um titulo para o tema", variant: "destructive" });
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
      toast({ title: "Copiado!", description: "Codigo PIX copiado para a area de transferencia." });
    }
  };
  
  const resetForm = () => {
    setTitulo('');
    setAutor('');
    setPalavras(Array(MAX_PALAVRAS).fill(''));
    setIsPublic(true);
    setPayment({ status: 'idle' });
  };
  
  const handleClose = () => {
    if (payment.status !== 'loading') {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose}></div>
      <div className="relative card-retro w-full max-w-lg max-h-[85vh] overflow-hidden animate-fade-in flex flex-col">
        <div className="p-4 border-b border-[#3d4a5c] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#6b4ba3] flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Oficina de Temas
          </h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-[#3d4a5c]">
          <button
            onClick={() => setActiveTab('galeria')}
            className={cn(
              "flex-1 py-3 text-sm font-semibold transition-colors",
              activeTab === 'galeria' 
                ? "text-[#6b4ba3] border-b-2 border-[#6b4ba3]" 
                : "text-gray-400 hover:text-white"
            )}
            data-testid="tab-galeria"
          >
            Galeria
          </button>
          <button
            onClick={() => setActiveTab('criar')}
            className={cn(
              "flex-1 py-3 text-sm font-semibold transition-colors",
              activeTab === 'criar' 
                ? "text-[#6b4ba3] border-b-2 border-[#6b4ba3]" 
                : "text-gray-400 hover:text-white"
            )}
            data-testid="tab-criar"
          >
            Criar Novo
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'galeria' && (
            <div className="space-y-3">
              {isLoadingThemes ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#6b4ba3]" />
                </div>
              ) : publicThemes.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>Nenhum tema disponivel ainda.</p>
                  <p className="text-sm mt-2">Seja o primeiro a criar um!</p>
                </div>
              ) : (
                publicThemes.map((theme) => (
                  <div 
                    key={theme.id}
                    className="p-3 rounded-xl bg-[#16213e]/80 border border-[#3d4a5c] hover:border-[#6b4ba3] transition-colors"
                    data-testid={`theme-${theme.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{theme.titulo}</h3>
                        <p className="text-xs text-gray-400">por {theme.autor}</p>
                      </div>
                      <span className="text-xs text-[#6b4ba3] bg-[#6b4ba3]/10 px-2 py-1 rounded">
                        {theme.palavrasCount} palavras
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {activeTab === 'criar' && (
            <div className="space-y-4">
              {payment.status === 'idle' || payment.status === 'loading' || payment.status === 'error' ? (
                <>
                  <div className="bg-[#16213e]/50 rounded-xl p-3 border border-[#3d4a5c]">
                    <p className="text-sm text-gray-300 mb-2">
                      Crie seu proprio tema com {MIN_PALAVRAS} a {MAX_PALAVRAS} palavras personalizadas!
                    </p>
                    <p className="text-xs text-[#e9c46a]">
                      Valor: R$ 3,00 via PIX
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Titulo do tema (ex: Animais da Fazenda)"
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
                      <span className="text-sm text-[#8aa0b0]">Disponibilizar na galeria publica</span>
                    </label>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-300 font-medium">
                        Palavras ({palavras.filter(p => p.trim()).length}/{MIN_PALAVRAS}-{MAX_PALAVRAS})
                        {palavras.filter(p => p.trim()).length >= MIN_PALAVRAS && (
                          <span className="text-green-400 ml-2">
                            <Check className="w-4 h-4 inline" />
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">
                        Digite entre {MIN_PALAVRAS} e {MAX_PALAVRAS} palavras
                      </p>
                      <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2">
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
                        GERAR PIX (R$ 3,00)
                      </>
                    )}
                  </button>
                  
                  {payment.status === 'error' && (
                    <p className="text-sm text-red-400 text-center">{payment.error}</p>
                  )}
                </>
              ) : payment.status === 'awaiting_payment' ? (
                <div className="space-y-4 text-center">
                  <div className="bg-[#16213e]/50 rounded-xl p-4 border border-[#3d4a5c]">
                    <p className="text-sm text-gray-300 mb-3">
                      Escaneie o QR Code ou copie o codigo PIX
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
                      Copiar Codigo PIX
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-[#e9c46a]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <p className="text-xs">
                      Aguardando confirmacao do pagamento...
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
                      Seu codigo de acesso:
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
                          toast({ title: "Copiado!", description: "Codigo de acesso copiado." });
                        }
                      }}
                      className="btn-green w-full mt-3"
                      data-testid="button-copy-access-code"
                    >
                      <Copy className="w-4 h-4" />
                      Copiar Codigo
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-400">
                    Use este codigo ao iniciar uma partida no modo Palavra Secreta para jogar com seu tema personalizado.
                  </p>
                  
                  <button
                    onClick={resetForm}
                    className="btn-orange w-full"
                    data-testid="button-create-another"
                  >
                    Criar outro tema
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DonationModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { toast } = useToast();

  const copyPixKey = () => {
    navigator.clipboard.writeText(PIX_KEY);
    toast({ title: "Copiado!", description: "Chave PIX copiada para a área de transferência." });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative card-retro w-full max-w-sm p-6 animate-fade-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-[#c44536]">
            <Heart className="w-5 h-5 fill-current" />
            <h2 className="text-xl font-bold">Apoie o Projeto</h2>
          </div>
          
          <p className="text-gray-400 text-sm">
            Se você está se divertindo, considere fazer uma doação! Isso ajuda a manter o projeto no ar.
          </p>

          <div className="space-y-3">
            <p className="text-gray-300 text-sm font-medium flex items-center justify-center gap-2">
              <span className="text-xs text-gray-500">BR</span>
              <span className="font-bold">PIX</span>
            </p>

            <div className="bg-[#efefef] rounded-xl p-3 mx-auto w-fit">
              <img 
                src="/pix-qrcode.png" 
                alt="QR Code PIX" 
                className="w-40 h-40 object-contain"
              />
            </div>

            <div className="bg-[#16213e] rounded-xl p-4 border border-[#3d4a5c]">
              <p className="text-gray-500 text-xs mb-2">Chave PIX:</p>
              <div className="flex items-center gap-2">
                <p className="text-[#4a90a4] text-xs font-mono flex-1 break-all">{PIX_KEY}</p>
                <Button
                  onClick={copyPixKey}
                  size="sm"
                  className="btn-retro-primary text-xs px-3 py-1 h-8"
                >
                  Copiar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomeButton = ({ inline = false }: { inline?: boolean } = {}) => {
  const { leaveGame } = useGameStore();
  
  const handleClick = () => {
    leaveGame();
    window.location.href = '/';
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 bg-[#4a90a4]/20 border-2 border-[#4a90a4] rounded-xl text-[#4a90a4] hover:bg-[#4a90a4]/30 transition-all font-semibold",
        inline ? "w-full justify-center" : "fixed top-4 left-4 z-40"
      )}
      title="Voltar à tela inicial"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="text-sm font-medium">Home</span>
    </button>
  );
};

const GameNavButtons = ({ 
  onBackToLobby, 
  isImpostor = false 
}: { 
  onBackToLobby: () => void; 
  isImpostor?: boolean;
}) => {
  const { leaveGame } = useGameStore();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const handleGoHome = () => {
    leaveGame();
  };

  const handleBackToLobbyClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmBackToLobby = () => {
    setShowConfirmDialog(false);
    onBackToLobby();
  };

  return (
    <>
      <div className="w-full flex gap-2">
        <Button 
          onClick={handleGoHome}
          size="icon"
          className="rounded-lg bg-gray-700 hover:bg-gray-600 border-2 border-gray-600/50 text-gray-300"
          data-testid="button-home"
        >
          <Home className="w-4 h-4" />
        </Button>
        <Button 
          onClick={handleBackToLobbyClick}
          className="flex-1 rounded-lg bg-gray-700 hover:bg-gray-600 border-2 border-gray-600/50 text-gray-300"
          data-testid="button-back-lobby"
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Voltar ao Lobby
        </Button>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-[#16213e] border-2 border-[#3d4a5c] max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-center">
              Voltar ao Lobby?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 text-center">
              Tem certeza que deseja voltar ao lobby? Caso saia não conseguirá entrar na mesma partida novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:justify-center">
            <AlertDialogCancel 
              className="flex-1 bg-[#3d4a5c] hover:bg-[#4d5a6c] text-white border-none"
              data-testid="button-cancel-back-lobby"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmBackToLobby}
              className="flex-1 border-none bg-white hover:bg-white/90 text-black"
              data-testid="button-confirm-back-lobby"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const TopRightButtons = ({ onDonateClick }: { onDonateClick: () => void }) => (
  <>
    {/* Mobile: Como Jogar and Discord on left */}
    <div className="sm:hidden fixed top-4 left-4 z-[60] flex items-center gap-2">
      <Link 
        href="/comojogar"
        className="flex items-center gap-2 px-3 py-2 bg-[#4a90a4] border-2 border-[#3a7084] rounded-xl text-white hover:bg-[#5aa0b4] transition-all font-semibold shadow-lg"
        data-testid="button-how-to-play-mobile"
      >
        <HelpCircle className="w-4 h-4" />
      </Link>
      <a
        href="https://discord.gg/rhZxA2ha"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 bg-[#5865F2] border-2 border-[#4752C4] rounded-xl text-white hover:bg-[#6875F3] transition-all font-semibold shadow-lg"
        data-testid="button-discord-mobile"
      >
        <SiDiscord className="w-4 h-4" />
      </a>
    </div>
    
    {/* Desktop: All buttons on right */}
    <div className="hidden sm:flex fixed top-4 right-4 z-[60] items-center gap-2">
      <Link 
        href="/comojogar"
        className="flex items-center gap-2 px-4 py-2 bg-[#4a90a4] border-2 border-[#3a7084] rounded-xl text-white hover:bg-[#5aa0b4] transition-all font-semibold shadow-lg"
        data-testid="button-how-to-play"
      >
        <HelpCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Como Jogar</span>
      </Link>
      <a
        href="https://discord.gg/rhZxA2ha"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-[#5865F2] border-2 border-[#4752C4] rounded-xl text-white hover:bg-[#6875F3] transition-all font-semibold shadow-lg"
        data-testid="button-discord"
      >
        <SiDiscord className="w-4 h-4" />
        <span className="text-sm font-medium">Encontrar Nave</span>
      </a>
      <button
        onClick={onDonateClick}
        className="flex items-center gap-2 px-4 py-2 bg-[#c44536] border-2 border-[#a33526] rounded-xl text-white hover:bg-[#d45546] transition-all font-semibold shadow-lg"
        data-testid="button-donate"
      >
        <Heart className="w-4 h-4 fill-current" />
        <span className="text-sm font-medium">Doar</span>
      </button>
    </div>
    
    {/* Mobile: Doar on right */}
    <button
      onClick={onDonateClick}
      className="sm:hidden fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-2 bg-[#c44536] border-2 border-[#a33526] rounded-xl text-white hover:bg-[#d45546] transition-all font-semibold shadow-lg"
      data-testid="button-donate-mobile"
    >
      <Heart className="w-4 h-4 fill-current" />
      <span className="text-sm font-medium">Doar</span>
    </button>
  </>
);


const getModeEmoji = (modeId: string) => {
  switch (modeId) {
    case 'palavraSecreta': return '🔤';
    case 'palavras': return '📍';
    case 'duasFaccoes': return '⚔️';
    case 'categoriaItem': return '🎯';
    case 'perguntasDiferentes': return '🤔';
    case 'palavraComunidade': return '👥';
    default: return '🎮';
  }
};

const HomeScreen = () => {
  const { setUser, createRoom, joinRoom, isLoading, loadSavedNickname, saveNickname, clearSavedNickname, savedNickname } = useGameStore();
  const [name, setNameInput] = useState("");
  const [code, setCodeInput] = useState("");
  const [saveNicknameChecked, setSaveNicknameChecked] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = loadSavedNickname();
    if (saved) {
      setNameInput(saved);
      setSaveNicknameChecked(true);
    }
  }, [loadSavedNickname]);

  const handleCreate = () => {
    if (!name.trim()) {
      toast({ title: "Nome necessário", description: "Por favor, digite seu nome.", variant: "destructive" });
      return;
    }
    if (saveNicknameChecked) {
      saveNickname(name);
    }
    setUser(name);
    createRoom();
  };

  const handleJoin = async () => {
    if (!name.trim()) {
      toast({ title: "Nome necessário", description: "Por favor, digite seu nome.", variant: "destructive" });
      return;
    }
    if (!code.trim()) {
      toast({ title: "Código inválido", description: "Digite o código da sala.", variant: "destructive" });
      return;
    }
    
    if (saveNicknameChecked) {
      saveNickname(name);
    }
    setUser(name);
    const success = await joinRoom(code.toUpperCase());
    if (!success) {
      toast({ title: "Erro ao entrar", description: "Sala não encontrada ou código inválido.", variant: "destructive" });
    }
  };

  const handleClearNickname = () => {
    clearSavedNickname();
    setNameInput("");
    setSaveNicknameChecked(false);
    toast({ title: "Nickname removido", description: "Próxima vez você precisará digitar novamente." });
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center relative pt-20 md:pt-24"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Hero Banner - Oficina de Temas */}
      <Link 
        href="/criar-tema"
        className="hero-banner"
        data-testid="hero-banner-theme-workshop"
      >
        <p className="hero-banner-text-small">Divirta-se com os amigos</p>
        <p className="hero-banner-text-main">Crie seu próprio tema</p>
        <p className="hero-banner-text-price">Por apenas R$ 3,00</p>
      </Link>

      {/* Left AdSense Banner - 160x600 */}
      <div className="hidden xl:block fixed left-2 top-1/2 -translate-y-1/2 z-30">
        <ins 
          className="adsbygoogle"
          style={{ display: 'block', width: '160px', height: '600px' }}
          data-ad-client="ca-pub-4854252788330308"
          data-ad-slot="auto"
          data-ad-format="vertical"
        />
      </div>

      {/* Right AdSense Banner - 160x600 */}
      <div className="hidden xl:block fixed right-2 top-1/2 -translate-y-1/2 z-30">
        <ins 
          className="adsbygoogle"
          style={{ display: 'block', width: '160px', height: '600px' }}
          data-ad-client="ca-pub-4854252788330308"
          data-ad-slot="auto"
          data-ad-format="vertical"
        />
      </div>

      {/* Tripulante character - left side (desktop only) */}
      <img 
        src={tripulanteImg} 
        alt="Tripulante" 
        className="hidden md:block absolute bottom-16 left-[18%] lg:left-[22%] xl:left-[26%] h-[42vh] max-h-[420px] object-contain z-10"
      />

      {/* Impostor character - right side (desktop only) */}
      <img 
        src={impostorImg} 
        alt="Impostor" 
        className="hidden md:block absolute bottom-16 right-[18%] lg:right-[22%] xl:right-[26%] h-[42vh] max-h-[420px] object-contain z-10"
      />

      {/* Main card */}
      <div className="main-card w-[90%] max-w-md p-5 md:p-6 z-20 animate-fade-in">
        {/* Impostor logo with characters */}
        <div className="flex justify-center mb-3">
          <img src={logoImpostor} alt="Impostor" className="h-28 md:h-36 object-contain" />
        </div>

        {/* Form */}
        <div className="space-y-3">
          {/* Nickname input */}
          <input
            type="text"
            placeholder="Seu nickname"
            value={name}
            onChange={(e) => setNameInput(e.target.value)}
            className="input-dark"
            data-testid="input-name"
          />

          {/* Create room button */}
          <button 
            onClick={handleCreate} 
            disabled={isLoading}
            className="btn-orange w-full"
            data-testid="button-create-room"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Zap size={20} />}
            CRIAR SALA
          </button>

          {/* Save nickname checkbox */}
          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={saveNicknameChecked}
                onChange={(e) => setSaveNicknameChecked(e.target.checked)}
                className="w-4 h-4 rounded bg-[#1a2a3a] border-2 border-[#4a6a8a] cursor-pointer accent-[#e8a045]"
                data-testid="checkbox-save-nickname"
              />
              <span className="text-sm text-[#8aa0b0]">Guardar nickname</span>
            </label>
            {savedNickname && (
              <button
                onClick={handleClearNickname}
                className="text-xs text-[#6a8aaa] hover:text-white transition-colors underline"
                data-testid="button-clear-nickname"
              >
                Limpar
              </button>
            )}
          </div>

          {/* OR divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-[#4a6a8a]"></div>
            <span className="text-[#8aa0b0] text-sm font-bold">OU</span>
            <div className="flex-1 h-px bg-[#4a6a8a]"></div>
          </div>

          {/* Code input and Enter button */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="CÓDIGO"
              value={code}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              maxLength={4}
              className="input-code flex-1"
              data-testid="input-room-code"
            />
            <button 
              onClick={handleJoin}
              disabled={isLoading}
              className="btn-green"
              data-testid="button-join-room"
            >
              ENTRAR
            </button>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center z-20">
        <img src={logoTikjogos} alt="TikJogos" className="h-4 md:h-5 mx-auto mb-2" />
        <p className="text-[#6a8aaa] text-xs">
          Desenvolvido com <Heart className="inline w-3 h-3 text-gray-500 fill-current" /> por <span className="text-[#8aa0b0]">Rodrigo Freitas</span>
        </p>
        <div className="flex items-center justify-center gap-2 text-xs mt-1">
          <Link href="/privacidade" className="text-[#6a8aaa] hover:text-white transition-colors">
            Privacidade
          </Link>
          <span className="text-[#4a6a8a]">|</span>
          <Link href="/termos" className="text-[#6a8aaa] hover:text-white transition-colors">
            Termos
          </Link>
        </div>
      </div>

      {/* Donation Button and Modal */}
      <TopRightButtons onDonateClick={() => setIsDonationOpen(true)} />
      <DonationModal isOpen={isDonationOpen} onClose={() => setIsDonationOpen(false)} />
    </div>
  );
};

type PublicTheme = {
  id: string;
  titulo: string;
  autor: string;
  palavrasCount: number;
  accessCode: string;
  createdAt: string;
};

const CommunityThemesModal = ({ isOpen, onClose, onSelectTheme }: { isOpen: boolean; onClose: () => void; onSelectTheme: (themeId: string) => void }) => {
  const { toast } = useToast();
  const [publicThemes, setPublicThemes] = useState<PublicTheme[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPublicThemes();
    }
  }, [isOpen]);

  const loadPublicThemes = async () => {
    setIsLoadingThemes(true);
    try {
      const res = await fetch('/api/themes/public');
      if (res.ok) {
        const themes = await res.json();
        setPublicThemes(themes);
      }
    } catch (err) {
      console.error('Failed to load themes:', err);
      toast({ title: "Erro", description: "Falha ao carregar temas", variant: "destructive" });
    } finally {
      setIsLoadingThemes(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative card-retro w-full max-w-lg max-h-[75vh] overflow-hidden animate-fade-in flex flex-col">
        <div className="p-4 border-b border-[#3d4a5c] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#6b4ba3] flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Temas da Comunidade
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {isLoadingThemes ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#6b4ba3]" />
              </div>
            ) : publicThemes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>Nenhum tema disponível ainda.</p>
                <p className="text-sm mt-2">Seja o primeiro a criar um!</p>
              </div>
            ) : (
              publicThemes.map((theme) => (
                <button 
                  key={theme.id}
                  onClick={() => {
                    onSelectTheme(theme.id);
                    onClose();
                    toast({ title: "Tema selecionado!", description: `"${theme.titulo}" será usado na partida.` });
                  }}
                  className="w-full p-3 rounded-xl bg-[#16213e]/80 border border-[#3d4a5c] hover:border-[#6b4ba3] transition-colors text-left"
                  data-testid={`theme-select-${theme.id}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white truncate">{theme.titulo}</h3>
                      <p className="text-xs text-gray-400">por {theme.autor}</p>
                    </div>
                    <span className="text-xs text-[#6b4ba3] bg-[#6b4ba3]/10 px-2 py-1 rounded whitespace-nowrap">
                      {theme.palavrasCount} palavras
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LobbyScreen = () => {
  const { room, user, goToModeSelect, leaveGame, kickPlayer } = useGameStore();
  const { toast } = useToast();

  if (!room) return null;

  const isHost = room.hostId === user?.uid;
  const players = room.players || [];
  const currentPlayer = players.find(p => p.uid === user?.uid);
  const isWaitingForNextRound = currentPlayer?.waitingForGame === true && room.status === 'playing';

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin + "/#" + room.code);
    toast({ title: "Copiado!", description: "Link da sala copiado para a área de transferência." });
  };

  return (
    <div className="flex flex-col w-full max-w-md h-full py-6 px-4 animate-fade-in relative z-10">
      {/* Overlay escuro para contraste */}
      <div className="absolute inset-0 bg-[#0a1628]/90 -z-10 rounded-2xl"></div>
      
      <div className="w-full flex justify-between items-center mb-6 border-b border-[#3d4a5c] pb-4">
        <div onClick={copyLink} className="cursor-pointer group">
          <p className="text-gray-300 text-[10px] uppercase tracking-widest mb-1 group-hover:text-[#e07b39] transition-colors">Código da Sala</p>
          <h2 className="text-4xl font-black tracking-widest font-mono flex items-center gap-3">
            <span className="text-[#e07b39]" data-testid="text-room-code">{room.code}</span>
            <Copy className="w-4 h-4 text-gray-300 group-hover:text-[#e07b39] transition-colors" />
          </h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={leaveGame}
          className="w-10 h-10 rounded-xl border-2 border-[#3d4a5c] hover:border-[#c44536] hover:bg-[#c44536]/10 text-gray-300 hover:text-[#c44536] transition-all"
          data-testid="button-leave-room"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 w-full card-retro p-4 mb-4 overflow-y-auto scrollbar-hide">
        <h3 className="text-gray-300 text-xs font-bold uppercase mb-4 flex items-center gap-2 tracking-widest">
          Tripulantes ({players.length})
          <span className="flex-1 h-[1px] bg-[#3d4a5c]"></span>
        </h3>
        <ul className="space-y-3 pb-4">
          {players.map((p) => {
            const isMe = p.uid === user?.uid;
            const isPlayerHost = p.uid === room.hostId;
            const initial = p.name.charAt(0).toUpperCase();
            
            return (
              <li 
                key={p.uid} 
                className={cn(
                  "p-3 rounded-xl flex items-center justify-between border-2 transition-all duration-300",
                  isMe ? "border-[#3d8b5f] bg-[#3d8b5f]/10" : "border-[#3d4a5c] bg-[#16213e]/50 hover:border-[#4a90a4]"
                )}
                data-testid={`player-${p.uid}`}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border-2",
                    isMe ? "border-[#3d8b5f] text-[#3d8b5f] bg-[#3d8b5f]/20" : "border-[#3d4a5c] text-gray-400"
                  )}>
                    {initial}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn("font-medium", isMe ? "text-[#3d8b5f]" : "text-white")}>
                        {p.name} {isMe && '(Você)'}
                      </span>
                      {p.waitingForGame && (
                        <span className="text-[11px] text-gray-400 italic opacity-60">
                          Aguardando partida acabar
                        </span>
                      )}
                    </div>
                    {isPlayerHost && (
                      <span className="text-[10px] text-[#e9c46a] uppercase tracking-widest font-bold flex items-center gap-1">
                        <Crown className="w-3 h-3" /> Capitão
                      </span>
                    )}
                  </div>
                </div>
                {isHost && !isMe && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => kickPlayer(p.uid)}
                    className="w-8 h-8 rounded-lg border border-[#3d4a5c] hover:border-[#c44536] hover:bg-[#c44536]/10 text-gray-400 hover:text-[#c44536] transition-all"
                    data-testid={`button-kick-${p.uid}`}
                    title="Expulsar jogador"
                  >
                    <UserX className="w-4 h-4" />
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {isWaitingForNextRound ? (
        <div className="w-full text-center text-[#e9c46a] py-4 flex flex-col items-center gap-3">
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-[#e9c46a] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-[#e9c46a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-[#e9c46a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-sm font-medium">Aguardando próxima rodada...</p>
          <p className="text-xs text-gray-300">Você entrará quando a rodada começar</p>
        </div>
      ) : isHost ? (
        <div className="w-full animate-fade-in space-y-3">
          <Button 
            onClick={goToModeSelect}
            disabled={players.length < 3}
            className="w-full h-16 btn-retro-primary font-bold text-lg transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
            data-testid="button-start-game"
          >
            <Play className="mr-2 fill-current" /> ESCOLHER MODO
          </Button>
          {players.length < 3 && (
            <p className="text-center text-xs text-[#c44536] mt-3">Mínimo de 3 tripulantes</p>
          )}
        </div>
      ) : (
        <div className="w-full text-center text-gray-300 py-4 flex flex-col items-center gap-3">
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-[#4a90a4] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-[#4a90a4] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-[#4a90a4] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-sm">Aguardando o capitão iniciar...</p>
        </div>
      )}

    </div>
  );
};

const ModeSelectScreen = () => {
  const { room, user, gameModes, selectedMode, selectMode, startGame, backToLobby, fetchGameModes, showSpeakingOrderWheel, speakingOrder, setSpeakingOrder, setShowSpeakingOrderWheel } = useGameStore();
  const { toast } = useToast();
  const [isStarting, setIsStarting] = useState(false);
  const [communityThemes, setCommunityThemes] = useState<PublicTheme[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(false);
  const [selectedThemeCode, setSelectedThemeCode] = useState<string | null>(null);

  const isHost = room && user && room.hostId === user.uid;

  useEffect(() => {
    fetchGameModes();
  }, [fetchGameModes]);

  useEffect(() => {
    if (selectedMode === 'palavraComunidade') {
      loadCommunityThemes();
    } else {
      setSelectedThemeCode(null);
    }
  }, [selectedMode]);

  const loadCommunityThemes = async () => {
    setIsLoadingThemes(true);
    try {
      const res = await fetch('/api/themes/public');
      if (res.ok) {
        const themes = await res.json();
        setCommunityThemes(themes);
      }
    } catch (err) {
      console.error('Failed to load themes:', err);
      toast({ title: "Erro", description: "Falha ao carregar temas", variant: "destructive" });
    } finally {
      setIsLoadingThemes(false);
    }
  };

  const handleStartGameWithSorteio = async () => {
    if (!selectedMode || !room) return;
    
    setIsStarting(true);
    
    // Se é modo de perguntas diferentes, pula sorteio
    if (selectedMode === 'perguntasDiferentes') {
      await startGame();
      setIsStarting(false);
      return;
    }
    
    // Se é palavraComunidade, precisa ter um tema selecionado
    if (selectedMode === 'palavraComunidade') {
      if (!selectedThemeCode) {
        toast({ title: "Selecione um tema", description: "Escolha um tema da comunidade para jogar", variant: "destructive" });
        setIsStarting(false);
        return;
      }
      await startGame(selectedThemeCode);
      setIsStarting(false);
      return;
    }
    
    // Para outros modos, inicia direto (sorteio aparecerá depois)
    await startGame();
    setIsStarting(false);
  };

  const handleBackClick = () => {
    backToLobby();
    if (isHost) {
      toast({ title: "Retornando ao lobby...", description: "Todos os jogadores foram levados de volta." });
    }
  };

  if (!room) return null;

  return (
    <div className="flex flex-col w-full max-w-md h-full py-6 px-4 animate-fade-in relative z-10">
      {/* Overlay escuro para contraste */}
      <div className="absolute inset-0 bg-[#0a1628]/90 -z-10 rounded-2xl"></div>
      
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleBackClick}
          className="w-10 h-10 rounded-lg border border-[#3d4a5c] hover:border-[#4a90a4] text-gray-300 hover:text-[#4a90a4] transition-all"
          data-testid="button-back-to-lobby"
          title={isHost ? "Voltar ao lobby (todos os jogadores serão levados)" : "Voltar ao lobby"}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white">Escolha o Modo</h2>
          <p className="text-gray-300 text-sm">Selecione como jogar</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-4 scrollbar-hide">
        {gameModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => selectMode(mode.id as GameModeType)}
            className={cn(
              "w-full p-4 rounded-xl border-2 text-left transition-all duration-300",
              selectedMode === mode.id 
                ? "border-[#4a90a4] bg-[#4a90a4]/10" 
                : "border-[#3d4a5c] bg-[#16213e]/80 hover:border-gray-500"
            )}
            style={selectedMode === mode.id ? { boxShadow: '0 4px 0 rgba(58, 77, 96, 0.5)' } : {}}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center text-2xl border-2",
                selectedMode === mode.id ? "border-[#4a90a4] bg-[#4a90a4]/10" : "border-[#3d4a5c] bg-black"
              )}>
                {getModeEmoji(mode.id)}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">{mode.title}</h3>
                <p className="text-gray-300 text-sm mt-1">{mode.desc}</p>
              </div>
              {selectedMode === mode.id && (
                <div className="w-6 h-6 rounded-full bg-[#4a90a4] flex items-center justify-center"
                     style={{ boxShadow: '0 2px 0 rgba(74, 144, 164, 0.5)' }}>
                  <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
        
        {selectedMode === 'palavraComunidade' && (
          <div className="mt-4 pt-4 border-t border-[#3d4a5c]">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#4a90a4]" />
              Escolha um tema da comunidade
            </h3>
            {isLoadingThemes ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-[#4a90a4]" />
              </div>
            ) : communityThemes.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <p>Nenhum tema disponivel ainda.</p>
                <p className="text-sm mt-2">Crie um na Oficina de Temas!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {communityThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedThemeCode(theme.accessCode)}
                    className={cn(
                      "w-full p-3 rounded-xl border-2 text-left transition-all",
                      selectedThemeCode === theme.accessCode
                        ? "border-[#6b4ba3] bg-[#6b4ba3]/10"
                        : "border-[#3d4a5c] bg-[#16213e]/60 hover:border-gray-500"
                    )}
                    data-testid={`button-theme-${theme.id}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate">{theme.titulo}</h4>
                        <p className="text-xs text-gray-400 truncate">por {theme.autor}</p>
                      </div>
                      <span className="text-xs text-[#6b4ba3] bg-[#6b4ba3]/10 px-2 py-1 rounded shrink-0">
                        {theme.palavrasCount} palavras
                      </span>
                      {selectedThemeCode === theme.accessCode && (
                        <div className="w-5 h-5 rounded-full bg-[#6b4ba3] flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Button 
        onClick={handleStartGameWithSorteio}
        disabled={!selectedMode || isStarting || (selectedMode === 'palavraComunidade' && !selectedThemeCode)}
        className="w-full h-16 btn-retro-primary font-bold text-lg rounded-lg transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Rocket className="mr-2" /> INICIAR PARTIDA
      </Button>
    </div>
  );
};

type PerguntasDiferentesPhase = 'viewing' | 'answering' | 'waitingAnswers' | 'allAnswers' | 'crewQuestion' | 'voting' | 'waitingVotes' | 'result';

const QuestionRevealedOverlay = ({ 
  crewQuestion, 
  myQuestion,
  isImpostor, 
  isHost, 
  onNewRound,
  onClose 
}: { 
  crewQuestion: string;
  myQuestion: string;
  isImpostor: boolean;
  isHost: boolean;
  onNewRound: () => void;
  onClose: () => void;
}) => {
  const questionsDiffer = crewQuestion !== myQuestion;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#16213e]/95 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md space-y-6">
        <div className="w-full bg-gradient-to-br from-gray-700/20 to-gray-700/5 rounded-2xl p-6 border border-gray-600/30 space-y-4">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-xl border-2 border-gray-600 flex items-center justify-center mb-4"
                 style={{ boxShadow: '0 4px 0 rgba(128, 128, 128, 0.2)' }}>
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">Pergunta dos Tripulantes</p>
            <p className="text-2xl text-white font-bold leading-relaxed">"{crewQuestion}"</p>
          </div>
          
          {isImpostor && questionsDiffer && (
            <div className="text-center pt-4 border-t border-gray-600/20 space-y-2">
              <p className="text-gray-400 text-lg font-bold animate-pulse">
                Sua pergunta era diferente!
              </p>
              <p className="text-gray-400 text-sm">
                Tente se justificar e convencer que voce nao e o impostor!
              </p>
            </div>
          )}
          
          {!isImpostor && (
            <div className="text-center pt-4 border-t border-gray-600/20">
              <p className="text-gray-400 text-sm">
                Descubra quem recebeu uma pergunta diferente!
              </p>
            </div>
          )}
        </div>

        <Button 
          onClick={onClose}
          className="w-full h-12 border-2 border-gray-700 bg-transparent text-gray-400 hover:border-[#4a90a4] hover:text-[#4a90a4] hover:bg-transparent rounded-lg"
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Voltar ao Jogo
        </Button>

        {isHost && (
          <Button 
            onClick={onNewRound}
            className="w-full border-2 border-[#4a90a4] bg-transparent text-[#4a90a4] hover:bg-[#4a90a4]/10 rounded-lg"
          >
            <RotateCcw className="mr-2 w-4 h-4" /> Nova Rodada
          </Button>
        )}
      </div>
    </div>
  );
};

const PerguntasDiferentesScreen = () => {
  const { user, room, returnToLobby } = useGameStore();
  const [phase, setPhase] = useState<PerguntasDiferentesPhase>('viewing');
  const [isRevealed, setIsRevealed] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVote, setSelectedVote] = useState<string | null>(null);

  if (!room || !room.gameData) return null;

  const isHost = room.hostId === user?.uid;
  const isImpostor = user?.uid === room.impostorId;
  const gameData = room.gameData;
  const answersRevealed = gameData.answersRevealed === true;
  const crewQuestionRevealed = gameData.crewQuestionRevealed === true;
  const votingStarted = gameData.votingStarted === true;
  const votesRevealed = gameData.votesRevealed === true;
  const answers = gameData.answers || [];
  const votes = gameData.votes || [];
  
  const myQuestion = isImpostor ? gameData.impostorQuestion : gameData.question;
  const crewQuestion = gameData.question || '';
  
  const activePlayers = room.players.filter(p => !p.waitingForGame);
  const totalPlayers = activePlayers.length;
  const answeredCount = answers.length;
  const allAnswered = answeredCount >= totalPlayers;
  const hasMyAnswer = answers.some((a: PlayerAnswer) => a.playerId === user?.uid);
  const myAnswer = answers.find((a: PlayerAnswer) => a.playerId === user?.uid)?.answer || '';
  
  const votedCount = votes.length;
  const allVoted = votedCount >= totalPlayers;
  const hasMyVote = votes.some((v: PlayerVote) => v.playerId === user?.uid);

  const handleNewRound = async () => {
    try {
      await returnToLobby();
    } catch (error) {
      console.error('Error in returnToLobby:', error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !room || !user) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/rooms/${room.code}/submit-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: user.uid,
          playerName: user.name,
          answer: answer.trim()
        })
      });
      
      if (response.ok) {
        setPhase('waitingAnswers');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevealAnswers = async () => {
    if (!room) return;
    try {
      await fetch(`/api/rooms/${room.code}/reveal-answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error revealing answers:', error);
    }
  };

  const handleRevealCrewQuestion = async () => {
    if (!room) return;
    try {
      await fetch(`/api/rooms/${room.code}/reveal-crew-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error revealing crew question:', error);
    }
  };

  const handleStartVoting = async () => {
    if (!room) return;
    try {
      await fetch(`/api/rooms/${room.code}/start-voting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error starting voting:', error);
    }
  };

  const handleSubmitVote = async () => {
    if (!selectedVote || !room || !user) return;
    
    const targetPlayer = activePlayers.find(p => p.uid === selectedVote);
    if (!targetPlayer) return;
    
    setIsSubmitting(true);
    try {
      await fetch(`/api/rooms/${room.code}/submit-vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: user.uid,
          playerName: user.name,
          targetId: selectedVote,
          targetName: targetPlayer.name
        })
      });
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevealImpostor = async () => {
    if (!room) return;
    try {
      await fetch(`/api/rooms/${room.code}/reveal-impostor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error revealing impostor:', error);
    }
  };

  const handleProceedToAnswer = () => {
    setPhase('answering');
  };

  useEffect(() => {
    if (votesRevealed && phase !== 'result') {
      setPhase('result');
    } else if (votingStarted && !votesRevealed && hasMyVote && phase !== 'waitingVotes' && phase !== 'result') {
      setPhase('waitingVotes');
    } else if (votingStarted && !votesRevealed && !hasMyVote && phase !== 'voting' && phase !== 'waitingVotes' && phase !== 'result') {
      setPhase('voting');
    } else if (crewQuestionRevealed && !votingStarted && phase !== 'crewQuestion' && phase !== 'voting' && phase !== 'waitingVotes' && phase !== 'result') {
      setPhase('crewQuestion');
    } else if (answersRevealed && !crewQuestionRevealed && phase !== 'allAnswers' && phase !== 'crewQuestion' && phase !== 'voting' && phase !== 'waitingVotes' && phase !== 'result') {
      setPhase('allAnswers');
    } else if (hasMyAnswer && phase === 'answering') {
      setPhase('waitingAnswers');
    }
  }, [answersRevealed, crewQuestionRevealed, votingStarted, votesRevealed, hasMyAnswer, hasMyVote, phase]);

  if (phase === 'viewing') {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-md h-full p-6 animate-fade-in space-y-6 relative z-10">
        <div className="absolute inset-0 bg-[#0a1628]/90 -z-10 rounded-2xl"></div>
        
        <GameNavButtons onBackToLobby={handleNewRound} isImpostor={false} />
        <div 
          className={cn(
            "w-full aspect-[3/4] max-h-[500px] rounded-2xl p-8 flex flex-col items-center justify-center text-center relative transition-all duration-500 cursor-pointer overflow-hidden",
            isRevealed 
              ? "innocent-card"
              : "bg-black border-2 border-[#3d4a5c]"
          )}
          onClick={() => !isRevealed && setIsRevealed(true)}
          data-testid="card-reveal"
        >
          {!isRevealed ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Eye className="w-20 h-20 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-200">TOQUE PARA REVELAR</h3>
              <p className="text-gray-400 text-sm">Veja sua pergunta</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 animate-fade-in w-full">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsRevealed(false); }}
                className="absolute top-4 right-4 w-10 h-10 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <EyeOff className="w-5 h-5 text-white/60" />
              </button>
              
              <div className="w-24 h-24 rounded-xl border-2 border-[#4a90a4] flex items-center justify-center mb-2"
                   style={{ boxShadow: '0 4px 0 rgba(74, 144, 164, 0.5)' }}>
                <HelpCircle className="w-12 h-12 text-[#4a90a4]" />
              </div>
              
              <div className="space-y-6 text-center">
                <div className="space-y-2">
                  <p className="text-[#4a90a4] text-sm uppercase tracking-widest font-bold">Sua Pergunta</p>
                  <h2 className="text-xl text-white font-bold leading-relaxed px-2">"{myQuestion}"</h2>
                </div>
                <p className="text-gray-400 text-sm">Memorize sua pergunta!</p>
              </div>
            </div>
          )}
        </div>

        <p className="text-gray-300 text-sm text-center">
          {isRevealed ? "Toque no X para esconder" : "Toque para ver sua pergunta"}
        </p>

        {isRevealed && (
          <Button 
            onClick={handleProceedToAnswer}
            className="w-full h-14 btn-retro-primary font-bold text-lg rounded-lg transition-all active:scale-[0.98]"
          >
            <MessageSquare className="mr-2 w-5 h-5" /> Responder Pergunta
          </Button>
        )}
      </div>
    );
  }

  if (phase === 'answering') {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-md h-full p-6 animate-fade-in space-y-6 relative z-10">
        <div className="absolute inset-0 bg-[#0a1628]/90 -z-10 rounded-2xl"></div>
        
        <GameNavButtons onBackToLobby={handleNewRound} isImpostor={false} />
        <div className="w-full bg-[#16213e]/80 rounded-2xl p-6 border border-[#3d4a5c] space-y-6">
          <div className="text-center space-y-2">
            <p className="text-[#4a90a4] text-sm uppercase tracking-widest font-bold">Sua Pergunta</p>
            <h2 className="text-lg text-white font-bold leading-relaxed">"{myQuestion}"</h2>
          </div>
          
          <div className="w-full h-[1px] bg-gray-700"></div>
          
          <div className="space-y-4">
            <p className="text-gray-300 text-sm text-center">Digite sua resposta abaixo:</p>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Sua resposta..."
              className="w-full min-h-[120px] p-4 rounded-xl bg-black border-2 border-[#3d4a5c] text-white text-lg placeholder:text-gray-600 focus-visible:ring-0 focus-visible:border-[#4a90a4] transition-all resize-none"
            />
          </div>

          <Button 
            onClick={handleSubmitAnswer}
            disabled={!answer.trim() || isSubmitting}
            className="w-full h-14 btn-retro-primary font-bold text-lg rounded-lg transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="mr-2 w-5 h-5" /> {isSubmitting ? 'Enviando...' : 'Enviar Resposta'}
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'waitingAnswers') {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-md h-full p-6 animate-fade-in space-y-6 relative z-10">
        <div className="absolute inset-0 bg-[#0a1628]/90 -z-10 rounded-2xl"></div>
        
        <GameNavButtons onBackToLobby={handleNewRound} isImpostor={false} />
        
        <div className="w-full bg-[#16213e]/80 rounded-2xl p-6 border border-[#3d4a5c] space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-[#3d8b5f]/20 border-2 border-[#3d8b5f] flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-[#3d8b5f]" />
            </div>
            <p className="text-[#3d8b5f] text-sm uppercase tracking-widest font-bold">Resposta Enviada!</p>
            <p className="text-white text-lg font-medium">"{myAnswer}"</p>
          </div>
          
          <div className="w-full h-[1px] bg-gray-700"></div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-[#4a90a4]" />
              <p className="text-gray-300">
                <span className="text-[#4a90a4] font-bold">{answeredCount}</span> de <span className="font-bold">{totalPlayers}</span> responderam
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {activePlayers.map(player => {
                const hasAnswered = answers.some((a: PlayerAnswer) => a.playerId === player.uid);
                return (
                  <div 
                    key={player.uid}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                      hasAnswered 
                        ? "bg-[#3d8b5f]/20 text-[#3d8b5f] border border-[#3d8b5f]/30"
                        : "bg-gray-700/50 text-gray-400 border border-gray-600/30"
                    )}
                  >
                    {hasAnswered && <Check className="w-3 h-3 inline mr-1" />}
                    {player.name}
                  </div>
                );
              })}
            </div>
          </div>
          
          {!allAnswered && (
            <p className="text-gray-400 text-sm text-center animate-pulse">
              Aguardando outros jogadores...
            </p>
          )}
        </div>

        {isHost && allAnswered && (
          <Button 
            onClick={handleRevealAnswers}
            className="w-full h-14 bg-[#e07b39] hover:bg-[#e07b39]/80 text-white font-bold text-lg rounded-lg transition-all"
            style={{ boxShadow: '0 4px 0 rgba(224, 123, 57, 0.5)' }}
          >
            <Eye className="mr-2 w-5 h-5" /> Mostrar Respostas para Todos
          </Button>
        )}
        
        {!isHost && allAnswered && (
          <p className="text-[#e07b39] text-sm text-center font-medium animate-pulse">
            Aguardando o host mostrar as respostas...
          </p>
        )}
      </div>
    );
  }

  if (phase === 'allAnswers') {
    return (
      <div className="flex flex-col items-center w-full max-w-md h-full p-6 animate-fade-in space-y-6 relative z-10 overflow-y-auto">
        <div className="absolute inset-0 bg-[#0a1628]/90 -z-10 rounded-2xl"></div>
        
        <GameNavButtons onBackToLobby={handleNewRound} isImpostor={false} />
        
        <div className="w-full space-y-4">
          <div className="text-center mb-4">
            <p className="text-[#e07b39] text-sm uppercase tracking-widest font-bold">Respostas de Todos</p>
          </div>
          
          {answers.map((playerAnswer: PlayerAnswer, index: number) => {
            const isCurrentUser = playerAnswer.playerId === user?.uid;
            return (
              <div 
                key={playerAnswer.playerId}
                className={cn(
                  "w-full rounded-xl p-4 border-2 transition-all",
                  isCurrentUser 
                    ? "bg-[#4a90a4]/10 border-[#4a90a4]/50"
                    : "bg-[#16213e]/80 border-[#3d4a5c]"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    isCurrentUser ? "bg-[#4a90a4] text-white" : "bg-gray-600 text-gray-200"
                  )}>
                    {index + 1}
                  </div>
                  <span className={cn(
                    "font-bold",
                    isCurrentUser ? "text-[#4a90a4]" : "text-gray-300"
                  )}>
                    {playerAnswer.playerName}
                    {isCurrentUser && " (Voce)"}
                  </span>
                </div>
                <p className="text-white text-lg pl-10">"{playerAnswer.answer}"</p>
              </div>
            );
          })}
        </div>

        {isHost && (
          <Button 
            onClick={handleRevealCrewQuestion}
            className="w-full h-14 bg-white hover:bg-white/80 text-black font-bold text-lg rounded-lg transition-all"
            style={{ boxShadow: '0 4px 0 rgba(255, 255, 255, 0.2)' }}
          >
            <Eye className="mr-2 w-5 h-5" /> Revelar Pergunta dos Tripulantes
          </Button>
        )}
        
        {!isHost && (
          <p className="text-gray-400 text-sm text-center font-medium animate-pulse">
            Aguardando o host revelar a pergunta dos tripulantes...
          </p>
        )}
      </div>
    );
  }

  if (phase === 'crewQuestion') {
    return (
      <div className="flex flex-col items-center w-full max-w-md h-full p-6 animate-fade-in space-y-6 relative z-10 overflow-y-auto">
        <div className="absolute inset-0 bg-[#0a1628]/90 -z-10 rounded-2xl"></div>
        
        <GameNavButtons onBackToLobby={handleNewRound} isImpostor={false} />
        
        <div className="w-full bg-gradient-to-br from-gray-700/20 to-gray-700/5 rounded-2xl p-6 border border-gray-600/30 space-y-4">
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Pergunta dos Tripulantes</p>
            <p className="text-xl text-white font-bold leading-relaxed">"{crewQuestion}"</p>
          </div>
          {isImpostor && (
            <div className="text-center pt-4 border-t border-gray-600/20">
              <p className="text-gray-400 text-sm font-medium">
                Sua pergunta era diferente! Tente se justificar!
              </p>
            </div>
          )}
        </div>
        
        <div className="w-full space-y-4">
          <div className="text-center">
            <p className="text-[#e07b39] text-sm uppercase tracking-widest font-bold mb-4">Respostas</p>
          </div>
          
          {answers.map((playerAnswer: PlayerAnswer, index: number) => {
            const isCurrentUser = playerAnswer.playerId === user?.uid;
            return (
              <div 
                key={playerAnswer.playerId}
                className={cn(
                  "w-full rounded-xl p-4 border-2 transition-all",
                  isCurrentUser 
                    ? "bg-[#4a90a4]/10 border-[#4a90a4]/50"
                    : "bg-[#16213e]/80 border-[#3d4a5c]"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    isCurrentUser ? "bg-[#4a90a4] text-white" : "bg-gray-600 text-gray-200"
                  )}>
                    {index + 1}
                  </div>
                  <span className={cn(
                    "font-bold",
                    isCurrentUser ? "text-[#4a90a4]" : "text-gray-300"
                  )}>
                    {playerAnswer.playerName}
                    {isCurrentUser && " (Voce)"}
                  </span>
                </div>
                <p className="text-white text-lg pl-10">"{playerAnswer.answer}"</p>
              </div>
            );
          })}
        </div>

        <Button 
          onClick={handleStartVoting}
          className="w-full h-14 bg-[#3d8b5f] hover:bg-[#3d8b5f]/80 text-white font-bold text-lg rounded-lg transition-all"
          style={{ boxShadow: '0 4px 0 rgba(61, 139, 95, 0.5)' }}
        >
          <Vote className="mr-2 w-5 h-5" /> Iniciar Votacao
        </Button>
      </div>
    );
  }

  if (phase === 'voting') {
    return (
      <div className="flex flex-col items-center w-full max-w-md h-full p-6 animate-fade-in space-y-6 relative z-10 overflow-y-auto">
        <div className="absolute inset-0 bg-[#0a1628]/90 -z-10 rounded-2xl"></div>
        
        <GameNavButtons onBackToLobby={handleNewRound} isImpostor={false} />
        
        <div className="w-full bg-[#16213e]/80 rounded-2xl p-6 border border-[#3d4a5c] space-y-6">
          <div className="text-center space-y-2">
            <Vote className="w-12 h-12 text-[#e9c46a] mx-auto" />
            <p className="text-[#e9c46a] text-sm uppercase tracking-widest font-bold">Hora de Votar!</p>
            <p className="text-gray-300 text-sm">Quem voce acha que e o impostor?</p>
          </div>
          
          <div className="w-full h-[1px] bg-gray-700"></div>
          
          <div className="space-y-3">
            {activePlayers.filter(p => p.uid !== user?.uid).map(player => (
              <button
                key={player.uid}
                onClick={() => setSelectedVote(player.uid)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3",
                  selectedVote === player.uid
                    ? "bg-[#e9c46a]/20 border-[#e9c46a] text-[#e9c46a]"
                    : "bg-[#16213e] border-[#3d4a5c] text-gray-300 hover:border-[#e9c46a]/50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold",
                  selectedVote === player.uid ? "bg-[#e9c46a] text-black" : "bg-gray-600 text-gray-200"
                )}>
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-bold text-lg">{player.name}</span>
                {selectedVote === player.uid && (
                  <Check className="w-5 h-5 ml-auto" />
                )}
              </button>
            ))}
          </div>

          <Button 
            onClick={handleSubmitVote}
            disabled={!selectedVote || isSubmitting}
            className="w-full h-14 bg-[#e9c46a] hover:bg-[#e9c46a]/80 text-black font-bold text-lg rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ boxShadow: '0 4px 0 rgba(233, 196, 106, 0.5)' }}
          >
            <Send className="mr-2 w-5 h-5" /> {isSubmitting ? 'Votando...' : 'Confirmar Voto'}
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'waitingVotes') {
    const myVote = votes.find((v: PlayerVote) => v.playerId === user?.uid);
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-md h-full p-6 animate-fade-in space-y-6 relative z-10">
        <div className="absolute inset-0 bg-[#0a1628]/90 -z-10 rounded-2xl"></div>
        
        <GameNavButtons onBackToLobby={handleNewRound} isImpostor={false} />
        
        <div className="w-full bg-[#16213e]/80 rounded-2xl p-6 border border-[#3d4a5c] space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-[#3d8b5f]/20 border-2 border-[#3d8b5f] flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-[#3d8b5f]" />
            </div>
            <p className="text-[#3d8b5f] text-sm uppercase tracking-widest font-bold">Voto Enviado!</p>
            <p className="text-white text-lg font-medium">Voce votou em: <span className="text-[#e9c46a]">{myVote?.targetName}</span></p>
          </div>
          
          <div className="w-full h-[1px] bg-gray-700"></div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-[#4a90a4]" />
              <p className="text-gray-300">
                <span className="text-[#4a90a4] font-bold">{votedCount}</span> de <span className="font-bold">{totalPlayers}</span> votaram
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {activePlayers.map(player => {
                const hasVoted = votes.some((v: PlayerVote) => v.playerId === player.uid);
                return (
                  <div 
                    key={player.uid}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                      hasVoted 
                        ? "bg-[#3d8b5f]/20 text-[#3d8b5f] border border-[#3d8b5f]/30"
                        : "bg-gray-700/50 text-gray-400 border border-gray-600/30"
                    )}
                  >
                    {hasVoted && <Check className="w-3 h-3 inline mr-1" />}
                    {player.name}
                  </div>
                );
              })}
            </div>
          </div>
          
          {!allVoted && (
            <p className="text-gray-400 text-sm text-center animate-pulse">
              Aguardando outros jogadores votarem...
            </p>
          )}
        </div>

        {isHost && allVoted && (
          <Button 
            onClick={handleRevealImpostor}
            className="w-full h-14 bg-[#c44536] hover:bg-[#c44536]/80 text-white font-bold text-lg rounded-lg transition-all"
            style={{ boxShadow: '0 4px 0 rgba(196, 69, 54, 0.5)' }}
          >
            <Skull className="mr-2 w-5 h-5" /> Revelar o Impostor
          </Button>
        )}
        
        {!isHost && allVoted && (
          <p className="text-[#c44536] text-sm text-center font-medium animate-pulse">
            Aguardando o host revelar o impostor...
          </p>
        )}
      </div>
    );
  }

  if (phase === 'result') {
    const impostorPlayer = activePlayers.find(p => p.uid === room.impostorId);
    const impostorName = impostorPlayer?.name || 'Desconhecido';
    
    const votesForImpostor = votes.filter((v: PlayerVote) => v.targetId === room.impostorId).length;
    const crewWins = votesForImpostor > totalPlayers / 2;
    
    return (
      <div className="flex flex-col items-center w-full max-w-md h-full p-4 animate-fade-in relative z-10 overflow-y-auto">
        <div className="w-full bg-[#0a1628]/95 rounded-2xl p-6 space-y-6">
          <GameNavButtons onBackToLobby={handleNewRound} isImpostor={false} />
          
          <div className="w-full rounded-2xl p-6 border-2 space-y-6 text-center bg-gradient-to-br from-gray-700/20 to-gray-700/5 border-gray-600">
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto bg-gray-600">
                {crewWins ? (
                  <Trophy className="w-10 h-10 text-white" />
                ) : (
                  <Skull className="w-10 h-10 text-white" />
                )}
              </div>
              
              <h2 className="text-3xl font-bold text-white">
                {crewWins ? "TRIPULACAO VENCEU!" : "IMPOSTOR VENCEU!"}
              </h2>
              
              <p className="text-gray-300 text-lg">
                O impostor era: <span className="text-gray-400 font-bold">{impostorName}</span>
              </p>
            </div>
            
            <div className="w-full h-[1px] bg-gray-700"></div>
            
            <div className="space-y-4">
              <p className="text-[#e9c46a] text-sm uppercase tracking-widest font-bold">Resultados da Votacao</p>
              
              <div className="space-y-2">
                {activePlayers.map(player => {
                  const votesReceived = votes.filter((v: PlayerVote) => v.targetId === player.uid).length;
                  const isTheImpostor = player.uid === room.impostorId;
                  return (
                    <div 
                      key={player.uid}
                      className={cn(
                        "w-full p-3 rounded-lg flex items-center justify-between",
                        isTheImpostor 
                          ? "bg-[#c44536]/20 border border-[#c44536]/50"
                          : "bg-[#16213e]/50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-bold",
                          isTheImpostor ? "text-[#c44536]" : "text-gray-300"
                        )}>
                          {player.name}
                          {isTheImpostor && " (Impostor)"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[#e9c46a] font-bold">{votesReceived}</span>
                        <span className="text-gray-500 text-sm">votos</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {isHost && (
            <Button 
              onClick={handleNewRound}
              className="w-full h-14 btn-retro-primary font-bold text-lg rounded-lg transition-all"
            >
              <RotateCcw className="mr-2 w-5 h-5" /> Nova Rodada
            </Button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

type RoundStage = 'WORD_REVEAL' | 'SPEAKING_ORDER' | 'VOTING' | 'VOTING_FEEDBACK' | 'ROUND_RESULT';

const GameScreen = () => {
  const { user, room, returnToLobby, speakingOrder, setSpeakingOrder, showSpeakingOrderWheel, setShowSpeakingOrderWheel, triggerSpeakingOrderWheel } = useGameStore();
  const [isRevealed, setIsRevealed] = useState(true);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);

  const handleNewRound = async () => {
    try {
      await returnToLobby();
    } catch (error) {
      console.error('Error in returnToLobby:', error);
    }
  };

  const handleStartSorteio = () => {
    triggerSpeakingOrderWheel();
  };

  const handleSpeakingOrderComplete = (order: string[]) => {
    setSpeakingOrder(order);
    setShowSpeakingOrderWheel(false);
  };

  const roomCode = room?.code;
  const gameMode = room?.gameMode;

  if (!room) return null;

  const isHost = room.hostId === user?.uid;
  const isImpostor = user?.uid === room.impostorId;
  const gameData = room.gameData;
  
  const activePlayers = room.players.filter(p => !p.waitingForGame);
  const votes: PlayerVote[] = gameData?.votes || [];
  const votingStarted = gameData?.votingStarted === true;
  const votesRevealed = gameData?.votesRevealed === true;
  const hasMyVote = votes.some(v => v.playerId === user?.uid);

  const deriveCurrentStage = (): RoundStage => {
    if (votesRevealed) {
      return 'ROUND_RESULT';
    } else if (votingStarted && hasMyVote) {
      return 'VOTING_FEEDBACK';
    } else if (votingStarted && !hasMyVote) {
      return 'VOTING';
    } else if (showSpeakingOrderWheel) {
      return 'SPEAKING_ORDER';
    } else {
      return 'WORD_REVEAL';
    }
  };

  const currentStage = deriveCurrentStage();

  if (gameMode === 'perguntasDiferentes') {
    return <PerguntasDiferentesScreen />;
  }

  const handleStartVoting = async () => {
    try {
      await fetch(`/api/rooms/${roomCode}/start-voting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error starting voting:', error);
    }
  };

  const handleSubmitVote = async (targetId: string) => {
    if (!user) return;
    
    const targetPlayer = activePlayers.find(p => p.uid === targetId);
    if (!targetPlayer) return;
    
    setIsSubmittingVote(true);
    try {
      await fetch(`/api/rooms/${roomCode}/submit-vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: user.uid,
          playerName: user.name,
          targetId: targetId,
          targetName: targetPlayer.name
        })
      });
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setIsSubmittingVote(false);
    }
  };

  const handleRevealImpostor = async () => {
    try {
      await fetch(`/api/rooms/${roomCode}/reveal-impostor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error revealing impostor:', error);
    }
  };

  const renderCrewContent = () => {
    if (!gameData) return null;

    switch (gameMode) {
      case 'palavraSecreta':
        return (
          <div className="space-y-2 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-[0.2em] font-semibold">Palavra Secreta</p>
            <h2 className="text-2xl sm:text-3xl text-white font-black">{gameData.word}</h2>
            <p className="text-gray-400 text-xs">Dê dicas sutis sobre a palavra!</p>
          </div>
        );
      
      case 'palavras':
        const myRole = user?.uid ? gameData.roles?.[user.uid] : null;
        return (
          <div className="space-y-3 text-center">
            <div className="space-y-1">
              <p className="text-gray-400 text-xs uppercase tracking-[0.2em] font-semibold">Local</p>
              <h2 className="text-xl sm:text-2xl text-white font-black">{gameData.location}</h2>
            </div>
            <div className="w-12 h-[1px] bg-gray-600/30 mx-auto"></div>
            <div className="space-y-1">
              <p className="text-gray-400 text-xs uppercase tracking-[0.2em] font-semibold">Sua Função</p>
              <h3 className="text-lg sm:text-xl text-white font-bold">{myRole}</h3>
            </div>
          </div>
        );
      
      case 'duasFaccoes':
        const myFaction = user?.uid ? gameData.factionMap?.[user.uid] : null;
        return (
          <div className="space-y-2 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-[0.2em] font-semibold">Sua Palavra</p>
            <h2 className="text-2xl sm:text-3xl text-white font-black">{myFaction}</h2>
            <p className="text-gray-400 text-xs">Descubra quem é do seu time!</p>
          </div>
        );
      
      case 'categoriaItem':
        return (
          <div className="space-y-3 text-center">
            <div className="space-y-1">
              <p className="text-gray-400 text-xs uppercase tracking-[0.2em] font-semibold">Categoria</p>
              <h3 className="text-lg sm:text-xl text-white font-bold">{gameData.category}</h3>
            </div>
            <div className="w-12 h-[1px] bg-gray-600/30 mx-auto"></div>
            <div className="space-y-1">
              <p className="text-gray-400 text-xs uppercase tracking-[0.2em] font-semibold">Item</p>
              <h2 className="text-2xl sm:text-3xl text-white font-black">{gameData.item}</h2>
            </div>
          </div>
        );
      
      case 'palavraComunidade':
        return (
          <div className="space-y-2 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-[0.2em] font-semibold">Palavra Secreta</p>
            <h2 className="text-2xl sm:text-3xl text-white font-black">{gameData.word}</h2>
            <p className="text-gray-400 text-xs">Dê dicas sutis sobre a palavra!</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderImpostorContent = () => {
    if (!gameData) return null;

    switch (gameMode) {
      case 'palavraSecreta':
        return (
          <div className="space-y-1 text-center px-4">
            <p className="text-gray-400 text-sm font-medium leading-relaxed">
              Finja que você sabe a palavra! Engane a todos.
            </p>
          </div>
        );
      
      case 'palavras':
        return (
          <div className="space-y-1 text-center px-4">
            <p className="text-gray-400 text-sm font-medium leading-relaxed">
              Você não sabe o local! Tente descobrir através das dicas.
            </p>
          </div>
        );
      
      case 'duasFaccoes':
        return (
          <div className="space-y-1 text-center px-4">
            <p className="text-gray-400 text-sm font-medium leading-relaxed">
              Duas palavras no jogo! Você não sabe nenhuma.
            </p>
          </div>
        );
      
      case 'categoriaItem':
        return (
          <div className="space-y-2 text-center px-4">
            <div className="space-y-1">
              <p className="text-gray-400 text-xs uppercase tracking-[0.2em] font-semibold">Categoria</p>
              <h3 className="text-lg sm:text-xl text-white font-bold">{gameData.category}</h3>
            </div>
            <p className="text-gray-400 text-xs font-medium">
              Você só sabe a categoria! Descubra o item.
            </p>
          </div>
        );
      
      case 'palavraComunidade':
        return (
          <div className="space-y-1 text-center px-4">
            <p className="text-gray-400 text-sm font-medium leading-relaxed">
              Finja que você sabe a palavra! Engane a todos.
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  const handleBackToLobby = async () => {
    try {
      await returnToLobby();
    } catch (error) {
      console.error('Error in returnToLobby:', error);
    }
  };

  const renderStageContent = () => {
    switch (currentStage) {
      case 'SPEAKING_ORDER':
        return (
          <SpeakingOrderWithVotingStage
            players={activePlayers}
            serverOrder={speakingOrder}
            userId={user?.uid || ''}
            isHost={isHost}
            onStartVoting={handleStartVoting}
            onSubmitVote={handleSubmitVote}
            isSubmitting={isSubmittingVote}
            onNewRound={handleNewRound}
          />
        );

      case 'VOTING':
        return (
          <div className="animate-stage-fade-in w-full space-y-4 py-3">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e9c46a]/10 border border-[#e9c46a]/30">
                <Vote className="w-4 h-4 text-[#e9c46a]" />
                <span className="text-[#e9c46a] text-xs uppercase tracking-widest font-bold">
                  Hora de Votar!
                </span>
              </div>
              <p className="text-gray-400 text-xs">Quem você acha que é o impostor?</p>
            </div>
            
            <div className="w-full h-[1px] bg-[#3d4a5c]"></div>
            
            <VotingPlayerList
              activePlayers={activePlayers}
              userId={user?.uid || ''}
              onSubmitVote={handleSubmitVote}
              isSubmitting={isSubmittingVote}
            />
          </div>
        );

      case 'VOTING_FEEDBACK':
        const myVote = votes.find(v => v.playerId === user?.uid);
        const totalPlayers = activePlayers.length;
        const votedCount = votes.length;
        const allVoted = votedCount >= totalPlayers;

        return (
          <div className="animate-stage-fade-in w-full space-y-4 py-3">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#3d8b5f]/20 border-2 border-[#3d8b5f] flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 text-[#3d8b5f]" />
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3d8b5f]/10 border border-[#3d8b5f]/30">
                <span className="text-[#3d8b5f] text-xs uppercase tracking-widest font-bold">
                  Voto Enviado!
                </span>
              </div>
              <p className="text-white text-sm">
                Você votou em: <span className="text-[#e9c46a] font-bold">{myVote?.targetName}</span>
              </p>
            </div>
            
            <div className="w-full h-[1px] bg-[#3d4a5c]"></div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4 text-[#4a90a4]" />
                <p className="text-gray-300 text-sm">
                  <span className="text-[#4a90a4] font-bold">{votedCount}</span> de <span className="font-bold">{totalPlayers}</span> votaram
                </p>
              </div>
              
              <div className="flex flex-wrap gap-1.5 justify-center">
                {activePlayers.map(player => {
                  const hasVoted = votes.some(v => v.playerId === player.uid);
                  return (
                    <div 
                      key={player.uid}
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium transition-all",
                        hasVoted 
                          ? "bg-[#3d8b5f]/20 text-[#3d8b5f] border border-[#3d8b5f]/30"
                          : "bg-gray-700/50 text-gray-400 border border-gray-600/30"
                      )}
                    >
                      {hasVoted && <Check className="w-2.5 h-2.5 inline mr-0.5" />}
                      {player.name}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {!allVoted && (
              <p className="text-gray-400 text-xs text-center animate-pulse">
                Aguardando outros jogadores votarem...
              </p>
            )}

            {isHost && allVoted && (
              <Button 
                onClick={handleRevealImpostor}
                className="w-full h-11 bg-[#c44536] hover:bg-[#c44536]/80 text-white font-bold text-sm rounded-xl transition-all"
                style={{ boxShadow: '0 4px 0 rgba(196, 69, 54, 0.4)' }}
                data-testid="button-reveal-impostor"
              >
                <Skull className="mr-2 w-4 h-4" /> Revelar o Impostor
              </Button>
            )}
            
            {!isHost && allVoted && (
              <p className="text-[#c44536] text-xs text-center font-medium animate-pulse">
                Aguardando o host revelar o impostor...
              </p>
            )}
          </div>
        );

      case 'ROUND_RESULT':
        const impostorPlayer = activePlayers.find(p => p.uid === room.impostorId);
        const impostorName = impostorPlayer?.name || 'Desconhecido';
        const votesForImpostor = votes.filter(v => v.targetId === room.impostorId).length;
        const crewWins = votesForImpostor > activePlayers.length / 2;

        return (
          <div className="animate-stage-fade-in w-full space-y-4 py-3">
            <div className="text-center space-y-2">
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center mx-auto",
                crewWins ? "bg-[#3d8b5f]" : "bg-[#c44536]"
              )}>
                {crewWins ? (
                  <Trophy className="w-7 h-7 text-white" />
                ) : (
                  <Skull className="w-7 h-7 text-white" />
                )}
              </div>
              
              <h2 className={cn(
                "text-lg font-bold uppercase tracking-wider",
                crewWins ? "text-[#3d8b5f]" : "text-[#c44536]"
              )}>
                {crewWins ? "Tripulação Venceu!" : "Impostor Venceu!"}
              </h2>
              
              <p className="text-gray-300 text-sm">
                O impostor era: <span className="text-[#c44536] font-bold">{impostorName}</span>
              </p>
            </div>
            
            <div className="w-full h-[1px] bg-[#3d4a5c]"></div>
            
            <div className="space-y-2">
              <p className="text-[#e9c46a] text-xs uppercase tracking-widest font-bold text-center">
                Resultados da Votação
              </p>
              
              <div className="space-y-1.5 max-h-[120px] overflow-y-auto scrollbar-hide">
                {activePlayers.map(player => {
                  const votesReceived = votes.filter(v => v.targetId === player.uid).length;
                  const isTheImpostor = player.uid === room.impostorId;
                  return (
                    <div 
                      key={player.uid}
                      className={cn(
                        "w-full p-2 rounded-lg flex items-center justify-between",
                        isTheImpostor 
                          ? "bg-[#c44536]/15 border border-[#c44536]/40"
                          : "bg-[#16213e]/50"
                      )}
                    >
                      <span className={cn(
                        "font-bold text-xs",
                        isTheImpostor ? "text-[#c44536]" : "text-gray-300"
                      )}>
                        {player.name}
                        {isTheImpostor && " (Impostor)"}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[#e9c46a] font-bold text-sm">{votesReceived}</span>
                        <span className="text-gray-500 text-xs">votos</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {isHost && (
              <Button 
                onClick={handleNewRound}
                className="w-full h-11 btn-retro-primary font-bold text-sm rounded-xl transition-all"
                data-testid="button-new-round"
              >
                <RotateCcw className="mr-2 w-4 h-4" /> Nova Rodada
              </Button>
            )}
          </div>
        );

      case 'WORD_REVEAL':
      default:
        return (
          <div className="animate-stage-fade-in w-full space-y-3 py-2">
            {isHost ? (
              <>
                <Button 
                  onClick={handleStartSorteio}
                  className="w-full h-10 bg-white hover:bg-white/80 border-2 border-white/40 text-black rounded-xl font-medium text-sm"
                  data-testid="button-sorteio"
                >
                  <Zap className="mr-2 w-4 h-4" /> Sortear Ordem de Fala
                </Button>
                <Button 
                  onClick={handleStartVoting}
                  className="w-full h-10 bg-[#e9c46a] hover:bg-[#e9c46a]/80 text-black font-bold rounded-xl text-sm"
                  style={{ boxShadow: '0 3px 0 rgba(233, 196, 106, 0.4)' }}
                  data-testid="button-start-voting"
                >
                  <Vote className="mr-2 w-4 h-4" /> Iniciar Votação
                </Button>
                <Button 
                  onClick={handleNewRound}
                  variant="ghost"
                  className="w-full h-9 text-gray-400 hover:text-gray-200 rounded-xl text-sm"
                  data-testid="button-return-lobby"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" /> Nova Rodada
                </Button>
              </>
            ) : (
              <p className="text-gray-400 text-sm text-center py-2">
                Aguardando o host iniciar a votação...
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md min-h-full p-4 animate-fade-in space-y-3 relative z-10">
      <GameNavButtons onBackToLobby={handleBackToLobby} isImpostor={isImpostor} />

      <div className="w-full card-retro p-4 space-y-4">
        <div 
          className="w-full rounded-xl p-4 flex flex-col items-center text-center relative transition-all duration-300 cursor-pointer bg-gradient-to-b from-[#2a2a3a] to-[#1a1a2a] border border-gray-600/40"
          onClick={() => setIsRevealed(!isRevealed)}
          data-testid="card-reveal"
        >
          {isRevealed ? (
            <div className="flex flex-col items-center gap-3 animate-fade-in w-full py-2">
              <div className="flex items-center gap-3">
                <div 
                  className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-700/40"
                >
                  <img 
                    src={isImpostor ? impostorImg : tripulanteImg} 
                    alt={isImpostor ? "Impostor" : "Tripulante"}
                    className="w-full h-auto"
                    style={{ transform: 'scale(1.5) translateY(18%)' }}
                  />
                </div>
                <div className="text-left">
                  <h2 
                    className="text-xl sm:text-2xl font-black tracking-wider uppercase text-gray-200"
                    data-testid={isImpostor ? "text-role-impostor" : "text-role-crew"}
                  >
                    {isImpostor ? "IMPOSTOR" : "TRIPULANTE"}
                  </h2>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsRevealed(false); }}
                  className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center transition-colors border border-gray-600/30 hover:bg-gray-500/20"
                  data-testid="button-hide-role"
                >
                  <EyeOff className="w-4 h-4 text-gray-400/60" />
                </button>
              </div>

              <div className="w-full">
                {isImpostor ? renderImpostorContent() : renderCrewContent()}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6">
              <Eye className="w-10 h-10 text-gray-400/60" />
              <h3 className="text-base font-bold text-gray-300">
                TOQUE PARA REVELAR
              </h3>
            </div>
          )}
        </div>

        <div className="w-full h-[1px] bg-[#3d4a5c]"></div>

        {renderStageContent()}
      </div>

    </div>
  );
};

const VotingPlayerList = ({ 
  activePlayers, 
  userId, 
  onSubmitVote, 
  isSubmitting 
}: { 
  activePlayers: { uid: string; name: string }[]; 
  userId: string; 
  onSubmitVote: (targetId: string) => void; 
  isSubmitting: boolean;
}) => {
  const [selectedVote, setSelectedVote] = useState<string | null>(null);

  return (
    <>
      <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-hide">
        {activePlayers.filter(p => p.uid !== userId).map(player => (
          <button
            key={player.uid}
            onClick={() => setSelectedVote(player.uid)}
            className={cn(
              "w-full p-2.5 rounded-xl border-2 transition-all text-left flex items-center gap-2",
              selectedVote === player.uid
                ? "bg-[#e9c46a]/15 border-[#e9c46a] text-[#e9c46a]"
                : "bg-[#16213e]/50 border-[#3d4a5c] text-gray-300 hover:border-[#e9c46a]/50"
            )}
            data-testid={`button-vote-${player.uid}`}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-base font-bold",
              selectedVote === player.uid ? "bg-[#e9c46a] text-black" : "bg-gray-600 text-gray-200"
            )}>
              {player.name.charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-sm">{player.name}</span>
            {selectedVote === player.uid && (
              <Check className="w-4 h-4 ml-auto" />
            )}
          </button>
        ))}
      </div>

      <Button 
        onClick={() => selectedVote && onSubmitVote(selectedVote)}
        disabled={!selectedVote || isSubmitting}
        className="w-full h-11 bg-[#e9c46a] hover:bg-[#e9c46a]/80 text-black font-bold text-sm rounded-xl transition-all disabled:opacity-30"
        style={{ boxShadow: '0 4px 0 rgba(233, 196, 106, 0.4)' }}
        data-testid="button-confirm-vote"
      >
        <Send className="mr-2 w-4 h-4" /> {isSubmitting ? 'Votando...' : 'Confirmar Voto'}
      </Button>
    </>
  );
};


export default function ImpostorGame() {
  const { status } = useGameStore();
  const [isDonationOpen, setIsDonationOpen] = useState(false);

  if (status === 'home') {
    return (
      <>
        <NotificationCenter />
        <HomeScreen />
      </>
    );
  }

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center font-poppins text-white overflow-hidden relative"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <NotificationCenter />
      
      <TopRightButtons onDonateClick={() => setIsDonationOpen(true)} />
      <DonationModal isOpen={isDonationOpen} onClose={() => setIsDonationOpen(false)} />

      {status === 'lobby' && <LobbyScreen />}
      {status === 'modeSelect' && <ModeSelectScreen />}
      {status === 'submodeSelect' && <PalavraSuperSecretaSubmodeScreen />}
      {status === 'playing' && <GameScreen />}
    </div>
  );
}
