import { useState, useEffect, useMemo, useRef } from "react";
import { useGameStore, type GameModeType, type PlayerVote, type PlayerAnswer, type GameConfig, type Player as GamePlayer } from "@/lib/gameStore";
import { useDrawingGameStore } from "@/lib/drawingGameStore";
import { notifyGameEnded } from "@/hooks/useFeedback";
import { Link, useLocation } from "wouter";
import PalavraSuperSecretaSubmodeScreen from "@/pages/PalavraSuperSecretaSubmodeScreen";
import { PALAVRA_SECRETA_SUBMODES, type PalavraSuperSecretaSubmode } from "@/lib/palavra-secreta-submodes";
import SupportHome from "@/pages/SupportHome";
import { NotificationCenter } from "@/components/NotificationCenter";
import bombaLogo from "@/assets/bomba-logo.png";
import bombaIcon from "@/assets/bomba-icon.png";

import { SpeakingOrderWithVotingStage } from "@/components/RoundStageContent";
import { LobbyChat } from "@/components/LobbyChat";
import { VoiceControlButton, VoiceChatJoinButton, SpeakingIndicator } from "@/components/InlineVoiceControls";
import { useVoiceChatContext, VoiceChatProvider } from "@/hooks/VoiceChatContext";

import { PremiumBanner } from "@/components/PremiumBanner";
import { MobileNav } from "@/components/MobileNav";
import { useLanguage } from "@/hooks/useLanguage";
// Discord icon inline — avoids loading the full react-icons/si bundle
const SiDiscord = () => (
  <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
  </svg>
);
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
  UserX,
  Gamepad2,
  Search,
  Plus,
  TrendingUp,
  Clock,
  Star,
  Sparkles,
  Info,
  AlertTriangle,
  Settings,
  Youtube,
  Instagram,
  MessageCircle,
  Paintbrush,
  BookOpen,
  ChevronDown,
  Bomb
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
import logoTikjogos from "@assets/logo_nova_tikjogos (1).png";
const logoImpostor = "/impostor-logo.webp";
const logoImpostorArt = "/art-impostor-logo.webp";
import tripulanteImg from "@assets/tripulante_natal_1765071995242.webp";
import impostorImg from "@assets/impostor_natal_1765071992843.webp";
import tripulantePincelImg from "@assets/TripulantePincel.webp";
import impostorPincelImg from "@assets/Impostor_pincel.webp";

const sincroniaLogo = "/sincronia-logo.webp";
const logoDesafioPalavraSmall = "/palavra-logo.webp";
const logoDesafioPalavraForms = "/palavra-logo.webp";
import personagemEsquerdo from "@assets/personagem esquerdo.png";
import personagemDireito from "@assets/personagem direito.png";
import lobbyCharacter1 from "@assets/character (1).png";
import lobbyCharacter2 from "@assets/character (2).png";
import lobbyCharacter3 from "@assets/character (3).png";
import lobbyCharacter4 from "@assets/character (4).png";
import lobbyCharacter5 from "@assets/character (5).png";
import lobbyCharacter6 from "@assets/character (6).png";
import lobbyCharacter7 from "@assets/character (7).png";
import lobbyCharacter8 from "@assets/character (8).png";
import lobbyCharacter9 from "@assets/character (9).png";
import lobbyCharacter10 from "@assets/character (10).png";
import lobbyPodium from "@assets/podio.png";
import { useRCGameStore } from "@/lib/rcGameStore";
import { useDesafioStore } from "@/lib/desafioStore";
import { useAproximacaoStore } from "@/lib/aproximacaoStore";
import { useRankMasterStore } from "@/lib/rankMasterStore";
const logoAprox = "/aproximacao-logo.webp";
import { SideAds, TopBannerAd, InArticleAd, BottomRightVideoAd, AnchorMobileAd, ResultAd, LobbyAd } from "@/components/AdSense";
import { AdBlockBetweenFormAndFooter } from "@/components/AdBlocks";
import { isNativeApp } from "@/lib/nativeApp";
import { useGameIntermission } from "@/components/GameIntermission";

const PIX_KEY = "48492456-23f1-4edc-b739-4e36547ef90e";

const DEFAULT_LOBBY_CHARACTERS = [
  lobbyCharacter1,
  lobbyCharacter2,
  lobbyCharacter3,
  lobbyCharacter4,
  lobbyCharacter5,
  lobbyCharacter6,
  lobbyCharacter7,
  lobbyCharacter8,
  lobbyCharacter9,
  lobbyCharacter10,
];

const characterAccents = [
  "from-violet-500 to-fuchsia-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-blue-500",
  "from-rose-400 to-pink-500",
  "from-lime-400 to-emerald-500",
  "from-purple-400 to-indigo-500",
  "from-cyan-400 to-sky-500",
  "from-yellow-400 to-amber-500",
  "from-red-400 to-rose-500",
];

const normalizeLobbyCharacterIndex = (index?: number) => {
  if (typeof index !== 'number' || Number.isNaN(index)) return 0;
  return Math.abs(index) % DEFAULT_LOBBY_CHARACTERS.length;
};

const getLobbyCharacterSrc = (index?: number) => DEFAULT_LOBBY_CHARACTERS[normalizeLobbyCharacterIndex(index)];

const getLobbyCharacterAccent = (index?: number) => characterAccents[normalizeLobbyCharacterIndex(index)];

const CharacterFaceAvatar = ({
  player,
  className,
  imageClassName,
}: {
  player: Pick<GamePlayer, 'characterIndex' | 'name'>;
  className?: string;
  imageClassName?: string;
}) => {
  const accent = getLobbyCharacterAccent(player.characterIndex);

  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-950/80", className)}>
      <div className={cn("absolute inset-x-2 bottom-1 h-3 rounded-full bg-gradient-to-r opacity-35 blur-sm", accent)} />
      <img
        src={getLobbyCharacterSrc(player.characterIndex)}
        alt=""
        className={cn("absolute left-1/2 top-0 z-10 h-[150%] w-auto max-w-none -translate-x-1/2 object-contain", imageClassName)}
        draggable={false}
      />
    </div>
  );
};

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'trending' | 'new' | 'popular'>('trending');
  
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
        // Enrich themes with mock data for better UX
        const enrichedThemes = themes.map((theme: PublicTheme, index: number) => ({
          ...theme,
          emoji: ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎬', '🎤', '🎸', '⚽'][index % 10],
          plays: Math.floor(Math.random() * 1000) + 50,
          likes: Math.floor(Math.random() * 200) + 10,
          isHot: index < 2 // First 2 themes are "hot"
        }));
        setPublicThemes(enrichedThemes);
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
            className="text-gray-300 hover:text-white transition-colors"
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
                : "text-gray-300 hover:text-white"
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
                : "text-gray-300 hover:text-white"
            )}
            data-testid="tab-criar"
          >
            Criar Novo
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'galeria' && (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar tema (ex: Futebol, Anime...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#16213e]/80 border border-[#3d4a5c] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#6b4ba3] transition-colors"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 p-1 bg-[#16213e]/50 rounded-xl border border-[#3d4a5c]">
                  <button
                    onClick={() => setFilterTab('trending')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                      filterTab === 'trending'
                        ? "bg-[#6b4ba3] text-white shadow-lg"
                        : "text-gray-300 hover:text-white"
                    )}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Em Alta
                  </button>
                  <button
                    onClick={() => setFilterTab('new')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                      filterTab === 'new'
                        ? "bg-[#6b4ba3] text-white shadow-lg"
                        : "text-gray-300 hover:text-white"
                    )}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Novos
                  </button>
                  <button
                    onClick={() => setFilterTab('popular')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                      filterTab === 'popular'
                        ? "bg-[#6b4ba3] text-white shadow-lg"
                        : "text-gray-300 hover:text-white"
                    )}
                  >
                    <Star className="w-3.5 h-3.5" />
                    Popular
                  </button>
                </div>
              </div>

              {/* Themes Grid */}
              {isLoadingThemes ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#6b4ba3]" />
                </div>
              ) : publicThemes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🎮</div>
                  <h3 className="text-lg font-bold text-white mb-2">Nenhum tema disponível ainda</h3>
                  <p className="text-sm text-gray-300 mb-4">Seja o primeiro a criar um tema incrível!</p>
                  <button
                    onClick={() => setActiveTab('criar')}
                    className="btn-orange px-6 py-2 text-sm inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Criar Tema
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {/* Create New Card */}
                  <button
                    onClick={() => setActiveTab('criar')}
                    className="group relative p-4 rounded-xl border-2 border-dashed border-[#3d4a5c] hover:border-[#6b4ba3] bg-[#16213e]/20 hover:bg-[#16213e]/40 transition-all duration-300 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#6b4ba3]/10 group-hover:bg-[#6b4ba3]/20 flex items-center justify-center transition-colors">
                        <Plus className="w-6 h-6 text-[#6b4ba3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-[#6b4ba3] transition-colors">Criar Novo Tema</h3>
                        <p className="text-xs text-gray-300">Sua ideia pode ser o próximo sucesso!</p>
                      </div>
                    </div>
                  </button>

                  {/* Theme Cards */}
                  {publicThemes
                    .filter(theme => 
                      theme.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      theme.autor.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((theme) => (
                      <div
                        key={theme.id}
                        className="group relative p-4 rounded-xl bg-[#16213e]/80 border border-[#3d4a5c] hover:border-[#6b4ba3] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                        data-testid={`theme-${theme.id}`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Theme Icon/Emoji */}
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6b4ba3] to-[#4a3070] flex items-center justify-center text-2xl flex-shrink-0">
                            {theme.emoji || '🎯'}
                          </div>
                          
                          {/* Theme Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white group-hover:text-[#6b4ba3] transition-colors truncate">
                              {theme.titulo}
                            </h3>
                            <p className="text-xs text-gray-300 mb-2">
                              por <span className="text-gray-300">@{theme.autor}</span>
                            </p>
                            
                            {/* Stats */}
                            <div className="flex items-center gap-3 text-xs">
                              <div className="flex items-center gap-1 text-gray-400">
                                <Sparkles className="w-3 h-3" />
                                <span>{theme.palavrasCount} palavras</span>
                              </div>
                              {theme.plays !== undefined && (
                                <div className="flex items-center gap-1 text-gray-400">
                                  <Play className="w-3 h-3 fill-gray-400" />
                                  <span>{theme.plays}</span>
                                </div>
                              )}
                              {theme.likes !== undefined && (
                                <div className="flex items-center gap-1 text-pink-400">
                                  <Heart className="w-3 h-3 fill-pink-400" />
                                  <span>{theme.likes}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Play Button (appears on hover) */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="btn-orange px-4 py-2 text-xs flex items-center gap-1.5">
                              <Play className="w-3 h-3 fill-white" />
                              Jogar
                            </button>
                          </div>
                        </div>

                        {/* Hot Badge */}
                        {theme.isHot && (
                          <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <TrendingUp className="w-2.5 h-2.5" />
                            HOT
                          </div>
                        )}
                      </div>
                    ))}
                </div>
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
                      Valor: R$ 1,50 via PIX
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
                      <p className="text-xs text-gray-300">
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
                        GERAR PIX (R$ 1,50)
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
                    className="text-sm text-gray-300 hover:text-white transition-colors underline"
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
                  
                  <p className="text-xs text-gray-300">
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
          
          <p className="text-gray-300 text-sm">
            Se você está se divertindo, considere fazer uma doação! Isso ajuda a manter o projeto no ar.
          </p>

          <div className="space-y-3">
            <p className="text-gray-300 text-sm font-medium flex items-center justify-center gap-2">
              <span className="text-xs text-gray-400">BR</span>
              <span className="font-bold">PIX</span>
            </p>

            <div className="bg-[#efefef] rounded-xl p-3 mx-auto w-fit">
              <img 
                src="/pix-qrcode.png" 
                alt="QR Code PIX" 
                width={160} height={160}
                loading="lazy"
                className="w-40 h-40 object-contain"
              />
            </div>

            <div className="bg-[#16213e] rounded-xl p-4 border border-[#3d4a5c]">
              <p className="text-gray-400 text-xs mb-2">Chave PIX:</p>
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
        "flex items-center gap-2 px-4 py-2 bg-[#4a90a4] border-2 border-[#3d7a8a] rounded-xl text-white hover:bg-[#5aa0b4] transition-all font-semibold shadow-md",
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
    {/* Desktop: All buttons on right - removed fixed buttons as requested */}
  </>
);

const MobileActionButtons = ({ onDonateClick }: { onDonateClick: () => void }) => (
  <>
    {/* Mobile action buttons removed as requested */}
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

const getModeIcon = (modeId: string) => {
  switch (modeId) {
    case 'palavraSecreta': return MessageSquare;
    case 'palavras': return MapPin;
    case 'duasFaccoes': return Swords;
    case 'categoriaItem': return Target;
    case 'perguntasDiferentes': return HelpCircle;
    case 'palavraComunidade': return Users;
    default: return Gamepad2;
  }
};

const getModeTheme = (modeId: string) => {
  switch (modeId) {
    case 'palavraSecreta': return 'blue';
    case 'palavras': return 'green';
    case 'duasFaccoes': return 'red';
    case 'categoriaItem': return 'yellow';
    case 'perguntasDiferentes': return 'purple';
    case 'palavraComunidade': return 'pink';
    default: return 'blue';
  }
};

const getModeDifficulty = (modeId: string) => {
  switch (modeId) {
    case 'palavraSecreta': return 'Fácil';
    case 'palavras': return 'Médio';
    case 'duasFaccoes': return 'Difícil';
    case 'categoriaItem': return 'Médio';
    case 'perguntasDiferentes': return 'Difícil';
    case 'palavraComunidade': return 'Custom';
    default: return 'Médio';
  }
};

const HOME_META: Record<string, { title: string; description: string }> = {
  pt: {
    title: 'Jogo do Impostor Online Grátis com Amigos | TikJogos',
    description: 'Jogue o Jogo do Impostor online grátis com seus amigos. Crie uma sala, compartilhe o código e descubra quem recebeu a palavra diferente.',
  },
  en: {
    title: 'TikJogos - Free Online Impostor Game With Friends | Play Now',
    description: 'Play Impostor online for free! Find friends, strategies and challenge other players on TikJogos. No downloads.',
  },
  es: {
    title: 'TikJogos - Juego del Impostor Online Gratis Con Amigos | Juega Ahora',
    description: '¡Juega Impostor online gratis! Encuentra amigos, estrategias y desafía a otros jugadores en TikJogos. Sin descargas.',
  },
};

const DrawingGameCard = ({ onCreateRoom }: { onCreateRoom: (action: () => void) => void }) => {
  const drawingStore = useDrawingGameStore();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t, langPath } = useLanguage();
  const [drawName, setDrawName] = useState(() => localStorage.getItem('tikjogos_saved_nickname') || '');
  const [drawCode, setDrawCode] = useState('');
  const [drawLoading, setDrawLoading] = useState(false);

  const handleDrawCreate = async () => {
    if (!drawName.trim()) {
      toast({ title: "Nome necessário", description: "Por favor, digite seu nome.", variant: "destructive" });
      return;
    }
    drawingStore.setUser(drawName);
    onCreateRoom(async () => {
      setDrawLoading(true);
      await drawingStore.createRoom();
      setDrawLoading(false);
      navigate('/desenho-impostor');
    });
  };

  const handleDrawJoin = async () => {
    if (!drawName.trim()) {
      toast({ title: "Nome necessário", description: "Por favor, digite seu nome.", variant: "destructive" });
      return;
    }
    if (!drawCode.trim()) {
      toast({ title: "Código inválido", description: "Digite o código da sala.", variant: "destructive" });
      return;
    }
    setDrawLoading(true);
    drawingStore.setUser(drawName);
    const success = await drawingStore.joinRoom(drawCode.toUpperCase());
    setDrawLoading(false);
    if (success) {
      navigate('/desenho-impostor');
    } else {
      toast({ title: "Erro ao entrar", description: "Sala não encontrada ou código inválido.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-3">
      {/* Large logo */}
      <div className="text-center mb-1">
        <div className="flex justify-center mb-1">
          <img
            src={logoImpostorArt}
            alt="Logo Desenho do Impostor - TikJogos"
            width={550} height={192}
            className="h-[82px] object-contain drop-shadow-lg"
          />
        </div>
        <p className="text-slate-400 text-xs">Desenhe e descubra quem é o impostor</p>
      </div>

      {/* Nickname input */}
      <input
        type="text"
        placeholder={t('home.nickname', 'Seu nickname')}
        value={drawName}
        onChange={(e) => setDrawName(e.target.value)}
        className="input-dark"
        data-testid="input-name-drawing"
      />

        {/* Create room button */}
        <button
          onClick={handleDrawCreate}
          disabled={drawLoading}
          className={cn(
            "w-full px-8 py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl",
            !drawLoading
              ? 'bg-gradient-to-r from-[#46cfa5] to-[#2ea87e] border-[#1e7a5a] text-white hover:brightness-110 active:border-b-0 active:translate-y-2'
              : 'bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed opacity-50'
          )}
          data-testid="button-create-room-drawing"
        >
          {drawLoading ? <Loader2 size={28} className="animate-spin" /> : <Zap size={28} className="animate-bounce" />}
          {t('home.createRoom', 'CRIAR SALA').toUpperCase()}
        </button>

        {/* Save nickname checkbox */}
        <div className="flex items-center justify-between px-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!localStorage.getItem('tikjogos_saved_nickname')}
              onChange={(e) => {
                if (e.target.checked && drawName.trim()) {
                  localStorage.setItem('tikjogos_saved_nickname', drawName.trim());
                } else {
                  localStorage.removeItem('tikjogos_saved_nickname');
                }
              }}
              className="w-4 h-4 rounded bg-[#1a2a3a] border-2 border-[#4a6a8a] cursor-pointer accent-[#e8a045]"
              data-testid="checkbox-save-nickname-drawing"
            />
            <span className="text-sm text-[#8aa0b0]">{t('home.saveNickname', 'Guardar nickname')}</span>
          </label>
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
            placeholder={t('home.roomCode', 'CÓDIGO').toUpperCase()}
            value={drawCode}
            onChange={(e) => setDrawCode(e.target.value.toUpperCase())}
            maxLength={3}
            className="input-code flex-1"
            data-testid="input-room-code-drawing"
          />
          <button
            onClick={handleDrawJoin}
            disabled={drawLoading}
            className={cn(
              "px-6 py-4 rounded-2xl font-black text-lg tracking-wide flex items-center justify-center gap-2 transition-all duration-300 border-b-[6px] shadow-2xl whitespace-nowrap",
              !drawLoading
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2'
                : 'bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed opacity-50'
            )}
            data-testid="button-join-room-drawing"
          >
            {t('home.enterCode', 'ENTRAR').toUpperCase()}
          </button>
        </div>

        {/* OR divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-[#4a6a8a]"></div>
          <span className="text-[#8aa0b0] text-sm font-bold">OU</span>
          <div className="flex-1 h-px bg-[#4a6a8a]"></div>
        </div>

        {/* How to play button */}
        <Link href={langPath("/como-jogar/jogo-do-impostor-desenho")}>
          <button
            className="w-full px-8 py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl bg-gradient-to-r from-purple-500 to-pink-500 border-purple-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2"
            data-testid="button-how-to-play-drawing"
          >
            <Paintbrush size={28} />
            {t('home.howToPlay', 'COMO JOGAR').toUpperCase()}
          </button>
        </Link>
    </div>
  );
};

const SincroniaGameCard = ({ onCreateRoom }: { onCreateRoom: (action: () => void) => void }) => {
  const rcStore = useRCGameStore();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t, langPath } = useLanguage();
  const [rcName, setRcName] = useState(() => localStorage.getItem('tikjogos_saved_nickname') || '');
  const [rcCode, setRcCode] = useState('');
  const [rcLoading, setRcLoading] = useState(false);

  const handleRcCreate = async () => {
    if (!rcName.trim()) {
      toast({ title: "Nome necessário", description: "Por favor, digite seu nome.", variant: "destructive" });
      return;
    }
    rcStore.setUser(rcName);
    onCreateRoom(async () => {
      setRcLoading(true);
      await rcStore.createRoom();
      setRcLoading(false);
      navigate('/respostas-em-comum');
    });
  };

  const handleRcJoin = async () => {
    if (!rcName.trim()) {
      toast({ title: "Nome necessário", description: "Por favor, digite seu nome.", variant: "destructive" });
      return;
    }
    if (!rcCode.trim()) {
      toast({ title: "Código inválido", description: "Digite o código da sala.", variant: "destructive" });
      return;
    }
    setRcLoading(true);
    rcStore.setUser(rcName);
    const success = await rcStore.joinRoom(rcCode.toUpperCase());
    setRcLoading(false);
    if (success) {
      navigate('/respostas-em-comum');
    } else {
      toast({ title: "Erro ao entrar", description: "Sala não encontrada ou código inválido.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-3">
      {/* Large logo */}
      <div className="text-center mb-1">
        <div className="flex justify-center mb-1">
          <img
            src={sincroniaLogo}
            alt="Logo Sincronia - Respostas em Comum - TikJogos"
            width={575} height={133}
            className="h-[67px] object-contain drop-shadow-lg"
          />
        </div>
        <p className="text-slate-400 text-xs">Respondeu igual? Pontuou!</p>
      </div>

      {/* Nickname input */}
      <input
        type="text"
        placeholder={t('home.nickname', 'Seu nickname')}
        value={rcName}
        onChange={(e) => setRcName(e.target.value)}
        className="input-dark"
        data-testid="input-name-sincronia"
      />

        {/* Create room button */}
        <button
          onClick={handleRcCreate}
          disabled={rcLoading}
          className={cn(
            "w-full px-8 py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl",
            !rcLoading
              ? 'bg-gradient-to-r from-[#43065c] to-[#6b21a8] border-[#2d0440] text-white hover:brightness-110 active:border-b-0 active:translate-y-2'
              : 'bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed opacity-50'
          )}
          data-testid="button-create-room-sincronia"
        >
          {rcLoading ? <Loader2 size={28} className="animate-spin" /> : <Zap size={28} className="animate-bounce" />}
          {t('home.createRoom', 'CRIAR SALA').toUpperCase()}
        </button>

        {/* Battle Royale button */}
        <button
          onClick={() => navigate('/sincronia-br')}
          className="w-full px-8 py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl bg-gradient-to-r from-amber-500 to-orange-500 border-amber-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2"
        >
          <Swords size={28} className="animate-bounce" />
          BATTLE ROYALE
        </button>

        {/* Save nickname checkbox */}
        <div className="flex items-center justify-between px-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!localStorage.getItem('tikjogos_saved_nickname')}
              onChange={(e) => {
                if (e.target.checked && rcName.trim()) {
                  localStorage.setItem('tikjogos_saved_nickname', rcName.trim());
                } else {
                  localStorage.removeItem('tikjogos_saved_nickname');
                }
              }}
              className="w-4 h-4 rounded bg-[#1a2a3a] border-2 border-[#4a6a8a] cursor-pointer accent-[#e8a045]"
              data-testid="checkbox-save-nickname-sincronia"
            />
            <span className="text-sm text-[#8aa0b0]">{t('home.saveNickname', 'Guardar nickname')}</span>
          </label>
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
            placeholder={t('home.roomCode', 'CÓDIGO').toUpperCase()}
            value={rcCode}
            onChange={(e) => setRcCode(e.target.value.toUpperCase())}
            maxLength={3}
            className="input-code flex-1"
            data-testid="input-room-code-sincronia"
          />
          <button
            onClick={handleRcJoin}
            disabled={rcLoading}
            className={cn(
              "px-6 py-4 rounded-2xl font-black text-lg tracking-wide flex items-center justify-center gap-2 transition-all duration-300 border-b-[6px] shadow-2xl whitespace-nowrap",
              !rcLoading
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2'
                : 'bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed opacity-50'
            )}
            data-testid="button-join-room-sincronia"
          >
            {t('home.enterCode', 'ENTRAR').toUpperCase()}
          </button>
        </div>

        {/* How to play button */}
        <Link href={langPath("/como-jogar/sincronia")}>
          <button
            className="w-full px-8 py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl bg-gradient-to-r from-teal-500 to-cyan-500 border-teal-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2"
            data-testid="button-how-to-play-sincronia"
          >
            <BookOpen size={28} />
            {t('home.howToPlay', 'COMO JOGAR').toUpperCase()}
          </button>
        </Link>
    </div>
  );
};

const DesafioGameCard = () => {
  const { setUser, createRoom, joinRoom, isLoading, loadSavedNickname, saveNickname } = useDesafioStore();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [dpName, setDpName] = useState(() => loadSavedNickname() || localStorage.getItem('tikjogos_saved_nickname') || '');
  const [dpCode, setDpCode] = useState('');
  const [saveChecked, setSaveChecked] = useState(() => !!localStorage.getItem('tikjogos_saved_nickname'));

  const handleCreate = async () => {
    if (!dpName.trim()) {
      toast({ title: 'Nome necessário', variant: 'destructive' });
      return;
    }
    if (saveChecked) saveNickname(dpName.trim());
    setUser(dpName.trim());
    await createRoom();
    navigate('/desafio-da-palavra');
  };

  const handleJoin = async () => {
    if (!dpName.trim()) {
      toast({ title: 'Nome necessário', variant: 'destructive' });
      return;
    }
    if (!dpCode.trim()) {
      toast({ title: 'Código inválido', variant: 'destructive' });
      return;
    }
    if (saveChecked) saveNickname(dpName.trim());
    setUser(dpName.trim());
    const ok = await joinRoom(dpCode.trim().toUpperCase());
    if (ok) {
      navigate('/desafio-da-palavra');
    } else {
      toast({ title: 'Sala não encontrada', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-center mb-1">
        <div className="flex justify-center mb-1">
          <img
            src={logoDesafioPalavraForms}
            alt="Desafio da Palavra"
            className="h-[67px] object-contain drop-shadow-lg"
          />
        </div>
        <p className="text-slate-400 text-xs">Não forme a palavra ou desafie!</p>
      </div>

      <input
        type="text"
        placeholder="Seu nickname"
        value={dpName}
        onChange={(e) => setDpName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        className="input-dark"
      />

      <button
        onClick={handleCreate}
        disabled={isLoading}
        className={cn(
          'w-full px-8 py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl',
          !isLoading
            ? 'bg-gradient-to-r from-violet-600 to-purple-600 border-violet-900 text-white hover:brightness-110 active:border-b-0 active:translate-y-2'
            : 'bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed opacity-50'
        )}
      >
        {isLoading ? <Loader2 size={28} className="animate-spin" /> : <Zap size={28} className="animate-bounce" />}
        CRIAR SALA
      </button>

      <div className="flex items-center px-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={saveChecked}
            onChange={(e) => setSaveChecked(e.target.checked)}
            className="w-4 h-4 rounded bg-[#1a2a3a] border-2 border-[#4a6a8a] cursor-pointer accent-[#7c3aed]"
          />
          <span className="text-sm text-[#8aa0b0]">Guardar nickname</span>
        </label>
      </div>

      <div className="flex items-center gap-4 py-1">
        <div className="flex-1 h-px bg-[#4a6a8a]" />
        <span className="text-[#8aa0b0] text-sm font-bold">OU</span>
        <div className="flex-1 h-px bg-[#4a6a8a]" />
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="CÓDIGO"
          value={dpCode}
          onChange={(e) => setDpCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          maxLength={3}
          className="input-code flex-1"
        />
        <button
          onClick={handleJoin}
          disabled={isLoading}
          className={cn(
            'px-6 py-4 rounded-2xl font-black text-lg tracking-wide flex items-center justify-center gap-2 transition-all duration-300 border-b-[6px] shadow-2xl whitespace-nowrap',
            !isLoading
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2'
              : 'bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed opacity-50'
          )}
        >
          ENTRAR
        </button>
      </div>

      {/* How to play */}
      <Link href="/como-jogar/desafio-da-palavra">
        <button className="w-full px-8 py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl bg-gradient-to-r from-teal-500 to-cyan-500 border-teal-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2">
          <BookOpen size={28} />
          COMO JOGAR
        </button>
      </Link>
    </div>
  );
};

const RankMasterGameCard = () => {
  const { setUser, createRoom, joinRoom, isLoading, loadSavedNickname, saveNickname } = useRankMasterStore();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [rmName, setRmName] = useState(() => loadSavedNickname() || localStorage.getItem('tikjogos_saved_nickname') || '');
  const [rmCode, setRmCode] = useState('');
  const [saveChecked, setSaveChecked] = useState(() => !!localStorage.getItem('tikjogos_saved_nickname'));

  const handleCreate = async () => {
    if (!rmName.trim()) {
      toast({ title: 'Nome necessário', variant: 'destructive' });
      return;
    }
    if (saveChecked) saveNickname(rmName.trim());
    setUser(rmName.trim());
    await createRoom();
    navigate('/rankmaster');
  };

  const handleJoin = async () => {
    if (!rmName.trim()) {
      toast({ title: 'Nome necessário', variant: 'destructive' });
      return;
    }
    if (!rmCode.trim()) {
      toast({ title: 'Código inválido', variant: 'destructive' });
      return;
    }
    if (saveChecked) saveNickname(rmName.trim());
    setUser(rmName.trim());
    const ok = await joinRoom(rmCode.trim().toUpperCase());
    if (ok) {
      navigate('/rankmaster');
    } else {
      toast({ title: 'Sala não encontrada', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-center mb-1">
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <img src="/rankify-logo.png" alt="Rankify" className="h-[67px] drop-shadow-lg" />
          </div>
          <p className="text-slate-400 text-xs">Ordene os itens e conquiste pontos!</p>
        </div>
      </div>

      <input
        type="text"
        placeholder="Seu nickname"
        value={rmName}
        maxLength={20}
        onChange={(e) => setRmName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        className="input-dark"
        data-testid="input-rm-nickname"
      />

      <button
        onClick={handleCreate}
        disabled={isLoading}
        className={cn(
          'w-full px-8 py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl',
          !isLoading
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 border-amber-900 text-black hover:brightness-110 active:border-b-0 active:translate-y-2'
            : 'bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed opacity-50'
        )}
        data-testid="button-rm-criar-sala"
      >
        {isLoading ? <Loader2 size={28} className="animate-spin" /> : <Zap size={28} className="animate-bounce" />}
        CRIAR SALA
      </button>

      <div className="flex items-center px-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={saveChecked}
            onChange={(e) => setSaveChecked(e.target.checked)}
            className="w-4 h-4 rounded bg-[#1a2a3a] border-2 border-[#4a6a8a] cursor-pointer accent-amber-500"
          />
          <span className="text-sm text-[#8aa0b0]">Guardar nickname</span>
        </label>
      </div>

      <div className="flex items-center gap-4 py-1">
        <div className="flex-1 h-px bg-[#4a6a8a]" />
        <span className="text-[#8aa0b0] text-sm font-bold">OU</span>
        <div className="flex-1 h-px bg-[#4a6a8a]" />
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="CÓDIGO"
          value={rmCode}
          onChange={(e) => setRmCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          maxLength={3}
          className="input-code flex-1"
          data-testid="input-rm-code"
        />
        <button
          onClick={handleJoin}
          disabled={isLoading}
          className={cn(
            'px-6 py-4 rounded-2xl font-black text-lg tracking-wide flex items-center justify-center gap-2 transition-all duration-300 border-b-[6px] shadow-2xl whitespace-nowrap',
            !isLoading
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2'
              : 'bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed opacity-50'
          )}
          data-testid="button-rm-entrar"
        >
          ENTRAR
        </button>
      </div>
    </div>
  );
};

const BombaGameCard = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [name, setName] = useState(() => localStorage.getItem('tikjogos_nickname') || localStorage.getItem('tikjogos_saved_nickname') || '');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const playerId = () => {
    const current = sessionStorage.getItem('bomba_player_id') || crypto.randomUUID();
    sessionStorage.setItem('bomba_player_id', current);
    return current;
  };

  const enterRoom = async (mode: 'create' | 'join') => {
    const nickname = name.trim();
    if (!nickname) return toast({ title: 'Digite seu apelido', variant: 'destructive' });
    if (mode === 'join' && code.trim().length !== 3) return toast({ title: 'Digite o código de 3 letras', variant: 'destructive' });
    setBusy(true);
    try {
      localStorage.setItem('tikjogos_nickname', nickname);
      const roomCode = code.trim().toUpperCase();
      const url = mode === 'create' ? '/api/bomba/rooms' : `/api/bomba/rooms/${roomCode}/join`;
      const response = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: playerId(), nickname }),
      });
      const room = await response.json();
      if (!response.ok) throw new Error(room.error || 'Não foi possível entrar na sala.');
      sessionStorage.setItem('bomba_room_code', room.code);
      navigate(`/bomba?room=${room.code}`);
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-3">
      <div className="text-center">
        <img src={bombaLogo} alt="Bomba" className="mx-auto h-[92px] w-auto max-w-full object-contain drop-shadow-[0_12px_24px_rgba(124,58,237,.35)]" />
        <p className="text-xs font-semibold text-slate-400">Escolha uma letra, responda e passe a vez antes de explodir.</p>
      </div>
      <input className="input-dark" value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nickname" maxLength={18} />
      <button onClick={() => enterRoom('create')} disabled={busy} className="flex w-full items-center justify-center gap-3 rounded-2xl border-b-[6px] border-[#b77900] bg-[#ffca28] px-8 py-5 text-xl font-black text-[#171329] shadow-[0_14px_30px_rgba(255,202,40,.28)] transition-all hover:bg-[#ffd43b] active:translate-y-2 active:border-b-0 disabled:opacity-50">
        <Bomb size={27} /> CRIAR SALA
      </button>
      <div className="flex items-center gap-3"><div className="h-px flex-1 bg-slate-700"/><span className="text-xs font-black text-slate-500">OU</span><div className="h-px flex-1 bg-slate-700"/></div>
      <div className="flex gap-2">
        <input className="input-code min-w-0 flex-1" value={code} onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3))} onKeyDown={(event) => event.key === 'Enter' && enterRoom('join')} placeholder="CÓDIGO" maxLength={3} />
        <button onClick={() => enterRoom('join')} disabled={busy} className="rounded-2xl border-b-[6px] border-green-800 bg-gradient-to-r from-green-500 to-emerald-500 px-6 font-black text-white active:translate-y-2 active:border-b-0 disabled:opacity-50">ENTRAR</button>
      </div>
      <div className="flex items-center gap-3"><div className="h-px flex-1 bg-slate-700"/><span className="text-xs font-black text-slate-500">OU</span><div className="h-px flex-1 bg-slate-700"/></div>
      <Link href="/bomba?local=1" className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-600 bg-slate-800 px-6 py-4 font-black text-white"><Users size={21}/> MODO LOCAL</Link>
    </div>
  );
};

const CronometroGameCard = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [name, setName] = useState(() => localStorage.getItem('tikjogos_nickname') || localStorage.getItem('tikjogos_saved_nickname') || '');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [gameMode, setGameMode] = useState<'classic' | 'challenge'>('classic');
  const getPlayerId = () => { const current = sessionStorage.getItem('cronometro_player_id') || crypto.randomUUID(); sessionStorage.setItem('cronometro_player_id', current); return current; };
  const enter = async (mode: 'create' | 'join') => {
    const nickname = name.trim();
    if (!nickname) return toast({ title: 'Digite seu apelido', variant: 'destructive' });
    if (mode === 'join' && code.length !== 3) return toast({ title: 'Digite o código de 3 letras', variant: 'destructive' });
    setBusy(true);
    try {
      localStorage.setItem('tikjogos_nickname', nickname);
      const roomCode = code.toUpperCase();
      const response = await fetch(mode === 'create' ? '/api/cronometro/rooms' : `/api/cronometro/rooms/${roomCode}/join`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerId: getPlayerId(), nickname, ...(mode === 'create' ? { gameMode } : {}) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível entrar na sala.');
      sessionStorage.setItem('cronometro_room_code', data.code);
      navigate(`/cronometro?room=${data.code}`);
    } catch (e: any) { toast({ title: e.message, variant: 'destructive' }); }
    finally { setBusy(false); }
  };
  return <div className="space-y-3">
    <div className="text-center"><div className="mx-auto w-fit rounded-xl border-2 border-cyan-400/40 bg-[#080d19] px-4 py-2 font-mono text-2xl font-black tracking-wider text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,.16)]"><span className="text-slate-400">T3:</span>MP:00</div><p className="mt-2 text-xs font-semibold text-slate-400">Pare o cronômetro no tempo exato.</p></div>
    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-700 bg-slate-950/50 p-2">
      <button type="button" onClick={() => setGameMode('classic')} className={cn('rounded-xl border-2 px-3 py-3 text-sm font-black transition', gameMode === 'classic' ? 'border-cyan-400 bg-cyan-400/15 text-cyan-200' : 'border-transparent text-slate-400')}>CLÁSSICO</button>
      <button type="button" onClick={() => setGameMode('challenge')} className={cn('rounded-xl border-2 px-3 py-3 text-sm font-black transition', gameMode === 'challenge' ? 'border-fuchsia-400 bg-fuchsia-400/15 text-fuchsia-200' : 'border-transparent text-slate-400')}>DESAFIO</button>
    </div>
    <input className="input-dark" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nickname" maxLength={18}/>
    <button onClick={() => enter('create')} disabled={busy} style={{ backgroundColor: "#18bff2", color: "#07152b" }} className="flex w-full items-center justify-center gap-3 rounded-2xl border-b-[6px] border-cyan-800 px-8 py-5 text-xl font-black shadow-[0_12px_28px_rgba(24,191,242,.28)] transition-all hover:brightness-110 active:translate-y-2 active:border-b-0 disabled:opacity-50"><Clock size={27}/> CRIAR SALA</button>
    <div className="flex items-center gap-3"><div className="h-px flex-1 bg-slate-700"/><span className="text-xs font-black text-slate-500">OU</span><div className="h-px flex-1 bg-slate-700"/></div>
    <div className="flex gap-2"><input className="input-code min-w-0 flex-1" value={code} onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3))} onKeyDown={e => e.key === 'Enter' && enter('join')} placeholder="CÓDIGO" maxLength={3}/><button onClick={() => enter('join')} disabled={busy} className="rounded-2xl border-b-[6px] border-green-800 bg-gradient-to-r from-green-500 to-emerald-500 px-6 font-black text-white active:translate-y-2 active:border-b-0 disabled:opacity-50">ENTRAR</button></div>
  </div>;
};

const AproximacaoGameCard = () => {
  const { setUser, createRoom, joinRoom, isLoading, loadSavedNickname, saveNickname } = useAproximacaoStore();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [apxName, setApxName] = useState(() => loadSavedNickname() || localStorage.getItem('tikjogos_saved_nickname') || '');
  const [apxCode, setApxCode] = useState('');
  const [saveChecked, setSaveChecked] = useState(() => !!localStorage.getItem('tikjogos_saved_nickname'));

  const handleCreate = async () => {
    if (!apxName.trim()) {
      toast({ title: 'Nome necessário', variant: 'destructive' });
      return;
    }
    if (saveChecked) saveNickname(apxName.trim());
    setUser(apxName.trim());
    await createRoom();
    navigate('/aproximacao');
  };

  const handleJoin = async () => {
    if (!apxName.trim()) {
      toast({ title: 'Nome necessário', variant: 'destructive' });
      return;
    }
    if (!apxCode.trim()) {
      toast({ title: 'Código inválido', variant: 'destructive' });
      return;
    }
    if (saveChecked) saveNickname(apxName.trim());
    setUser(apxName.trim());
    const ok = await joinRoom(apxCode.trim().toUpperCase());
    if (ok) {
      navigate('/aproximacao');
    } else {
      toast({ title: 'Sala não encontrada', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-center mb-1">
        <div className="flex justify-center mb-1">
          <img
            src={logoAprox}
            alt="Jogo da Aproximação"
            className="h-[67px] object-contain drop-shadow-lg"
          />
        </div>
        <p className="text-slate-400 text-xs">Quem chega mais perto ganha!</p>
      </div>

      <input
        type="text"
        placeholder="Seu nickname"
        value={apxName}
        maxLength={20}
        onChange={(e) => setApxName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        className="input-dark"
        data-testid="input-apx-nickname"
      />

      <button
        onClick={handleCreate}
        disabled={isLoading}
        className={cn(
          'w-full px-8 py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl',
          !isLoading
            ? 'bg-gradient-to-r from-cyan-500 to-teal-500 border-cyan-900 text-white hover:brightness-110 active:border-b-0 active:translate-y-2'
            : 'bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed opacity-50'
        )}
        data-testid="button-apx-criar-sala"
      >
        {isLoading ? <Loader2 size={28} className="animate-spin" /> : <Zap size={28} className="animate-bounce" />}
        CRIAR SALA
      </button>

      <div className="flex items-center px-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={saveChecked}
            onChange={(e) => setSaveChecked(e.target.checked)}
            className="w-4 h-4 rounded bg-[#1a2a3a] border-2 border-[#4a6a8a] cursor-pointer accent-cyan-500"
          />
          <span className="text-sm text-[#8aa0b0]">Guardar nickname</span>
        </label>
      </div>

      <div className="flex items-center gap-4 py-1">
        <div className="flex-1 h-px bg-[#4a6a8a]" />
        <span className="text-[#8aa0b0] text-sm font-bold">OU</span>
        <div className="flex-1 h-px bg-[#4a6a8a]" />
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="CÓDIGO"
          value={apxCode}
          onChange={(e) => setApxCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          maxLength={3}
          className="input-code flex-1"
          data-testid="input-apx-code"
        />
        <button
          onClick={handleJoin}
          disabled={isLoading}
          className={cn(
            'px-6 py-4 rounded-2xl font-black text-lg tracking-wide flex items-center justify-center gap-2 transition-all duration-300 border-b-[6px] shadow-2xl whitespace-nowrap',
            !isLoading
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2'
              : 'bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed opacity-50'
          )}
          data-testid="button-apx-entrar"
        >
          ENTRAR
        </button>
      </div>
    </div>
  );
};

const HomeScreen = ({ showSupportContent = false }: { showSupportContent?: boolean }) => {
  const { setUser, createRoom, joinRoom, isLoading, loadSavedNickname, saveNickname, clearSavedNickname, savedNickname } = useGameStore();
  const [name, setNameInput] = useState("");
  const [code, setCodeInput] = useState("");
  const [saveNicknameChecked, setSaveNicknameChecked] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isThemeWorkshopOpen, setIsThemeWorkshopOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<'impostor' | 'desenho' | 'sincronia' | 'desafio' | 'aproximacao' | 'rankmaster' | 'bomba' | 'cronometro'>('impostor');
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselDrag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });
  const [carouselAtStart, setCarouselAtStart] = useState(true);
  const [carouselAtEnd, setCarouselAtEnd] = useState(false);

  const updateCarouselEdges = () => {
    const el = carouselRef.current;
    if (!el) return;
    setCarouselAtStart(el.scrollLeft <= 2);
    setCarouselAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  };
  const { toast } = useToast();
  const { t, langPath, lang } = useLanguage();
  const homeGames = useMemo(() => {
    const games = {
      pt: [
        { title: 'Jogo do Impostor', description: 'Um jogo de dedução social em que todos recebem uma palavra, menos o impostor. Dê pistas, desconfie dos amigos e vote para encontrar quem está fingindo.', play: '/', guide: '/como-jogar/jogo-do-impostor', icon: Gamepad2, accent: '#f97316' },
        { title: 'Bomba', description: 'Um tema é sorteado e cada jogador escolhe uma letra para responder. A letra usada é eliminada e você precisa passar a vez antes que a bomba exploda.', play: '/bomba', guide: '/como-jogar/bomba', icon: Bomb, accent: '#ff244d' },
        { title: 'T3:MP:00 — Jogo do Cronômetro', description: 'Um tempo-alvo é sorteado e todos tentam parar o cronômetro no instante exato. Vence quem terminar com a menor diferença.', play: '/cronometro', guide: '/como-jogar/cronometro', icon: Clock, accent: '#22d3ee' },
        { title: 'Desenho do Impostor', description: 'Todos desenham a mesma palavra, menos o impostor. Observe cada traço, descubra quem não conhece o tema e escolha seu suspeito.', play: '/desenho-impostor', guide: '/como-jogar/jogo-do-impostor-desenho', icon: Paintbrush, accent: '#34d399' },
        { title: 'Sincronia', description: 'Responda às perguntas pensando como seus amigos. Quanto mais jogadores escreverem a mesma resposta, mais pontos vocês conquistam.', play: '/respostas-em-comum', guide: '/como-jogar/sincronia', icon: Sparkles, accent: '#a855f7' },
        { title: 'Rankify', description: 'Coloque os itens na ordem que considera correta. O gabarito é revelado no fim e vence quem chegar mais perto do ranking real.', play: '/rankmaster', guide: '/como-jogar/rankify', icon: Trophy, accent: '#f59e0b' },
        { title: 'Jogo da Aproximação', description: 'Dê seu melhor palpite para perguntas numéricas. Quem chegar mais perto ganha um coração; quem ficar mais longe perde um.', play: '/aproximacao', guide: '/como-jogar/aproximacao', icon: Target, accent: '#06b6d4' },
        { title: 'Desafio da Palavra', description: 'Adicione letras ao fragmento, forme palavras possíveis e desafie os blefes dos adversários antes de perder todas as vidas.', play: '/desafio-da-palavra', guide: '/como-jogar/desafio-da-palavra', icon: BookOpen, accent: '#8b5cf6' },
      ],
      en: [
        { title: 'Impostor Game', description: 'A social deduction game where everyone receives a word except the impostor. Give clues, question your friends and vote for the pretender.', play: '/en', guide: '/en/how-to-play/impostor-game', icon: Gamepad2, accent: '#f97316' },
        { title: 'Bomba', description: 'A theme is drawn and each player chooses a letter to answer. The used letter is removed and you must pass the turn before the bomb explodes.', play: '/bomba', guide: '/en/how-to-play/bomba', icon: Bomb, accent: '#ff244d' },
        { title: 'Timer Game', description: 'A target time is drawn and everyone tries to stop the timer at the exact moment. The smallest difference wins.', play: '/cronometro', guide: '/en/how-to-play/timer-game', icon: Clock, accent: '#22d3ee' },
        { title: 'Impostor Drawing', description: 'Everyone draws the same word except the impostor. Watch every stroke, find who does not know the theme and choose your suspect.', play: '/desenho-impostor', guide: '/en/how-to-play/impostor-drawing-game', icon: Paintbrush, accent: '#34d399' },
        { title: 'Sincronia', description: 'Answer questions by thinking like your friends. The more players give the same answer, the more points you score.', play: '/respostas-em-comum', guide: '/en/how-to-play/sincronia', icon: Sparkles, accent: '#a855f7' },
        { title: 'Rankify', description: 'Put the items in the order you believe is correct. The answer is revealed at the end and the closest ranking wins.', play: '/rankmaster', guide: '/en/how-to-play/rankify', icon: Trophy, accent: '#f59e0b' },
        { title: 'Approximation Game', description: 'Give your best estimate for numerical questions. The closest player gains a heart and the farthest loses one.', play: '/aproximacao', guide: '/en/how-to-play/approximation', icon: Target, accent: '#06b6d4' },
        { title: 'Word Challenge', description: 'Add letters to the fragment, keep real words possible and challenge your opponents’ bluffs before losing all your lives.', play: '/desafio-da-palavra', guide: '/en/how-to-play/word-challenge', icon: BookOpen, accent: '#8b5cf6' },
      ],
      es: [
        { title: 'Juego del Impostor', description: 'Un juego de deducción social donde todos reciben una palabra menos el impostor. Da pistas, sospecha de tus amigos y vota al farsante.', play: '/es', guide: '/es/como-jugar/juego-del-impostor', icon: Gamepad2, accent: '#f97316' },
        { title: 'Bomba', description: 'Se sortea un tema y cada jugador elige una letra para responder. La letra usada se elimina y debes pasar el turno antes de la explosión.', play: '/bomba', guide: '/es/como-jugar/bomba', icon: Bomb, accent: '#ff244d' },
        { title: 'Juego del Cronómetro', description: 'Se sortea un tiempo objetivo y todos intentan detener el cronómetro en el instante exacto. Gana la menor diferencia.', play: '/cronometro', guide: '/es/como-jugar/juego-del-cronometro', icon: Clock, accent: '#22d3ee' },
        { title: 'Dibujo del Impostor', description: 'Todos dibujan la misma palabra excepto el impostor. Observa cada trazo, descubre quién no conoce el tema y elige a tu sospechoso.', play: '/desenho-impostor', guide: '/es/como-jugar/juego-del-impostor-dibujo', icon: Paintbrush, accent: '#34d399' },
        { title: 'Sincronia', description: 'Responde pensando como tus amigos. Cuantos más jugadores escriban la misma respuesta, más puntos conseguirán.', play: '/respostas-em-comum', guide: '/es/como-jugar/sincronia', icon: Sparkles, accent: '#a855f7' },
        { title: 'Rankify', description: 'Coloca los elementos en el orden que creas correcto. La respuesta se revela al final y gana quien más se acerque.', play: '/rankmaster', guide: '/es/como-jugar/rankify', icon: Trophy, accent: '#f59e0b' },
        { title: 'Juego de Aproximación', description: 'Da tu mejor estimación para preguntas numéricas. Quien más se acerca gana un corazón y quien queda más lejos pierde uno.', play: '/aproximacao', guide: '/es/como-jugar/aproximacion', icon: Target, accent: '#06b6d4' },
        { title: 'Desafío de la Palabra', description: 'Añade letras al fragmento, mantén palabras posibles y desafía los engaños de tus rivales antes de perder todas las vidas.', play: '/desafio-da-palavra', guide: '/es/como-jugar/desafio-de-la-palabra', icon: BookOpen, accent: '#8b5cf6' },
      ],
    };
    return games[(lang === 'en' || lang === 'es' ? lang : 'pt')];
  }, [lang]);

  // Detect carousel scroll limits on mount
  useEffect(() => {
    updateCarouselEdges();
  }, []);

  // Set page title and meta description per language
  useEffect(() => {
    const meta = HOME_META[lang] || HOME_META.pt;
    document.title = meta.title;
    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute('content', meta.description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', meta.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', meta.description);
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', meta.title);
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', meta.description);
  }, [lang]);

  useEffect(() => {
    const saved = loadSavedNickname();
    if (saved) {
      setNameInput(saved);
      setSaveNicknameChecked(true);
    }

    // Check if there's a room code from URL redirect
    const autoJoinCode = sessionStorage.getItem('autoJoinRoomCode');
    if (autoJoinCode) {
      setCodeInput(autoJoinCode);
      sessionStorage.removeItem('autoJoinRoomCode');
      toast({ 
        title: "Código da sala preenchido!", 
        description: `Digite seu nome e clique em "Entrar na Sala" para começar.` 
      });
    }

    // Check for SEO theme redirect (from theme pages)
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('tema');
    const origemParam = urlParams.get('origem');
    
    if (themeParam && origemParam === 'seo') {
      // Store theme selection for when user creates room
      sessionStorage.setItem('selectedCategory', themeParam);
      sessionStorage.setItem('selectedGameMode', 'palavraSecreta');
      
      toast({
        title: `Tema ${themeParam} selecionado!`,
        description: 'Digite seu nome e crie uma sala para jogar.'
      });
      
      // Clean URL
      window.history.replaceState({}, '', '/');
    }

  }, [loadSavedNickname, toast]);

  // Auto-create room when coming from gallery
  useEffect(() => {
    const autoStart = sessionStorage.getItem('autoStartGame');
    const selectedThemeCode = sessionStorage.getItem('selectedThemeCode');
    const selectedGameMode = sessionStorage.getItem('selectedGameMode');
    const selectedCategory = sessionStorage.getItem('selectedCategory');
    
    if (autoStart === 'true' && (selectedThemeCode || selectedGameMode)) {
      const saved = loadSavedNickname();
      if (saved) {
        setUser(saved);
        createRoom();
        
        const description = selectedThemeCode 
          ? "Preparando o jogo com o tema selecionado"
          : "Preparando o jogo com a categoria selecionada";
        
        toast({ 
          title: "Criando sala...", 
          description 
        });
      } else {
        // If no saved nickname, just show a message
        toast({ 
          title: "Digite seu nome", 
          description: "Digite seu nome e crie uma sala para jogar" 
        });
        sessionStorage.removeItem('autoStartGame');
        sessionStorage.removeItem('selectedGameMode');
        sessionStorage.removeItem('selectedCategory');
      }
    }
  }, [loadSavedNickname, setUser, createRoom, toast]);

  const handleCreate = () => {
    console.log('[HandleCreate] Button clicked, name:', name);
    
    if (!name.trim()) {
      console.log('[HandleCreate] Name is empty, showing toast');
      toast({ title: "Nome necessário", description: "Por favor, digite seu nome.", variant: "destructive" });
      return;
    }
    
    console.log('[HandleCreate] Setting user and creating room');
    
    if (saveNicknameChecked) {
      saveNickname(name);
    }
    setUser(name);
    createRoom();
  };

  const handleJoin = () => {
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
    void joinRoom(code.toUpperCase()).then((success) => {
      if (!success) toast({ title: "Erro ao entrar", description: "Sala não encontrada ou código inválido.", variant: "destructive" });
    });
  };

  const handleClearNickname = () => {
    clearSavedNickname();
    setNameInput("");
    setSaveNicknameChecked(false);
    toast({ title: "Nickname removido", description: "Próxima vez você precisará digitar novamente." });
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#1a1b2e] selection:bg-purple-500/30">
      {/* Navigation */}
      <MobileNav />

      {/* Side Ads - Desktop only */}
      <SideAds />

      {/* Video ad - bottom right corner */}
      <BottomRightVideoAd />

      {/* Bottom Ad removed from home page */}

      {/* Social and Action Buttons - Floating Desktop */}
      {/* Removido conforme solicitado */}

      {/* Elementos decorativos de fundo */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1000ms' }}></div>
      </div>

      {/* Hero Banner - Oficina de Temas - TEMPORARIAMENTE DESABILITADO */}
      {/* <Link 
        href="/criar-tema"
        className="hero-banner"
        data-testid="hero-banner-theme-workshop"
      >
        <div className="hero-banner-overlay">
          <p className="hero-banner-text-small">Divirta-se com os amigos</p>
          <p className="hero-banner-text-main">Crie seu próprio tema por apenas R$ 1,50</p>
        </div>
      </Link> */}

      {/* Character images - change based on selected game (desktop only) */}
      {selectedGame === 'impostor' && (
        <>
          <img 
            src={tripulanteImg} 
            alt="Personagem Tripulante do Jogo do Impostor - TikJogos" 
            width="300"
            height="420"
            loading="lazy"
            decoding="async"
            className="hidden md:block absolute bottom-[220px] left-[18%] lg:left-[22%] xl:left-[26%] h-[42vh] max-h-[420px] object-contain z-10 transition-opacity duration-500"
          />
          <img 
            src={impostorImg} 
            alt="Personagem Impostor do Jogo - TikJogos" 
            width="300"
            height="420"
            loading="lazy"
            decoding="async"
            className="hidden md:block absolute bottom-[220px] right-[18%] lg:right-[22%] xl:right-[26%] h-[42vh] max-h-[420px] object-contain z-10 transition-opacity duration-500"
          />
        </>
      )}
      {selectedGame === 'desenho' && (
        <>
          <img 
            src={tripulantePincelImg} 
            alt="Personagem Tripulante com Pincel - TikJogos" 
            width="300"
            height="420"
            loading="lazy"
            decoding="async"
            className="hidden md:block absolute bottom-[220px] left-[18%] lg:left-[22%] xl:left-[26%] h-[42vh] max-h-[420px] object-contain z-10 transition-opacity duration-500"
          />
          <img 
            src={impostorPincelImg} 
            alt="Personagem Impostor com Pincel - TikJogos" 
            width="300"
            height="420"
            loading="lazy"
            decoding="async"
            className="hidden md:block absolute bottom-[220px] right-[18%] lg:right-[22%] xl:right-[26%] h-[42vh] max-h-[420px] object-contain z-10 transition-opacity duration-500"
          />
        </>
      )}
      {selectedGame === 'sincronia' && (
        <>
          <img 
            src={personagemEsquerdo} 
            alt="Personagem Sincronia lado esquerdo - TikJogos" 
            width="258"
            height="324"
            loading="lazy"
            decoding="async"
            className="hidden md:block absolute bottom-[220px] left-[18%] lg:left-[22%] xl:left-[26%] h-[42vh] max-h-[420px] object-contain z-10 transition-opacity duration-500"
          />
          <img 
            src={personagemDireito} 
            alt="Personagem Sincronia lado direito - TikJogos" 
            width="246"
            height="326"
            loading="lazy"
            decoding="async"
            className="hidden md:block absolute bottom-[220px] right-[18%] lg:right-[22%] xl:right-[26%] h-[42vh] max-h-[420px] object-contain z-10 transition-opacity duration-500"
          />
        </>
      )}

      {/* Main content area - flex-grow to push footer down */}
      <div className="flex-1 flex flex-col items-center pt-6 md:pt-0 px-4 relative z-20">
        {/* Mobile action buttons - above the card */}
        <MobileActionButtons onDonateClick={() => setIsDonationOpen(true)} />

        {/* Square banner ad before game form - mobile only */}
        <div className="block md:hidden w-full">
          <InArticleAd />
        </div>

        {/* Game selector card */}
        <div className="bg-[#242642] rounded-[3rem] p-6 md:p-10 shadow-2xl border-4 border-[#2f3252] w-[90%] max-w-md animate-fade-in mb-6 md:mb-24 mt-4 md:mt-12">
          {/* Game logo carousel */}
          {/* Arrow row — sits above the scroll track, outside overflow-hidden */}
          <div className="flex items-center justify-between px-1 mb-1">
            <button
              onClick={() => { const el = carouselRef.current; if (el) { el.scrollBy({ left: -120, behavior: 'smooth' }); } }}
              className="transition-opacity duration-300 p-1"
              style={{ opacity: carouselAtStart ? 0 : 0.45, pointerEvents: carouselAtStart ? 'none' : 'auto' }}
              aria-label="Anterior"
              tabIndex={-1}
            >
              <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
                <path d="M8 2L2 9L8 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={() => { const el = carouselRef.current; if (el) { el.scrollBy({ left: 120, behavior: 'smooth' }); } }}
              className="transition-opacity duration-300 p-1"
              style={{ opacity: carouselAtEnd ? 0 : 0.45, pointerEvents: carouselAtEnd ? 'none' : 'auto' }}
              aria-label="Próximo"
              tabIndex={-1}
            >
              <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
                <path d="M2 2L8 9L2 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Scroll track — overflow-hidden clips scrollbar, py-3 gives room for scale-105 and badge */}
          <div className="overflow-hidden mb-4">
          <div
            ref={carouselRef}
            className="flex gap-2 overflow-x-auto snap-x snap-mandatory py-3 px-1 select-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: 'grab' }}
            onScroll={updateCarouselEdges}
            onMouseDown={(e) => {
              const el = carouselRef.current;
              if (!el) return;
              carouselDrag.current = { active: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft, moved: false };
              el.style.cursor = 'grabbing';
            }}
            onMouseMove={(e) => {
              const d = carouselDrag.current;
              const el = carouselRef.current;
              if (!d.active || !el) return;
              e.preventDefault();
              const x = e.pageX - el.offsetLeft;
              const walk = x - d.startX;
              if (Math.abs(walk) > 4) d.moved = true;
              el.scrollLeft = d.scrollLeft - walk;
            }}
            onMouseUp={() => {
              carouselDrag.current.active = false;
              if (carouselRef.current) carouselRef.current.style.cursor = 'grab';
            }}
            onMouseLeave={() => {
              carouselDrag.current.active = false;
              if (carouselRef.current) carouselRef.current.style.cursor = 'grab';
            }}
          >
            {/* Impostor */}
            <button
              onClick={() => { if (!carouselDrag.current.moved) setSelectedGame('impostor'); carouselDrag.current.moved = false; }}
              className={cn(
                "flex-none w-[23%] rounded-2xl p-2 transition-all duration-300 border-2 cursor-pointer snap-start",
                selectedGame === 'impostor'
                  ? "border-orange-500 bg-[#2f3252] shadow-lg shadow-orange-500/20 scale-105"
                  : "border-transparent bg-[#1a1c2e] opacity-50 hover:opacity-80 hover:border-[#4a6a8a]"
              )}
              data-testid="tab-impostor"
            >
              <img
                src={logoImpostor}
                alt="Jogo do Impostor"
                className="h-12 md:h-16 w-full object-contain"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
            </button>

            {/* Desenho */}
            <button
              onClick={() => { if (!carouselDrag.current.moved) setSelectedGame('desenho'); carouselDrag.current.moved = false; }}
              className={cn(
                "flex-none w-[23%] rounded-2xl p-2 transition-all duration-300 border-2 cursor-pointer snap-start",
                selectedGame === 'desenho'
                  ? "border-[#46cfa5] bg-[#2f3252] shadow-lg shadow-[#46cfa5]/20 scale-105"
                  : "border-transparent bg-[#1a1c2e] opacity-50 hover:opacity-80 hover:border-[#4a6a8a]"
              )}
              data-testid="tab-desenho"
            >
              <img
                src={logoImpostorArt}
                alt="Desenho do Impostor"
                className="h-12 md:h-16 w-full object-contain"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
            </button>

            {/* Bomba */}
            <button
              onClick={() => { if (!carouselDrag.current.moved) setSelectedGame('bomba'); carouselDrag.current.moved = false; }}
              className={cn(
                "relative flex-none w-[23%] cursor-pointer snap-start rounded-2xl border-2 p-2 transition-all duration-300",
                selectedGame === 'bomba'
                  ? "scale-105 border-red-500 bg-[#2f3252] shadow-lg shadow-red-500/20"
                  : "border-transparent bg-[#1a1c2e] opacity-50 hover:border-[#4a6a8a] hover:opacity-80"
              )}
              data-testid="tab-bomba"
            >
              <div className="flex h-12 w-full items-center justify-center md:h-16">
                <img src={bombaIcon} alt="Bomba" className="h-12 w-full object-contain drop-shadow-[0_0_8px_rgba(124,58,237,.55)] md:h-16" draggable={false} />
              </div>
              <span className="absolute -right-1 -top-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-black leading-none text-white shadow-md shadow-red-900/50">
                NOVO
              </span>
            </button>

            {/* Sincronia */}
            <button
              onClick={() => { if (!carouselDrag.current.moved) setSelectedGame('cronometro'); carouselDrag.current.moved = false; }}
              className={cn("relative flex-none w-[23%] cursor-pointer snap-start rounded-2xl border-2 p-2 transition-all duration-300", selectedGame === 'cronometro' ? "scale-105 border-cyan-400 bg-[#2f3252] shadow-lg shadow-cyan-400/20" : "border-transparent bg-[#1a1c2e] opacity-50 hover:border-[#4a6a8a] hover:opacity-80")}
              data-testid="tab-cronometro"
            >
              <div className="flex h-12 items-center justify-center rounded-lg bg-[#080d19] font-mono text-[11px] font-black text-cyan-300 md:h-16 md:text-sm"><span className="text-slate-400">T3:</span>MP:00</div>
              <span className="absolute -right-1 -top-2 rounded-full bg-cyan-500 px-1.5 py-0.5 text-[9px] font-black leading-none text-slate-950">NOVO</span>
            </button>

            {/* Sincronia */}
            <button
              onClick={() => { if (!carouselDrag.current.moved) setSelectedGame('sincronia'); carouselDrag.current.moved = false; }}
              className={cn(
                "flex-none w-[23%] rounded-2xl p-2 transition-all duration-300 border-2 cursor-pointer snap-start",
                selectedGame === 'sincronia'
                  ? "border-[#43065c] bg-[#2f3252] shadow-lg shadow-[#43065c]/20 scale-105"
                  : "border-transparent bg-[#1a1c2e] opacity-50 hover:opacity-80 hover:border-[#4a6a8a]"
              )}
              data-testid="tab-sincronia"
            >
              <img
                src={sincroniaLogo}
                alt="Sincronia"
                className="h-12 md:h-16 w-full object-contain"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
            </button>

            {/* Aproximação */}
            <button
              onClick={() => { if (!carouselDrag.current.moved) setSelectedGame('aproximacao'); carouselDrag.current.moved = false; }}
              className={cn(
                "flex-none w-[23%] rounded-2xl p-2 transition-all duration-300 border-2 cursor-pointer snap-start relative",
                selectedGame === 'aproximacao'
                  ? "border-cyan-500 bg-[#2f3252] shadow-lg shadow-cyan-500/20 scale-105"
                  : "border-transparent bg-[#1a1c2e] opacity-50 hover:opacity-80 hover:border-[#4a6a8a]"
              )}
              data-testid="tab-aproximacao"
            >
              <img
                src={logoAprox}
                alt="Jogo da Aproximação"
                className="h-12 md:h-16 w-full object-contain"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
            </button>

            {/* RankMaster */}
            <button
              onClick={() => { if (!carouselDrag.current.moved) setSelectedGame('rankmaster'); carouselDrag.current.moved = false; }}
              className={cn(
                "flex-none w-[23%] rounded-2xl p-2 transition-all duration-300 border-2 cursor-pointer snap-start relative",
                selectedGame === 'rankmaster'
                  ? "border-amber-500 bg-[#2f3252] shadow-lg shadow-amber-500/20 scale-105"
                  : "border-transparent bg-[#1a1c2e] opacity-50 hover:opacity-80 hover:border-[#4a6a8a]"
              )}
              data-testid="tab-rankmaster"
            >
              <div className={cn(
                "h-12 md:h-16 w-full flex items-center justify-center",
              )}>
                <img
                  src="/rankify-logo.png"
                  alt="Rankify"
                  className="h-10 md:h-12 w-full object-contain"
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                />
              </div>
            </button>

            {/* Desafio da Palavra — last, revealed by scrolling */}
            <button
              onClick={() => { if (!carouselDrag.current.moved) setSelectedGame('desafio'); carouselDrag.current.moved = false; }}
              className={cn(
                "flex-none w-[23%] rounded-2xl p-2 transition-all duration-300 border-2 cursor-pointer snap-start",
                selectedGame === 'desafio'
                  ? "border-violet-500 bg-[#2f3252] shadow-lg shadow-violet-500/20 scale-105"
                  : "border-transparent bg-[#1a1c2e] opacity-50 hover:opacity-80 hover:border-[#4a6a8a]"
              )}
              data-testid="tab-desafio"
            >
              <img
                src={logoDesafioPalavraSmall}
                alt="Desafio da Palavra"
                className="h-12 md:h-16 w-full object-contain"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
            </button>
          </div>{/* end scroll track */}
          </div>{/* end overflow-hidden wrapper */}

          {/* Animated indicator line */}
          <div className="relative h-1 bg-[#1a1c2e] rounded-full mb-5 mx-2">
            <div
              className={cn(
                "absolute top-0 h-full w-1/5 rounded-full transition-all duration-300",
                selectedGame === 'impostor' && "left-0 bg-gradient-to-r from-orange-500 to-amber-500",
                selectedGame === 'desenho' && "left-[20%] bg-gradient-to-r from-[#46cfa5] to-[#2ea87e]",
                selectedGame === 'bomba' && "left-[40%] bg-gradient-to-r from-red-500 to-rose-600",
                selectedGame === 'sincronia' && "left-[60%] bg-gradient-to-r from-[#43065c] to-[#6b21a8]",
                selectedGame === 'aproximacao' && "left-[80%] bg-gradient-to-r from-cyan-500 to-teal-500",
                selectedGame === 'desafio' && "left-[80%] bg-gradient-to-r from-violet-500 to-purple-600"
              )}
            />
          </div>

          {/* Impostor form */}
          {selectedGame === 'impostor' && (
            <div className="space-y-3 animate-fade-in">
              {/* Large logo */}
              <div className="text-center mb-1">
                <div className="flex justify-center mb-1">
                  <img 
                    src={logoImpostor} 
                    alt="Logo Jogo do Impostor"
                    width={575} height={133}
                    className="h-[67px] object-contain drop-shadow-lg" 
                  />
                </div>
                <p className="text-slate-400 text-xs">Descubra e elimine o impostor entre os jogadores!</p>
              </div>

              <input
                type="text"
                placeholder={t('home.nickname', 'Seu nickname')}
                value={name}
                onChange={(e) => setNameInput(e.target.value)}
                className="input-dark"
                data-testid="input-name"
              />

              <button 
                onClick={handleCreate} 
                disabled={isLoading}
                className={cn(
                  "w-full px-8 py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl",
                  !isLoading
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 border-orange-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2' 
                    : 'bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed opacity-50'
                )}
                data-testid="button-create-room"
              >
                {isLoading ? <Loader2 size={28} className="animate-spin" /> : <Zap size={28} className="animate-bounce" />}
                {t('home.createRoom', 'CRIAR SALA').toUpperCase()}
              </button>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveNicknameChecked}
                    onChange={(e) => setSaveNicknameChecked(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#1a2a3a] border-2 border-[#4a6a8a] cursor-pointer accent-[#e8a045]"
                    data-testid="checkbox-save-nickname"
                  />
                  <span className="text-sm text-[#8aa0b0]">{t('home.saveNickname', 'Guardar nickname')}</span>
                </label>
                {savedNickname && (
                  <button
                    onClick={handleClearNickname}
                    className="text-xs text-[#6a8aaa] hover:text-white transition-colors underline"
                    data-testid="button-clear-nickname"
                  >
                    {t('buttons.delete', 'Limpar')}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-[#4a6a8a]"></div>
                <span className="text-[#8aa0b0] text-sm font-bold">OU</span>
                <div className="flex-1 h-px bg-[#4a6a8a]"></div>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder={t('home.roomCode', 'CÓDIGO').toUpperCase()}
                  value={code}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  maxLength={3}
                  className="input-code flex-1"
                  data-testid="input-room-code"
                />
                <button 
                  onClick={handleJoin}
                  disabled={isLoading}
                  className={cn(
                    "px-6 py-4 rounded-2xl font-black text-lg tracking-wide flex items-center justify-center gap-2 transition-all duration-300 border-b-[6px] shadow-2xl whitespace-nowrap",
                    !isLoading
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2' 
                      : 'bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed opacity-50'
                  )}
                  data-testid="button-join-room"
                >
                  {t('home.enterCode', 'ENTRAR').toUpperCase()}
                </button>
              </div>

              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-[#4a6a8a]"></div>
                <span className="text-[#8aa0b0] text-sm font-bold">OU</span>
                <div className="flex-1 h-px bg-[#4a6a8a]"></div>
              </div>

              <Link href={langPath("/modo-local")}>
                <button 
                  className="w-full px-8 py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl bg-gradient-to-r from-purple-500 to-pink-500 border-purple-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2"
                  data-testid="button-local-mode"
                >
                  <Smartphone size={28} />
                  {t('home.playLocal', 'MODO LOCAL').toUpperCase()}
                </button>
              </Link>
            </div>
          )}

          {/* Drawing game form */}
          {selectedGame === 'desenho' && (
            <div className="animate-fade-in">
              <DrawingGameCard onCreateRoom={(action) => action()} />
            </div>
          )}

          {/* Sincronia game form */}
          {selectedGame === 'sincronia' && (
            <div className="animate-fade-in">
              <SincroniaGameCard onCreateRoom={(action) => action()} />
            </div>
          )}

          {/* Desafio da Palavra */}
          {selectedGame === 'desafio' && (
            <div className="animate-fade-in">
              <DesafioGameCard />
            </div>
          )}

          {/* Jogo da Aproximação */}
          {selectedGame === 'aproximacao' && (
            <div className="animate-fade-in">
              <AproximacaoGameCard />
            </div>
          )}

          {/* RankMaster */}
          {selectedGame === 'rankmaster' && (
            <div className="animate-fade-in">
              <RankMasterGameCard />
            </div>
          )}

          {/* Bomba */}
          {selectedGame === 'bomba' && (
            <div className="animate-fade-in">
              <BombaGameCard />
            </div>
          )}
          {selectedGame === 'cronometro' && <div className="animate-fade-in"><CronometroGameCard /></div>}
        </div>

      </div>

      {isNativeApp() && (
        <div className="native-app-footer" role="contentinfo">
          <p>Desenvolvido por <strong>Rodrigo Freitas</strong></p>
          <p>© 2026 TikJogos. Todos os direitos reservados.</p>
        </div>
      )}

      <section className="native-web-only relative z-20 mx-auto mb-10 max-w-3xl px-6 text-center" aria-label="Sobre o Jogo do Impostor">
        <h1 className="mb-3 text-3xl font-black leading-tight text-white md:text-4xl">
          {lang === 'en' ? 'Free Online Impostor Game' : lang === 'es' ? 'Juego del Impostor Online Gratis' : 'Jogo do Impostor Online Grátis'}
        </h1>
        <p className="text-base font-medium leading-relaxed text-slate-300 md:text-lg">
          {lang === 'en'
            ? 'Create a room, invite your friends and discover who received the different word.'
            : lang === 'es'
              ? 'Crea una sala, invita a tus amigos y descubre quién recibió la palabra diferente.'
              : 'Crie uma sala, convide seus amigos e descubra quem recebeu a palavra diferente.'}
        </p>
      </section>

      <section className="native-web-only relative z-20 mx-auto mb-16 w-full max-w-6xl px-4" aria-labelledby="home-games-title">
        <header className="mx-auto mb-8 max-w-3xl text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-purple-300">
            <Gamepad2 className="h-4 w-4" /> {lang === 'en' ? 'Games for friends' : lang === 'es' ? 'Juegos para amigos' : 'Jogos para amigos'}
          </span>
          <h2 id="home-games-title" className="text-3xl font-black text-white md:text-4xl">
            {lang === 'en' ? 'Discover all TikJogos games' : lang === 'es' ? 'Descubre todos los juegos de TikJogos' : 'Conheça todos os jogos do TikJogos'}
          </h2>
          <p className="mt-3 text-slate-400">
            {lang === 'en' ? 'Choose your favorite, create a room and invite your friends.' : lang === 'es' ? 'Elige tu favorito, crea una sala e invita a tus amigos.' : 'Escolha seu favorito, crie uma sala e convide seus amigos.'}
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          {homeGames.map(({ title, description, guide, icon: Icon, accent }, index) => (
            <article
              key={title}
              className={cn(
                "group relative overflow-hidden rounded-3xl border border-[#343854] bg-[#242642] p-6 shadow-xl transition-all hover:-translate-y-1 hover:border-[#4b5078] md:p-7",
                index === 0 && "md:col-span-2"
              )}
            >
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: accent }} />
              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border" style={{ color: accent, borderColor: `${accent}55`, backgroundColor: `${accent}18` }}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">{title}</h2>
                  <p className="mt-3 leading-relaxed text-slate-400">{description}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href={guide} className="inline-flex items-center gap-2 rounded-xl border border-[#454a70] bg-[#1a1b2e] px-5 py-3 text-sm font-black text-slate-200 transition-colors hover:border-purple-400 hover:text-white">
                      <BookOpen className="h-4 w-4" /> {lang === 'en' ? 'How to play' : lang === 'es' ? 'Cómo jugar' : 'Como jogar'}
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {showSupportContent && <SupportHome embedded />}

      {/* In-article ad before footer */}
      <InArticleAd />

      {/* Ad block between form and footer */}
      <AdBlockBetweenFormAndFooter />

      {/* Mini banner horizontal - above footer, mobile only */}
      <div className="block md:hidden w-full">
        <TopBannerAd />
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#0f172a] border-t-8 border-[#242642] pt-16 pb-8 z-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <Link href="/" className="flex items-center cursor-pointer">
                <img 
                  src={logoTikjogos} 
                  alt="TikJogos Impostor" 
                  width={245} height={70}
                  loading="lazy"
                  className="h-16 w-auto object-contain"
                />
              </Link>
              <p className="text-slate-300 max-w-md text-lg font-medium">
                {t('home.description', 'A experiência definitiva de dedução social no espaço. Junte-se a milhares de tripulantes e descubra quem é o traidor.')}
              </p>
              <div className="flex gap-4">
                <a href="https://www.youtube.com/@RAPMUGEN?sub_confirmation=1" target="_blank" rel="noopener noreferrer" title="YouTube" className="w-12 h-12 bg-slate-800 hover:bg-purple-600 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1">
                  <Youtube className="w-6 h-6 text-white" />
                </a>
                <a href="https://www.instagram.com/jogodoimpostor/" target="_blank" rel="noopener noreferrer" title="Instagram" className="w-12 h-12 bg-slate-800 hover:bg-purple-600 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1">
                  <Instagram className="w-6 h-6 text-white" />
                </a>
                <a href="https://discord.gg/H3cjkcd7Pz" target="_blank" rel="noopener noreferrer" title="Discord" className="w-12 h-12 bg-slate-800 hover:bg-purple-600 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1">
                  <MessageCircle className="w-6 h-6 text-white" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-black mb-6 text-xl uppercase tracking-tighter">{t('nav.home', 'NAVEGAÇÃO')}</h3>
              <ul className="flex flex-col gap-3 text-slate-300 font-bold text-left">
                <li><Link href={langPath("/")} className="hover:text-purple-400 transition-colors">{t('nav.home', 'Início')}</Link></li>
                <li><Link href={langPath("/blog")} className="hover:text-purple-400 transition-colors">{t('nav.blog', 'Blog')}</Link></li>
                <li><Link href={langPath("/comojogar")} className="hover:text-purple-400 transition-colors">{t('nav.howToPlay', 'Como Jogar')}</Link></li>
                <li><Link href="/jogo-do-impostor/temas" className="hover:text-purple-400 transition-colors">{t('nav.themes', 'Temas')}</Link></li>
                <li><Link href={langPath("/desenho-impostor")} className="hover:text-purple-400 transition-colors">Desenho do Impostor</Link></li>
                <li><Link href={langPath("/")} className="hover:text-purple-400 transition-colors">Sincronia</Link></li>
                <li><Link href={langPath("/modos")} className="hover:text-purple-400 transition-colors">{t('gameModes.title', 'Modos de Jogo')}</Link></li>
                <li><Link href={langPath("/termos")} className="hover:text-purple-400 transition-colors">{t('nav.terms', 'Termos de Uso')}</Link></li>
                <li><Link href={langPath("/privacidade")} className="hover:text-purple-400 transition-colors">{t('nav.privacy', 'Privacidade')}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-black mb-6 text-xl uppercase tracking-tighter">SUPORTE</h3>
              <ul className="flex flex-col gap-3 text-slate-300 font-bold text-left">
                <li><Link href="/" className="hover:text-purple-400 transition-colors">FAQ</Link></li>
                <li><Link href="/" className="hover:text-purple-400 transition-colors">Reportar Bug</Link></li>
                <li><Link href="/" className="hover:text-purple-400 transition-colors">Contato</Link></li>
                <li>
                  <a href="https://discord.gg/H3cjkcd7Pz" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
                    Discord Oficial
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div className="space-y-2">
              <p className="text-slate-500 font-bold">{t('legal.copyright', '© 2026 TikJogos Entertainment. Todos os direitos reservados.')}</p>
              <p className="text-slate-600 text-[10px] md:text-xs italic max-w-3xl leading-relaxed">
                O TikJogos é um projeto independente de fãs. Todas as marcas registradas (como nomes de personagens e franquias) pertencem aos seus respectivos proprietários e são usadas aqui apenas para fins de referência em contexto de jogo de palavras/trivia.
              </p>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-bold whitespace-nowrap">
              <span>Feito com 💜 na Galáxia TikJogos</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Donation Button and Modal */}
      {!isNativeApp() && <TopRightButtons onDonateClick={() => setIsDonationOpen(true)} />}
      {!isNativeApp() && <DonationModal isOpen={isDonationOpen} onClose={() => setIsDonationOpen(false)} />}
      {!isNativeApp() && <ThemeWorkshopModal isOpen={isThemeWorkshopOpen} onClose={() => setIsThemeWorkshopOpen(false)} />}

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
  emoji?: string;
  plays?: number;
  likes?: number;
  isHot?: boolean;
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
        // Enrich themes with mock data for better UX
        const enrichedThemes = themes.map((theme: PublicTheme, index: number) => ({
          ...theme,
          emoji: ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎬', '🎤', '🎸', '⚽'][index % 10],
          plays: Math.floor(Math.random() * 1000) + 50,
          likes: Math.floor(Math.random() * 200) + 10,
          isHot: index < 2
        }));
        setPublicThemes(enrichedThemes);
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
            className="text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {isLoadingThemes ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#6b4ba3]" />
            </div>
          ) : publicThemes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="text-lg font-bold text-white mb-2">Nenhum tema disponível ainda</h3>
              <p className="text-sm text-gray-400">Aguarde novos temas da comunidade!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {publicThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    onSelectTheme(theme.id);
                    onClose();
                    toast({ title: "Tema selecionado!", description: `"${theme.titulo}" será usado na partida.` });
                  }}
                  className="group relative p-4 rounded-xl bg-[#16213e]/80 border border-[#3d4a5c] hover:border-[#6b4ba3] hover:-translate-y-1 transition-all duration-300 text-left"
                  data-testid={`theme-select-${theme.id}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Theme Icon/Emoji */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6b4ba3] to-[#4a3070] flex items-center justify-center text-2xl flex-shrink-0">
                      {theme.emoji || '🎯'}
                    </div>
                    
                    {/* Theme Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white group-hover:text-[#6b4ba3] transition-colors truncate">
                        {theme.titulo}
                      </h3>
                      <p className="text-xs text-gray-300 mb-2">
                        por <span className="text-gray-300">@{theme.autor}</span>
                      </p>
                      
                      {/* Stats */}
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Sparkles className="w-3 h-3" />
                          <span>{theme.palavrasCount} palavras</span>
                        </div>
                        {theme.plays !== undefined && (
                          <div className="flex items-center gap-1 text-gray-400">
                            <Play className="w-3 h-3 fill-gray-400" />
                            <span>{theme.plays}</span>
                          </div>
                        )}
                        {theme.likes !== undefined && (
                          <div className="flex items-center gap-1 text-pink-400">
                            <Heart className="w-3 h-3 fill-pink-400" />
                            <span>{theme.likes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Select Arrow */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-[#6b4ba3] flex items-center justify-center">
                        <Play className="w-4 h-4 fill-white" />
                      </div>
                    </div>
                  </div>

                  {/* Hot Badge */}
                  {theme.isHot && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <TrendingUp className="w-2.5 h-2.5" />
                      HOT
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

type WordCategory = {
  id: string;
  name: string;
  emoji: string;
  words: string[];
  difficulty: "fácil" | "médio" | "difícil";
  plays?: number;
  isHot?: boolean;
};

const WORD_CATEGORIES: WordCategory[] = [
  {
    id: "animais",
    name: "Animais",
    emoji: "🦁",
    difficulty: "fácil",
    words: ["Leão", "Elefante", "Girafa", "Zebra", "Tigre", "Urso", "Panda", "Coala", "Canguru", "Pinguim"],
    plays: 1250,
    isHot: true
  },
  {
    id: "frutas",
    name: "Frutas",
    emoji: "🍎",
    difficulty: "fácil",
    words: ["Abacaxi", "Banana", "Manga", "Uva", "Melancia", "Morango", "Laranja", "Limão", "Kiwi", "Maçã"],
    plays: 980
  },
  {
    id: "objetos",
    name: "Objetos",
    emoji: "🔧",
    difficulty: "médio",
    words: ["Escada", "Relógio", "Espelho", "Garfo", "Almofada", "Janela", "Tesoura", "Guarda-chuva", "Chave", "Caneta"],
    plays: 750,
    isHot: true
  },
  {
    id: "profissoes",
    name: "Profissões",
    emoji: "👨‍⚕️",
    difficulty: "médio",
    words: ["Médico", "Professor", "Bombeiro", "Policial", "Chef", "Piloto", "Dentista", "Mecânico", "Arquiteto", "Jornalista"],
    plays: 620
  },
  {
    id: "tecnologia",
    name: "Tecnologia",
    emoji: "💻",
    difficulty: "médio",
    words: ["Computador", "Celular", "Tablet", "Mouse", "Teclado", "Monitor", "Fone", "Carregador", "Webcam", "Impressora"],
    plays: 890
  },
  {
    id: "esportes",
    name: "Esportes",
    emoji: "⚽",
    difficulty: "fácil",
    words: ["Futebol", "Basquete", "Vôlei", "Tênis", "Natação", "Corrida", "Ciclismo", "Boxe", "Judô", "Skate"],
    plays: 1100
  },
  {
    id: "comidas",
    name: "Comidas",
    emoji: "🍕",
    difficulty: "fácil",
    words: ["Pizza", "Hambúrguer", "Sushi", "Pastel", "Feijoada", "Lasanha", "Tacos", "Panqueca", "Sorvete", "Bolo"],
    plays: 1350,
    isHot: true
  },
  {
    id: "lugares",
    name: "Lugares",
    emoji: "🏖️",
    difficulty: "médio",
    words: ["Praia", "Montanha", "Deserto", "Floresta", "Cidade", "Fazenda", "Ilha", "Caverna", "Vulcão", "Cachoeira"],
    plays: 540
  },
  {
    id: "veiculos",
    name: "Veículos",
    emoji: "🚗",
    difficulty: "fácil",
    words: ["Carro", "Moto", "Avião", "Barco", "Trem", "Ônibus", "Bicicleta", "Helicóptero", "Caminhão", "Submarino"],
    plays: 720
  },
  {
    id: "instrumentos",
    name: "Instrumentos",
    emoji: "🎸",
    difficulty: "médio",
    words: ["Violão", "Piano", "Bateria", "Flauta", "Saxofone", "Trompete", "Violino", "Harpa", "Gaita", "Pandeiro"],
    plays: 430
  }
];

const PalavraSecretaCategoryModal = ({ isOpen, onClose, onSelectCategory }: { isOpen: boolean; onClose: () => void; onSelectCategory: (categoryId: string) => void }) => {
  const { toast } = useToast();
  const [categories] = useState<WordCategory[]>(WORD_CATEGORIES);
  const [filterDifficulty, setFilterDifficulty] = useState<"todos" | "fácil" | "médio" | "difícil">("todos");

  const filteredCategories = categories.filter((cat) => {
    return filterDifficulty === "todos" || cat.difficulty === filterDifficulty;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[#242642] rounded-[3rem] p-6 md:p-8 shadow-2xl border-4 border-[#2f3252] w-full max-w-3xl max-h-[85vh] overflow-hidden animate-fade-in flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-xl border-2 border-purple-500/20">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              Categorias - Palavra Secreta
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 rounded-xl hover:bg-rose-500 transition-all border-b-3 border-slate-950 hover:border-rose-700 active:border-b-0 active:translate-y-1 text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" strokeWidth={3} />
          </button>
        </div>

        {/* Difficulty Filter */}
        <div className="mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setFilterDifficulty("todos")}
              className={cn(
                "flex-1 px-4 py-3 rounded-2xl text-sm font-black transition-all duration-200 border-b-4",
                filterDifficulty === "todos"
                  ? "bg-purple-500 border-purple-800 text-white shadow-lg"
                  : "bg-slate-800 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-700"
              )}
            >
              TODOS
            </button>
            <button
              onClick={() => setFilterDifficulty("fácil")}
              className={cn(
                "flex-1 px-4 py-3 rounded-2xl text-sm font-black transition-all duration-200 border-b-4",
                filterDifficulty === "fácil"
                  ? "bg-green-500 border-green-800 text-white shadow-lg"
                  : "bg-slate-800 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-700"
              )}
            >
              FÁCIL
            </button>
            <button
              onClick={() => setFilterDifficulty("médio")}
              className={cn(
                "flex-1 px-4 py-3 rounded-2xl text-sm font-black transition-all duration-200 border-b-4",
                filterDifficulty === "médio"
                  ? "bg-yellow-500 border-yellow-800 text-white shadow-lg"
                  : "bg-slate-800 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-700"
              )}
            >
              MÉDIO
            </button>
            <button
              onClick={() => setFilterDifficulty("difícil")}
              className={cn(
                "flex-1 px-4 py-3 rounded-2xl text-sm font-black transition-all duration-200 border-b-4",
                filterDifficulty === "difícil"
                  ? "bg-rose-500 border-rose-800 text-white shadow-lg"
                  : "bg-slate-800 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-700"
              )}
            >
              DIFÍCIL
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  onSelectCategory(category.id);
                  onClose();
                  toast({ title: "Categoria selecionada!", description: `"${category.name}" será usada na partida.` });
                }}
                className="relative p-5 rounded-3xl bg-slate-800 border-4 border-slate-900 hover:bg-slate-750 hover:-translate-y-1 hover:border-slate-700 transition-all duration-200 text-left shadow-lg group"
              >
                <div className="flex items-start gap-4">
                  {/* Category Icon/Emoji */}
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 border-2 border-black/10",
                    category.difficulty === "fácil" && "bg-gradient-to-br from-green-500 to-green-600",
                    category.difficulty === "médio" && "bg-gradient-to-br from-yellow-500 to-yellow-600",
                    category.difficulty === "difícil" && "bg-gradient-to-br from-rose-500 to-rose-600"
                  )}>
                    {category.emoji}
                  </div>
                  
                  {/* Category Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg text-slate-100 group-hover:text-white transition-colors mb-1">
                      {category.name}
                    </h3>
                    <div className={cn(
                      "inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2 capitalize",
                      category.difficulty === "fácil" && "bg-green-500/20 text-green-400 border border-green-500/30",
                      category.difficulty === "médio" && "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
                      category.difficulty === "difícil" && "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    )}>
                      {category.difficulty}
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span className="font-medium">{category.words.length} palavras</span>
                      </div>
                      {category.plays !== undefined && (
                        <div className="flex items-center gap-1">
                          <Play className="w-3 h-3 fill-slate-400" />
                          <span className="font-medium">{category.plays >= 1000 ? (category.plays / 1000).toFixed(1) + "k" : category.plays}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Select Arrow */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center border-2 border-purple-700">
                      <Play className="w-4 h-4 fill-white" />
                    </div>
                  </div>
                </div>

                {/* Hot Badge */}
                {category.isHot && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    🔥 HOT
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Counter Control Component
interface CounterControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

const CounterControl: React.FC<CounterControlProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  icon: Icon
}) => {
  return (
    <div className="bg-slate-800 p-3 md:p-5 rounded-2xl md:rounded-3xl border-2 md:border-4 border-slate-900 flex flex-col gap-3 md:gap-4">
      <div className="flex items-center gap-2 md:gap-3 text-slate-300 font-bold text-base md:text-lg">
        {Icon && <Icon size={18} className="text-orange-500 md:w-5 md:h-5" />}
        {label}
      </div>
      <div className="flex items-center justify-between bg-slate-900 rounded-xl md:rounded-2xl p-1.5 md:p-2">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className={cn(
            "w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg md:rounded-xl font-black text-xl md:text-2xl transition-all border-b-4",
            value <= min
              ? "bg-slate-800 border-slate-950 text-slate-600 cursor-not-allowed"
              : "bg-slate-700 border-slate-950 text-white hover:bg-slate-600 active:border-b-0 active:translate-y-1"
          )}
        >
          -
        </button>
        <span className="text-3xl md:text-4xl font-black text-white w-12 md:w-16 text-center">
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className={cn(
            "w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg md:rounded-xl font-black text-xl md:text-2xl transition-all border-b-4",
            value >= max
              ? "bg-slate-800 border-slate-950 text-slate-600 cursor-not-allowed"
              : "bg-gradient-to-r from-orange-500 to-amber-500 border-orange-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-1"
          )}
        >
          +
        </button>
      </div>
    </div>
  );
};

// Toggle Switch Component
interface ToggleSwitchProps {
  label: string;
  subLabel?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  subLabel,
  checked,
  onChange,
  disabled = false
}) => {
  return (
    <div
      className={cn(
        "p-3 md:p-5 rounded-2xl md:rounded-3xl border-2 md:border-4 transition-all duration-300",
        disabled
          ? "bg-slate-800/50 border-slate-900 opacity-50 cursor-not-allowed"
          : "bg-slate-800 border-slate-900 hover:border-slate-700"
      )}
    >
      <div className="flex items-center justify-between gap-3 md:gap-4">
        <div className="flex-1 min-w-0">
          <div className={cn(
            "font-bold text-base md:text-lg mb-1",
            disabled ? "text-slate-500" : "text-slate-200"
          )}>
            {label}
          </div>
          {subLabel && (
            <p className="text-xs md:text-sm text-slate-400 leading-snug">
              {subLabel}
            </p>
          )}
        </div>
        
        <button
          onClick={() => !disabled && onChange(!checked)}
          disabled={disabled}
          className={cn(
            "relative w-14 h-8 md:w-16 md:h-9 rounded-full transition-all duration-300 border-b-4 shrink-0",
            checked
              ? "bg-gradient-to-r from-emerald-500 to-green-500 border-emerald-800"
              : "bg-slate-600 border-slate-900"
          )}
        >
          <div
            className={cn(
              "absolute top-0.5 md:top-1 left-0.5 md:left-1 bg-white w-6 h-6 md:w-7 md:h-7 rounded-full transition-transform duration-300 shadow-lg flex items-center justify-center",
              checked ? "translate-x-6 md:translate-x-7" : "translate-x-0"
            )}
          >
            {checked ? (
              <Check size={14} className="text-emerald-600 md:w-4 md:h-4" strokeWidth={3} />
            ) : (
              <X size={14} className="text-slate-600 md:w-4 md:h-4" strokeWidth={3} />
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

// Game Config Modal Component (for Lobby)
interface GameConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GameConfigModal: React.FC<GameConfigModalProps> = ({ isOpen, onClose }) => {
  const { gameConfig } = useGameStore();
  const { toast } = useToast();
  
  // Configuration state - initialize from store or defaults
  const [impostorCount, setImpostorCount] = useState(gameConfig?.impostorCount || 1);
  const [enableHints, setEnableHints] = useState(gameConfig?.enableHints ?? false);
  const [firstPlayerHintOnly, setFirstPlayerHintOnly] = useState(gameConfig?.firstPlayerHintOnly || false);
  
  // Config summary
  const configSummary = useMemo(() => {
    let hintText = '';
    if (!enableHints) {
      hintText = 'O impostor jogará sem dicas (Modo Hardcore)';
    } else if (firstPlayerHintOnly) {
      hintText = 'O impostor só terá dica se começar a rodada';
    } else {
      hintText = 'O impostor terá acesso à dica';
    }
    return { impostorCount, hintText };
  }, [impostorCount, enableHints, firstPlayerHintOnly]);
  
  const handleSave = () => {
    const config: GameConfig = {
      impostorCount,
      enableHints,
      firstPlayerHintOnly: enableHints ? firstPlayerHintOnly : false
    };
    
    // Save to store
    useGameStore.setState({ gameConfig: config });
    
    toast({
      title: "Configurações salvas!",
      description: "As configurações serão aplicadas ao modo Palavra Secreta."
    });
    
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[95vh] md:max-h-none bg-[#242642] rounded-2xl md:rounded-[3rem] shadow-2xl border-4 border-[#2f3252] relative animate-scale-in flex flex-col md:block overflow-hidden md:overflow-visible">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-10 pb-4 md:pb-0 md:mb-8 shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-base md:text-2xl lg:text-3xl font-black text-white leading-tight md:leading-normal">
              Configurações da Partida
            </h2>
            <p className="text-slate-400 text-xs md:text-sm font-medium leading-tight md:leading-normal">Modo Palavra Secreta</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 md:p-3 bg-slate-800 rounded-xl md:rounded-2xl hover:bg-slate-700 transition-colors border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 shrink-0 ml-2"
          >
            <X size={20} strokeWidth={3} className="text-slate-300 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Conteúdo das configurações */}
        <div className="overflow-y-auto md:overflow-visible px-4 md:px-10 pb-4 md:pb-0 flex-1 md:flex-none">
          <div className="space-y-4 md:space-y-6 md:mb-8">
            {/* Contador de Impostores */}
            <CounterControl 
              label="Quantidade de Impostores" 
              value={impostorCount} 
              onChange={setImpostorCount}
              min={1}
              max={5}
              icon={AlertTriangle}
            />

            {/* Divisor */}
            <div className="h-px bg-slate-700 my-4 md:my-6" />

            {/* Seção de Dicas */}
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm uppercase tracking-wider font-semibold px-1">
                <HelpCircle size={14} />
                <span>Sistema de Dicas</span>
              </div>

              <ToggleSwitch 
                label="Dica para o Impostor"
                subLabel="O impostor recebe uma pista vaga sobre a palavra."
                checked={enableHints}
                onChange={setEnableHints}
              />

              <ToggleSwitch 
                label="Dica Apenas se for o Primeiro"
                subLabel="Aumenta a dificuldade. Se o impostor não for o primeiro a falar, ele não recebe dica."
                checked={firstPlayerHintOnly}
                onChange={setFirstPlayerHintOnly}
                disabled={!enableHints}
              />
            </div>

            {/* Resumo visual */}
            <div className="bg-slate-950/50 rounded-xl p-3 md:p-4 border border-slate-800/50 flex items-start gap-2 md:gap-3">
              <Info className="text-indigo-400 shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-slate-400 leading-relaxed">
                Haverá <strong className="text-red-400">{configSummary.impostorCount} impostor(es)</strong> nesta rodada. 
                {' '}{configSummary.hintText}
              </p>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 md:gap-3 p-4 md:p-10 pt-4 md:pt-0 shrink-0">
          <button 
            onClick={onClose}
            className="flex-1 px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-lg tracking-wide transition-all duration-300 border-b-4 md:border-b-[6px] shadow-xl bg-slate-700 border-slate-900 text-slate-300 hover:bg-slate-600 active:border-b-0 active:translate-y-2"
          >
            CANCELAR
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-lg tracking-wide flex items-center justify-center gap-2 md:gap-3 transition-all duration-300 border-b-4 md:border-b-[6px] shadow-xl bg-gradient-to-r from-green-500 to-emerald-500 border-green-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2"
          >
            <Check size={20} strokeWidth={3} className="md:w-6 md:h-6" />
            SALVAR
          </button>
        </div>
      </div>
    </div>
  );
};

// Game Config Screen Component
const GameConfigScreen = () => {
  const { 
    room, 
    user, 
    selectedMode, 
    backToModeSelect, 
    startGameWithConfig 
  } = useGameStore();
  
  const { toast } = useToast();
  const [isStarting, setIsStarting] = useState(false);
  
  // Configuration state
  const [impostorCount, setImpostorCount] = useState(1);
  const [enableHints, setEnableHints] = useState(false);
  const [firstPlayerHintOnly, setFirstPlayerHintOnly] = useState(false);
  
  const isHost = room && user && room.hostId === user.uid;
  
  // Get theme code from sessionStorage if needed
  const selectedThemeCode = sessionStorage.getItem('selectedThemeCode');
  
  // Config summary
  const configSummary = useMemo(() => {
    let hintText = '';
    if (!enableHints) {
      hintText = 'O impostor jogará sem dicas (Modo Hardcore)';
    } else if (firstPlayerHintOnly) {
      hintText = 'O impostor só terá dica se começar a rodada';
    } else {
      hintText = 'O impostor terá acesso à dica';
    }
    return { impostorCount, hintText };
  }, [impostorCount, enableHints, firstPlayerHintOnly]);
  
  const handleStartGame = async () => {
    if (!isHost) {
      toast({
        title: "Acesso negado",
        description: "Apenas o host pode iniciar a partida",
        variant: "destructive"
      });
      return;
    }
    
    if (!room || !selectedMode) return;
    
    // Validate player count
    if (room.players.length <= impostorCount) {
      toast({
        title: "Jogadores insuficientes",
        description: `Você precisa de pelo menos ${impostorCount + 1} jogadores para ${impostorCount} impostor(es)`,
        variant: "destructive"
      });
      return;
    }
    
    setIsStarting(true);
    
    try {
      const config: GameConfig = {
        impostorCount,
        enableHints,
        firstPlayerHintOnly: enableHints ? firstPlayerHintOnly : false
      };
      
      await startGameWithConfig(config, selectedThemeCode || undefined);
    } catch (error) {
      toast({
        title: "Erro ao iniciar",
        description: "Não foi possível iniciar a partida. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsStarting(false);
    }
  };
  
  const handleBack = () => {
    backToModeSelect();
  };
  
  if (!isHost) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-6">
        <div className="w-20 h-20 rounded-full bg-blue-500/10 border-4 border-blue-500/20 flex items-center justify-center">
          <Clock className="w-10 h-10 text-blue-500 animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-white mb-2">Aguardando o Host</h2>
          <p className="text-slate-400 font-medium">O host está configurando a partida...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col w-full max-w-2xl h-full py-6 px-4 animate-fade-in relative z-10">
      {/* Elementos decorativos de fundo */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1000ms' }}></div>
      </div>
      
      <div className="bg-[#242642] rounded-[3rem] p-6 md:p-10 shadow-2xl border-4 border-[#2f3252] relative z-10">
        {/* Header com botão de voltar */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={handleBack}
            className="p-3 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-colors border-b-4 border-slate-950 active:border-b-0 active:translate-y-1"
          >
            <ArrowLeft size={24} strokeWidth={3} className="text-slate-300" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-500/10 rounded-xl border-2 border-orange-500/20">
                <Settings className="w-6 h-6 text-orange-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                Configuração da Partida
              </h2>
            </div>
            <p className="text-slate-400 font-medium">Personalize as regras do jogo</p>
          </div>
        </div>

        {/* Conteúdo das configurações */}
        <div className="space-y-6 mb-8">
          {/* Contador de Impostores */}
          <CounterControl 
            label="Quantidade de Impostores" 
            value={impostorCount} 
            onChange={setImpostorCount}
            min={1}
            max={5}
            icon={AlertTriangle}
          />

          {/* Divisor */}
          <div className="h-px bg-slate-700 my-6" />

          {/* Seção de Dicas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm uppercase tracking-wider font-semibold px-1">
              <HelpCircle size={14} />
              <span>Sistema de Dicas</span>
            </div>

            <ToggleSwitch 
              label="Dica para o Impostor"
              subLabel="O impostor recebe uma pista vaga sobre a palavra."
              checked={enableHints}
              onChange={setEnableHints}
            />

            <ToggleSwitch 
              label="Dica Apenas se for o Primeiro"
              subLabel="Aumenta a dificuldade. Se o impostor não for o primeiro a falar, ele não recebe dica."
              checked={firstPlayerHintOnly}
              onChange={setFirstPlayerHintOnly}
              disabled={!enableHints}
            />
          </div>

          {/* Resumo visual */}
          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50 flex items-start gap-3">
            <Info className="text-indigo-400 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-slate-400 leading-relaxed">
              Haverá <strong className="text-red-400">{configSummary.impostorCount} impostor(es)</strong> nesta rodada. 
              {' '}{configSummary.hintText}
            </p>
          </div>
        </div>

        {/* Botão de ação principal */}
        <button 
          onClick={handleStartGame}
          disabled={isStarting}
          className={cn(
            "w-full px-8 py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl",
            isStarting
              ? "bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 to-emerald-500 border-green-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2"
          )}
        >
          {isStarting ? (
            <>
              <Loader2 size={28} className="animate-spin" />
              INICIANDO...
            </>
          ) : (
            <>
              <Play size={28} className="fill-current animate-bounce" />
              INICIAR PARTIDA
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const LobbyScreen = () => {
  const { room, user, goToModeSelect, leaveGame, kickPlayer, selectCharacter, gameConfig } = useGameStore();
  const { toast } = useToast();
  const [showConfigModal, setShowConfigModal] = useState(false);

  if (!room) return null;

  const isHost = room.hostId === user?.uid;
  const players = room.players || [];
  const currentPlayer = players.find(p => p.uid === user?.uid);
  const isWaitingForNextRound = currentPlayer?.waitingForGame === true && room.status === 'playing';
  const canStart = players.length >= 3;
  const currentCharacterIndex = normalizeLobbyCharacterIndex(currentPlayer?.characterIndex);
  const takenCharacterIndexes = new Set(
    players
      .filter(p => p.uid !== user?.uid && typeof p.characterIndex === 'number')
      .map(p => normalizeLobbyCharacterIndex(p.characterIndex))
  );

  const copyLink = () => {
    const shareLink = `${window.location.origin}/sala/${room.code}`;
    navigator.clipboard.writeText(shareLink);
    toast({ title: "Copiado!", description: "Link da sala copiado para a área de transferência." });
  };

  const getPlayerCharacter = (index?: number) => DEFAULT_LOBBY_CHARACTERS[normalizeLobbyCharacterIndex(index)];
  const getPlayerAccent = (index?: number) => characterAccents[normalizeLobbyCharacterIndex(index)];

  const actionContent = isWaitingForNextRound ? (
    <div className="w-full text-center py-5 flex flex-col items-center gap-3 rounded-2xl bg-amber-500/10 border border-amber-400/25">
      <Clock className="w-7 h-7 text-amber-300 animate-pulse" />
      <div>
        <p className="text-amber-300 font-black text-base">Aguardando próxima rodada...</p>
        <p className="text-slate-400 text-sm">Você entrará quando a rodada começar</p>
      </div>
    </div>
  ) : isHost ? (
    <div className="w-full space-y-3">
      <button
        onClick={goToModeSelect}
        disabled={!canStart}
        className={cn(
          "mx-auto w-full max-w-sm px-7 py-4 rounded-2xl font-black text-lg tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl",
          canStart
            ? "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 border-purple-950 text-white hover:brightness-110 active:border-b-0 active:translate-y-1"
            : "bg-slate-800 border-slate-950 text-slate-500 cursor-not-allowed opacity-70"
        )}
        data-testid="button-start-game"
      >
        <Play size={24} className={canStart ? "fill-current" : "fill-current opacity-60"} />
        {canStart ? "ESCOLHER MODO" : "AGUARDANDO JOGADORES"}
      </button>
      {!canStart && (
        <p className="text-center text-sm font-bold text-rose-300">Mínimo de 3 jogadores para iniciar</p>
      )}
    </div>
  ) : (
    <div className="w-full text-center py-5 flex flex-col items-center gap-3 rounded-2xl bg-blue-500/10 border border-blue-400/25">
      <Crown className="w-7 h-7 text-blue-300 animate-pulse" />
      <div>
        <p className="text-blue-300 font-black text-base">Aguardando o capitão...</p>
        <p className="text-slate-400 text-sm">O capitão escolherá o modo de jogo</p>
      </div>
    </div>
  );

  const dashboardLobby = (
    <div className="relative z-10 w-full max-w-[1480px] overflow-x-hidden px-2 py-2 sm:px-5 sm:py-4 md:py-6 animate-fade-in">
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_32%)]" />
      <div className="relative z-10 grid min-w-0 grid-cols-1 items-stretch gap-3 sm:gap-5 lg:grid-cols-[350px_minmax(0,1fr)]">
        <aside className="order-2 flex min-w-0 w-full flex-col overflow-hidden rounded-[1.25rem] border border-slate-700/80 bg-[#0d1529]/95 p-3 shadow-[0_24px_70px_rgba(0,0,0,.36)] sm:rounded-[1.75rem] sm:p-5 lg:order-1">
          <button onClick={leaveGame} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 font-black text-slate-300 transition hover:border-rose-400/40 hover:bg-rose-500/15 hover:text-white" data-testid="button-leave-room"><ArrowLeft className="h-5 w-5"/> Sair da Sala</button>

          <div className="mt-4 flex items-center justify-between px-1 sm:mt-6">
            <h2 className="text-sm font-black uppercase tracking-[.14em] text-slate-300">Jogadores</h2>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-sm font-black text-emerald-300">{players.length} / 10</span>
          </div>

          <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
            {players.map((player, index) => {
              const isMe = player.uid === user?.uid;
              const isPlayerHost = player.uid === room.hostId;
              const characterIndex = player.characterIndex ?? index;
              return <article key={player.uid} className={cn("flex min-w-0 items-center gap-2.5 rounded-xl border p-2.5 sm:gap-3 sm:rounded-2xl sm:p-3", isMe ? "border-violet-400/45 bg-violet-500/10" : "border-slate-700/70 bg-[#111c32]")} data-testid={`player-${player.uid}`}>
                <div className="relative"><CharacterFaceAvatar player={{ ...player, characterIndex }} className="h-12 w-12 rounded-xl sm:h-14 sm:w-14" imageClassName="h-20 sm:h-24"/><div className="absolute -bottom-1 -right-1"><SpeakingIndicator playerId={player.uid} isCurrentUser={isMe}/></div></div>
                <div className="min-w-0 flex-1">
                  {isPlayerHost && <span className="mb-1 inline-flex items-center gap-1 rounded-md bg-violet-500/15 px-1.5 py-0.5 text-[9px] font-black uppercase text-violet-300"><Crown className="h-3 w-3"/> Capitão da sala</span>}
                  <div className="flex min-w-0 items-center gap-2"><strong className="truncate text-sm text-white">{player.name}</strong>{isMe && <span className="rounded bg-violet-600 px-1.5 py-0.5 text-[9px] font-black uppercase">Você</span>}</div>
                  <div className="mt-1.5 flex items-center gap-2"><span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-300"><Check className="h-3 w-3"/>{player.waitingForGame ? "Aguardando" : "Pronto"}</span><span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/5 px-2 py-0.5 text-[9px] font-black text-amber-300"><Trophy className="h-3 w-3"/>{player.impostorWins ?? 0}</span></div>
                </div>
                <div className="flex flex-col items-center gap-1"><span className="h-3 w-3 rounded-full bg-emerald-400 text-emerald-400 shadow-[0_0_12px_currentColor]"/><VoiceControlButton playerId={player.uid} isCurrentUser={isMe}/>{isHost && !isMe && <button onClick={() => kickPlayer(player.uid)} className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-slate-500 hover:border-rose-400/30 hover:text-rose-300" data-testid={`button-kick-${player.uid}`}><UserX className="h-4 w-4"/></button>}</div>
              </article>;
            })}
          </div>

          <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-950/25 p-2.5 sm:mt-5 sm:rounded-2xl sm:p-3">
            <p className="text-[9px] font-black uppercase tracking-[.16em] text-slate-500">Escolha seu personagem</p>
            <div className="mt-2 grid grid-cols-5 gap-1.5 sm:mt-3 sm:gap-2">{DEFAULT_LOBBY_CHARACTERS.map((character, index) => {
              const selected = currentCharacterIndex === index; const taken = takenCharacterIndexes.has(index);
              return <button key={index} type="button" onClick={() => !taken && !selected && selectCharacter(index)} disabled={taken} className={cn("relative aspect-square overflow-hidden rounded-lg border bg-slate-950/80 transition", selected ? "border-amber-300 shadow-[0_0_12px_rgba(251,191,36,.25)]" : taken ? "cursor-not-allowed border-white/5 grayscale opacity-25" : "border-white/10 hover:border-violet-400/50")} aria-label={taken ? "Personagem ocupado" : `Selecionar personagem ${index + 1}`}><img src={character} alt="" className="absolute left-1/2 top-0 h-[155%] w-auto max-w-none -translate-x-1/2 object-contain"/>{selected && <Check className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 p-0.5 text-white"/>}{taken && <span className="absolute inset-x-0 bottom-0 bg-slate-950/90 py-0.5 text-[6px] font-black uppercase">Ocupado</span>}</button>;
            })}</div>
          </div>
        </aside>

        <main className="order-1 flex min-h-0 min-w-0 w-full flex-col overflow-hidden rounded-[1.25rem] border border-slate-700/80 bg-[#111a31]/95 p-3 shadow-[0_24px_70px_rgba(0,0,0,.36)] sm:min-h-[520px] sm:rounded-[1.75rem] sm:p-6 lg:order-2 lg:min-h-[720px] lg:p-8">
          <header className="flex min-w-0 flex-col gap-3 border-b border-slate-700/60 pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-6">
            <button onClick={copyLink} className="group min-w-0 text-left" data-testid="text-room-code"><p className="text-[9px] font-black uppercase tracking-[.2em] text-slate-500 sm:text-[10px]">Código da sala</p><div className="mt-1 flex items-center gap-2 sm:gap-3"><strong className="font-mono text-3xl font-black tracking-widest text-amber-400 group-hover:text-amber-300 sm:text-4xl">{room.code}</strong><span className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-slate-400 group-hover:text-amber-300 sm:rounded-xl sm:p-2"><Copy className="h-4 w-4 sm:h-5 sm:w-5"/></span></div></button>
            <div className="grid min-w-0 w-full grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center [&>button]:min-w-0 [&>button]:w-full [&>button]:justify-center [&>button_span]:truncate">{isHost && <button onClick={() => setShowConfigModal(true)} className="flex h-10 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs font-black text-slate-300 hover:bg-slate-800 sm:h-12 sm:px-4 sm:text-sm"><Settings className="h-4 w-4 sm:h-5 sm:w-5"/> Configurações</button>}<VoiceChatJoinButton/></div>
          </header>

          <section className="flex min-w-0 flex-1 flex-col items-center justify-center px-1 py-5 text-center sm:py-8"><div className="grid h-14 w-14 place-items-center rounded-2xl border border-violet-400/25 bg-violet-500/10 shadow-[0_0_35px_rgba(139,92,246,.15)] sm:h-20 sm:w-20 sm:rounded-3xl"><Users className="h-7 w-7 text-violet-300 sm:h-10 sm:w-10"/></div><h2 className="mt-3 max-w-full text-xl font-black leading-tight sm:mt-5 sm:text-3xl">Sala pronta para jogar</h2><p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-400 sm:text-base">Convide seus amigos pelo código da sala e escolha o modo quando todos estiverem prontos.</p><div className="mt-4 w-full min-w-0 max-w-lg sm:mt-7">{actionContent}</div></section>

          <div className="hidden sm:block"><LobbyAd/></div>
        </main>
      </div>

      <LobbyChat/>
      {showConfigModal && (
        <GameConfigModal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)}/>
      )}
    </div>
  );

  return dashboardLobby;

  /* Legacy lobby markup kept temporarily while the new dashboard layout is reviewed. */
  return (
    <div className="w-full max-w-7xl px-3 sm:px-5 py-4 md:py-6 animate-fade-in relative z-10">
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_32%)]" />

      <div className="relative z-10 rounded-[2rem] md:rounded-[2.25rem] border border-white/10 bg-slate-950/80 shadow-[0_24px_80px_rgba(0,0,0,0.45)] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_22%),radial-gradient(circle_at_50%_38%,rgba(124,58,237,0.18),transparent_42%)]" />

        <div className="relative px-4 py-4 sm:px-6 md:px-8 md:py-7">
          <div className="grid grid-cols-[auto_1fr_auto] items-start gap-3 md:gap-6">
            <button
              onClick={leaveGame}
              className="h-12 px-3 sm:px-4 rounded-2xl bg-slate-900/90 border border-white/10 text-slate-200 hover:text-white hover:bg-rose-500/20 hover:border-rose-400/40 transition-all flex items-center gap-2 font-black"
              data-testid="button-leave-room"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">SAIR DA SALA</span>
            </button>

            <button onClick={copyLink} className="group text-center justify-self-center" data-testid="text-room-code">
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-1 font-black">Código da Sala</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl md:text-5xl font-black tracking-wider font-mono text-amber-400 group-hover:text-amber-300 transition-colors">
                  {room.code}
                </span>
                <span className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 group-hover:text-amber-300 group-hover:border-amber-400/30 transition-colors">
                  <Copy className="w-5 h-5" />
                </span>
              </div>
            </button>

            <div className="flex items-start gap-2 justify-end">
              {isHost && (
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="h-12 w-12 rounded-2xl bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center"
                  title="Configurações da Partida"
                >
                  <Settings className="w-6 h-6" />
                </button>
              )}
              <div className="hidden md:block">
                <VoiceChatJoinButton />
              </div>
            </div>
          </div>

          <div className="mt-6 md:hidden">
            <VoiceChatJoinButton />
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/55 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Escolha seu personagem</span>
              <span className="text-[11px] font-bold text-slate-500">Ocupados ficam bloqueados</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" role="radiogroup" aria-label="Escolha seu personagem">
              {DEFAULT_LOBBY_CHARACTERS.map((character, index) => {
                const selected = currentCharacterIndex === index;
                const taken = takenCharacterIndexes.has(index);
                const accent = characterAccents[index % characterAccents.length];

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => !taken && !selected && selectCharacter(index)}
                    disabled={taken}
                    className={cn(
                      "relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border bg-slate-950/80 transition-all",
                      selected
                        ? "border-amber-300 shadow-[0_0_0_2px_rgba(251,191,36,0.25),0_10px_24px_rgba(0,0,0,0.35)]"
                        : taken
                          ? "border-white/5 opacity-35 cursor-not-allowed grayscale"
                          : "border-white/10 hover:border-white/30 hover:-translate-y-0.5"
                    )}
                    role="radio"
                    aria-checked={selected}
                    title={taken ? "Personagem ocupado" : `Personagem ${index + 1}`}
                    data-testid={`button-lobby-character-${index}`}
                  >
                    <div className={cn("absolute inset-x-2 bottom-1 h-4 rounded-full bg-gradient-to-r opacity-30 blur-sm", accent)} />
                    <img
                      src={character}
                      alt=""
                      className="absolute left-1/2 top-0 h-24 w-auto max-w-none -translate-x-1/2 object-contain"
                      draggable={false}
                    />
                    {selected && (
                      <span className="absolute right-1 top-1 rounded-full bg-emerald-500 p-0.5 text-white shadow-lg">
                        <Check className="h-3.5 w-3.5" strokeWidth={4} />
                      </span>
                    )}
                    {taken && (
                      <span className="absolute inset-x-1 bottom-1 rounded-full bg-slate-950/85 px-1 py-0.5 text-[9px] font-black text-slate-300">
                        OCUPADO
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden md:grid mt-12 min-h-[420px] grid-cols-2 lg:grid-cols-5 gap-x-5 gap-y-10 items-end">
            {players.map((p, index) => {
              const isMe = p.uid === user?.uid;
              const isPlayerHost = p.uid === room.hostId;
              const characterIndex = p.characterIndex ?? index;
              const accent = getPlayerAccent(characterIndex);

              return (
                <div key={p.uid} className="relative flex min-w-0 flex-col items-center" data-testid={`player-${p.uid}`}>
                  <div className="mb-4 flex flex-col items-center gap-2">
                    {isPlayerHost && (
                      <div className="text-amber-300 drop-shadow-[0_2px_8px_rgba(251,191,36,0.55)]">
                        <Crown className="w-6 h-6" fill="currentColor" />
                      </div>
                    )}
                    <div className="max-w-[190px] rounded-xl border border-white/10 bg-slate-900/90 px-3 py-2 text-center shadow-lg">
                      <div className="flex min-w-0 items-center justify-center gap-2">
                        <p className="truncate text-base font-black text-white">{p.name}</p>
                        <span className="shrink-0 rounded-lg border border-amber-300/25 bg-amber-400/10 px-2 py-0.5 text-xs font-black text-amber-200 inline-flex items-center gap-1">
                          <Trophy className="h-3.5 w-3.5" />
                          {p.impostorWins ?? 0}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-full border border-emerald-300/20 bg-emerald-500/20 px-3 py-1 text-xs font-black text-white shadow-[0_0_16px_rgba(34,197,94,0.22)] flex items-center gap-1.5">
                      <Check className="w-4 h-4 rounded-full bg-emerald-500 p-0.5" />
                      {p.waitingForGame ? "AGUARDANDO" : "PRONTO"}
                    </div>
                  </div>

                  <div className="relative h-[245px] w-full max-w-[180px] flex items-end justify-center">
                    <div className={cn("absolute bottom-0 h-10 w-[94%] rounded-full bg-gradient-to-r opacity-50 blur-md", accent)} />
                    <img
                      src={lobbyPodium}
                      alt=""
                      className="absolute bottom-0 w-[112%] max-w-none object-contain drop-shadow-[0_8px_18px_rgba(56,189,248,0.28)]"
                      draggable={false}
                    />
                    <img
                      src={getPlayerCharacter(characterIndex)}
                      alt=""
                      className="relative z-10 max-h-[238px] w-auto max-w-full object-contain drop-shadow-[0_18px_22px_rgba(0,0,0,0.45)]"
                      draggable={false}
                    />
                    <div className="absolute bottom-8 right-2 z-20">
                      <SpeakingIndicator playerId={p.uid} isCurrentUser={isMe} />
                    </div>
                  </div>

                  <div className="mt-4 flex h-8 items-center justify-center gap-2">
                    {isPlayerHost && (
                      <span className="rounded-lg border border-amber-400/20 bg-slate-900 px-3 py-1 text-xs font-black text-amber-300">
                        CAPITÃO DA SALA
                      </span>
                    )}
                    {isMe && (
                      <span className="rounded-lg bg-violet-600 px-3 py-1 text-xs font-black text-white shadow-lg shadow-violet-950/50">
                        VOCÊ
                      </span>
                    )}
                    <VoiceControlButton playerId={p.uid} isCurrentUser={isMe} />
                    {isHost && !isMe && (
                      <button
                        onClick={() => kickPlayer(p.uid)}
                        className="rounded-lg bg-slate-900 p-2 text-slate-400 border border-white/10 hover:text-white hover:bg-rose-500/25 hover:border-rose-400/30 transition-colors"
                        data-testid={`button-kick-${p.uid}`}
                        title="Expulsar jogador"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="md:hidden mt-6 space-y-3">
            {players.map((p, index) => {
              const isMe = p.uid === user?.uid;
              const isPlayerHost = p.uid === room.hostId;
              const characterIndex = p.characterIndex ?? index;
              const accent = getPlayerAccent(characterIndex);

              return (
                <div
                  key={p.uid}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-3 flex items-center gap-3"
                  data-testid={`player-${p.uid}`}
                >
                  <div className={cn("absolute left-0 top-0 h-full w-1 bg-gradient-to-b", accent)} />
                  {isPlayerHost && (
                    <Crown className="absolute left-3 top-2 h-4 w-4 text-amber-300" fill="currentColor" />
                  )}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-950/70 border border-white/10">
                    <div className={cn("absolute inset-x-2 bottom-1 h-4 rounded-full bg-gradient-to-r opacity-35 blur-sm", accent)} />
                    <img
                      src={getPlayerCharacter(characterIndex)}
                      alt=""
                      className="absolute left-1/2 top-0 z-10 h-32 w-auto max-w-none -translate-x-1/2 object-contain"
                      draggable={false}
                    />
                    <div className="absolute bottom-1 right-1">
                      <SpeakingIndicator playerId={p.uid} isCurrentUser={isMe} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="truncate text-lg font-black text-white">{p.name}</p>
                      <span className="shrink-0 rounded-lg border border-amber-300/25 bg-amber-400/10 px-2 py-0.5 text-xs font-black text-amber-200 inline-flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5" />
                        {p.impostorWins ?? 0}
                      </span>
                      {isPlayerHost && <span className="rounded-lg bg-violet-700 px-2 py-1 text-[10px] font-black text-white">CAPITÃO</span>}
                      {isMe && <span className="rounded-lg bg-violet-600 px-2 py-1 text-[10px] font-black text-white">VOCÊ</span>}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-black text-white flex items-center gap-1.5">
                        <Check className="w-4 h-4 rounded-full bg-emerald-500 p-0.5" />
                        {p.waitingForGame ? "AGUARDANDO" : "PRONTO"}
                      </span>
                      <VoiceControlButton playerId={p.uid} isCurrentUser={isMe} />
                    </div>
                  </div>
                  {isHost && !isMe && (
                    <button
                      onClick={() => kickPlayer(p.uid)}
                      className="rounded-xl bg-slate-950 p-2 text-slate-400 border border-white/10 hover:text-white hover:bg-rose-500/25"
                      data-testid={`button-kick-${p.uid}`}
                      title="Expulsar jogador"
                    >
                      <UserX className="w-5 h-5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <LobbyAd />

          <div className="mt-4 border-t border-white/10 pt-6">
            <div className="grid gap-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div className="flex flex-col items-center md:items-start gap-1 text-slate-300">
                <div className="flex items-center gap-2 text-lg font-black">
                  <Users className="w-5 h-5" />
                  {players.length} / 10 JOGADORES
                </div>
                <p className="text-sm text-slate-500">Todos aparecem com um personagem no lobby</p>
              </div>
              <div>{actionContent}</div>
              <div className="hidden md:block" />
            </div>
          </div>
        </div>
      </div>

      <LobbyChat />
      
      {/* Modal de Configuração */}
      {showConfigModal && (
        <GameConfigModal 
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
        />
      )}
    </div>
  );
};

const ModeSelectScreen = () => {
  const { room, user, gameModes, selectedMode, selectMode, selectCharacter, startGame, startGameWithConfig, gameConfig, backToLobby, fetchGameModes, showSpeakingOrderWheel, speakingOrder, setSpeakingOrder, setShowSpeakingOrderWheel } = useGameStore();
  const { toast } = useToast();
  const [isStarting, setIsStarting] = useState(false);
  const [communityThemes, setCommunityThemes] = useState<PublicTheme[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(false);
  const [selectedThemeCode, setSelectedThemeCode] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubmode, setSelectedSubmode] = useState<PalavraSuperSecretaSubmode>(() => (localStorage.getItem('selectedSubmode') as PalavraSuperSecretaSubmode) || 'classico');
  const [shouldAutoStart, setShouldAutoStart] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const isHost = room && user && room.hostId === user.uid;

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
    
    try {
      if (selectedMode === 'palavraSecreta') localStorage.setItem('selectedSubmode', selectedSubmode);
      // Se é palavraComunidade, precisa ter um tema selecionado
      if (selectedMode === 'palavraComunidade') {
        if (!selectedThemeCode) {
          toast({ title: "Selecione um tema", description: "Escolha um tema da comunidade para jogar", variant: "destructive" });
          setIsStarting(false);
          return;
        }
      }
      
      // If Palavra Secreta with gameConfig (any built-in theme, not community themes), use it
      const isPalavraSecretaBuiltIn = selectedMode === 'palavraSecreta' && !selectedThemeCode;
      
      if (isPalavraSecretaBuiltIn && gameConfig) {
        // Validate player count
        if (room.players.length <= gameConfig.impostorCount) {
          toast({
            title: "Jogadores insuficientes",
            description: `Você precisa de pelo menos ${gameConfig.impostorCount + 1} jogadores para ${gameConfig.impostorCount} impostor(es)`,
            variant: "destructive"
          });
          setIsStarting(false);
          return;
        }
        
        await startGameWithConfig(gameConfig, selectedThemeCode || undefined);
      } else {
        // For other modes or community themes, start normally
        await startGame(selectedThemeCode || undefined);
      }
    } catch (error) {
      toast({
        title: "Erro ao iniciar",
        description: "Não foi possível iniciar a partida. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleBackClick = () => {
    backToLobby();
    if (isHost) {
      toast({ title: "Retornando ao lobby...", description: "Todos os jogadores foram levados de volta." });
    }
  };

  useEffect(() => {
    fetchGameModes();
  }, [fetchGameModes]);

  // Auto-select mode when coming from gallery
  useEffect(() => {
    const autoStart = sessionStorage.getItem('autoStartGame');
    const selectedThemeCode = sessionStorage.getItem('selectedThemeCode');
    const selectedGameMode = sessionStorage.getItem('selectedGameMode');
    
    if (autoStart === 'true' && !selectedMode) {
      if (selectedThemeCode) {
        selectMode('palavraComunidade');
      } else if (selectedGameMode) {
        selectMode(selectedGameMode as GameModeType);
      }
    }
  }, [selectedMode, selectMode]);

  // Handle theme/mode selection and auto-start
  useEffect(() => {
    const autoStart = sessionStorage.getItem('autoStartGame');
    
    if (selectedMode === 'palavraComunidade') {
      loadCommunityThemes();
      
      // Check if theme code is already in sessionStorage (from gallery)
      const themeCodeFromStorage = sessionStorage.getItem('selectedThemeCode');
      const selectedThemeId = sessionStorage.getItem('selectedThemeId');
      
      if (themeCodeFromStorage && !selectedThemeCode) {
        // Use the theme code directly from storage
        setSelectedThemeCode(themeCodeFromStorage);
        
        if (autoStart === 'true' && isHost) {
          setShouldAutoStart(true);
        }
        
        // Clean up after setting
        sessionStorage.removeItem('selectedThemeId');
        sessionStorage.removeItem('selectedThemeCode');
        
        toast({ 
          title: "Tema selecionado!", 
          description: "Tema da comunidade carregado com sucesso" 
        });
      } else if (selectedThemeId && !selectedThemeCode) {
        // Fallback: fetch theme by ID if code not available
        fetch('/api/themes/public')
          .then(res => res.json())
          .then(themes => {
            const theme = themes.find((t: PublicTheme) => t.id === selectedThemeId);
            if (theme) {
              setSelectedThemeCode(theme.accessCode);
              
              if (autoStart === 'true' && isHost) {
                setShouldAutoStart(true);
              }
              
              sessionStorage.removeItem('selectedThemeId');
              sessionStorage.removeItem('selectedThemeCode');
              
              toast({ 
                title: "Tema selecionado!", 
                description: `"${theme.titulo}" está pronto para jogar` 
              });
            }
          })
          .catch(err => console.error('Failed to load selected theme:', err));
      }
    } else if (selectedMode === 'palavraSecreta' && autoStart === 'true' && isHost) {
      // Auto-start for palavra secreta from gallery
      setShouldAutoStart(true);
      sessionStorage.removeItem('selectedGameMode');
      sessionStorage.removeItem('selectedCategory');
    } else {
      setSelectedThemeCode(null);
    }
  }, [selectedMode, isHost, toast, selectedThemeCode]);

  // Auto-start game when ready
  useEffect(() => {
    if (shouldAutoStart && selectedThemeCode && isHost) {
      sessionStorage.removeItem('autoStartGame');
      setShouldAutoStart(false);
      
      setTimeout(() => {
        handleStartGameWithSorteio();
      }, 1000);
    }
  }, [shouldAutoStart, selectedThemeCode, isHost]);

  if (!room) return null;

  return (
    <div className="fixed inset-0 z-[40] h-[100dvh] w-full overflow-hidden bg-[#080f20] p-2 lg:relative lg:z-10 lg:h-auto lg:min-h-full lg:max-w-[1480px] lg:bg-transparent lg:px-8 lg:py-8 animate-fade-in">
      {/* Elementos decorativos de fundo */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1000ms' }}></div>
      </div>
      
      <div className="relative z-10 grid h-full items-stretch gap-5 lg:h-auto lg:grid-cols-[350px_minmax(0,1fr)]">
      <aside className="hidden flex-col rounded-[1.75rem] border border-slate-700/80 bg-[#0d1529]/95 p-4 shadow-[0_24px_70px_rgba(0,0,0,.32)] sm:p-5 lg:flex">
        <button onClick={handleBackClick} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 font-black text-slate-300 hover:bg-slate-800" data-testid="button-back-to-lobby"><ArrowLeft className="h-5 w-5"/> Voltar ao Lobby</button>
        <div className="mt-6 flex items-center justify-between"><h2 className="text-sm font-black uppercase tracking-[.14em] text-slate-300">Jogadores</h2><span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-sm font-black text-emerald-300">{room.players.length} / 10</span></div>
        <div className="mt-4 space-y-2.5">{room.players.map((player, index) => <article key={player.uid} className={cn("flex min-w-0 items-center gap-3 rounded-2xl border p-3", player.uid === user?.uid ? "border-violet-400/45 bg-violet-500/10" : "border-slate-700/70 bg-[#111c32]")}><CharacterFaceAvatar player={{ ...player, characterIndex: player.characterIndex ?? index }} className="h-12 w-12 rounded-xl" imageClassName="h-20"/><div className="min-w-0 flex-1"><div className="flex items-center gap-1.5">{player.uid === room.hostId && <Crown className="h-3.5 w-3.5 text-violet-300"/>}<strong className="truncate text-sm">{player.name}</strong></div><div className="mt-1 flex items-center gap-2"><span className="text-[9px] font-black uppercase text-emerald-300">Pronto</span><span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-300"><Trophy className="h-3 w-3"/>{player.impostorWins ?? 0}</span></div></div><span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_currentColor]"/></article>)}</div>
        <div className="mt-5 rounded-2xl border border-slate-700/70 bg-slate-950/25 p-3"><p className="text-[9px] font-black uppercase tracking-[.16em] text-slate-500">Escolha seu personagem</p><div className="mt-3 grid grid-cols-5 gap-2">{DEFAULT_LOBBY_CHARACTERS.map((character, index) => { const selected = normalizeLobbyCharacterIndex(room.players.find(player => player.uid === user?.uid)?.characterIndex) === index; const taken = room.players.some(player => player.uid !== user?.uid && normalizeLobbyCharacterIndex(player.characterIndex) === index); return <button key={index} onClick={() => !taken && selectCharacter(index)} disabled={taken} className={cn("relative aspect-square overflow-hidden rounded-lg border bg-slate-950/80", selected ? "border-amber-300" : taken ? "cursor-not-allowed border-white/5 grayscale opacity-25" : "border-white/10 hover:border-violet-400/50")}><img src={character} alt="" className="absolute left-1/2 top-0 h-[155%] w-auto max-w-none -translate-x-1/2"/>{selected && <Check className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 p-0.5"/>}</button>; })}</div></div>
      </aside>

      <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[1.25rem] border border-slate-700/80 bg-[#111a31]/95 p-3 shadow-[0_24px_70px_rgba(0,0,0,.32)] sm:p-5 lg:h-[min(820px,calc(100vh-64px))] lg:min-h-[720px] lg:rounded-[1.75rem] lg:p-8">
        <div className="mb-3 flex shrink-0 items-start gap-3 text-left lg:mb-8">
          <button onClick={handleBackClick} className="flex h-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 px-3 font-black text-slate-300 lg:hidden" data-testid="button-mobile-back-to-lobby"><ArrowLeft className="h-4 w-4"/></button>
          <div className="flex-1">
            <h2 className="mb-1 text-lg font-black text-white sm:text-2xl lg:mb-2 lg:text-3xl">
              {selectedMode ? 'Escolha o tema da partida' : 'Como vamos jogar hoje?'}
            </h2>
            <p className="max-w-2xl text-xs font-medium text-slate-400 sm:text-base lg:text-lg">
              {selectedMode ? 'O modo já está definido. Agora escolha um tema para começar.' : 'Selecione o modo que mais combina com a sua galera. O Impostor está pronto...'}
            </p>
          </div>
          {selectedMode && <button type="button" onClick={() => { useGameStore.setState({ selectedMode: null }); setSelectedCategory(null); }} className="shrink-0 rounded-xl border border-slate-600 bg-slate-900/70 px-3 py-2 text-[10px] font-black text-slate-300 transition hover:border-violet-400/50 hover:text-white sm:text-sm"><ArrowLeft className="mr-1 inline h-4 w-4"/><span className="hidden sm:inline">Trocar </span>modo</button>}
        </div>

        {!selectedMode && <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto overscroll-contain rounded-2xl border border-slate-600/80 bg-slate-950/25 p-3 pr-2 scrollbar-thin sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {gameModes
            .filter(mode => mode.id !== 'palavraComunidade') // Esconde modo de temas customizados
            .map((mode, index) => {
            const Icon = getModeIcon(mode.id);
            const theme = getModeTheme(mode.id);
            const difficulty = getModeDifficulty(mode.id);
            const isSelected = selectedMode === mode.id;
            const isRecommended = mode.id === 'palavraSecreta';
            
            const themeColors = {
              blue: { bg: 'bg-blue-500', border: 'border-blue-700', iconBg: 'bg-blue-600' },
              green: { bg: 'bg-emerald-500', border: 'border-emerald-700', iconBg: 'bg-emerald-600' },
              red: { bg: 'bg-rose-500', border: 'border-rose-700', iconBg: 'bg-rose-600' },
              yellow: { bg: 'bg-amber-400', border: 'border-amber-600', iconBg: 'bg-amber-500' },
              purple: { bg: 'bg-violet-500', border: 'border-violet-700', iconBg: 'bg-violet-600' },
              pink: { bg: 'bg-pink-500', border: 'border-pink-700', iconBg: 'bg-pink-600' }
            };
            
            const colors = themeColors[theme as keyof typeof themeColors];
            
            return (
              <div 
                key={mode.id}
                onClick={() => {
                  // Se for palavraComunidade (CUSTOM), redireciona para galeria
                  if (mode.id === 'palavraComunidade') {
                    window.location.href = '/temas';
                  } else {
                    selectMode(mode.id as GameModeType);
                  }
                }}
                className={cn(
                  "relative p-3 sm:p-5 rounded-2xl sm:rounded-3xl cursor-pointer transition-all duration-200 flex flex-col gap-2 sm:gap-4 h-full border-2 sm:border-4",
                  isSelected 
                    ? `${colors.bg} ${colors.border} -translate-y-2 shadow-[0_10px_0_0_rgba(0,0,0,0.2)]` 
                    : 'bg-slate-800 border-slate-900 hover:bg-slate-750 hover:-translate-y-1 hover:border-slate-700 shadow-lg'
                )}
              >
                {/* Badge Recomendado */}
                {isRecommended && !isSelected && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full border-2 border-yellow-600 shadow-sm z-10 flex items-center gap-1 w-max">
                    <Star size={12} fill="currentColor" /> RECOMENDADO
                  </div>
                )}

                {/* Check Icon */}
                {isSelected && (
                  <div className="absolute -top-3 -right-3 bg-white text-green-600 rounded-full p-1 border-4 border-green-600 shadow-sm animate-in zoom-in spin-in-12 duration-300">
                    <Check size={20} strokeWidth={4} />
                  </div>
                )}

                {/* Header do Card */}
                <div className="flex justify-between items-start">
                  <div className={cn(
                    "p-3 rounded-2xl border-2 border-black/10",
                    isSelected ? 'bg-white/20 text-white' : `${colors.bg} text-white`
                  )}>
                    <Icon size={32} strokeWidth={2.5} />
                  </div>
                  
                  <div className={cn(
                    "text-xs font-bold px-3 py-1 rounded-full border-2 border-black/10",
                    isSelected ? 'bg-black/20 text-white' : 'bg-slate-900 text-slate-400'
                  )}>
                    {difficulty.toUpperCase()}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="flex flex-col gap-1">
                  <h3 className={cn(
                    "font-black text-xl leading-tight",
                    isSelected ? 'text-white' : 'text-slate-100'
                  )}>
                    {mode.title}
                  </h3>
                  <p className={cn(
                    "text-sm font-medium leading-relaxed",
                    isSelected ? 'text-white/90' : 'text-slate-400'
                  )}>
                    {mode.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>}

        {selectedMode && <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-2xl border border-slate-600/80 bg-slate-950/25 p-3 pr-2 scrollbar-thin">
        
        {selectedMode === 'palavraComunidade' && (
          <div className="pt-1">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#4a90a4]" />
              Temas da Comunidade
            </h3>
            
            {selectedThemeCode ? (
              <div className="p-4 rounded-2xl border-2 border-[#6b4ba3] bg-[#6b4ba3]/10 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6b4ba3] to-[#4a3070] flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#6b4ba3]">Tema Selecionado</p>
                    <p className="text-xs text-gray-300">Pronto para iniciar a partida!</p>
                  </div>
                  <button
                    onClick={() => setSelectedThemeCode(null)}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : null}
            
            <Link href="/temas">
              <div className="group relative p-6 rounded-2xl border-2 border-dashed border-[#3d4a5c] hover:border-[#6b4ba3] bg-[#16213e]/20 hover:bg-[#16213e]/40 transition-all duration-300 cursor-pointer text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6b4ba3] to-[#4a3070] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-[#6b4ba3] transition-colors">
                      {selectedThemeCode ? 'Trocar Tema' : 'Explorar Galeria de Temas'}
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Descubra temas incríveis criados pela comunidade!
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Play className="w-3 h-3" />
                    <span>Clique para ver todos os temas disponíveis</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {selectedMode === 'palavraSecreta' && (
          <div className="pt-1">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4a90a4]" />
              Categorias de Palavras
            </h3>
            
            {selectedCategory ? (
              <div className="p-4 rounded-2xl border-2 border-[#6b4ba3] bg-[#6b4ba3]/10 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6b4ba3] to-[#4a3070] flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#6b4ba3]">Categoria Selecionada</p>
                    <p className="text-xs text-gray-300 capitalize">
                      {WORD_CATEGORIES.find(c => c.id === selectedCategory)?.name || selectedCategory}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : null}
            
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {(Object.entries(PALAVRA_SECRETA_SUBMODES) as Array<[PalavraSuperSecretaSubmode, typeof PALAVRA_SECRETA_SUBMODES['classico']]>).map(([submodeId, submode]) => <button key={submodeId} type="button" onClick={() => { setSelectedSubmode(submodeId); setSelectedCategory(submodeId); localStorage.setItem('selectedSubmode', submodeId); }} className={cn("overflow-hidden rounded-2xl border p-3 text-left transition", selectedSubmode === submodeId ? "border-violet-400 bg-violet-500/20 shadow-[0_0_18px_rgba(139,92,246,.14)]" : "border-slate-700 bg-slate-900/70 hover:border-violet-400/40")}>
                {submode.image && <img src={submode.image} alt="" className="mb-3 h-24 w-full rounded-xl object-cover"/>}<strong className="block text-sm text-white">{submode.title}</strong><span className="mt-1 block text-xs leading-relaxed text-slate-400">{submode.desc}</span><span className="mt-2 inline-block text-[10px] font-bold uppercase text-violet-300">{submode.words.length} palavras</span>
              </button>)}
            </div>
          </div>
        )}

        {selectedMode !== 'palavraSecreta' && selectedMode !== 'palavraComunidade' && (
          <div className="grid h-full min-h-[260px] place-items-center rounded-3xl border border-violet-400/20 bg-violet-500/5 p-8 text-center">
            <div><Check className="mx-auto h-12 w-12 rounded-full bg-emerald-500/15 p-3 text-emerald-300"/><p className="mt-4 text-xl font-black text-white">Modo selecionado</p><p className="mt-2 text-sm text-slate-400">Este modo não precisa de uma escolha adicional de tema.</p></div>
          </div>
        )}
        </div>

        {/* CTA Principal */}
        <div className="flex shrink-0 flex-col items-center border-t border-slate-700/70 bg-[#111a31] pt-3 lg:pt-5">
          <button 
            onClick={handleStartGameWithSorteio}
            disabled={!selectedMode || isStarting || (selectedMode === 'palavraComunidade' && !selectedThemeCode)}
            className={cn(
              "w-full md:w-auto md:min-w-[300px] px-6 py-3.5 lg:px-8 lg:py-5 rounded-2xl font-black text-base lg:text-xl tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[5px] lg:border-b-[6px] shadow-2xl",
              selectedMode && !(selectedMode === 'palavraComunidade' && !selectedThemeCode)
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2' 
                : 'bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed opacity-50'
            )}
          >
            {isStarting ? <Loader2 size={24} className="animate-spin"/> : <Rocket size={28} className={selectedMode && !(selectedMode === 'palavraComunidade' && !selectedThemeCode) ? 'animate-bounce' : ''} />}
            {isStarting ? 'PREPARANDO PARTIDA...' : selectedMode && !(selectedMode === 'palavraComunidade' && !selectedThemeCode) ? 'INICIAR PARTIDA' : 'SELECIONE UM MODO'}
          </button>
        </div>
        </div>}
      </div>
      </div>

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
            <p className="text-gray-300 text-sm uppercase tracking-widest font-bold">Pergunta dos Tripulantes</p>
            <p className="text-2xl text-white font-bold leading-relaxed">"{crewQuestion}"</p>
          </div>
          
          {isImpostor && questionsDiffer && (
            <div className="text-center pt-4 border-t border-gray-600/20 space-y-2">
              <p className="text-gray-400 text-lg font-bold animate-pulse">
                Sua pergunta era diferente!
              </p>
              <p className="text-gray-300 text-sm">
                Tente se justificar e convencer que voce nao e o impostor!
              </p>
            </div>
          )}
          
          {!isImpostor && (
            <div className="text-center pt-4 border-t border-gray-600/20">
              <p className="text-gray-300 text-sm">
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

  // Notify feedback system once when result screen is shown
  useEffect(() => {
    if (phase === 'result') notifyGameEnded();
  }, [phase]);

  if (!room || !room.gameData) return null;

  const isHost = room.hostId === user?.uid;
  // Check if user is impostor - support both single impostorId and multiple impostorIds
  const impostorIds = room.gameData?.impostorIds || [];
  const isImpostor = user?.uid === room.impostorId || impostorIds.includes(user?.uid || '');
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
              <p className="text-gray-300 text-sm">Veja sua pergunta</p>
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
                <p className="text-gray-300 text-sm">Memorize sua pergunta!</p>
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
            <p className="text-gray-300 text-sm text-center animate-pulse">
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
          <p className="text-gray-300 text-sm text-center font-medium animate-pulse">
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
              <p className="text-gray-300 text-sm font-medium">
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
            <p className="text-gray-300 text-sm text-center animate-pulse">
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
    // Support multiple impostors
    const impostorIds = gameData?.impostorIds || [];
    const allImpostorIds = impostorIds.length > 0 ? impostorIds : (room.impostorId ? [room.impostorId] : []);
    const impostorPlayers = activePlayers.filter(p => allImpostorIds.includes(p.uid));
    const impostorNames = impostorPlayers.map(p => p.name).join(', ') || 'Desconhecido';
    
    // Count votes for any impostor
    const votesForImpostors = votes.filter((v: PlayerVote) => allImpostorIds.includes(v.targetId)).length;
    const crewWins = votesForImpostors > totalPlayers / 2;
    
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
                {crewWins ? "TRIPULACAO VENCEU!" : (impostorPlayers.length > 1 ? "IMPOSTORES VENCERAM!" : "IMPOSTOR VENCEU!")}
              </h2>
              
              <p className="text-gray-300 text-lg">
                {impostorPlayers.length > 1 ? "Os impostores eram" : "O impostor era"}: <span className="text-gray-400 font-bold">{impostorNames}</span>
              </p>
            </div>
            
            <div className="w-full h-[1px] bg-gray-700"></div>
            
            <div className="space-y-4">
              <p className="text-[#e9c46a] text-sm uppercase tracking-widest font-bold">Resultados da Votacao</p>
              
              <div className="space-y-2">
                {activePlayers.map(player => {
                  const votesReceived = votes.filter((v: PlayerVote) => v.targetId === player.uid).length;
                  const isTheImpostor = allImpostorIds.includes(player.uid);
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

          <ResultAd />

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

type ImpostorPixState =
  | { status: 'idle' }
  | { status: 'loading'; type: 'hint' | 'reveal' }
  | { status: 'awaiting_payment'; type: 'hint' | 'reveal'; paymentId: string; qrCode: string; qrCodeBase64?: string }
  | { status: 'success'; type: 'hint' | 'reveal' }
  | { status: 'error'; error: string };

const GameScreen = () => {
  const { user, room, returnToLobby, speakingOrder, speakingOrderPlayerMap, setSpeakingOrder, showSpeakingOrderWheel, setShowSpeakingOrderWheel, triggerSpeakingOrderWheel } = useGameStore();
  const [isRevealed, setIsRevealed] = useState(true);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const { showIntermission, intermissionScreen } = useGameIntermission();
  const [impostorPix, setImpostorPix] = useState<ImpostorPixState>({ status: 'idle' });
  const [pixCopied, setPixCopied] = useState(false);
  const [unlockedHint, setUnlockedHint] = useState<string | null>(null);
  const [unlockedWord, setUnlockedWord] = useState<string | null>(null);
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const automaticOrderTriggered = useRef(false);

  // Poll PIX payment status for impostor unlock
  useEffect(() => {
    if (impostorPix.status !== 'awaiting_payment') return;
    let active = true;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/donations/status/${impostorPix.paymentId}`);
        if (res.ok && active) {
          const data = await res.json();
          if (data.status === 'approved') {
            clearInterval(id);
            if (impostorPix.type === 'hint') {
              setUnlockedHint(room?.gameData?.hint ?? null);
            } else {
              setUnlockedWord(room?.gameData?.word ?? null);
            }
            setImpostorPix({ status: 'success', type: impostorPix.type });
          }
        }
      } catch {}
    }, 5000);
    return () => { active = false; clearInterval(id); };
  }, [impostorPix, room]);

  const handleImpostorPix = async (type: 'hint' | 'reveal') => {
    const amount = type === 'hint' ? 1 : 3;
    setImpostorPix({ status: 'loading', type });
    try {
      const res = await fetch('/api/donations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donorName: user?.name || 'Impostor', amount }),
      });
      if (!res.ok) throw new Error('Falha ao criar pagamento');
      const data = await res.json();
      setImpostorPix({ status: 'awaiting_payment', type, paymentId: data.paymentId, qrCode: data.qrCode, qrCodeBase64: data.qrCodeBase64 });
    } catch (err: any) {
      setImpostorPix({ status: 'error', error: err.message });
    }
  };

  const copyImpostorPix = () => {
    if (impostorPix.status !== 'awaiting_payment') return;
    navigator.clipboard.writeText(impostorPix.qrCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  };

  const handleNewRound = () => {
    showIntermission(async () => {
      try {
        await returnToLobby();
      } catch (error) {
        console.error('Error in returnToLobby:', error);
      }
    });
  };

  useEffect(() => {
    if (!room || room.hostId !== user?.uid || automaticOrderTriggered.current || showSpeakingOrderWheel || speakingOrder?.length) return;
    automaticOrderTriggered.current = true;
    const timer = window.setTimeout(() => triggerSpeakingOrderWheel(), 450);
    return () => window.clearTimeout(timer);
  }, [room, user?.uid, showSpeakingOrderWheel, speakingOrder, triggerSpeakingOrderWheel]);

  const handleSpeakingOrderComplete = (order: string[]) => {
    setSpeakingOrder(order);
    setShowSpeakingOrderWheel(false);
  };

  const roomCode = room?.code;
  const gameMode = room?.gameMode;

  if (!room) return null;
  if (intermissionScreen) return intermissionScreen;

  const isHost = room.hostId === user?.uid;
  // Check if user is impostor - support both single impostorId and multiple impostorIds
  const impostorIds = room.gameData?.impostorIds || [];
  const isImpostor = user?.uid === room.impostorId || impostorIds.includes(user?.uid || '');
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
  const compactRoleCard = currentStage !== 'WORD_REVEAL';

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
          <div className="space-y-3 text-center p-4 bg-emerald-500/5 rounded-2xl border-2 border-emerald-500/20">
            <p className="text-emerald-400 text-xs uppercase tracking-[0.3em] font-bold">Palavra Secreta</p>
            <h2 className="text-3xl sm:text-4xl text-white font-black tracking-tight">{gameData.word}</h2>
            <p className="text-slate-400 text-sm">Dê dicas sutis sobre a palavra!</p>
          </div>
        );
      
      case 'palavras':
        const myRole = user?.uid ? gameData.roles?.[user.uid] : null;
        return (
          <div className="space-y-4 text-center p-4 bg-emerald-500/5 rounded-2xl border-2 border-emerald-500/20">
            <div className="space-y-2">
              <p className="text-emerald-400 text-xs uppercase tracking-[0.3em] font-bold">Local</p>
              <h2 className="text-2xl sm:text-3xl text-white font-black">{gameData.location}</h2>
            </div>
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent mx-auto"></div>
            <div className="space-y-2">
              <p className="text-emerald-400 text-xs uppercase tracking-[0.3em] font-bold">Sua Função</p>
              <h3 className="text-xl sm:text-2xl text-white font-bold">{myRole}</h3>
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
        const hint = gameData.hint;
        const gameConfig = gameData.gameConfig;
        const firstPlayerHintOnly = gameConfig?.firstPlayerHintOnly || false;
        const enableHints = gameConfig?.enableHints ?? false;
        
        // Debug logging
        console.log('[ImpostorContent] Hint logic:', {
          hint,
          enableHints,
          firstPlayerHintOnly,
          speakingOrder,
          userId: user?.uid,
          firstPlayer: speakingOrder?.[0]
        });
        
        // Determine if impostor should see the hint
        let shouldShowHint = false;
        let hintMessage = "Finja que você sabe a palavra! Engane a todos.";
        
        if (!enableHints) {
          // No hints at all - hardcore mode
          shouldShowHint = false;
          hintMessage = "Modo Hardcore! Você não tem dica.";
          console.log('[ImpostorContent] Hints disabled - hardcore mode');
        } else if (hint) {
          if (firstPlayerHintOnly) {
            // Only show hint if impostor is first in speaking order
            // Speaking order is only available after the wheel is spun
            if (speakingOrder && speakingOrder.length > 0) {
              const firstPlayerId = speakingOrder[0];
              const isFirstPlayer = firstPlayerId === user?.uid;
              shouldShowHint = isFirstPlayer;
              console.log('[ImpostorContent] First player only mode:', {
                firstPlayerId,
                currentUserId: user?.uid,
                isFirstPlayer,
                shouldShowHint
              });
              if (!shouldShowHint) {
                hintMessage = "Você não é o primeiro a falar, então não tem dica!";
              }
            } else {
              // Speaking order not determined yet - show waiting message
              shouldShowHint = false;
              hintMessage = "Aguardando ordem de fala para revelar dica...";
              console.log('[ImpostorContent] Waiting for speaking order to be determined');
            }
          } else {
            // Always show hint if enabled and not restricted to first player
            shouldShowHint = true;
            console.log('[ImpostorContent] Hints enabled for all impostors');
          }
        } else {
          console.log('[ImpostorContent] No hint available for this word');
        }
        
        console.log('[ImpostorContent] Result:', { shouldShowHint, hintMessage });
        
        // Unlocked via PIX overrides everything
        const pixHint = unlockedHint;
        const pixWord = unlockedWord;

        return (
          <div className="space-y-3 text-center p-4 bg-rose-500/5 rounded-2xl border-2 border-rose-500/20">
            {/* Already unlocked via PIX */}
            {pixWord ? (
              <>
                <p className="text-yellow-400 text-xs uppercase tracking-[0.3em] font-bold">Palavra Revelada 👑</p>
                <h3 className="text-2xl sm:text-3xl text-white font-black">{pixWord}</h3>
                <p className="text-slate-400 text-sm">Você pagou para saber. Use bem!</p>
              </>
            ) : pixHint ? (
              <>
                <p className="text-rose-400 text-xs uppercase tracking-[0.3em] font-bold">Dica Desbloqueada 🔓</p>
                <h3 className="text-2xl sm:text-3xl text-white font-black">{pixHint}</h3>
                <p className="text-slate-400 text-sm">Use a dica para fingir que sabe a palavra!</p>
              </>
            ) : shouldShowHint ? (
              <>
                <p className="text-rose-400 text-xs uppercase tracking-[0.3em] font-bold">Dica</p>
                <h3 className="text-2xl sm:text-3xl text-white font-black">{hint}</h3>
                <p className="text-slate-400 text-sm">Use a dica para fingir que sabe a palavra!</p>
              </>
            ) : (
              <>
                <p className="text-slate-300 text-sm font-medium leading-relaxed">{hintMessage}</p>

                {/* PIX unlock options — only show when awaiting_payment or idle/error */}
                {impostorPix.status === 'awaiting_payment' ? (
                  <div className="mt-3 space-y-2 text-left bg-slate-800/60 rounded-xl p-3 border border-slate-700">
                    <p className="text-xs text-slate-400 font-bold text-center">
                      {impostorPix.type === 'hint' ? 'Pague R$ 1,00 para receber a dica' : 'Pague R$ 3,00 para ver a palavra'}
                    </p>
                    {impostorPix.qrCodeBase64 && (
                      <div className="flex justify-center">
                        <div className="bg-white rounded-lg p-1.5">
                          <img src={`data:image/png;base64,${impostorPix.qrCodeBase64}`} alt="QR PIX" className="w-28 h-28 object-contain" />
                        </div>
                      </div>
                    )}
                    <button
                      onClick={copyImpostorPix}
                      className="w-full px-3 py-2 rounded-xl font-black text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white border-b-[3px] border-emerald-800 hover:brightness-110 active:border-b-0 active:translate-y-0.5 transition-all"
                    >
                      {pixCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {pixCopied ? 'Copiado!' : 'COPIAR CÓDIGO PIX'}
                    </button>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-yellow-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-xs font-bold">Aguardando pagamento...</span>
                      </div>
                      <button onClick={() => setImpostorPix({ status: 'idle' })} className="text-xs text-slate-500 hover:text-white underline transition-colors">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-col gap-2">
                    {impostorPix.status === 'error' && (
                      <p className="text-xs text-rose-400 font-bold">{impostorPix.error}</p>
                    )}
                    <button
                      onClick={() => handleImpostorPix('hint')}
                      disabled={impostorPix.status === 'loading'}
                      className="w-full px-3 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white border-b-[3px] border-rose-800 hover:brightness-110 active:border-b-0 active:translate-y-0.5 transition-all disabled:opacity-50"
                    >
                      {impostorPix.status === 'loading' && impostorPix.type === 'hint'
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : '🔍'}
                      Receber dica — R$ 1,00
                    </button>
                    <button
                      onClick={() => handleImpostorPix('reveal')}
                      disabled={impostorPix.status === 'loading'}
                      className="w-full px-3 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-b-[3px] border-yellow-800 hover:brightness-110 active:border-b-0 active:translate-y-0.5 transition-all disabled:opacity-50"
                    >
                      {impostorPix.status === 'loading' && impostorPix.type === 'reveal'
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : '👑'}
                      Ver a palavra secreta — R$ 3,00
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      
      case 'palavras':
        return (
          <div className="text-center p-4 bg-rose-500/5 rounded-2xl border-2 border-rose-500/20">
            <p className="text-slate-300 text-sm font-medium leading-relaxed">
              Você não sabe o local! Tente descobrir através das dicas.
            </p>
          </div>
        );
      
      case 'duasFaccoes':
        return (
          <div className="text-center p-4 bg-rose-500/5 rounded-2xl border-2 border-rose-500/20">
            <p className="text-slate-300 text-sm font-medium leading-relaxed">
              Duas palavras no jogo! Você não sabe nenhuma.
            </p>
          </div>
        );
      
      case 'categoriaItem':
        return (
          <div className="space-y-3 text-center p-4 bg-rose-500/5 rounded-2xl border-2 border-rose-500/20">
            <div className="space-y-2">
              <p className="text-rose-400 text-xs uppercase tracking-[0.3em] font-bold">Categoria</p>
              <h3 className="text-xl sm:text-2xl text-white font-bold">{gameData.category}</h3>
            </div>
            <p className="text-slate-400 text-sm">
              Você só sabe a categoria! Descubra o item.
            </p>
          </div>
        );
      
      case 'palavraComunidade':
        return (
          <div className="text-center p-4 bg-rose-500/5 rounded-2xl border-2 border-rose-500/20">
            <p className="text-slate-300 text-sm font-medium leading-relaxed">
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
            playerMap={speakingOrderPlayerMap}
            userId={user?.uid || ''}
            isHost={isHost}
            onStartVoting={handleStartVoting}
            onSubmitVote={handleSubmitVote}
            isSubmitting={isSubmittingVote}
            onNewRound={handleNewRound}
          />
        );

      case 'VOTING':
        const selectedVotePlayer = activePlayers.find(player => player.uid === selectedVote);
        return (
          <div className="animate-stage-fade-in w-full space-y-5">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border-2 border-orange-500/30 flex items-center justify-center mx-auto">
                <Vote className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-1">
                  Hora de Votar!
                </h3>
                <p className="text-slate-400 text-sm">Quem você acha que é o impostor?</p>
              </div>
            </div>
            
            <div className="mx-auto max-w-xl rounded-3xl border border-orange-400/25 bg-orange-500/5 p-6 text-center">
              {selectedVotePlayer ? <><CharacterFaceAvatar player={selectedVotePlayer} className="mx-auto h-24 w-24 rounded-2xl" imageClassName="h-40"/><p className="mt-4 text-sm font-bold text-slate-400">Seu voto está selecionado em</p><h4 className="mt-1 text-3xl font-black text-white">{selectedVotePlayer.name}</h4><Button onClick={() => handleSubmitVote(selectedVotePlayer.uid)} disabled={isSubmittingVote} className="mt-6 h-14 w-full rounded-2xl border-b-4 border-orange-900 bg-orange-500 text-lg font-black text-white hover:bg-orange-400" data-testid="button-confirm-vote"><Vote className="mr-2 h-5 w-5"/>{isSubmittingVote ? "CONFIRMANDO..." : `CONFIRMAR VOTO EM ${selectedVotePlayer.name.toUpperCase()}?`}</Button></> : <><Vote className="mx-auto h-12 w-12 text-orange-300"/><h4 className="mt-4 text-xl font-black text-white"><span className="lg:hidden">Selecione um jogador na lista abaixo</span><span className="hidden lg:inline">Selecione um jogador na coluna esquerda</span></h4><p className="mt-2 text-sm text-slate-400">Depois, confirme seu voto aqui.</p></>}
            </div>
          </div>
        );

      case 'VOTING_FEEDBACK':
        const myVote = votes.find(v => v.playerId === user?.uid);
        const totalPlayers = activePlayers.length;
        const votedCount = votes.length;
        const allVoted = votedCount >= totalPlayers;

        return (
          <div className="animate-stage-fade-in w-full space-y-5">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-emerald-400 uppercase tracking-wider mb-2">
                  Voto Enviado!
                </h3>
                <p className="text-white text-base">
                  Você votou em: <span className="text-orange-400 font-bold">{myVote?.targetName}</span>
                </p>
              </div>
            </div>
            
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-slate-600/30 to-transparent"></div>
            
            <div className="space-y-4 p-4 bg-slate-700/20 rounded-2xl border border-slate-600/30">
              <div className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <p className="text-white text-base font-medium">
                  <span className="text-blue-400 font-bold">{votedCount}</span> de <span className="font-bold">{totalPlayers}</span> votaram
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {activePlayers.map(player => {
                  const hasVoted = votes.some(v => v.playerId === player.uid);
                  return (
                    <div 
                      key={player.uid}
                      className={cn(
                        "px-2.5 py-1.5 rounded-xl text-sm font-medium transition-all inline-flex items-center gap-2",
                        hasVoted 
                          ? "bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/40"
                          : "bg-slate-700/50 text-slate-400 border-2 border-slate-600/30"
                      )}
                    >
                      <CharacterFaceAvatar player={player} className="h-8 w-8 rounded-lg" imageClassName="h-12" />
                      {hasVoted && <Check className="w-3 h-3" />}
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
        // Support multiple impostors
        const resultImpostorIds = gameData?.impostorIds || [];
        const resultAllImpostorIds = resultImpostorIds.length > 0 ? resultImpostorIds : (room.impostorId ? [room.impostorId] : []);
        const resultImpostorPlayers = activePlayers.filter(p => resultAllImpostorIds.includes(p.uid));
        const resultVotesForImpostors = votes.filter(v => resultAllImpostorIds.includes(v.targetId)).length;
        const crewWins = resultVotesForImpostors > activePlayers.length / 2;

        return (
          <div className="animate-stage-fade-in w-full space-y-6">
            <div className="text-center space-y-4">
              <div className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-2xl border-4",
                crewWins 
                  ? "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400/50" 
                  : "bg-gradient-to-br from-rose-500 to-rose-600 border-rose-400/50"
              )}>
                {crewWins ? (
                  <Trophy className="w-10 h-10 text-white" />
                ) : (
                  <Skull className="w-10 h-10 text-white" />
                )}
              </div>
              
              <div>
                <h2 className={cn(
                  "text-3xl font-black uppercase tracking-wider mb-2",
                  crewWins ? "text-emerald-400" : "text-rose-400"
                )}>
                  {crewWins ? "Tripulação Venceu!" : (resultImpostorPlayers.length > 1 ? "Impostores Venceram!" : "Impostor Venceu!")}
                </h2>
                
                {/* Impostor sees the secret word; crew sees who the impostor was */}
                {isImpostor && gameData?.word && (
                  <div className="mt-2 mb-1 px-4 py-3 rounded-xl bg-purple-500/20 border-2 border-purple-500/40">
                    <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">A palavra secreta era:</p>
                    <p className="text-white text-2xl font-black">{gameData.word}</p>
                  </div>
                )}

                <p className="mt-3 text-sm text-slate-400">
                  Confira os votos e {resultImpostorPlayers.length > 1 ? "os impostores" : "o impostor"} na lista de jogadores.
                </p>
              </div>
            </div>
            
            <div className="hidden lg:block"><ResultAd /></div>

            {isHost && (
              <Button 
                onClick={handleNewRound}
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold text-sm rounded-2xl shadow-lg border-2 border-purple-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                data-testid="button-new-round"
              >
                <RotateCcw className="mr-2 w-5 h-5" /> Nova Rodada
              </Button>
            )}
          </div>
        );

      case 'WORD_REVEAL':
      default:
        return (
          <div className="animate-stage-fade-in w-full space-y-3">
            {isHost ? (
              <>
                <Button 
                  onClick={handleStartVoting}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-2xl text-sm shadow-lg border-2 border-orange-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  data-testid="button-start-voting"
                >
                  <Vote className="mr-2 w-5 h-5" /> Iniciar Votação
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-700/50 border border-slate-600/30">
                  <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
                  <p className="text-slate-300 text-sm font-medium">
                    Aguardando o host iniciar a votação...
                  </p>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  const occupiedCharacterIndexes = Array.from(new Set(room.players.map((player, index) => normalizeLobbyCharacterIndex(player.characterIndex ?? index))));
  const sidebarImpostorIds = gameData?.impostorIds?.length
    ? gameData.impostorIds
    : (room.impostorId ? [room.impostorId] : []);
  const mobileRoleLabel = isImpostor
    ? (unlockedWord ? 'Palavra revelada' : unlockedHint ? 'Dica desbloqueada' : 'Sua missão')
    : gameMode === 'palavras' ? 'Local e função' : gameMode === 'duasFaccoes' ? 'Sua facção' : gameMode === 'categoriaItem' ? 'Categoria e item' : 'Palavra secreta';
  const mobileRoleValue = (() => {
    if (!gameData) return 'Preparando informações...';
    if (isImpostor) {
      if (unlockedWord) return unlockedWord;
      if (unlockedHint) return unlockedHint;
      const hintsEnabled = gameData.gameConfig?.enableHints === true;
      const firstOnly = gameData.gameConfig?.firstPlayerHintOnly === true;
      const canSeeHint = hintsEnabled && (!firstOnly || speakingOrder?.[0] === user?.uid);
      return canSeeHint && gameData.hint ? gameData.hint : 'Finja que sabe a palavra';
    }
    if (gameMode === 'palavras') return `${gameData.location || 'Local'} • ${user?.uid ? gameData.roles?.[user.uid] || 'Função' : 'Função'}`;
    if (gameMode === 'duasFaccoes') return user?.uid ? gameData.factionMap?.[user.uid] || 'Descubra sua facção' : 'Descubra sua facção';
    if (gameMode === 'categoriaItem') return `${gameData.category || 'Categoria'} • ${gameData.item || 'Item'}`;
    return gameData.word || 'Aguardando palavra...';
  })();

  return (
    <>
    <div className="fixed inset-0 z-[40] flex h-[100dvh] flex-col overflow-hidden bg-[#080f20] px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-[max(.5rem,env(safe-area-inset-top))] lg:hidden">
      <header className="flex h-10 shrink-0 items-center justify-between gap-2">
        <button type="button" onClick={handleBackToLobby} className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 text-[11px] font-black text-slate-200"><ArrowLeft className="h-4 w-4"/>Lobby</button>
        <div className="text-center"><p className="text-[8px] font-black uppercase tracking-[.18em] text-slate-500">Sala</p><strong className="text-sm tracking-[.18em] text-amber-300">{room.code}</strong></div>
        <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black text-emerald-300">{activePlayers.length}/{room.players.length}</span>
      </header>

      <button type="button" onClick={() => setIsRevealed(!isRevealed)} className={cn("mt-2 shrink-0 rounded-2xl border bg-gradient-to-br from-[#17213b] to-[#10182d] px-3 py-2 text-left", isImpostor ? "border-rose-500/35" : "border-emerald-500/35")}>
        {isRevealed ? <div className="flex min-w-0 items-center gap-2.5">
          <div className={cn("h-10 w-10 shrink-0 overflow-hidden rounded-lg border", isImpostor ? "border-rose-500/50" : "border-emerald-500/50")}><img src={isImpostor ? impostorImg : tripulanteImg} alt="" className="h-full w-full object-cover"/></div>
          <div className="min-w-0 flex-1"><p className={cn("text-xs font-black uppercase tracking-wider", isImpostor ? "text-rose-300" : "text-emerald-300")}>{isImpostor ? 'Impostor' : 'Tripulante'}</p><p className="mt-1 text-[8px] font-black uppercase tracking-[.22em] text-slate-500">{mobileRoleLabel}</p><p className="mt-0.5 truncate text-base font-black leading-tight text-white">{mobileRoleValue}</p></div>
          <EyeOff className="h-4 w-4 shrink-0 text-slate-500"/>
        </div> : <div className="flex h-10 items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-violet-300"><Eye className="h-4 w-4"/>Toque para revelar</div>}
      </button>

      <main className="mt-2 min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-700/80 bg-[#111a31] px-3 py-2 [&_.space-y-6]:space-y-2 [&_.space-y-5]:space-y-2 [&_.space-y-4]:space-y-2 [&_.py-4]:py-1 [&_.p-6]:p-3 [&_.h-20]:h-12 [&_.w-20]:w-12 [&_.h-16]:h-11 [&_.w-16]:w-11 [&_.text-3xl]:text-xl [&_.text-2xl]:text-lg">
        <div className="mx-auto flex h-full w-full max-w-xl flex-col justify-center">{renderStageContent()}</div>
      </main>

      <div className="mt-2 grid shrink-0 grid-cols-5 gap-1.5 rounded-2xl border border-slate-700/70 bg-[#0d1529] p-1.5">
        {room.players.slice(0, 10).map((player, index) => {
          const isCurrentUser = player.uid === user?.uid;
          const isWaiting = !!player.waitingForGame;
          const speakingPosition = speakingOrder?.indexOf(player.uid) ?? -1;
          const votesReceived = votes.filter(vote => vote.targetId === player.uid).length;
          const isResultImpostor = currentStage === 'ROUND_RESULT' && sidebarImpostorIds.includes(player.uid);
          const canSelectVote = currentStage === 'VOTING' && !isCurrentUser && !isWaiting;
          return <button type="button" key={player.uid} onClick={() => canSelectVote && setSelectedVote(player.uid)} disabled={!canSelectVote} className={cn("relative flex min-w-0 flex-col items-center rounded-xl border px-1 py-1.5", isCurrentUser ? "border-violet-400 bg-violet-500/10" : "border-slate-700 bg-[#111c32]", canSelectVote && "active:scale-95", selectedVote === player.uid && "border-orange-400 bg-orange-500/20", isResultImpostor && "border-rose-400 bg-rose-500/15")}>
            <CharacterFaceAvatar player={{ ...player, characterIndex: player.characterIndex ?? index }} className="h-8 w-8 rounded-lg" imageClassName="h-14"/>
            <strong className="mt-0.5 w-full truncate text-center text-[8px] leading-tight text-slate-200">{player.name}</strong>
            <span className={cn("absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full px-0.5 text-[7px] font-black", currentStage === 'ROUND_RESULT' ? "bg-orange-500 text-white" : speakingPosition >= 0 ? "bg-violet-500 text-white" : isWaiting ? "bg-amber-400 text-black" : "bg-emerald-400 text-emerald-950")}>{currentStage === 'ROUND_RESULT' ? votesReceived : speakingPosition >= 0 ? speakingPosition + 1 : '•'}</span>
            {isResultImpostor && <Skull className="absolute bottom-0.5 left-0.5 h-3 w-3 text-rose-300"/>}
          </button>;
        })}
      </div>
    </div>

    <div className="hidden w-full max-w-[1480px] min-h-full px-4 py-5 sm:px-6 lg:block lg:px-8 lg:py-8 animate-fade-in relative z-10">
      {/* Elementos decorativos de fundo */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600/15 rounded-full blur-[110px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-600/15 rounded-full blur-[110px]"></div>
      </div>

      <div className="relative z-10 grid items-stretch gap-5 lg:grid-cols-[350px_minmax(0,1fr)]">
        <aside className="flex flex-col rounded-[1.75rem] border border-slate-700/80 bg-[#0d1529]/95 p-4 shadow-[0_24px_70px_rgba(0,0,0,.32)] sm:p-5">
          <GameNavButtons onBackToLobby={handleBackToLobby} isImpostor={isImpostor} />

          <div className="mt-6 flex items-center justify-between px-1">
            <div><p className="text-[11px] font-black uppercase tracking-[.18em] text-slate-500">Sala {room.code}</p><h2 className="mt-1 text-sm font-black uppercase tracking-[.12em] text-slate-300">Jogadores</h2></div>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-sm font-black text-emerald-300">{activePlayers.length} / {room.players.length}</span>
          </div>

          <div className="mt-4 space-y-2.5">
            {room.players.map((player, index) => {
              const isCurrentUser = player.uid === user?.uid;
              const isCaptain = player.uid === room.hostId;
              const isWaiting = !!player.waitingForGame;
              const speakingPosition = speakingOrder?.indexOf(player.uid) ?? -1;
              const votesReceived = votes.filter(vote => vote.targetId === player.uid).length;
              const isResultImpostor = currentStage === 'ROUND_RESULT' && sidebarImpostorIds.includes(player.uid);
              return (
                <button type="button" key={player.uid} onClick={() => currentStage === 'VOTING' && player.uid !== user?.uid && setSelectedVote(player.uid)} disabled={currentStage !== 'VOTING' || player.uid === user?.uid || isWaiting} className={cn("flex w-full min-w-0 items-center gap-3 rounded-2xl border p-3 text-left transition", isCurrentUser ? "border-violet-400/45 bg-violet-500/10" : "border-slate-700/70 bg-[#111c32]", isResultImpostor && "border-rose-400/55 bg-rose-500/10", isWaiting && "opacity-55", currentStage === 'VOTING' && !isCurrentUser && !isWaiting && "cursor-pointer hover:border-orange-400/60 hover:bg-orange-500/10", selectedVote === player.uid && "border-orange-400 bg-orange-500/15 shadow-[0_0_20px_rgba(249,115,22,.14)]")} data-testid={`vote-sidebar-${player.uid}`}>
                  <div className="relative"><CharacterFaceAvatar player={{ ...player, characterIndex: player.characterIndex ?? index }} className="h-14 w-14 rounded-xl" imageClassName="h-24" /><span className={cn("absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#111c32]", isWaiting ? "bg-amber-400" : "bg-emerald-400")} /></div>
                  <div className="min-w-0 flex-1">
                    {isCaptain && <span className="mb-1 inline-flex items-center gap-1 rounded-md bg-violet-500/15 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-violet-300"><Crown className="h-3 w-3"/> Capitão</span>}
                    <div className="flex min-w-0 flex-wrap items-center gap-2"><strong className="truncate text-sm text-slate-100">{player.name}</strong>{isCurrentUser && <span className="rounded bg-violet-600 px-1.5 py-0.5 text-[9px] font-black uppercase">Você</span>}{isResultImpostor && <span className="inline-flex items-center gap-1 rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-rose-200"><Skull className="h-3 w-3"/>Impostor</span>}</div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase", isWaiting ? "border-amber-400/20 bg-amber-400/10 text-amber-300" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300")}><Check className="h-3 w-3"/>{isWaiting ? "Aguardando" : "Pronto"}</span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/5 px-2 py-0.5 text-[9px] font-black text-amber-300"><Trophy className="h-3 w-3"/>{player.impostorWins ?? 0}</span>
                    </div>
                  </div>
                  {currentStage === 'ROUND_RESULT' ? <span className="grid min-w-10 place-items-center rounded-xl border border-orange-400/30 bg-orange-500/10 px-2 py-1 text-center"><strong className="text-lg text-orange-300">{votesReceived}</strong><small className="text-[8px] font-black uppercase text-slate-500">votos</small></span> : speakingPosition >= 0 ? <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-400/35 bg-violet-500/15 font-black text-violet-200">{speakingPosition + 1}º</span> : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-700 bg-slate-900 text-slate-600">—</span>}
                  {currentStage === 'VOTING' && selectedVote === player.uid && <Check className="h-5 w-5 shrink-0 text-orange-300"/>}
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-700/70 bg-slate-950/25 p-3">
            <p className="text-[9px] font-black uppercase tracking-[.16em] text-slate-500">Ocupados (bloqueados)</p>
            <div className="mt-3 flex flex-wrap gap-2">{occupiedCharacterIndexes.map(index => <div key={index} className="relative"><CharacterFaceAvatar player={{ name: 'Ocupado', characterIndex: index }} className="h-10 w-10 rounded-lg grayscale opacity-45" imageClassName="h-16"/><span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded bg-slate-950/90 px-1 text-[7px] font-black uppercase text-slate-500">Ocupado</span></div>)}</div>
          </div>

          {isHost && <Button onClick={handleNewRound} variant="ghost" className="mt-5 h-12 w-full rounded-xl border border-slate-700 bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-white" data-testid="button-return-lobby"><ArrowLeft className="mr-2 h-4 w-4"/> Nova Rodada</Button>}
        </aside>

        <section className="flex min-h-[720px] flex-col rounded-[1.75rem] border border-slate-700/80 bg-[#111a31]/95 p-4 shadow-[0_24px_70px_rgba(0,0,0,.32)] sm:p-6 lg:p-8">
        <div 
          className={cn("w-full rounded-[1.5rem] flex flex-col items-center text-center relative transition-all duration-300 cursor-pointer bg-gradient-to-br from-[#17213b] to-[#10182d] border border-slate-700/80 hover:border-slate-600 shadow-lg", compactRoleCard ? "p-3 sm:p-4" : "p-5 sm:p-6")}
          onClick={() => setIsRevealed(!isRevealed)}
          data-testid="card-reveal"
        >
          {isRevealed ? (
            <div className="flex flex-col items-center gap-4 animate-fade-in w-full">
              <div className="flex items-center gap-4 sm:gap-6 w-full">
                <div 
                  className={cn(
                    compactRoleCard ? "w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-lg border-2" : "w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden flex-shrink-0 shadow-xl border-2",
                    isImpostor ? "border-rose-500/50 bg-rose-500/10" : "border-emerald-500/50 bg-emerald-500/10"
                  )}
                >
                  <img 
                    src={isImpostor ? impostorImg : tripulanteImg} 
                    alt={isImpostor ? "Impostor" : "Tripulante"}
                    className="w-full h-auto"
                    style={{ transform: 'scale(1.5) translateY(18%)' }}
                  />
                </div>
                <div className="text-left flex-1">
                  <h2 
                    className={cn(
                      compactRoleCard ? "text-lg sm:text-2xl font-black tracking-wider uppercase" : "text-2xl sm:text-4xl font-black tracking-wider uppercase",
                      isImpostor ? "text-rose-400" : "text-emerald-400"
                    )}
                    data-testid={isImpostor ? "text-role-impostor" : "text-role-crew"}
                  >
                    {isImpostor ? "IMPOSTOR" : "TRIPULANTE"}
                  </h2>
                  <p className={cn("text-slate-400 mt-1", compactRoleCard ? "text-xs sm:text-sm" : "text-sm sm:text-lg")}>
                    {isImpostor ? "Engane todos!" : "Descubra o impostor!"}
                  </p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsRevealed(false); }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-slate-700/50 hover:bg-slate-600/50 border-2 border-slate-600/30"
                  data-testid="button-hide-role"
                >
                  <EyeOff className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className={cn("w-full", compactRoleCard ? "mt-2 [&>div]:p-2 [&_h2]:text-xl [&_h3]:text-lg" : "mt-2 sm:mt-4")}>
                {isImpostor ? renderImpostorContent() : renderCrewContent()}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center">
                <Eye className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                Toque para Revelar
              </h3>
              <p className="text-slate-400 text-sm">Descubra seu papel no jogo</p>
            </div>
          )}
        </div>

        <div className="my-6 w-full h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent"></div>

        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center">{renderStageContent()}</div>
        </section>
      </div>

    </div>
    </>
  );
};

const VotingPlayerList = ({ 
  activePlayers, 
  userId, 
  onSubmitVote, 
  isSubmitting 
}: { 
  activePlayers: GamePlayer[];
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
            <CharacterFaceAvatar
              player={player}
              className={cn(
                "h-11 w-11 rounded-xl",
                selectedVote === player.uid ? "border-[#e9c46a]" : "border-white/10"
              )}
              imageClassName="h-16"
            />
            <span className="min-w-0 truncate font-bold text-sm">{player.name}</span>
            <span className="ml-auto shrink-0 rounded-lg border border-amber-300/20 bg-amber-400/10 px-2 py-0.5 text-xs font-black text-amber-200 inline-flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5" />
              {player.impostorWins ?? 0}
            </span>
            {selectedVote === player.uid && (
              <Check className="w-4 h-4 shrink-0" />
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


function ImpostorGameInner({ showSupportContent = false }: { showSupportContent?: boolean }) {
  const { status, user, room } = useGameStore();
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const { showIntermission: showNewRoundAd, intermissionScreen: newRoundIntermission } = useGameIntermission();

  useEffect(() => {
    return useGameStore.subscribe((state, prevState) => {
      if (prevState.status === 'playing' && state.status === 'lobby') {
        const isHost = state.room?.hostId === state.user?.uid;
        if (!isHost) {
          showNewRoundAd(() => {});
        }
      }
    });
  }, []);

  if (status === 'home') {
    return (
      <>
        <NotificationCenter />
        <HomeScreen showSupportContent={showSupportContent} />
        <AnchorMobileAd />
      </>
    );
  }

  if (newRoundIntermission) return newRoundIntermission;

  return (
    <div 
      className={cn("min-h-screen w-full flex justify-center font-poppins text-white relative", status === 'playing' ? "items-start overflow-y-auto" : "items-center overflow-hidden")}
      style={{
        backgroundColor: '#1C202C'
      }}
    >
      <NotificationCenter />
      
      <TopRightButtons onDonateClick={() => setIsDonationOpen(true)} />
      <DonationModal isOpen={isDonationOpen} onClose={() => setIsDonationOpen(false)} />

      {status === 'lobby' && <LobbyScreen />}
      {status === 'modeSelect' && <ModeSelectScreen />}
      {status === 'submodeSelect' && <PalavraSuperSecretaSubmodeScreen />}
      {status === 'playing' && <GameScreen />}
      <AnchorMobileAd />
    </div>
  );
}

// VoiceChatProvider (and agora-rtc-sdk-ng) is scoped here so it's only
// loaded when this page chunk is parsed, not on the initial app bootstrap.
export default function ImpostorGame({ showSupportContent = false }: any) {
  return (
    <VoiceChatProvider>
      <ImpostorGameInner showSupportContent={showSupportContent} />
    </VoiceChatProvider>
  );
}
