import { useState, useEffect, useRef } from 'react';
import { useRCGameStore } from '@/lib/rcGameStore';
import { notifyGameEnded } from '@/hooks/useFeedback';

import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Loader2, Copy, Users, Crown, LogOut, Play, Send, Clock, Trophy, X, Settings, Sparkles, Star, ArrowLeft, Home, UserX, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameIntermission } from '@/components/GameIntermission';
import { GameIdentityLayout } from '@/components/GameIdentityLayout';
const sincroniaLogo = "/sincronia-logo.webp";
import jogosCover from '@/assets/jogos_cover.png';
import animesCover from '@/assets/submode-animes.png';
import marvelCover from '@/assets/submode-marvel.png';
import desenhoAnimadoCover from '@/assets/cover-desenho-animado.jpg';



// ── HomeScreen (standalone page — redirects from /respostas-em-comum) ──

const RCHomeScreen = () => {
  // If user lands directly on /respostas-em-comum, show a minimal home
  // The main entry point is the card on the Impostor home feed
  const { setUser, createRoom, joinRoom, isLoading, loadSavedNickname, saveNickname } = useRCGameStore();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [saveNick, setSaveNick] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = loadSavedNickname();
    if (saved) { setName(saved); setSaveNick(true); }
  }, [loadSavedNickname]);

  const handleCreate = () => {
    if (!name.trim()) { toast({ title: 'Nome necessário', description: 'Digite seu nome.', variant: 'destructive' }); return; }
    if (saveNick) saveNickname(name);
    setUser(name);
    createRoom();
  };

  const handleJoin = async () => {
    if (!name.trim()) { toast({ title: 'Nome necessário', description: 'Digite seu nome.', variant: 'destructive' }); return; }
    if (!code.trim()) { toast({ title: 'Código inválido', description: 'Digite o código da sala.', variant: 'destructive' }); return; }
    if (saveNick) saveNickname(name);
    setUser(name);
    const ok = await joinRoom(code.toUpperCase());
    if (!ok) toast({ title: 'Erro', description: 'Sala não encontrada.', variant: 'destructive' });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#1a1b2e] px-4">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-teal-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="bg-[#242642] rounded-[3rem] p-6 md:p-10 shadow-2xl border-4 border-[#2f3252] w-[90%] max-w-md animate-fade-in z-10">
        {/* Logo */}
        <div className="flex justify-center mb-3">
          <img
            src={sincroniaLogo}
            alt="Logo Sincronia - Respostas em Comum - TikJogos"
            width={575} height={133}
            className="h-28 md:h-36 object-contain"
          />
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Seu nickname"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={20}
            className="input-dark"
          />

          <button
            onClick={handleCreate}
            disabled={isLoading}
            className="w-full px-8 py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl bg-gradient-to-r from-orange-500 to-amber-500 border-orange-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 size={28} className="animate-spin" /> : <Play size={28} className="animate-bounce" />}
            CRIAR SALA
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-[#4a6a8a]" />
            <span className="text-[#8aa0b0] text-sm font-bold">OU</span>
            <div className="flex-1 h-px bg-[#4a6a8a]" />
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="CÓDIGO"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={3}
              className="input-code flex-1"
            />
            <button
              onClick={handleJoin}
              disabled={isLoading}
              className="px-6 py-4 rounded-2xl font-black text-lg tracking-wide flex items-center justify-center gap-2 transition-all duration-300 border-b-[6px] shadow-2xl bg-gradient-to-r from-green-500 to-emerald-500 border-green-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2 disabled:opacity-50 whitespace-nowrap"
            >
              ENTRAR
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer px-1">
            <input type="checkbox" checked={saveNick} onChange={e => setSaveNick(e.target.checked)} className="w-4 h-4 rounded bg-[#1a2a3a] border-2 border-[#4a6a8a] cursor-pointer accent-[#e8a045]" />
            <span className="text-sm text-[#8aa0b0]">Guardar nickname</span>
          </label>
        </div>
      </div>
    </div>
  );
};

// ── Theme data for selection cards ──────────────────────────────────────

interface RCThemeCard {
  id: string;
  name: string;
  emoji: string;
  description: string;
  questionCount: number;
  cover?: string;
  isRecommended?: boolean;
}

const RC_THEME_CARDS: RCThemeCard[] = [
  { id: 'classico', name: 'Clássico', emoji: '🎲', description: 'Perguntas clássicas sobre cotidiano, cultura e nostalgia', questionCount: 190, isRecommended: true, cover: 'https://images.tcdn.com.br/img/editor/up/702656/blogdicasondeguardarmiudezascasa.jpg' },
  { id: 'animes', name: 'Animes', emoji: '⚔️', description: 'Perguntas sobre personagens e universos de anime', questionCount: 30, cover: animesCover },
  { id: 'marvel', name: 'Marvel', emoji: '🦸', description: 'Perguntas sobre heróis e vilões da Marvel', questionCount: 30, cover: marvelCover },
  { id: 'jogos', name: 'Jogos', emoji: '🎮', description: 'Perguntas sobre games e personagens', questionCount: 30, cover: jogosCover },
  { id: 'desenho_animado', name: 'Desenho Animado', emoji: '🎬', description: 'Personagens icônicos dos desenhos animados', questionCount: 30, cover: desenhoAnimadoCover },
];

// ── ThemeSelectScreen ──────────────────────────────────────────────────

const RCThemeSelectScreen = () => {
  const { room, user, selectTheme } = useRCGameStore();

  if (!room || !user) return null;

  // Back to lobby without changing theme
  const goBackToLobby = () => {
    useRCGameStore.setState({ phase: 'lobby' });
  };

  const players = room.players || [];

  return (
    <GameIdentityLayout players={players} userId={user.uid} hostId={room.hostId}>
      <div className="flex items-center justify-between gap-4 border-b border-slate-700/70 pb-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-emerald-300">Sala {room.code}</p>
          <h1 className="mt-1 text-2xl font-black text-white sm:text-4xl">Escolha o tema</h1>
        </div>
        <button onClick={goBackToLobby} className="tj-secondary-btn inline-flex items-center gap-2 px-4 py-3">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
      </div>

      <div className="mt-6 grid flex-1 grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
        {RC_THEME_CARDS.map((theme) => (
          <button
            key={theme.id}
            onClick={() => selectTheme(theme.id)}
            className="tj-player-card group relative overflow-hidden text-left transition hover:-translate-y-1 hover:border-emerald-400/60"
          >
            {theme.cover && (
              <div className="h-28 overflow-hidden border-b border-slate-700/80">
                <img src={theme.cover} alt={theme.name} className="h-full w-full object-cover opacity-65 transition group-hover:scale-105 group-hover:opacity-90" />
              </div>
            )}
            <div className="flex items-start gap-4 p-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-400/15 text-3xl">{theme.emoji}</div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-black text-white">{theme.name}</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{theme.description}</p>
                <p className="mt-3 flex items-center gap-1 text-[11px] font-black uppercase tracking-wide text-emerald-300"><Sparkles className="h-3.5 w-3.5" /> {theme.questionCount} perguntas</p>
              </div>
              <Play className="mt-2 h-5 w-5 fill-emerald-300 text-emerald-300 opacity-0 transition group-hover:opacity-100" />
            </div>
            {theme.isRecommended && <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-2.5 py-1 text-[10px] font-black uppercase text-white"><Star className="mr-1 inline h-3 w-3 fill-current" /> Recomendado</span>}
          </button>
        ))}
      </div>
    </GameIdentityLayout>
  );

  /* Layout legado mantido temporariamente abaixo; o fluxo usa o painel unificado acima. */
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#1a1b2e] px-4 py-6">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-600/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative bg-[#242642] rounded-[3rem] p-6 md:p-8 shadow-2xl border-4 border-[#2f3252] w-full max-w-3xl max-h-[90vh] overflow-hidden animate-fade-in flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goBackToLobby}
            className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all border-b-3 border-slate-950 active:border-b-0 active:translate-y-1 text-slate-400 hover:text-white"
            title="Voltar ao lobby"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl border-2 border-emerald-500/20">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white">
                Selecione o Tema
              </h2>
              <p className="text-xs text-gray-400">Sala: {room.code}</p>
            </div>
          </div>
          <div className="w-9" />
        </div>

        {/* Theme cards grid */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {RC_THEME_CARDS.map((theme) => (
              <button
                key={theme.id}
                onClick={() => selectTheme(theme.id)}
                className="relative rounded-3xl bg-slate-800 border-4 border-slate-900 hover:bg-slate-750 hover:-translate-y-1 hover:border-slate-700 transition-all duration-200 text-left shadow-lg group overflow-hidden"
              >
                {/* Cover image */}
                {theme.cover && (
                  <div className="w-full h-24 overflow-hidden">
                    <img src={theme.cover} alt={theme.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                  </div>
                )}

                <div className={cn("p-5", theme.cover && "pt-3")}>
                  <div className="flex items-start gap-4">
                    {/* Emoji icon */}
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 border-2 border-black/10 bg-gradient-to-br from-emerald-500 to-emerald-600">
                      {theme.emoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-lg text-slate-100 group-hover:text-white transition-colors mb-1">
                        {theme.name}
                      </h3>
                      <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                        {theme.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span className="font-medium">{theme.questionCount} PERGUNTAS</span>
                        </div>
                      </div>
                    </div>

                    {/* Select arrow */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-emerald-700">
                        <Play className="w-4 h-4 fill-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommended badge */}
                {theme.isRecommended && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> RECOMENDADO
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

// ── LobbyScreen ────────────────────────────────────────────────────────

const RCLobbyScreen = () => {
  const { room, user, leaveGame, startGame, kickPlayer, config, goBackToThemeSelect } = useRCGameStore();
  const { toast } = useToast();

  if (!room || !user) return null;
  const isHost = room.hostId === user.uid;
  const players = room.players || [];
  const selectedTheme = RC_THEME_CARDS.find(t => t.id === (config.category || 'classico'));

  const copyLink = () => {
    const shareLink = `${window.location.origin}/sala/${room.code}`;
    navigator.clipboard.writeText(shareLink);
    toast({ title: 'Copiado!', description: 'Link da sala copiado para a área de transferência.' });
  };

  const handleStart = () => {
    if (players.length < 2) {
      toast({ title: 'Mínimo 2 jogadores', description: 'Aguarde mais jogadores entrarem.', variant: 'destructive' });
      return;
    }
    if (!config.category) {
      toast({ title: 'Escolha um tema', description: 'Selecione um tema antes de iniciar.', variant: 'destructive' });
      return;
    }
    startGame({ mode: config.mode || 'classico', rounds: 10, timePerRound: 30, category: config.category });
  };

  return <GameIdentityLayout players={players} userId={user.uid} hostId={room.hostId} detail={(player) => <p className="mt-1 text-[9px] font-black uppercase text-emerald-300">{player.connected === false ? 'Desconectado' : `Pronto · ${player.score ?? 0} pts`}</p>}><header className="flex flex-col gap-3 border-b border-slate-700/60 pb-5 sm:flex-row sm:items-center sm:justify-between"><button onClick={copyLink} className="text-left"><p className="text-[10px] font-black uppercase tracking-[.2em] text-slate-500">Código da sala</p><div className="mt-1 flex items-center gap-3"><strong className="font-mono text-4xl font-black tracking-widest text-amber-400">{room.code}</strong><span className="rounded-xl border border-slate-700 bg-slate-900 p-2"><Copy className="h-5 w-5"/></span></div></button><button onClick={leaveGame} className="h-12 rounded-xl border border-slate-700 bg-slate-900 px-5 font-black text-slate-300"><LogOut className="mr-2 inline h-5 w-5"/>Sair da Sala</button></header><section className="flex flex-1 flex-col items-center justify-center py-8 text-center"><div className="tj-icon-box tj-icon-box--xl bg-violet-500/15 text-violet-300"><Sparkles className="h-9 w-9"/></div><img src={sincroniaLogo} alt="Sincronia" className="mt-5 h-16 object-contain sm:h-20"/><h2 className="mt-5 text-2xl font-black sm:text-3xl">Sala pronta para jogar</h2><p className="mt-2 max-w-xl text-slate-400">Pense como seus amigos e tente responder a mesma coisa.</p><div className="mt-7 w-full max-w-md space-y-3">{isHost?<><button onClick={goBackToThemeSelect} className="h-14 w-full rounded-2xl border-2 border-slate-700 bg-slate-900 font-black text-slate-200"><Sparkles className="mr-2 inline h-5 w-5"/>{config.category?`TEMA: ${selectedTheme?.name || config.category}`:'ESCOLHER TEMA'}</button><button onClick={handleStart} disabled={players.length<2||!config.category} className="h-16 w-full rounded-2xl border-b-4 border-violet-800 bg-violet-500 text-lg font-black text-white disabled:opacity-40"><Play className="mr-2 inline h-5 w-5 fill-current"/>INICIAR JOGO</button></>:<div className="tj-inset border-violet-400/35 p-5 font-black text-violet-300">Aguardando o capitão...</div>}</div></section></GameIdentityLayout>;

  /* Layout anterior preservado temporariamente para comparação. */
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#1a1b2e] px-4 py-6">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-teal-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1000ms' }} />
      </div>

      <div className="bg-[#242642] rounded-[3rem] p-6 md:p-10 shadow-2xl border-4 border-[#2f3252] relative z-10 w-[90%] max-w-2xl animate-fade-in">
        {/* Header with room code */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div onClick={copyLink} className="cursor-pointer group flex-1 text-center md:text-left">
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-2 font-bold group-hover:text-emerald-400 transition-colors">
              Código da Sala
            </p>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <h2 className="text-5xl md:text-6xl font-black tracking-widest font-mono text-emerald-500 group-hover:text-emerald-400 transition-colors" data-testid="text-room-code">
                {room.code}
              </h2>
              <div className="p-3 bg-emerald-500/10 rounded-2xl border-2 border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                <Copy className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-2 font-medium">Clique para copiar o link</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={leaveGame}
              className="p-3 bg-slate-800 rounded-2xl hover:bg-rose-500 transition-all border-b-4 border-slate-950 hover:border-rose-700 active:border-b-0 active:translate-y-1 text-slate-400 hover:text-white group"
              data-testid="button-leave-room"
            >
              <LogOut size={24} strokeWidth={3} className="group-hover:animate-pulse" />
            </button>
          </div>
        </div>

        {/* Player list */}
        <div className="flex-1 w-full mb-6 overflow-y-auto scrollbar-hide">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl border-2 border-emerald-500/20">
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-white text-lg font-black">
                Jogadores na Sala
              </h3>
              <div className="px-3 py-1 bg-emerald-500 text-white text-sm font-black rounded-full border-2 border-emerald-700">
                {players.length}
              </div>
            </div>
          </div>

          <ul className="space-y-3 pb-4">
            {players.map((p) => {
              const isMe = p.uid === user.uid;
              const isPlayerHost = p.uid === room.hostId;
              const initial = p.name.charAt(0).toUpperCase();

              return (
                <li
                  key={p.uid}
                  className={cn(
                    "relative p-4 rounded-3xl flex items-center justify-between border-4 transition-all duration-200",
                    isMe
                      ? "bg-emerald-500 border-emerald-700 shadow-[0_6px_0_0_rgba(0,0,0,0.2)]"
                      : p.connected === false
                        ? "bg-slate-900 border-slate-950 opacity-50"
                        : "bg-slate-800 border-slate-900 hover:bg-slate-750 hover:-translate-y-1 shadow-lg"
                  )}
                  data-testid={`player-${p.uid}`}
                >
                  {/* Host badge */}
                  {isPlayerHost && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full p-1.5 border-3 border-yellow-600 shadow-sm z-10">
                      <Crown size={16} fill="currentColor" />
                    </div>
                  )}

                  <div className="flex items-center gap-4 flex-1">
                    {/* Avatar */}
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black border-2 border-black/10 shrink-0",
                      isMe ? "bg-white/20 text-white" : "bg-emerald-600 text-white"
                    )}>
                      {initial}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          "font-black text-lg leading-tight",
                          isMe ? "text-white" : "text-slate-100"
                        )}>
                          {p.name}
                        </span>
                        {isMe && (
                          <span className="text-xs font-bold px-2 py-0.5 bg-white/20 text-white rounded-full border border-white/30">
                            VOCÊ
                          </span>
                        )}
                      </div>

                      {isPlayerHost && (
                        <span className="text-xs text-yellow-400 font-bold mt-1 flex items-center gap-1">
                          <Crown className="w-3 h-3" fill="currentColor" /> HOST DA SALA
                        </span>
                      )}

                      {p.connected === false && (
                        <span className="text-xs text-red-400 font-medium mt-1">
                          Desconectado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Kick button */}
                  {isHost && !isMe && (
                    <button
                      onClick={() => kickPlayer(p.uid)}
                      className="p-2 bg-slate-900 rounded-xl hover:bg-rose-500 transition-all border-b-3 border-slate-950 hover:border-rose-700 active:border-b-0 active:translate-y-1 text-slate-400 hover:text-white group ml-2"
                      data-testid={`button-kick-${p.uid}`}
                      title="Expulsar jogador"
                    >
                      <UserX className="w-5 h-5 group-hover:animate-pulse" strokeWidth={2.5} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Host actions */}
        {isHost ? (
          <div className="w-full animate-fade-in space-y-4">
            {/* Choose theme button */}
            <button
              onClick={goBackToThemeSelect}
              className={cn(
                "w-full px-8 py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl",
                "bg-gradient-to-r from-amber-500 to-orange-500 border-amber-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2"
              )}
            >
              <Sparkles size={28} className="animate-bounce" />
              {config.category
                ? `TEMA: ${selectedTheme?.emoji || ''} ${selectedTheme?.name || config.category}`.toUpperCase()
                : 'ESCOLHER TEMA'}
            </button>

            {/* Start game button */}
            <button
              onClick={handleStart}
              disabled={players.length < 2 || !config.category}
              className={cn(
                "w-full px-8 py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl",
                players.length >= 2 && config.category
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2'
                  : 'bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed opacity-50'
              )}
              data-testid="button-start-game"
            >
              <Play size={28} className={players.length >= 2 && config.category ? 'animate-bounce fill-current' : 'fill-current'} />
              {players.length >= 2 ? (config.category ? 'INICIAR JOGO' : 'ESCOLHA UM TEMA') : 'AGUARDANDO JOGADORES'}
            </button>
            {players.length < 2 && (
              <div className="flex items-center justify-center gap-2 text-rose-400">
                <Info size={16} />
                <p className="text-sm font-bold">Mínimo de 2 jogadores para iniciar</p>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full text-center py-6 flex flex-col items-center gap-4 bg-emerald-500/10 rounded-3xl border-4 border-emerald-500/20">
            <div className="p-4 bg-emerald-500/20 rounded-2xl">
              <Crown className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <p className="text-emerald-400 font-black text-lg mb-1">Aguardando o host...</p>
              <p className="text-slate-400 text-sm font-medium">O host escolherá o tema e iniciará o jogo</p>
            </div>
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── QuestionScreen ─────────────────────────────────────────────────────

const RCQuestionScreen = () => {
  const { currentRound, totalRounds, currentQuestion, timeLeft, myAnswer, setMyAnswer, submitAnswer, hasSubmitted, answeredCount, room, user, returnToLobby } = useRCGameStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hasSubmitted && inputRef.current) inputRef.current.focus();
  }, [hasSubmitted, currentRound]);

  const handleSubmit = () => {
    if (myAnswer.trim()) submitAnswer(myAnswer.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && myAnswer.trim()) handleSubmit();
  };

  const totalPlayers = room?.players.length || 0;
  const urgentTime = timeLeft <= 5;

  if (room && user) return <GameIdentityLayout players={room.players} userId={user.uid} hostId={room.hostId} detail={(player)=><p className="mt-1 text-[9px] font-black uppercase text-emerald-300">{player.score ?? 0} pontos</p>}><header className="flex items-center justify-between border-b border-slate-700/60 pb-5"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-slate-500">Rodada {currentRound} de {totalRounds}</p><h1 className="mt-1 text-xl font-black">Sincronia</h1></div><div className={cn("rounded-full border px-4 py-2 font-black",urgentTime?"border-rose-400/40 bg-rose-500/10 text-rose-300 animate-pulse":"border-violet-400/30 bg-violet-500/10 text-violet-300")}><Clock className="mr-2 inline h-4 w-4"/>{timeLeft}s</div></header><section className="flex flex-1 flex-col items-center justify-center py-8 text-center"><div className="tj-icon-box tj-icon-box--xl bg-violet-500/15 text-violet-300"><Sparkles className="h-9 w-9"/></div><p className="mt-5 text-[10px] font-black uppercase tracking-[.2em] text-violet-300">Pense como seus amigos</p><h2 className="mt-3 max-w-3xl text-2xl font-black leading-tight sm:text-4xl">{currentQuestion}</h2><div className="mt-8 w-full max-w-xl">{!hasSubmitted?<div className="tj-inset p-5"><input ref={inputRef} value={myAnswer} onChange={e=>setMyAnswer(e.target.value)} onKeyDown={handleKeyDown} placeholder="Digite sua resposta..." maxLength={100} className="h-16 w-full rounded-xl border-2 border-slate-700 bg-slate-950 px-5 text-center text-xl font-black text-white outline-none focus:border-violet-400"/><button onClick={handleSubmit} disabled={!myAnswer.trim()} className="mt-3 h-14 w-full rounded-2xl border-b-4 border-violet-800 bg-violet-500 font-black text-white disabled:opacity-40"><Send className="mr-2 inline h-5 w-5"/>ENVIAR RESPOSTA</button></div>:<div className="tj-inset border-emerald-400/35 p-5"><CheckCircle className="mx-auto h-7 w-7 text-emerald-300"/><p className="mt-2 font-black text-emerald-300">Resposta enviada: {myAnswer}</p><p className="mt-1 text-sm text-slate-400">Aguardando jogadores ({answeredCount}/{totalPlayers})</p></div>}</div></section><button onClick={returnToLobby} className="h-12 rounded-xl border-2 border-slate-700 bg-slate-900 font-black text-slate-400"><Home className="mr-2 inline h-4 w-4"/>Voltar ao lobby</button></GameIdentityLayout>;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#1a1b2e] px-4">
      <div className="w-[90%] max-w-lg z-10">
        {/* Round + Timer header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={returnToLobby} className="p-2 bg-slate-800 rounded-xl hover:bg-blue-500 transition-all text-slate-400 hover:text-white" title="Voltar ao lobby">
              <Home size={16} />
            </button>
            <div className="px-4 py-2 rounded-xl bg-[#242642] border border-[#3d4a5c]">
              <span className="text-sm font-bold text-gray-400">Rodada </span>
              <span className="text-lg font-black text-white">{currentRound}</span>
              <span className="text-sm text-gray-500">/{totalRounds}</span>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${urgentTime ? 'bg-red-500/20 border-red-500/50 animate-pulse' : 'bg-[#242642] border-[#3d4a5c]'} border`}>
            <Clock size={16} className={urgentTime ? 'text-red-400' : 'text-emerald-400'} />
            <span className={`text-lg font-black ${urgentTime ? 'text-red-400' : 'text-white'}`}>{timeLeft}s</span>
          </div>
        </div>

        {/* Question card */}
        <div className="bg-[#242642] rounded-[2rem] p-6 md:p-8 shadow-2xl border-2 border-[#2f3252] mb-4">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🤔</div>
            <h2 className="text-xl md:text-2xl font-black text-white leading-tight">{currentQuestion}</h2>
          </div>

          {!hasSubmitted ? (
            <div className="space-y-3">
              <input
                ref={inputRef}
                type="text"
                placeholder="Digite sua resposta..."
                value={myAnswer}
                onChange={e => setMyAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={100}
                className="w-full px-5 py-4 rounded-2xl bg-[#1a2a3a] border-2 border-[#3d4a5c] text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors text-lg font-bold text-center"
                autoComplete="off"
              />
              <button
                onClick={handleSubmit}
                disabled={!myAnswer.trim()}
                className="w-full py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-b-4 border-emerald-800 hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={20} /> ENVIAR RESPOSTA
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-emerald-400 font-bold">Resposta enviada:</span>
                <span className="text-white font-black">{myAnswer}</span>
              </div>
              <div className="mt-4">
                <Loader2 size={20} className="animate-spin text-gray-500 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Aguardando outros jogadores... ({answeredCount}/{totalPlayers})</p>
              </div>
            </div>
          )}
        </div>

        {/* Tip */}
        <p className="text-center text-xs text-gray-500">Dica: pense na resposta mais óbvia!</p>
      </div>
    </div>
  );
};

// ── RoundResultScreen ──────────────────────────────────────────────────

const RCRoundResultScreen = () => {
  const { roundResult, scores, room, user, currentRound, totalRounds, nextRound, returnToLobby } = useRCGameStore();
  const { showIntermission, intermissionScreen } = useGameIntermission();
  if (!roundResult || !room || !user) return null;
  if (intermissionScreen) return intermissionScreen;

  const isHost = room.hostId === user.uid;
  const isLastRound = currentRound >= totalRounds;

  // Notify feedback system when the final round result is shown
  useEffect(() => {
    if (isLastRound) notifyGameEnded();
  }, [isLastRound]);

  // Sort players by score descending
  const sortedPlayers = [...room.players].sort((a, b) => (scores[b.uid] || 0) - (scores[a.uid] || 0));

  return <GameIdentityLayout players={sortedPlayers} userId={user.uid} hostId={room.hostId} detail={(player)=><p className="mt-1 text-[9px] font-black uppercase text-emerald-300">{scores[player.uid] || 0} pontos</p>}><header className="border-b border-slate-700/60 pb-5"><p className="text-[10px] font-black uppercase tracking-[.2em] text-slate-500">Rodada {currentRound} de {totalRounds}</p><h1 className="mt-1 text-xl font-black">Respostas em comum</h1></header><section className="flex-1 py-6"><div className="tj-inset border-violet-400/30 p-5 text-center"><Sparkles className="mx-auto h-7 w-7 text-violet-300"/><h2 className="mt-3 text-xl font-black sm:text-2xl">{roundResult.questionText}</h2></div><div className="mt-5 space-y-2.5">{roundResult.groups.map((group,index)=><article key={index} className={cn("tj-player-card p-4",group.points>0&&"is-current")}><div className="flex items-center justify-between gap-3"><strong className="text-lg uppercase text-white">{group.original[0]}</strong><span className={cn("rounded-full px-3 py-1 text-[10px] font-black uppercase",group.points>0?"bg-emerald-400/15 text-emerald-300":"bg-slate-800 text-slate-500")}>{group.players.length} iguais · {group.points>0?'+1 ponto':'0 pontos'}</span></div><div className="mt-2 flex flex-wrap gap-2">{group.players.map(player=><span key={player.uid} className={cn("rounded-lg bg-slate-950/60 px-2 py-1 text-xs font-bold text-slate-400",player.uid===user.uid&&"text-violet-300")}>{player.name}</span>)}</div></article>)}</div></section>{isHost?<button onClick={()=>showIntermission(nextRound)} className="h-16 rounded-2xl border-b-4 border-violet-800 bg-violet-500 text-lg font-black text-white">{isLastRound?'VER RESULTADO FINAL':'PRÓXIMA RODADA'} <Play className="ml-2 inline h-5 w-5 fill-current"/></button>:<div className="tj-inset py-5 text-center font-bold text-slate-400">Aguardando o capitão...</div>}</GameIdentityLayout>;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#1a1b2e] px-4 py-8">
      <div className="w-[90%] max-w-lg z-10">
        {/* Header with lobby button */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={returnToLobby} className="p-2 bg-slate-800 rounded-xl hover:bg-blue-500 transition-all text-slate-400 hover:text-white" title="Voltar ao lobby">
            <Home size={16} />
          </button>
          <div className="text-center flex-1">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Rodada {currentRound}/{totalRounds}</span>
            <h2 className="text-lg font-bold text-gray-300 mt-1">{roundResult.questionText}</h2>
          </div>
          <div className="w-9" />
        </div>

        {/* Answer groups */}
        <div className="space-y-3 mb-6">
          {roundResult.groups.map((g, i) => (
            <div key={i} className={`p-4 rounded-xl border ${g.points > 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/5 border-red-500/20'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-white text-lg uppercase">{g.original[0]}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${g.points > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {g.players.length} {g.players.length === 1 ? 'pessoa' : 'pessoas'} → {g.points > 0 ? '+1 pt' : '0 pts'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {g.players.map(p => (
                  <span key={p.uid} className={`px-2 py-0.5 rounded-lg text-xs font-bold ${p.uid === user.uid ? 'bg-emerald-500/30 text-emerald-300' : 'bg-[#1a2a3a] text-gray-400'}`}>
                    {p.name}{p.uid === user.uid ? ' (você)' : ''}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {roundResult.noAnswer.length > 0 && (
            <div className="p-3 rounded-xl bg-gray-500/5 border border-gray-500/20">
              <span className="text-xs text-gray-500 font-bold">Sem resposta: </span>
              {roundResult.noAnswer.map(p => (
                <span key={p.uid} className="text-xs text-gray-500">{p.name} </span>
              ))}
            </div>
          )}
        </div>

        {/* Scoreboard */}
        <div className="bg-[#242642] rounded-2xl p-4 border border-[#2f3252] mb-4">
          <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2"><Trophy size={14} className="text-yellow-400" /> Placar</h3>
          <div className="space-y-1">
            {sortedPlayers.map((p, i) => (
              <div key={p.uid} className={`flex items-center justify-between px-3 py-2 rounded-lg ${p.uid === user.uid ? 'bg-emerald-500/10' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-500 w-5">{i + 1}.</span>
                  {i === 0 && <span>🏆</span>}
                  {i === 1 && <span>🥈</span>}
                  {i === 2 && <span>🥉</span>}
                  <span className={`font-bold ${p.uid === user.uid ? 'text-emerald-400' : 'text-white'}`}>{p.name}</span>
                </div>
                <span className="font-black text-white">{scores[p.uid] || 0} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next button (host) */}
        {isHost && (
          <button
            onClick={() => showIntermission(nextRound)}
            className="w-full py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-b-4 border-emerald-800 hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            {isLastRound ? <><Trophy size={20} /> VER RESULTADO FINAL</> : <><Play size={20} /> PRÓXIMA RODADA</>}
          </button>
        )}
        {!isHost && (
          <div className="text-center py-3">
            <p className="text-sm text-gray-500">Aguardando o host...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── FinalScoreScreen ───────────────────────────────────────────────────

const RCFinalScoreScreen = () => {
  const { scores, room, user, returnToLobby, leaveGame } = useRCGameStore();
  if (!room || !user) return null;

  const isHost = room.hostId === user.uid;
  const sortedPlayers = [...room.players]
    .map(p => ({ ...p, score: scores[p.uid] || 0 }))
    .sort((a, b) => b.score - a.score);

  const winner = sortedPlayers[0];
  const isWinner = winner?.uid === user.uid;

  return <GameIdentityLayout players={sortedPlayers} userId={user.uid} hostId={room.hostId} detail={(player)=><p className="mt-1 text-[9px] font-black uppercase text-amber-300">{player.score} pontos</p>}><section className="flex flex-1 flex-col items-center justify-center text-center"><Trophy className="h-16 w-16 text-amber-300"/><p className="mt-5 text-[10px] font-black uppercase tracking-[.22em] text-amber-300">Campeão da partida</p><h1 className="mt-2 text-4xl font-black sm:text-6xl">{winner?.name}</h1><p className="mt-3 text-lg font-bold text-violet-300">{winner?.score} pontos</p><p className="mt-2 text-slate-400">{isWinner?'Você pensou como a maioria!':'Foi quem mais entrou em sintonia com o grupo.'}</p><div className="mt-8 w-full max-w-xl space-y-3">{isHost&&<button onClick={returnToLobby} className="h-16 w-full rounded-2xl border-b-4 border-violet-800 bg-violet-500 text-lg font-black text-white"><Play className="mr-2 inline h-5 w-5 fill-current"/>JOGAR NOVAMENTE</button>}<button onClick={leaveGame} className="h-14 w-full rounded-2xl border-2 border-slate-700 bg-slate-900 font-black text-slate-300"><LogOut className="mr-2 inline h-5 w-5"/>SAIR DA SALA</button></div></section></GameIdentityLayout>;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#1a1b2e] px-4 py-8">
      <div className="w-[90%] max-w-lg z-10">
        {/* Lobby button */}
        <div className="mb-4">
          <button onClick={returnToLobby} className="p-2 bg-slate-800 rounded-xl hover:bg-blue-500 transition-all text-slate-400 hover:text-white" title="Voltar ao lobby">
            <Home size={16} />
          </button>
        </div>

        {/* Winner announcement */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">{isWinner ? '🎉' : '🏆'}</div>
          <h1 className="text-3xl font-black text-white mb-1">
            {isWinner ? 'Você venceu!' : `${winner?.name} venceu!`}
          </h1>
          <p className="text-lg text-emerald-400 font-bold">{winner?.score} pontos</p>
        </div>

        {/* Final scoreboard */}
        <div className="bg-[#242642] rounded-2xl p-5 border-2 border-[#2f3252] mb-6">
          <h3 className="text-sm font-bold text-gray-400 mb-4 text-center uppercase tracking-wider">Placar Final</h3>
          <div className="space-y-2">
            {sortedPlayers.map((p, i) => (
              <div key={p.uid} className={`flex items-center justify-between px-4 py-3 rounded-xl ${i === 0 ? 'bg-yellow-500/10 border border-yellow-500/30' : p.uid === user.uid ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-[#1a2a3a]'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-gray-500 w-6 text-center">
                    {i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                  </span>
                  <span className={`font-bold ${i === 0 ? 'text-yellow-400' : p.uid === user.uid ? 'text-emerald-400' : 'text-white'}`}>
                    {p.name}
                    {p.uid === user.uid && <span className="text-xs ml-1 opacity-60">(você)</span>}
                  </span>
                </div>
                <span className={`font-black text-xl ${i === 0 ? 'text-yellow-400' : 'text-white'}`}>{p.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {isHost && (
            <button
              onClick={returnToLobby}
              className="w-full py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-b-4 border-emerald-800 hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <Play size={20} /> JOGAR NOVAMENTE
            </button>
          )}
          <button
            onClick={leaveGame}
            className="w-full py-3 rounded-2xl font-bold text-sm bg-[#242642] text-gray-400 hover:text-white border border-[#3d4a5c] hover:border-gray-500 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={16} /> SAIR DA SALA
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Notifications ──────────────────────────────────────────────────────

const RCNotifications = () => {
  const { notifications, removeNotification } = useRCGameStore();
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(n => (
        <div key={n.id} className="px-4 py-2 rounded-xl bg-[#242642] border border-[#3d4a5c] text-sm text-white shadow-lg animate-fade-in flex items-center gap-2">
          <span>{n.message}</span>
          <button onClick={() => removeNotification(n.id)} className="text-gray-500 hover:text-white"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────

export default function RespostasEmComum() {
  const { phase } = useRCGameStore();
  const [, navigate] = useLocation();

  useEffect(() => {
    document.title = 'Respostas em Comum - TikJogos';
  }, []);

  // Redirect to home if no active game
  useEffect(() => {
    if (phase === 'home') {
      navigate('/');
    }
  }, [phase, navigate]);

  if (phase === 'home') return null;

  return (
    <>
      <RCNotifications />
      {phase === 'themeSelect' && <RCThemeSelectScreen />}
      {phase === 'lobby' && <RCLobbyScreen />}
      {phase === 'answering' && <RCQuestionScreen />}
      {phase === 'roundResult' && <RCRoundResultScreen />}
      {phase === 'finalScore' && <RCFinalScoreScreen />}
    </>
  );
}
