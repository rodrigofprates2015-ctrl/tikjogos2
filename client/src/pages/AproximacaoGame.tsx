import { useState, useEffect, useRef } from "react";
import { AnchorMobileAd, ResultAd } from "@/components/AdSense";
import { useGameIntermission } from "@/components/GameIntermission";
import { useAproximacaoStore, type AproximacaoRoom } from "@/lib/aproximacaoStore";
import { cn } from "@/lib/utils";
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
import { useToast } from "@/hooks/use-toast";
import { MobileNav } from "@/components/MobileNav";
import {
  Copy, LogOut, Play, Crown, Loader2, Users, Zap,
  Heart, HeartOff, Trophy, Target, ArrowLeft, ChevronRight,
  CheckCircle, Clock, Eye,
  Flame, Send
} from "lucide-react";
const logoAprox = "/aproximacao-logo.webp";
const aproximacaoCharacters = [
  lobbyCharacter1, lobbyCharacter2, lobbyCharacter3, lobbyCharacter4, lobbyCharacter5,
  lobbyCharacter6, lobbyCharacter7, lobbyCharacter8, lobbyCharacter9, lobbyCharacter10,
];

function AproximacaoAvatar({ index, name, className }: { index: number; name: string; className?: string }) {
  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#11172a]", className)}>
      <div className="absolute inset-x-2 bottom-1 h-3 rounded-full bg-cyan-400/30 blur-sm" />
      <img
        src={aproximacaoCharacters[Math.abs(index) % aproximacaoCharacters.length]}
        alt={`Personagem de ${name}`}
        className="absolute left-1/2 top-0 h-[150%] w-auto max-w-none -translate-x-1/2 object-contain"
        draggable={false}
      />
    </div>
  );
}

function NotificationCenter() {
  const { notifications, removeNotification } = useAproximacaoStore();
  if (notifications.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="bg-[#242642] border border-[#2f3252] text-white text-sm px-4 py-2 rounded-xl shadow-lg animate-fade-in"
          onClick={() => removeNotification(n.id)}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}

function HeartDisplay({ count, eliminated }: { count: number; eliminated?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(Math.max(3, count + 1))].map((_, i) => {
        if (eliminated) {
          return <HeartOff key={i} className="w-4 h-4 text-slate-600" />;
        }
        return (
          <Heart
            key={i}
            className={cn(
              "w-4 h-4",
              i < count ? "text-red-500 fill-red-500" : "text-slate-600"
            )}
          />
        );
      })}
    </div>
  );
}

function AproximacaoPlayersSidebar({ room, userId, allowSelection = false }: { room: AproximacaoRoom; userId: string; allowSelection?: boolean }) {
  const { selectCharacter } = useAproximacaoStore();
  const occupied = new Set(room.players.filter(p => p.uid !== userId).map((p, index) => p.characterIndex ?? index));

  return (
    <aside className="tj-surface flex min-w-0 w-full flex-col overflow-hidden p-3 sm:p-5">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-black uppercase tracking-[.14em] text-slate-300">Jogadores</h2>
        <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-sm font-black text-emerald-300">{room.players.length} / 10</span>
      </div>
      <div className="mt-3 space-y-2.5">
        {room.players.map((player, index) => {
          const isMe = player.uid === userId;
          const isHost = player.uid === room.hostId;
          return (
            <article key={player.uid} className={cn("tj-player-card flex min-w-0 items-center gap-3 p-3", isMe && "is-current", player.eliminated && "opacity-50")}>
              <AproximacaoAvatar index={player.characterIndex ?? index} name={player.name} className="h-12 w-12 sm:h-14 sm:w-14" />
              <div className="min-w-0 flex-1">
                {isHost && <span className="mb-1 inline-flex items-center gap-1 rounded-md bg-violet-500/15 px-1.5 py-0.5 text-[9px] font-black uppercase text-violet-300"><Crown className="h-3 w-3" /> Capitão da sala</span>}
                <div className="flex items-center gap-2"><strong className="truncate text-sm text-white">{player.name}</strong>{isMe && <span className="rounded bg-violet-600 px-1.5 py-0.5 text-[9px] font-black uppercase">Você</span>}</div>
                <div className="mt-1.5 flex items-center gap-2"><HeartDisplay count={player.hearts} eliminated={player.eliminated} />{player.eliminated && <span className="text-[9px] font-black uppercase text-rose-300">Eliminado</span>}</div>
              </div>
              <span className={cn("h-3 w-3 rounded-full", player.connected === false ? "bg-slate-600" : "bg-emerald-400 text-emerald-400 shadow-[0_0_12px_currentColor]")} />
            </article>
          );
        })}
      </div>
      {allowSelection && (
        <div className="tj-inset mt-5 p-3">
          <p className="text-[9px] font-black uppercase tracking-[.16em] text-slate-500">Escolha seu personagem</p>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {aproximacaoCharacters.map((character, index) => {
              const selected = (room.players.find(p => p.uid === userId)?.characterIndex ?? 0) === index;
              const taken = occupied.has(index);
              return <button key={index} type="button" onClick={() => !taken && selectCharacter(index)} disabled={taken} className={cn("relative aspect-square overflow-hidden rounded-lg border bg-slate-950/80", selected ? "border-amber-300" : taken ? "cursor-not-allowed border-white/5 grayscale opacity-25" : "border-white/10 hover:border-violet-400/50")}><img src={character} alt="" className="absolute left-1/2 top-0 h-[155%] w-auto max-w-none -translate-x-1/2" />{selected && <CheckCircle className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 p-0.5 text-white" />}{taken && <span className="absolute inset-x-0 bottom-0 bg-slate-950/90 py-0.5 text-[6px] font-black uppercase">Ocupado</span>}</button>;
            })}
          </div>
        </div>
      )}
    </aside>
  );
}

function HomeScreen() {
  const { setUser, createRoom, joinRoom, isLoading, loadSavedNickname, saveNickname } = useAproximacaoStore();
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [saveChecked, setSaveChecked] = useState(true);
  const [joinError, setJoinError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const saved = loadSavedNickname();
    if (saved) setName(saved);
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) { toast({ title: 'Digite seu apelido', variant: 'destructive' }); return; }
    if (saveChecked) saveNickname(name.trim());
    setUser(name.trim());
    await new Promise(r => setTimeout(r, 10));
    await useAproximacaoStore.getState().createRoom();
  };

  const handleJoin = async () => {
    if (!name.trim()) { toast({ title: 'Digite seu apelido', variant: 'destructive' }); return; }
    if (!joinCode.trim()) { toast({ title: 'Digite o código da sala', variant: 'destructive' }); return; }
    if (saveChecked) saveNickname(name.trim());
    setUser(name.trim());
    await new Promise(r => setTimeout(r, 10));
    const ok = await useAproximacaoStore.getState().joinRoom(joinCode.trim());
    if (!ok) setJoinError('Sala não encontrada. Verifique o código.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1b2e] selection:bg-purple-500/30">
      <MobileNav />

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1000ms' }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
        {/* Logo */}
        <div className="mb-8 text-center">
          <img
            src={logoAprox}
            alt="Jogo da Aproximação"
            className="h-24 md:h-32 object-contain mx-auto mb-2"
          />
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Adivinhe números, colete corações, seja o último sobrevivente!
          </p>
        </div>

        {/* Main card */}
        <div className="w-full max-w-md bg-[#242642] rounded-[3rem] p-6 md:p-10 shadow-2xl border-4 border-[#2f3252]">

          <input
            type="text"
            placeholder="Seu apelido"
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="w-full bg-[#1a1c2e] border-2 border-[#2f3252] rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors mb-4"
            data-testid="input-nickname"
          />

          <button
            onClick={handleCreate}
            disabled={isLoading}
            className={cn(
              "w-full py-4 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-2 transition-all border-b-[6px] shadow-2xl",
              !isLoading
                ? "bg-gradient-to-r from-cyan-500 to-teal-500 border-cyan-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-1 shadow-lg shadow-cyan-500/25"
                : "bg-[#2f3252] border-[#1a1c2e] text-slate-500 cursor-not-allowed"
            )}
            data-testid="button-create-room"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            CRIAR SALA
          </button>

          <div className="flex items-center my-4">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400 text-sm">
              <input type="checkbox" checked={saveChecked} onChange={e => setSaveChecked(e.target.checked)}
                className="w-4 h-4 rounded accent-cyan-500" />
              Lembrar apelido
            </label>
          </div>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-[#2f3252]" />
            <span className="text-slate-500 text-sm font-bold">OU</span>
            <div className="flex-1 h-px bg-[#2f3252]" />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="CÓDIGO"
              value={joinCode}
              maxLength={3}
              onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              className="flex-1 bg-[#1a1c2e] border-2 border-[#2f3252] rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-center font-mono font-bold tracking-widest uppercase"
              data-testid="input-join-code"
            />
            <button
              onClick={handleJoin}
              disabled={isLoading}
              className="bg-[#2f3252] hover:bg-[#3a3d65] text-white px-4 py-3 rounded-2xl font-bold transition-all disabled:opacity-50 border-b-4 border-[#1a1c2e] active:border-b-0 active:translate-y-1"
              data-testid="button-join-room"
            >
              Entrar
            </button>
          </div>
          {joinError && <p className="text-red-400 text-xs mt-2 text-center">{joinError}</p>}

          {/* How to play quick ref */}
          <div className="mt-6 bg-[#1a1c2e] rounded-2xl p-4 border-2 border-[#2f3252]">
            <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">Como Jogar</p>
            <ul className="text-slate-400 text-xs space-y-1">
              <li className="flex items-center gap-2"><Heart className="w-3 h-3 text-red-500 fill-red-500 flex-shrink-0" /> Começa com 3 corações</li>
              <li className="flex items-center gap-2"><Trophy className="w-3 h-3 text-yellow-400 flex-shrink-0" /> Mais próximo ganha um coração</li>
              <li className="flex items-center gap-2"><HeartOff className="w-3 h-3 text-slate-500 flex-shrink-0" /> Mais distante perde um coração</li>
              <li className="flex items-center gap-2"><Target className="w-3 h-3 text-cyan-400 flex-shrink-0" /> A 0 corações: eliminado!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function LobbyScreen() {
  const { room, user, leaveGame, startGame } = useAproximacaoStore();
  const { toast } = useToast();

  if (!room || !user) return null;
  const isHost = room.hostId === user.uid;
  const canStart = room.players.length >= 2;

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    toast({ title: 'Código copiado!', description: room.code });
  };

  const handleLeave = () => {
    leaveGame();
    window.location.href = '/';
  };

  const dashboardLobby = (
    <div className="relative z-10 w-full max-w-[1480px] overflow-x-hidden px-2 py-2 sm:px-5 sm:py-4 md:py-6 animate-fade-in">
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_32%)]" />
      <div className="relative z-10 grid min-w-0 grid-cols-1 items-stretch gap-3 sm:gap-5 lg:grid-cols-[350px_minmax(0,1fr)]">
        <div className="order-2 lg:order-1">
          <AproximacaoPlayersSidebar room={room} userId={user.uid} allowSelection />
        </div>
        <main className="tj-surface tj-surface--stage order-1 flex min-h-[520px] min-w-0 w-full flex-col overflow-hidden p-4 sm:p-6 lg:order-2 lg:min-h-[720px] lg:p-8">
          <header className="flex flex-col gap-3 border-b border-slate-700/60 pb-4 sm:flex-row sm:items-center sm:justify-between sm:pb-6">
            <button onClick={copyCode} className="group min-w-0 text-left" data-testid="button-copy-code">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-slate-500">Código da sala</p>
              <div className="mt-1 flex items-center gap-3"><strong className="font-mono text-3xl font-black tracking-widest text-amber-400 sm:text-4xl">{room.code}</strong><span className="rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-400"><Copy className="h-5 w-5" /></span></div>
            </button>
            <button onClick={handleLeave} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-5 font-black text-slate-300 hover:border-rose-400/40 hover:bg-rose-500/15 hover:text-white"><ArrowLeft className="h-5 w-5" /> Sair da Sala</button>
          </header>
          <section className="flex flex-1 flex-col items-center justify-center px-2 py-8 text-center">
            <div className="tj-icon-box tj-icon-box--xl border-cyan-400/25 bg-cyan-500/10"><Target className="h-10 w-10 text-cyan-300" /></div>
            <img src={logoAprox} alt="Aproximação" className="mt-5 h-16 max-w-full object-contain sm:h-20" />
            <h2 className="mt-5 text-2xl font-black sm:text-3xl">Sala pronta para jogar</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">Todos começam com 3 corações. A cada rodada, quem ficar mais longe da resposta perde um.</p>
            <div className="mt-7 w-full max-w-sm">
              {isHost ? <button onClick={startGame} disabled={!canStart} className={cn("flex h-16 w-full items-center justify-center gap-3 rounded-2xl border-b-4 text-lg font-black transition", canStart ? "border-violet-800 bg-violet-500 text-white hover:bg-violet-400" : "cursor-not-allowed border-slate-900 bg-slate-700 text-slate-500")}><Play className="h-6 w-6 fill-current" />{canStart ? "INICIAR PARTIDA" : "AGUARDANDO JOGADORES"}</button> : <div className="tj-inset border-violet-400/40 p-5"><Crown className="mx-auto h-7 w-7 text-violet-300" /><p className="mt-2 font-black text-violet-300">Aguardando o capitão...</p></div>}
            </div>
          </section>
          <div className="tj-inset p-4"><p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-500">Como funciona</p><div className="mt-3 grid gap-3 text-sm text-slate-300 sm:grid-cols-3"><span className="flex items-center gap-2"><Heart className="h-4 w-4 fill-rose-500 text-rose-500" /> 3 corações</span><span className="flex items-center gap-2"><Target className="h-4 w-4 text-cyan-300" /> Dê seu palpite</span><span className="flex items-center gap-2"><HeartOff className="h-4 w-4 text-rose-300" /> Mais distante perde 1</span></div></div>
        </main>
      </div>
    </div>
  );

  return <div className="min-h-screen bg-[#1a1e2a]"><MobileNav /><div className="flex justify-center">{dashboardLobby}</div></div>;

  /* Layout antigo mantido temporariamente até a revisão visual terminar. */
  return (
    <div className="min-h-screen flex flex-col bg-[#1a1b2e] selection:bg-purple-500/30">
      <MobileNav />

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1000ms' }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">

        {/* Header */}
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logoAprox} alt="Jogo da Aproximação" className="h-8 object-contain" />
            </div>
            <button
              onClick={handleLeave}
              className="flex items-center gap-2 px-4 py-2 bg-[#2f3252] border-2 border-[#3a3d65] rounded-xl text-white hover:bg-[#3a3d65] transition-all font-semibold"
              title="Voltar à tela inicial"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Home</span>
            </button>
          </div>
        </div>

        {/* Room code card */}
        <div className="w-full max-w-md bg-[#242642] rounded-[3rem] p-6 shadow-2xl border-4 border-[#2f3252] mb-4">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider text-center mb-2">Código da Sala</p>
          <button
            onClick={copyCode}
            className="w-full flex items-center justify-center gap-3 bg-[#1a1c2e] rounded-2xl p-4 border-2 border-cyan-500/30 hover:border-cyan-500/60 transition-colors group"
            data-testid="button-copy-code"
          >
            <span className="text-4xl font-black tracking-[0.3em] text-cyan-400 font-mono">{room.code}</span>
            <Copy className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          </button>
          <p className="text-slate-500 text-xs text-center mt-2">Compartilhe este código para convidar jogadores</p>
        </div>

        {/* Players */}
        <div className="w-full max-w-md bg-[#242642] rounded-[3rem] p-6 shadow-2xl border-4 border-[#2f3252] mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-bold">{room.players.length} Jogador{room.players.length !== 1 ? 'es' : ''}</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {room.players.map((player) => (
              <div
                key={player.uid}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl",
                  player.uid === user.uid ? "bg-cyan-500/10 border border-cyan-500/30" : "bg-[#1a1c2e]"
                )}
                data-testid={`player-${player.uid}`}
              >
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center font-black text-sm",
                  player.uid === user.uid ? "bg-cyan-500 text-white" : "bg-[#2f3252] text-slate-300"
                )}>
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">
                    {player.name}
                    {player.uid === user.uid && <span className="text-cyan-400 text-xs ml-1">(você)</span>}
                  </p>
                  {room.hostId === player.uid && (
                    <div className="flex items-center gap-1">
                      <Crown className="w-3 h-3 text-yellow-400" />
                      <span className="text-yellow-400 text-xs">Host</span>
                    </div>
                  )}
                </div>
                <div className={cn("w-2 h-2 rounded-full", player.connected !== false ? "bg-green-500" : "bg-slate-600")} />
              </div>
            ))}
          </div>
        </div>

        {/* Start button (host only) */}
        {isHost ? (
          <div className="w-full max-w-md">
            {!canStart && (
              <p className="text-slate-500 text-xs text-center mb-2">Aguardando pelo menos 2 jogadores...</p>
            )}
            <button
              onClick={startGame}
              disabled={!canStart}
              className={cn(
                "w-full py-4 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-2 transition-all border-b-[6px] shadow-2xl",
                canStart
                  ? "bg-gradient-to-r from-cyan-500 to-teal-500 border-cyan-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-1 shadow-lg shadow-cyan-500/25"
                  : "bg-[#2f3252] border-[#1a1c2e] text-slate-500 cursor-not-allowed opacity-50"
              )}
              data-testid="button-start-game"
            >
              <Play className="w-5 h-5" />
              INICIAR JOGO
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md bg-[#242642] rounded-2xl p-4 border-2 border-[#2f3252] text-center">
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <Clock className="w-4 h-4 animate-pulse" />
              <span className="text-sm">Aguardando o host iniciar...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayingScreen() {
  const { room, user, submitGuess, revealResults, nextRound, returnToLobby, leaveGame, myGuess, setMyGuess } = useAproximacaoStore();
  const { showIntermission, intermissionScreen } = useGameIntermission();
  const [inputValue, setInputValue] = useState('');
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  if (!room || !user || !room.gameData) return null;
  if (intermissionScreen) return intermissionScreen;

  const { gameData } = room;
  const isHost = room.hostId === user.uid;
  const me = room.players.find(p => p.uid === user.uid);
  const isEliminated = me?.eliminated === true;
  const alivePlayers = room.players.filter(p => !p.eliminated);
  const hasMyGuess = gameData.guesses.some(g => g.playerId === user.uid);
  const totalActivePlayers = room.players.filter(p => !p.eliminated).length;
  const guessCount = gameData.guesses.length;

  const handleSubmitGuess = () => {
    const val = parseFloat(inputValue.replace(',', '.'));
    if (isNaN(val)) {
      toast({ title: 'Número inválido', variant: 'destructive' });
      return;
    }
    submitGuess(val);
    toast({ title: 'Palpite enviado!', description: `Você apostou: ${val.toLocaleString('pt-BR')}` });
  };

  const handleLeave = () => {
    leaveGame();
    window.location.href = '/';
  };

  const cardClass = "w-full max-w-md bg-[#242642] rounded-[2rem] p-5 shadow-2xl border-2 border-[#2f3252]";

  const gameNavigation = (
    <nav className="mb-4 grid grid-cols-2 gap-2 border-b border-slate-700/60 pb-4 sm:flex sm:justify-end">
      <button onClick={returnToLobby} className="h-11 rounded-xl border border-slate-700 bg-slate-900 px-4 text-xs font-black text-slate-300 hover:border-violet-400/50 hover:text-white"><ArrowLeft className="mr-2 inline h-4 w-4" />Voltar ao lobby</button>
      <button onClick={handleLeave} className="h-11 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 text-xs font-black text-rose-200 hover:bg-rose-500/20"><LogOut className="mr-2 inline h-4 w-4" />Sair para a home</button>
    </nav>
  );

  // Guessing phase
  if (gameData.phase === 'guessing') {
    const guessingDashboard = (
      <div className="relative z-10 w-full max-w-[1480px] px-2 py-2 sm:px-5 sm:py-4 md:py-6">
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_32%)]" />
        <div className="relative grid min-w-0 grid-cols-1 items-stretch gap-3 sm:gap-5 lg:grid-cols-[350px_minmax(0,1fr)]">
          <div className="order-2 lg:order-1"><AproximacaoPlayersSidebar room={room} userId={user.uid} /></div>
          <main className="tj-surface tj-surface--stage order-1 flex min-h-[600px] min-w-0 flex-col p-4 sm:p-6 lg:order-2 lg:min-h-[720px] lg:p-8">
            {gameNavigation}
            <header className="flex items-center justify-between border-b border-slate-700/60 pb-5">
              <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-slate-500">Sala {room.code}</p><h1 className="mt-1 text-xl font-black text-white">Rodada {gameData.roundNumber}</h1></div>
              <div className="flex items-center gap-3"><span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-black text-cyan-300">{guessCount}/{totalActivePlayers} palpites</span><button onClick={handleLeave} className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-400 hover:text-rose-300"><LogOut className="h-5 w-5" /></button></div>
            </header>
            <section className="flex flex-1 flex-col items-center justify-center py-7 text-center">
              <div className="tj-icon-box tj-icon-box--xl border-cyan-400/25 bg-cyan-500/10"><Target className="h-10 w-10 text-cyan-300" /></div>
              <p className="mt-5 text-[11px] font-black uppercase tracking-[.22em] text-cyan-300">Aproxime-se da resposta</p>
              <h2 className="mt-3 max-w-3xl text-2xl font-black leading-tight text-white sm:text-4xl">{gameData.question.text}</h2>
              <p className="mt-3 text-sm text-slate-400">Responda em <strong className="text-cyan-300">{gameData.question.unit}</strong></p>
              <div className="mt-8 w-full max-w-xl">
                {isEliminated ? <div className="tj-inset border-rose-500/35 p-5 text-rose-300"><HeartOff className="mx-auto h-7 w-7" /><p className="mt-2 font-black">Você foi eliminado</p></div> : hasMyGuess ? <div className="tj-inset border-emerald-400/35 p-5"><CheckCircle className="mx-auto h-7 w-7 text-emerald-300" /><p className="mt-2 font-black text-emerald-300">Palpite enviado!</p><p className="mt-1 text-sm text-slate-400">Aguardando os outros jogadores...</p></div> : <div className="tj-inset p-4 sm:p-5"><label className="text-[10px] font-black uppercase tracking-[.18em] text-slate-500">Seu palpite</label><div className="mt-3 flex gap-2"><input ref={inputRef} type="number" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmitGuess()} placeholder="Digite um número" className="min-w-0 flex-1 rounded-xl border-2 border-slate-700 bg-slate-950/70 px-4 py-4 text-center font-mono text-2xl font-black text-white outline-none focus:border-violet-400" /><button onClick={handleSubmitGuess} disabled={!inputValue} className="flex h-auto w-16 items-center justify-center rounded-xl border-b-4 border-violet-800 bg-violet-500 text-white disabled:opacity-40"><Send className="h-6 w-6" /></button></div></div>}
              </div>
            </section>
            {isHost && <div>{guessCount < totalActivePlayers ? <div className="tj-inset py-4 text-center text-sm font-bold text-slate-500">Aguardando palpites ({guessCount}/{totalActivePlayers})</div> : <button onClick={revealResults} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-violet-800 bg-violet-500 font-black text-white hover:bg-violet-400"><Eye className="h-5 w-5" /> REVELAR RESPOSTA</button>}</div>}
          </main>
        </div>
      </div>
    );
    return <div className="min-h-screen bg-[#1a1e2a]"><MobileNav /><div className="flex justify-center">{guessingDashboard}</div></div>;

    /* Layout antigo mantido temporariamente até a revisão visual terminar. */
    return (
      <div className="min-h-screen flex flex-col bg-[#1a1b2e] selection:bg-purple-500/30">
        <MobileNav />
        <div className="flex-1 flex flex-col items-center px-4 py-6 gap-4 relative z-10">

          {/* Header row */}
          <div className="w-full max-w-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-sm">Rodada {gameData.roundNumber}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-slate-400 text-sm">
                <Users className="w-4 h-4" />
                {guessCount}/{totalActivePlayers} palpites
              </div>
              <button
                onClick={handleLeave}
                className="text-slate-400 hover:text-red-400 transition-colors p-2"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Players hearts bar */}
          <div className="w-full max-w-md">
            <div className="flex gap-2 flex-wrap">
              {room.players.map(p => (
                <div key={p.uid} className={cn(
                  "flex items-center gap-1.5 bg-[#242642] rounded-xl px-3 py-1.5 border-2",
                  p.eliminated ? "border-[#2f3252]/30 opacity-40" : "border-[#2f3252]",
                  p.uid === user.uid && "border-cyan-500/40"
                )}>
                  <span className="text-white text-xs font-bold truncate max-w-[60px]">{p.name}</span>
                  <HeartDisplay count={p.hearts} eliminated={p.eliminated} />
                  {gameData.guesses.some(g => g.playerId === p.uid) && (
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Question card */}
          <div className={cardClass}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Target className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Pergunta</span>
            </div>
            <p className="text-white text-lg font-bold leading-snug mb-1">{gameData.question.text}</p>
            <p className="text-slate-400 text-sm">Resposta em: <span className="text-cyan-400 font-semibold">{gameData.question.unit}</span></p>
          </div>

          {/* Input area */}
          {isEliminated ? (
            <div className="w-full max-w-md bg-red-900/20 rounded-2xl p-4 border border-red-500/30 text-center">
              <HeartOff className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Você foi eliminado. Aguarde a rodada acabar.</p>
            </div>
          ) : hasMyGuess ? (
            <div className="w-full max-w-md bg-green-900/20 rounded-2xl p-4 border border-green-500/30 text-center">
              <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <p className="text-green-400 font-bold text-sm">Palpite enviado!</p>
              <p className="text-slate-400 text-xs mt-1">Aguardando outros jogadores...</p>
            </div>
          ) : (
            <div className={cardClass}>
              <p className="text-slate-400 text-sm mb-3 text-center">Seu palpite (número):</p>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="number"
                  placeholder="Ex: 330"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmitGuess()}
                  className="flex-1 bg-[#1a1c2e] border-2 border-[#2f3252] rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-center font-mono text-xl font-bold"
                  data-testid="input-guess"
                />
                <button
                  onClick={handleSubmitGuess}
                  disabled={!inputValue}
                  className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-[#2f3252] disabled:opacity-50 text-white px-4 py-3 rounded-2xl font-bold transition-all border-b-4 border-cyan-800 disabled:border-[#1a1c2e] active:border-b-0 active:translate-y-1"
                  data-testid="button-submit-guess"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Host reveal button */}
          {isHost && (
            <div className="w-full max-w-md">
              {guessCount < totalActivePlayers ? (
                <div className="w-full py-3 rounded-2xl text-sm text-slate-500 border-2 border-[#2f3252] text-center cursor-not-allowed select-none">
                  Aguardando palpites... ({guessCount}/{totalActivePlayers})
                </div>
              ) : (
                <button
                  onClick={revealResults}
                  className="w-full py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-b-4 border-cyan-800 hover:brightness-110 active:border-b-0 active:translate-y-1 shadow-lg shadow-cyan-500/25 transition-all"
                  data-testid="button-reveal"
                >
                  Revelar Resultados ✓ ({guessCount}/{totalActivePlayers})
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Revealing phase
  if (gameData.phase === 'revealing') {
    const result = gameData.lastRoundResult;
    const correctAnswer = gameData.question.answer;

    if (result) {
      const resultDashboard = (
        <div className="relative z-10 w-full max-w-[1480px] px-2 py-2 sm:px-5 sm:py-4 md:py-6">
          <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_32%)]" />
          <div className="relative grid min-w-0 grid-cols-1 items-stretch gap-3 sm:gap-5 lg:grid-cols-[350px_minmax(0,1fr)]">
            <div className="order-2 lg:order-1"><AproximacaoPlayersSidebar room={room} userId={user.uid} /></div>
            <main className="tj-surface tj-surface--stage order-1 flex min-h-[600px] min-w-0 flex-col p-4 sm:p-6 lg:order-2 lg:min-h-[720px] lg:p-8">
              {gameNavigation}
              <header className="border-b border-slate-700/60 pb-5"><p className="text-[10px] font-black uppercase tracking-[.2em] text-slate-500">Rodada {gameData.roundNumber}</p><h1 className="mt-1 text-xl font-black">Resultado</h1></header>
              <section className="flex-1 py-6">
                <div className="tj-inset border-cyan-400/35 p-5 text-center sm:p-7">
                  <p className="text-[10px] font-black uppercase tracking-[.22em] text-cyan-300">Resposta correta</p>
                  <p className="mt-3 text-4xl font-black text-white sm:text-6xl">{correctAnswer.toLocaleString('pt-BR')}</p>
                  <p className="mt-1 font-bold text-cyan-300">{gameData.question.unit}</p>
                  <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">{gameData.question.text}</p>
                </div>
                <p className="mb-3 mt-6 text-[10px] font-black uppercase tracking-[.2em] text-slate-500">Respostas da rodada</p>
                <div className="space-y-2.5">
                  {result.allGuesses.map((guess, guessIndex) => {
                    const playerIndex = room.players.findIndex(player => player.uid === guess.playerId);
                    const lostHeart = result.farthestIds.includes(guess.playerId) && result.closestIds[0] !== result.farthestIds[0];
                    const isClosest = result.closestIds.includes(guess.playerId) && !lostHeart;
                    return <article key={guess.playerId} className={cn("tj-player-card flex items-center gap-3 p-3", isClosest && "is-current", lostHeart && "is-danger")}><AproximacaoAvatar index={room.players[playerIndex]?.characterIndex ?? (playerIndex >= 0 ? playerIndex : guessIndex)} name={guess.playerName} className="h-12 w-12" /><div className="min-w-0 flex-1"><strong className="block truncate text-sm text-white">{guess.playerName}</strong><span className={cn("text-[9px] font-black uppercase", isClosest ? "text-violet-300" : lostHeart ? "text-rose-300" : "text-slate-500")}>{isClosest ? "Mais perto" : lostHeart ? "Perdeu 1 coração" : "Palpite enviado"}</span></div><strong className="font-mono text-xl text-white">{guess.value.toLocaleString('pt-BR')}</strong>{isClosest && <Trophy className="h-5 w-5 text-amber-300" />}{lostHeart && <span className="font-black text-rose-300">−1 ♥</span>}</article>;
                  })}
                </div>
              </section>
              {isHost ? gameData.pendingWinnerId ? <button onClick={() => showIntermission(nextRound)} className="h-14 rounded-2xl border-b-4 border-amber-700 bg-amber-400 font-black text-slate-950">VER VENCEDOR</button> : <div className="grid gap-2 sm:grid-cols-2"><button onClick={returnToLobby} className="h-14 rounded-2xl border-2 border-slate-700 bg-slate-900 font-black text-slate-300"><ArrowLeft className="mr-2 inline h-5 w-5" />Lobby</button><button onClick={() => showIntermission(nextRound)} className="h-14 rounded-2xl border-b-4 border-violet-800 bg-violet-500 font-black text-white">PRÓXIMA <ChevronRight className="ml-1 inline h-5 w-5" /></button></div> : <div className="tj-inset py-4 text-center text-sm font-bold text-slate-400">Aguardando o capitão continuar...</div>}
            </main>
          </div>
        </div>
      );
      return <div className="min-h-screen bg-[#1a1e2a]"><MobileNav /><div className="flex justify-center">{resultDashboard}</div></div>;
    }

    return (
      <div className="min-h-screen flex flex-col bg-[#1a1b2e] selection:bg-purple-500/30">
        <MobileNav />
        <div className="flex-1 flex flex-col items-center px-4 py-6 gap-4 relative z-10">

          <div className="w-full max-w-5xl">
            {/* Round number */}
            <div className="text-center mb-4">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Rodada {gameData.roundNumber} — Resultado</span>
            </div>

            {result ? (
              <div className="mb-4 grid gap-4 md:grid-cols-[0.9fr_1.1fr] md:items-start">
                {/* Jogadores — mesma linguagem visual do lobby do Impostor */}
                <section className="rounded-[2rem] border-2 border-[#2f3252] bg-[#242642] p-4 shadow-2xl">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Jogadores</p>
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-[10px] font-black text-cyan-300">
                      {room.players.filter(p => !p.eliminated).length} restantes
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {room.players.map((p, playerIndex) => {
                      const lostHeart = result.farthestIds.includes(p.uid) && result.closestIds[0] !== result.farthestIds[0];
                      const roundWinner = result.closestIds.includes(p.uid) && !lostHeart;
                      return (
                        <article key={p.uid} className={cn(
                          "relative flex min-w-0 items-center gap-3 rounded-2xl border-2 p-2.5 transition-colors",
                          roundWinner ? "border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,.12)]" :
                          lostHeart ? "border-red-500/70 bg-red-500/10" : "border-[#343858] bg-[#1a1c2e]",
                          p.eliminated && "opacity-55"
                        )}>
                          <AproximacaoAvatar index={playerIndex} name={p.name} className="h-12 w-12" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <strong className="truncate text-sm text-white">{p.name}</strong>
                              {p.uid === user.uid && <span className="rounded bg-violet-500 px-1.5 py-0.5 text-[8px] font-black uppercase text-white">você</span>}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <HeartDisplay count={p.hearts} eliminated={p.eliminated} />
                              {roundWinner && <span className="text-[9px] font-black uppercase text-cyan-300">mais perto</span>}
                              {lostHeart && <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-red-300"><HeartOff className="h-3 w-3" /> perdeu 1</span>}
                            </div>
                          </div>
                          {roundWinner && <Trophy className="h-5 w-5 shrink-0 text-cyan-300" />}
                        </article>
                      );
                    })}
                  </div>
                </section>

                {/* Resposta e palpites, sem diferença absoluta ou percentual */}
                <section className="rounded-[2rem] border-2 border-[#2f3252] bg-[#242642] p-4 shadow-2xl">
                  <div className="rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/15 to-teal-500/5 p-4 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Resposta correta</p>
                    <p className="mt-2 text-4xl font-black leading-none text-white">
                      {correctAnswer.toLocaleString('pt-BR')}
                    </p>
                    <p className="mt-1 text-sm font-bold text-cyan-300">{gameData.question.unit}</p>
                    <p className="mt-3 text-sm leading-snug text-slate-300">{gameData.question.text}</p>
                  </div>

                  <p className="mb-2 mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Respostas da rodada</p>
                  <div className="space-y-2">
                    {result.allGuesses.map((g, guessIndex) => {
                      const playerIndex = room.players.findIndex(p => p.uid === g.playerId);
                      const lostHeart = result.farthestIds.includes(g.playerId) && result.closestIds[0] !== result.farthestIds[0];
                      const roundWinner = result.closestIds.includes(g.playerId) && !lostHeart;
                      return (
                        <div key={g.playerId} className={cn(
                          "flex items-center gap-3 rounded-xl border px-3 py-2",
                          roundWinner ? "border-cyan-400/50 bg-cyan-400/10" :
                          lostHeart ? "border-red-500/40 bg-red-500/10" : "border-[#343858] bg-[#1a1c2e]"
                        )}>
                          <AproximacaoAvatar index={playerIndex >= 0 ? playerIndex : guessIndex} name={g.playerName} className="h-9 w-9 rounded-lg" />
                          <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-200">{g.playerName}</span>
                          <strong className={cn("font-mono text-base", roundWinner ? "text-cyan-300" : lostHeart ? "text-red-300" : "text-white")}>
                            {g.value.toLocaleString('pt-BR')}
                          </strong>
                          {roundWinner && <span className="rounded-full bg-cyan-400 px-2 py-1 text-[8px] font-black uppercase text-[#102236]">venceu</span>}
                          {lostHeart && <span className="text-xs font-black text-red-300">−1 ♥</span>}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            ) : (
              <div className={cn(cardClass, "mb-4 text-center text-sm text-slate-500")}>Nenhum palpite foi enviado nesta rodada.</div>
            )}

            {/* Host controls */}
            {isHost ? (
              gameData.pendingWinnerId ? (
                // Last round — show winner reveal button (no lobby button)
                <button
                  onClick={() => showIntermission(nextRound)}
                  className="w-full py-4 rounded-2xl font-black text-base bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-b-4 border-yellow-700 hover:brightness-110 active:border-b-0 active:translate-y-1 shadow-lg shadow-yellow-500/30 transition-all"
                  data-testid="button-see-winner"
                >
                  🏆 Ver Vencedor
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={returnToLobby}
                    className="flex-1 py-3 rounded-2xl font-bold text-sm text-slate-400 border-2 border-[#2f3252] hover:border-slate-500 transition-all"
                    data-testid="button-return-lobby"
                  >
                    <ArrowLeft className="w-4 h-4 inline mr-1" />
                    Lobby
                  </button>
                  <button
                    onClick={() => showIntermission(nextRound)}
                    className="flex-1 py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-b-4 border-cyan-800 hover:brightness-110 active:border-b-0 active:translate-y-1 shadow-lg shadow-cyan-500/25 transition-all"
                    data-testid="button-next-round"
                  >
                    Próxima <ChevronRight className="w-4 h-4 inline" />
                  </button>
                </div>
              )
            ) : (
              <div className="bg-[#242642] rounded-2xl p-4 border-2 border-[#2f3252] text-center">
                <div className="flex items-center justify-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4 animate-pulse" />
                  <span className="text-sm">
                    {gameData.pendingWinnerId ? 'Aguardando revelação do vencedor...' : 'Aguardando o host continuar...'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Game over phase
  if (gameData.phase === 'gameover') {
    const winner = room.players.find(p => p.uid === gameData.winnerId);
    const isWinner = user.uid === gameData.winnerId;

    const winnerIndex = Math.max(0, room.players.findIndex(p => p.uid === gameData.winnerId));
    const gameoverDashboard = (
      <div className="relative z-10 w-full max-w-[1480px] px-2 py-2 sm:px-5 sm:py-4 md:py-6">
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_32%)]" />
        <div className="relative grid min-w-0 grid-cols-1 items-stretch gap-3 sm:gap-5 lg:grid-cols-[350px_minmax(0,1fr)]">
          <div className="order-2 lg:order-1"><AproximacaoPlayersSidebar room={room} userId={user.uid} /></div>
          <main className="tj-surface tj-surface--stage order-1 flex min-h-[600px] min-w-0 flex-col items-center justify-center p-5 text-center sm:p-8 lg:order-2 lg:min-h-[720px]">
            <div className="relative"><AproximacaoAvatar index={winner?.characterIndex ?? winnerIndex} name={winner?.name ?? 'vencedor'} className="h-32 w-32 rounded-3xl border-2 border-amber-300 sm:h-40 sm:w-40" /><span className="absolute -right-3 -top-3 rounded-2xl bg-amber-400 p-3 text-slate-950 shadow-xl"><Trophy className="h-7 w-7" /></span></div>
            <p className="mt-6 text-[11px] font-black uppercase tracking-[.22em] text-amber-300">Campeão da partida</p>
            <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">{winner?.name || gameData.winnerName}</h1>
            <p className="mt-3 text-base text-slate-400">{isWinner ? 'Você foi quem mais se aproximou até o fim!' : 'Foi quem resistiu até o fim com seus corações.'}</p>
            <div className="mt-8 w-full max-w-xl space-y-3">{isHost ? <button onClick={returnToLobby} className="h-16 w-full rounded-2xl border-b-4 border-violet-800 bg-violet-500 text-lg font-black text-white hover:bg-violet-400"><Play className="mr-2 inline h-5 w-5 fill-current" />JOGAR NOVAMENTE</button> : <div className="tj-inset py-5 font-bold text-slate-400">Aguardando o capitão...</div>}<button onClick={handleLeave} className="h-14 w-full rounded-2xl border-2 border-slate-700 bg-slate-900 font-black text-slate-300"><ArrowLeft className="mr-2 inline h-5 w-5" />Voltar ao início</button></div>
          </main>
        </div>
      </div>
    );
    return <div className="min-h-screen bg-[#1a1e2a]"><MobileNav /><div className="flex justify-center">{gameoverDashboard}</div></div>;

    /* Layout antigo mantido temporariamente até a revisão visual terminar. */
    return (
      <div className="min-h-screen flex flex-col bg-[#1a1b2e] selection:bg-purple-500/30">
        <MobileNav />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
          <div className="w-full max-w-md text-center">

            {/* Trophy animation */}
            <div className="relative mb-6">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mx-auto shadow-2xl shadow-yellow-500/30">
                <Trophy className="w-14 h-14 text-white" />
              </div>
              {isWinner && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center animate-bounce">
                  <Flame className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <h2 className="text-3xl font-black text-white mb-1">
              {isWinner ? '🎉 Você Venceu!' : 'Fim de Jogo!'}
            </h2>
            <p className="text-yellow-400 font-bold text-lg mb-6">
              {winner?.name || gameData.winnerName} é o campeão!
            </p>

            {/* Final standings */}
            <div className={cn(cardClass, "mb-6 text-left")}>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 text-center">Classificação Final</p>
              <div className="space-y-2">
                {[...room.players]
                  .sort((a, b) => {
                    if (a.uid === gameData.winnerId) return -1;
                    if (b.uid === gameData.winnerId) return 1;
                    return (b.hearts || 0) - (a.hearts || 0);
                  })
                  .map((p, idx) => (
                  <div key={p.uid} className={cn(
                    "flex items-center gap-3 p-2 rounded-xl",
                    p.uid === gameData.winnerId ? "bg-yellow-500/10 border border-yellow-500/30" :
                    p.uid === user.uid ? "bg-cyan-500/10" : ""
                  )}>
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-sm font-black",
                      p.uid === gameData.winnerId ? "bg-yellow-500 text-black" : "bg-[#2f3252] text-slate-300"
                    )}>
                      {idx + 1}
                    </div>
                    <span className="flex-1 text-white text-sm font-bold truncate">
                      {p.name}
                      {p.uid === user.uid && <span className="text-cyan-400 text-xs ml-1">(você)</span>}
                    </span>
                    <HeartDisplay count={p.hearts} eliminated={p.eliminated} />
                    {p.uid === gameData.winnerId && <Trophy className="w-4 h-4 text-yellow-400" />}
                  </div>
                ))}
              </div>
            </div>

            <ResultAd />

            {/* Actions */}
            {isHost ? (
              <button
                onClick={returnToLobby}
                className="w-full py-4 rounded-2xl font-black text-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-b-[6px] border-cyan-800 hover:brightness-110 active:border-b-0 active:translate-y-1 shadow-lg shadow-cyan-500/25 transition-all"
                data-testid="button-play-again"
              >
                <Play className="w-5 h-5 inline mr-2" />
                JOGAR NOVAMENTE
              </button>
            ) : (
              <div className="bg-[#242642] rounded-2xl p-4 border-2 border-[#2f3252] text-center">
                <div className="flex items-center justify-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4 animate-pulse" />
                  <span className="text-sm">Aguardando o host...</span>
                </div>
              </div>
            )}

            <button
              onClick={handleLeave}
              className="w-full mt-3 py-3 rounded-2xl font-bold text-sm text-slate-400 border-2 border-[#2f3252] hover:border-slate-500 transition-all"
              data-testid="button-leave"
            >
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function AproximacaoGame() {
  const { phase } = useAproximacaoStore();

  return (
    <>
      <NotificationCenter />
      <AnchorMobileAd />
      {phase === 'home' && <HomeScreen />}
      {phase === 'lobby' && <LobbyScreen />}
      {phase === 'playing' && <PlayingScreen />}
    </>
  );
}
