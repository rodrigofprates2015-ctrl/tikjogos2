import { useState, useEffect, useCallback } from "react";
import { useDrawingGameStore } from "@/lib/drawingGameStore";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  User, Users, Zap, Copy, LogOut, Play, Crown,
  Loader2, ArrowLeft, Send, Check, Vote, Skull,
  Trophy, Clock, Paintbrush, Home, Undo2, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { PALAVRA_SECRETA_SUBMODES, type PalavraSuperSecretaSubmode } from "@/lib/palavra-secreta-submodes";
import logoImpostorArt from "@assets/logo_impostor_art.png";

/** Leave game and navigate back to home */
function useLeaveAndGoHome() {
  const { leaveGame } = useDrawingGameStore();
  const [, navigate] = useLocation();
  return useCallback(() => {
    leaveGame();
    navigate('/');
  }, [leaveGame, navigate]);
}

// ─── LOBBY ───
const DrawingLobbyScreen = () => {
  const { room, user, goToThemeSelect } = useDrawingGameStore();
  const handleLeave = useLeaveAndGoHome();
  const { toast } = useToast();

  if (!room) return null;

  const isHost = room.hostId === user?.uid;
  const players = room.players || [];

  const copyLink = () => {
    const shareLink = `${window.location.origin}/desenho-impostor?sala=${room.code}`;
    navigator.clipboard.writeText(shareLink);
    toast({ title: "Copiado!", description: "Link da sala copiado." });
  };

  const handleStart = () => {
    if (players.length < 3) {
      toast({ title: "Mínimo 3 jogadores", description: "Aguarde mais jogadores entrarem.", variant: "destructive" });
      return;
    }
    goToThemeSelect();
  };

  return (
    <div className="flex flex-col w-full max-w-2xl py-6 px-4 animate-fade-in relative z-10">
      <div className="bg-[#242642] rounded-[3rem] p-6 md:p-10 shadow-2xl border-4 border-[#2f3252] relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div onClick={copyLink} className="cursor-pointer group flex-1 text-center md:text-left">
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-2 font-bold group-hover:text-emerald-400 transition-colors">
              Código da Sala
            </p>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <h2 className="text-5xl md:text-6xl font-black tracking-widest font-mono text-emerald-500 group-hover:text-emerald-400 transition-colors">
                {room.code}
              </h2>
              <div className="p-3 bg-emerald-500/10 rounded-2xl border-2 border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                <Copy className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-2 font-medium">Clique para copiar o link</p>
          </div>

          <button
            onClick={handleLeave}
            className="p-3 bg-slate-800 rounded-2xl hover:bg-rose-500 transition-all border-b-4 border-slate-950 hover:border-rose-700 active:border-b-0 active:translate-y-1 text-slate-400 hover:text-white group"
          >
            <LogOut size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Player list */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-xl border-2 border-emerald-500/20">
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-white text-lg font-black">Jogadores</h3>
            <div className="px-3 py-1 bg-emerald-500 text-white text-sm font-black rounded-full border-2 border-emerald-700">
              {players.length}
            </div>
          </div>

          <ul className="space-y-3">
            {players.map((p) => {
              const isMe = p.uid === user?.uid;
              const isPlayerHost = p.uid === room.hostId;
              return (
                <li
                  key={p.uid}
                  className={cn(
                    "relative p-4 rounded-3xl flex items-center border-4 transition-all",
                    isMe
                      ? "bg-emerald-500 border-emerald-700 shadow-[0_6px_0_0_rgba(0,0,0,0.2)]"
                      : "bg-slate-800 border-slate-900 shadow-lg"
                  )}
                >
                  {isPlayerHost && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full p-1.5 border-3 border-yellow-600 shadow-sm z-10">
                      <Crown size={16} fill="currentColor" />
                    </div>
                  )}
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black border-2 border-black/10 shrink-0",
                    isMe ? "bg-white/20 text-white" : "bg-emerald-600 text-white"
                  )}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={cn("ml-4 font-black text-lg", isMe ? "text-white" : "text-slate-100")}>
                    {p.name}
                  </span>
                  {isMe && <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">Você</span>}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Start button (host only) */}
        {isHost ? (
          <button
            onClick={handleStart}
            className="w-full px-8 py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl bg-gradient-to-r from-emerald-500 to-green-500 border-emerald-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2"
          >
            <Play size={28} />
            INICIAR JOGO
          </button>
        ) : (
          <div className="text-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mx-auto mb-2" />
            <p className="text-slate-400 font-bold">Aguardando o host iniciar...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── THEME SELECT SCREEN ───
const DrawingThemeSelectScreen = () => {
  const { room, user, startGame } = useDrawingGameStore();
  const isHost = room && user && room.hostId === user.uid;

  const handleSelectTheme = (submode: PalavraSuperSecretaSubmode) => {
    if (!isHost) return;
    startGame({ turnTimeLimit: 30, theme: submode });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6 relative">
      {/* Decorative bg */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-green-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1000ms' }}></div>
      </div>

      <div className="bg-[#242642] rounded-[3rem] p-6 md:p-10 shadow-2xl border-4 border-[#2f3252] relative z-10">
        <div className="text-center space-y-2 mb-8">
          <div className="flex items-center justify-center gap-2 text-white mb-2">
            <Paintbrush className="w-6 h-6 text-emerald-400 animate-pulse" />
            <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">Escolha um Tema</h1>
            <Paintbrush className="w-6 h-6 text-emerald-400 animate-pulse" />
          </div>
          <p className="text-slate-400 text-base md:text-lg font-medium">Selecione a categoria de palavras para desenhar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {(Object.entries(PALAVRA_SECRETA_SUBMODES) as Array<[PalavraSuperSecretaSubmode, typeof PALAVRA_SECRETA_SUBMODES['classico']]>).map(([submodeId, submode], index) => {
            const isRecommended = index === 0;

            return (
              <button
                key={submodeId}
                onClick={() => handleSelectTheme(submodeId)}
                disabled={!isHost}
                className={cn(
                  "relative p-5 rounded-3xl cursor-pointer transition-all duration-200 flex flex-col gap-4 h-full border-4",
                  !isHost
                    ? "bg-slate-700 border-slate-800 opacity-50 cursor-not-allowed"
                    : "bg-slate-800 border-slate-900 hover:bg-slate-750 hover:-translate-y-1 hover:border-slate-700 shadow-lg"
                )}
              >
                {/* Badge Recomendado */}
                {isRecommended && isHost && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full border-2 border-yellow-600 shadow-sm z-10 flex items-center gap-1 w-max">
                    <Star size={12} fill="currentColor" /> RECOMENDADO
                  </div>
                )}

                {/* Image Container */}
                {submode.image ? (
                  <div className="w-full h-40 overflow-hidden rounded-2xl bg-black/50 flex items-center justify-center">
                    <img
                      src={submode.image}
                      alt={submode.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center border-2 border-black/10">
                    <span className="text-4xl">🎨</span>
                  </div>
                )}

                {/* Content */}
                <div className="flex flex-col gap-2 flex-1">
                  <h3 className="font-black text-xl leading-tight text-slate-100">
                    {submode.title}
                  </h3>
                  <p className="text-sm font-medium leading-relaxed text-slate-400 flex-1">
                    {submode.desc}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900 text-slate-400 border-2 border-black/10">
                      {submode.words.length} PALAVRAS
                    </span>
                  </div>
                </div>

                {!isHost && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-3xl backdrop-blur-sm">
                    <div className="text-center">
                      <div className="flex gap-2 justify-center mb-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <p className="text-slate-300 text-sm font-bold">Aguardando o host...</p>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── GAME SCREEN (Drawing Phase) ───
const DrawingGameScreen = () => {
  const { room, user, completeTurn, strokes, addStroke, sendStroke, undoStroke, sendUndo } = useDrawingGameStore();
  const [timeLeft, setTimeLeft] = useState(30);

  if (!room || !room.gameData) return null;

  const gameData = room.gameData;
  const isImpostor = gameData.impostorIds?.includes(user?.uid || '');
  const currentDrawerId = gameData.currentDrawerId;
  const isMyTurn = currentDrawerId === user?.uid;
  const currentDrawer = room.players.find(p => p.uid === currentDrawerId);
  const drawingOrder = gameData.drawingOrder || [];
  const currentIndex = gameData.currentDrawerIndex || 0;
  const totalTurns = drawingOrder.length;

  // Timer countdown
  useEffect(() => {
    const limit = gameData.turnTimeLimit || 30;
    setTimeLeft(limit);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (isMyTurn) completeTurn();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentDrawerId, gameData.turnTimeLimit, isMyTurn, completeTurn]);

  const handleStroke = (stroke: Parameters<typeof addStroke>[0]) => {
    addStroke(stroke);
    sendStroke(stroke);
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    undoStroke();
    sendUndo();
  };

  return (
    <div className="flex flex-col w-full max-w-2xl py-4 px-4 animate-fade-in relative z-10">
      <div className="bg-[#242642] rounded-[3rem] p-4 md:p-8 shadow-2xl border-4 border-[#2f3252] relative z-10">
        {/* Top bar: word + timer */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Paintbrush className="w-5 h-5 text-emerald-400" />
            <span className="text-white font-black text-lg">
              {isImpostor ? "Você é o IMPOSTOR!" : `Palavra: ${gameData.word}`}
            </span>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full font-black text-sm",
            timeLeft <= 10 ? "bg-rose-500/20 text-rose-400" : "bg-slate-700 text-slate-300"
          )}>
            <Clock className="w-4 h-4" />
            {timeLeft}s
          </div>
        </div>

        {/* Turn indicator */}
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-slate-400 text-sm font-bold">
            {isMyTurn ? "Sua vez de desenhar!" : `${currentDrawer?.name || '...'} está desenhando`}
          </p>
          <span className="text-slate-500 text-xs font-bold">
            Turno {currentIndex + 1}/{totalTurns}
          </span>
        </div>

        {/* Canvas */}
        <DrawingCanvas
          isDrawing={isMyTurn}
          strokes={strokes}
          onStroke={handleStroke}
          onUndo={isMyTurn ? handleUndo : undefined}
        />

        {/* Pronto button (only for current drawer) */}
        {isMyTurn && (
          <button
            onClick={() => completeTurn()}
            className="w-full mt-4 px-8 py-4 rounded-2xl font-black text-lg tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl bg-gradient-to-r from-emerald-500 to-green-500 border-emerald-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2"
          >
            <Check size={24} />
            PRONTO
          </button>
        )}
      </div>
    </div>
  );
};

// ─── DISCUSSION SCREEN ───
const DiscussionScreen = () => {
  const { room, user, strokes } = useDrawingGameStore();
  const [showVoteButton, setShowVoteButton] = useState(false);

  useEffect(() => {
    // Show vote button after 5 seconds of discussion
    const timer = setTimeout(() => setShowVoteButton(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!room) return null;
  const isHost = room.hostId === user?.uid;

  const handleStartVoting = async () => {
    try {
      await fetch(`/api/drawing-rooms/${room.code}/start-voting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error starting voting:', error);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl py-4 px-4 animate-fade-in relative z-10">
      <div className="bg-[#242642] rounded-[3rem] p-4 md:p-8 shadow-2xl border-4 border-[#2f3252] relative z-10">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-black text-white mb-2">Discussão</h2>
          <p className="text-slate-400 text-sm">Analisem o desenho e discutam quem é o impostor!</p>
        </div>

        {/* Final canvas (read-only) */}
        <DrawingCanvas isDrawing={false} strokes={strokes} onStroke={() => {}} />

        {/* Start voting button (host only) */}
        {isHost && showVoteButton && (
          <button
            onClick={handleStartVoting}
            className="w-full mt-4 px-8 py-4 rounded-2xl font-black text-lg tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl bg-gradient-to-r from-amber-500 to-orange-500 border-amber-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2"
          >
            <Vote size={24} />
            INICIAR VOTAÇÃO
          </button>
        )}
        {!isHost && (
          <p className="text-center text-slate-500 text-sm font-bold mt-4">Aguardando o host iniciar a votação...</p>
        )}
      </div>
    </div>
  );
};

// ─── VOTING SCREEN ───
const VotingScreen = () => {
  const { room, user, submitVote } = useDrawingGameStore();
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  if (!room || !room.gameData) return null;

  const players = room.players.filter(p => p.uid !== user?.uid);
  const votes = room.gameData.votes || [];
  const myVote = votes.find(v => v.playerId === user?.uid);

  useEffect(() => {
    if (myVote) setHasVoted(true);
  }, [myVote]);

  const handleVote = async () => {
    if (!selectedVote) return;
    await submitVote(selectedVote);
    setHasVoted(true);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl py-4 px-4 animate-fade-in relative z-10">
      <div className="bg-[#242642] rounded-[3rem] p-6 md:p-10 shadow-2xl border-4 border-[#2f3252] relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-white mb-2">Votação</h2>
          <p className="text-slate-400 text-sm">Quem é o impostor?</p>
          <p className="text-slate-500 text-xs mt-1">
            {votes.length}/{room.players.length} votaram
          </p>
        </div>

        {!hasVoted ? (
          <>
            <div className="space-y-2 mb-4">
              {players.map(player => (
                <button
                  key={player.uid}
                  onClick={() => setSelectedVote(player.uid)}
                  className={cn(
                    "w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3",
                    selectedVote === player.uid
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-400"
                      : "bg-[#16213e]/50 border-[#3d4a5c] text-gray-300 hover:border-emerald-500/50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-base font-bold",
                    selectedVote === player.uid ? "bg-emerald-500 text-black" : "bg-gray-600 text-gray-200"
                  )}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold">{player.name}</span>
                  {selectedVote === player.uid && <Check className="w-5 h-5 ml-auto" />}
                </button>
              ))}
            </div>

            <Button
              onClick={handleVote}
              disabled={!selectedVote}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl disabled:opacity-30"
            >
              <Send className="mr-2 w-4 h-4" /> Confirmar Voto
            </Button>
          </>
        ) : (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
            <p className="text-slate-400 font-bold">Aguardando todos votarem...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── RESULT SCREEN ───
const ResultScreen = () => {
  const { room, user, returnToLobby } = useDrawingGameStore();
  const handleLeave = useLeaveAndGoHome();

  if (!room || !room.gameData) return null;

  const gameData = room.gameData;
  const votes = gameData.votes || [];
  const impostorIds = gameData.impostorIds || [];
  const isHost = room.hostId === user?.uid;

  // Count votes per player
  const voteCounts: Record<string, number> = {};
  votes.forEach(v => { voteCounts[v.targetId] = (voteCounts[v.targetId] || 0) + 1; });

  // Most voted player
  const mostVotedId = Object.entries(voteCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const impostorCaught = mostVotedId && impostorIds.includes(mostVotedId);
  const impostorPlayer = room.players.find(p => impostorIds.includes(p.uid));

  return (
    <div className="flex flex-col w-full max-w-2xl py-4 px-4 animate-fade-in relative z-10">
      <div className="bg-[#242642] rounded-[3rem] p-6 md:p-10 shadow-2xl border-4 border-[#2f3252] relative z-10 text-center">
        {/* Result icon */}
        <div className="mb-4">
          {impostorCaught ? (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border-4 border-emerald-500 mb-3">
              <Trophy className="w-10 h-10 text-emerald-400" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-500/20 border-4 border-rose-500 mb-3">
              <Skull className="w-10 h-10 text-rose-400" />
            </div>
          )}
        </div>

        <h2 className="text-3xl font-black text-white mb-2">
          {impostorCaught ? "Impostor Descoberto!" : "Impostor Venceu!"}
        </h2>
        <p className="text-slate-400 mb-6">
          O impostor era <span className="text-emerald-400 font-black">{impostorPlayer?.name}</span>
        </p>

        {/* Word reveal */}
        {gameData.word && (
          <div className="bg-slate-800 rounded-2xl p-4 mb-6 border-2 border-slate-700">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-1 font-bold">A palavra era</p>
            <p className="text-2xl font-black text-white">{gameData.word}</p>
          </div>
        )}

        {/* Vote breakdown */}
        <div className="space-y-2 mb-6 text-left">
          {votes.map((v, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-xl p-3 border border-slate-700">
              <span className="text-slate-300 font-bold text-sm">{v.playerName}</span>
              <span className="text-slate-500 text-sm">votou em <span className={cn(
                "font-bold",
                impostorIds.includes(v.targetId) ? "text-emerald-400" : "text-slate-300"
              )}>{v.targetName}</span></span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {isHost ? (
            <button
              onClick={() => returnToLobby()}
              className="w-full px-6 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all border-b-[6px] shadow-2xl bg-gradient-to-r from-emerald-500 to-green-500 border-emerald-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2"
            >
              <Play size={20} /> Jogar Novamente
            </button>
          ) : (
            <div className="text-center py-2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-500 mx-auto mb-1" />
              <p className="text-slate-500 text-sm font-bold">Aguardando o host...</p>
            </div>
          )}
          <button
            onClick={handleLeave}
            className="w-full px-6 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all border-b-[6px] shadow-2xl bg-slate-700 border-slate-900 text-slate-300 hover:bg-slate-600 active:border-b-0 active:translate-y-2"
          >
            <LogOut size={20} /> Sair
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───
export default function DesenhoImpostor() {
  const { phase } = useDrawingGameStore();
  const [, navigate] = useLocation();

  // If user lands here directly without an active room, redirect to home scrolled to the drawing card
  useEffect(() => {
    if (phase === 'home') {
      navigate('/');
      // Small delay so the navigation completes before scrolling
      setTimeout(() => {
        const el = document.getElementById('desenho-impostor');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [phase, navigate]);

  if (phase === 'home') return null;

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center font-poppins text-white overflow-hidden relative"
      style={{ backgroundColor: '#1C202C' }}
    >
      {/* Decorative bg */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-600/15 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-green-600/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1000ms' }}></div>
      </div>

      {phase === 'lobby' && <DrawingLobbyScreen />}
      {phase === 'themeSelect' && <DrawingThemeSelectScreen />}
      {phase === 'playing' && <DrawingGameScreen />}
      {phase === 'discussion' && <DiscussionScreen />}
      {phase === 'voting' && <VotingScreen />}
      {phase === 'result' && <ResultScreen />}
    </div>
  );
}
