import { useState, useEffect, useRef } from "react";
import { useAproximacaoStore } from "@/lib/aproximacaoStore";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Copy, LogOut, Play, Crown, Loader2, Users, Home, Zap,
  Heart, HeartOff, Trophy, Target, ArrowLeft, ChevronRight,
  CheckCircle, Clock, TrendingUp, TrendingDown, Minus,
  Flame, Send
} from "lucide-react";
import logoAprox from "@assets/Texto__APROX_1775568617320.webp";

function NotificationCenter() {
  const { notifications, removeNotification } = useAproximacaoStore();
  if (notifications.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="bg-[#1e293b] border border-cyan-500/30 text-white text-sm px-4 py-2 rounded-xl shadow-lg animate-fade-in"
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ backgroundColor: '#0f172a' }}>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal-500/5 blur-3xl" />
      </div>

      {/* Back to home */}
      <div className="absolute top-4 left-4">
        <Link href="/">
          <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <Home className="w-4 h-4" />
            TikJogos
          </button>
        </Link>
      </div>

      {/* Logo */}
      <div className="mb-8 text-center relative z-10">
        <img
          src={logoAprox}
          alt="Jogo da Aproximação"
          className="h-24 md:h-32 object-contain mx-auto mb-2"
        />
        <p className="text-slate-400 text-sm max-w-xs mx-auto">
          Adivinhe números, colete corações, seja o último sobrevivente!
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-[#1e293b] rounded-3xl p-6 shadow-2xl border border-slate-700/50 relative z-10">

        <input
          type="text"
          placeholder="Seu apelido"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          className="w-full bg-[#0f172a] border-2 border-slate-700 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors mb-4"
          data-testid="input-nickname"
        />

        <button
          onClick={handleCreate}
          disabled={isLoading}
          className={cn(
            "w-full py-4 rounded-2xl font-black text-lg tracking-wide flex items-center justify-center gap-2 transition-all border-b-4",
            !isLoading
              ? "bg-gradient-to-r from-cyan-500 to-teal-500 border-cyan-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-1 shadow-lg shadow-cyan-500/25"
              : "bg-slate-700 border-slate-800 text-slate-500 cursor-not-allowed"
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
          <div className="flex-1 h-px bg-slate-700" />
          <span className="text-slate-500 text-sm font-bold">OU</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="CÓDIGO"
            value={joinCode}
            maxLength={3}
            onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            className="flex-1 bg-[#0f172a] border-2 border-slate-700 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-center font-mono font-bold tracking-widest uppercase"
            data-testid="input-join-code"
          />
          <button
            onClick={handleJoin}
            disabled={isLoading}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-2xl font-bold transition-all disabled:opacity-50 border-b-4 border-slate-800 active:border-b-0 active:translate-y-1"
            data-testid="button-join-room"
          >
            Entrar
          </button>
        </div>
        {joinError && <p className="text-red-400 text-xs mt-2 text-center">{joinError}</p>}

        {/* How to play quick ref */}
        <div className="mt-6 bg-[#0f172a] rounded-2xl p-4 border border-slate-700/50">
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ backgroundColor: '#0f172a' }}>

      {/* Header */}
      <div className="w-full max-w-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoAprox} alt="Jogo da Aproximação" className="h-8 object-contain" />
          </div>
          <button onClick={leaveGame} className="text-slate-400 hover:text-red-400 transition-colors p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Room code card */}
      <div className="w-full max-w-sm bg-[#1e293b] rounded-3xl p-6 shadow-2xl border border-slate-700/50 mb-4">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider text-center mb-2">Código da Sala</p>
        <button
          onClick={copyCode}
          className="w-full flex items-center justify-center gap-3 bg-[#0f172a] rounded-2xl p-4 border-2 border-cyan-500/30 hover:border-cyan-500/60 transition-colors group"
          data-testid="button-copy-code"
        >
          <span className="text-4xl font-black tracking-[0.3em] text-cyan-400 font-mono">{room.code}</span>
          <Copy className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
        </button>
        <p className="text-slate-500 text-xs text-center mt-2">Compartilhe este código para convidar jogadores</p>
      </div>

      {/* Players */}
      <div className="w-full max-w-sm bg-[#1e293b] rounded-3xl p-6 shadow-2xl border border-slate-700/50 mb-4">
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
                player.uid === user.uid ? "bg-cyan-500/10 border border-cyan-500/30" : "bg-[#0f172a]"
              )}
              data-testid={`player-${player.uid}`}
            >
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center font-black text-sm",
                player.uid === user.uid ? "bg-cyan-500 text-white" : "bg-slate-700 text-slate-300"
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
        <div className="w-full max-w-sm">
          {!canStart && (
            <p className="text-slate-500 text-xs text-center mb-2">Aguardando pelo menos 2 jogadores...</p>
          )}
          <button
            onClick={startGame}
            disabled={!canStart}
            className={cn(
              "w-full py-4 rounded-2xl font-black text-lg tracking-wide flex items-center justify-center gap-2 transition-all border-b-4",
              canStart
                ? "bg-gradient-to-r from-cyan-500 to-teal-500 border-cyan-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-1 shadow-lg shadow-cyan-500/25"
                : "bg-slate-700 border-slate-800 text-slate-500 cursor-not-allowed opacity-50"
            )}
            data-testid="button-start-game"
          >
            <Play className="w-5 h-5" />
            INICIAR JOGO
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm bg-[#1e293b] rounded-2xl p-4 border border-slate-700/50 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Aguardando o host iniciar...</span>
          </div>
        </div>
      )}
    </div>
  );
}

function PlayingScreen() {
  const { room, user, submitGuess, revealResults, nextRound, returnToLobby, myGuess, setMyGuess } = useAproximacaoStore();
  const [inputValue, setInputValue] = useState('');
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  if (!room || !user || !room.gameData) return null;

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

  // Guessing phase
  if (gameData.phase === 'guessing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
        style={{ backgroundColor: '#0f172a' }}>

        {/* Header row */}
        <div className="w-full max-w-sm flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm">Rodada {gameData.roundNumber}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-sm">
            <Users className="w-4 h-4" />
            {guessCount}/{totalActivePlayers} palpites
          </div>
        </div>

        {/* Players hearts bar */}
        <div className="w-full max-w-sm mb-4">
          <div className="flex gap-2 flex-wrap">
            {room.players.map(p => (
              <div key={p.uid} className={cn(
                "flex items-center gap-1.5 bg-[#1e293b] rounded-xl px-3 py-1.5 border",
                p.eliminated ? "border-slate-700/30 opacity-40" : "border-slate-700/50",
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
        <div className="w-full max-w-sm bg-[#1e293b] rounded-3xl p-6 shadow-2xl border border-slate-700/50 mb-4">
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
          <div className="w-full max-w-sm bg-red-900/20 rounded-2xl p-4 border border-red-500/30 text-center">
            <HeartOff className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Você foi eliminado. Aguarde a rodada acabar.</p>
          </div>
        ) : hasMyGuess ? (
          <div className="w-full max-w-sm bg-green-900/20 rounded-2xl p-4 border border-green-500/30 text-center">
            <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <p className="text-green-400 font-bold text-sm">Palpite enviado!</p>
            <p className="text-slate-400 text-xs mt-1">Aguardando outros jogadores...</p>
          </div>
        ) : (
          <div className="w-full max-w-sm bg-[#1e293b] rounded-3xl p-6 shadow-2xl border border-slate-700/50">
            <p className="text-slate-400 text-sm mb-3 text-center">Seu palpite (número):</p>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="number"
                placeholder="Ex: 330"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmitGuess()}
                className="flex-1 bg-[#0f172a] border-2 border-slate-700 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-center font-mono text-xl font-bold"
                data-testid="input-guess"
              />
              <button
                onClick={handleSubmitGuess}
                disabled={!inputValue}
                className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:opacity-50 text-white px-4 py-3 rounded-2xl font-bold transition-all border-b-4 border-cyan-800 disabled:border-slate-800 active:border-b-0 active:translate-y-1"
                data-testid="button-submit-guess"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Host reveal button */}
        {isHost && (
          <div className="w-full max-w-sm mt-4">
            <button
              onClick={revealResults}
              className="w-full py-3 rounded-2xl font-bold text-sm text-slate-400 border border-slate-700 hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
              data-testid="button-reveal"
            >
              Revelar Resultados ({guessCount} palpites)
            </button>
          </div>
        )}
      </div>
    );
  }

  // Revealing phase
  if (gameData.phase === 'revealing') {
    const result = gameData.lastRoundResult;
    const correctAnswer = gameData.question.answer;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
        style={{ backgroundColor: '#0f172a' }}>

        <div className="w-full max-w-sm">
          {/* Round number */}
          <div className="text-center mb-4">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Rodada {gameData.roundNumber} — Resultado</span>
          </div>

          {/* Question recap */}
          <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700/50 mb-4 text-center">
            <p className="text-slate-400 text-sm mb-2">{gameData.question.text}</p>
            <p className="text-3xl font-black text-cyan-400">
              {correctAnswer.toLocaleString('pt-BR')} <span className="text-lg font-semibold text-slate-400">{gameData.question.unit}</span>
            </p>
          </div>

          {/* Ranking */}
          <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700/50 mb-4">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Ranking de Aproximação</p>
            {result ? (
              <div className="space-y-2">
                {result.allGuesses.map((g, idx) => {
                  const diff = Math.abs(g.value - correctAnswer);
                  const pct = correctAnswer !== 0 ? Math.round((diff / correctAnswer) * 100) : 0;
                  const isClosest = g.playerId === result.closestId;
                  const isFarthest = g.playerId === result.farthestId && result.closestId !== result.farthestId;
                  return (
                    <div key={g.playerId} className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border",
                      isClosest ? "bg-green-900/20 border-green-500/40" :
                      isFarthest ? "bg-red-900/20 border-red-500/40" :
                      "bg-[#0f172a] border-slate-700/30"
                    )}>
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-sm font-black",
                        isClosest ? "bg-green-500 text-white" :
                        isFarthest ? "bg-red-500 text-white" :
                        "bg-slate-700 text-slate-300"
                      )}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold truncate">{g.playerName}</p>
                        <p className="text-slate-400 text-xs">
                          Palpite: <span className="font-mono text-white">{g.value.toLocaleString('pt-BR')}</span>
                          <span className="ml-2 text-slate-500">({diff > 0 ? '+' : ''}{(g.value - correctAnswer).toLocaleString('pt-BR')} / {pct}% de diferença)</span>
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {isClosest && <TrendingUp className="w-5 h-5 text-green-400" />}
                        {isFarthest && <TrendingDown className="w-5 h-5 text-red-400" />}
                        {!isClosest && !isFarthest && <Minus className="w-5 h-5 text-slate-600" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-500 text-sm text-center">Nenhum palpite foi enviado nesta rodada.</p>
            )}
          </div>

          {/* Hearts update */}
          {result && (
            <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700/50 mb-4">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Corações Atuais</p>
              <div className="space-y-2">
                {[...room.players].sort((a, b) => (b.eliminated ? -1 : 0) - (a.eliminated ? -1 : 0)).map(p => (
                  <div key={p.uid} className={cn(
                    "flex items-center gap-3 p-2 rounded-xl",
                    p.eliminated ? "opacity-50" : "",
                    p.uid === user.uid ? "bg-cyan-500/10" : ""
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black",
                      p.eliminated ? "bg-slate-700 text-slate-500" : "bg-slate-700 text-white"
                    )}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <span className={cn("flex-1 text-sm font-bold", p.eliminated ? "text-slate-500 line-through" : "text-white")}>
                      {p.name}
                      {p.uid === user.uid && <span className="text-cyan-400 text-xs ml-1">(você)</span>}
                    </span>
                    {p.eliminated ? (
                      <span className="text-xs text-red-400 font-bold">ELIMINADO</span>
                    ) : (
                      <HeartDisplay count={p.hearts} />
                    )}
                    {result.closestId === p.uid && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold border border-green-500/30">+1 ❤️</span>
                    )}
                    {result.farthestId === p.uid && result.closestId !== result.farthestId && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold border border-red-500/30">-1 ❤️</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Host actions */}
          {isHost ? (
            <div className="flex gap-3">
              <button
                onClick={returnToLobby}
                className="flex-1 py-3 rounded-2xl font-bold text-sm text-slate-400 border border-slate-700 hover:border-slate-500 transition-all"
                data-testid="button-return-lobby"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Lobby
              </button>
              <button
                onClick={nextRound}
                className="flex-1 py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-b-4 border-cyan-800 hover:brightness-110 active:border-b-0 active:translate-y-1 shadow-lg shadow-cyan-500/25 transition-all"
                data-testid="button-next-round"
              >
                Próxima <ChevronRight className="w-4 h-4 inline" />
              </button>
            </div>
          ) : (
            <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700/50 text-center">
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <Clock className="w-4 h-4 animate-pulse" />
                <span className="text-sm">Aguardando o host continuar...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Game over phase
  if (gameData.phase === 'gameover') {
    const winner = room.players.find(p => p.uid === gameData.winnerId);
    const isWinner = user.uid === gameData.winnerId;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
        style={{ backgroundColor: '#0f172a' }}>
        <div className="w-full max-w-sm text-center">

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
          <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700/50 mb-6 text-left">
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
                    p.uid === gameData.winnerId ? "bg-yellow-500 text-black" : "bg-slate-700 text-slate-300"
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

          {/* Actions */}
          {isHost ? (
            <button
              onClick={returnToLobby}
              className="w-full py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-b-4 border-cyan-800 hover:brightness-110 active:border-b-0 active:translate-y-1 shadow-lg shadow-cyan-500/25 transition-all"
              data-testid="button-play-again"
            >
              <Play className="w-5 h-5 inline mr-2" />
              JOGAR NOVAMENTE
            </button>
          ) : (
            <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700/50 text-center">
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <Clock className="w-4 h-4 animate-pulse" />
                <span className="text-sm">Aguardando o host...</span>
              </div>
            </div>
          )}
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
      {phase === 'home' && <HomeScreen />}
      {phase === 'lobby' && <LobbyScreen />}
      {phase === 'playing' && <PlayingScreen />}
    </>
  );
}
