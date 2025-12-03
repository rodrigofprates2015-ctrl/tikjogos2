import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Vote, Check, Users, Send, Skull, Trophy, RotateCcw, X } from 'lucide-react';
import { Player, PlayerVote } from '@shared/schema';

type VotingPhase = 'discussion' | 'voting' | 'waitingVotes' | 'result';

interface VotingSystemProps {
  roomCode: string;
  userId: string;
  userName: string;
  isHost: boolean;
  activePlayers: Player[];
  impostorId: string;
  votes: PlayerVote[];
  votingStarted: boolean;
  votesRevealed: boolean;
  onNewRound: () => void;
}

export function VotingSystem({
  roomCode,
  userId,
  userName,
  isHost,
  activePlayers,
  impostorId,
  votes,
  votingStarted,
  votesRevealed,
  onNewRound
}: VotingSystemProps) {
  const [phase, setPhase] = useState<VotingPhase>('discussion');
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPlayers = activePlayers.length;
  const votedCount = votes.length;
  const allVoted = votedCount >= totalPlayers;
  const hasMyVote = votes.some((v: PlayerVote) => v.playerId === userId);

  useEffect(() => {
    if (!votingStarted && !votesRevealed) {
      setPhase('discussion');
      setSelectedVote(null);
    } else if (votesRevealed && phase !== 'result') {
      setPhase('result');
    } else if (votingStarted && !votesRevealed && hasMyVote && phase !== 'waitingVotes' && phase !== 'result') {
      setPhase('waitingVotes');
    } else if (votingStarted && !votesRevealed && !hasMyVote && phase !== 'voting' && phase !== 'waitingVotes' && phase !== 'result') {
      setPhase('voting');
    }
  }, [votingStarted, votesRevealed, hasMyVote, phase]);

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

  const handleSubmitVote = async () => {
    if (!selectedVote) return;
    
    const targetPlayer = activePlayers.find(p => p.uid === selectedVote);
    if (!targetPlayer) return;
    
    setIsSubmitting(true);
    try {
      await fetch(`/api/rooms/${roomCode}/submit-vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: userId,
          playerName: userName,
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
    try {
      await fetch(`/api/rooms/${roomCode}/reveal-impostor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error revealing impostor:', error);
    }
  };

  if (phase === 'discussion') {
    return (
      <div className="w-full space-y-4 mt-4">
        {isHost && (
          <Button 
            onClick={handleStartVoting}
            className="w-full h-12 bg-white hover:bg-white/80 text-black font-bold text-base rounded-lg transition-all"
            style={{ boxShadow: '0 4px 0 rgba(255, 255, 255, 0.2)' }}
            data-testid="button-start-voting"
          >
            <Vote className="mr-2 w-5 h-5" /> Iniciar Votacao
          </Button>
        )}
        {!isHost && (
          <p className="text-gray-400 text-sm text-center">
            Aguardando o host iniciar a votacao...
          </p>
        )}
      </div>
    );
  }

  if (phase === 'voting') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
        <div className="relative w-full max-w-md bg-[#16213e] rounded-2xl p-6 border border-[#3d4a5c] space-y-6">
          {isHost && (
            <button
              onClick={onNewRound}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center hover:bg-gray-700 transition-colors z-10"
              data-testid="button-cancel-voting"
            >
              <X className="w-5 h-5 text-gray-300" />
            </button>
          )}
          <div className="text-center space-y-2">
            <Vote className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">Hora de Votar!</p>
            <p className="text-gray-300 text-sm">Quem voce acha que e o impostor?</p>
          </div>
          
          <div className="w-full h-[1px] bg-gray-700"></div>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {activePlayers.filter(p => p.uid !== userId).map(player => (
              <button
                key={player.uid}
                onClick={() => setSelectedVote(player.uid)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3",
                  selectedVote === player.uid
                    ? "bg-white/15 border-white/40 text-white"
                    : "bg-[#16213e] border-[#3d4a5c] text-gray-300 hover:border-white/30"
                )}
                data-testid={`button-vote-${player.uid}`}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold",
                  selectedVote === player.uid ? "bg-white/30 text-white" : "bg-gray-600 text-gray-200"
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
            className="w-full h-14 bg-white hover:bg-white/80 text-black font-bold text-lg rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ boxShadow: '0 4px 0 rgba(255, 255, 255, 0.2)' }}
            data-testid="button-confirm-vote"
          >
            <Send className="mr-2 w-5 h-5" /> {isSubmitting ? 'Votando...' : 'Confirmar Voto'}
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'waitingVotes') {
    const myVote = votes.find((v: PlayerVote) => v.playerId === userId);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
        <div className="relative w-full max-w-md bg-[#16213e] rounded-2xl p-6 border border-[#3d4a5c] space-y-6">
          {isHost && (
            <button
              onClick={onNewRound}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center hover:bg-gray-700 transition-colors z-10"
              data-testid="button-cancel-waiting"
            >
              <X className="w-5 h-5 text-gray-300" />
            </button>
          )}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-[#3d8b5f]/20 border-2 border-[#3d8b5f] flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-[#3d8b5f]" />
            </div>
            <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">Voto Enviado!</p>
            <p className="text-white text-lg font-medium">Voce votou em: <span className="text-gray-300">{myVote?.targetName}</span></p>
          </div>
          
          <div className="w-full h-[1px] bg-gray-700"></div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              <p className="text-gray-300">
                <span className="text-gray-300 font-bold">{votedCount}</span> de <span className="font-bold">{totalPlayers}</span> votaram
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

          {isHost && allVoted && (
            <Button 
              onClick={handleRevealImpostor}
              className="w-full h-14 bg-white hover:bg-white/80 text-black font-bold text-lg rounded-lg transition-all"
              style={{ boxShadow: '0 4px 0 rgba(255, 255, 255, 0.2)' }}
              data-testid="button-reveal-impostor"
            >
              <Skull className="mr-2 w-5 h-5" /> Revelar o Impostor
            </Button>
          )}
          
          {!isHost && allVoted && (
            <p className="text-gray-400 text-sm text-center font-medium animate-pulse">
              Aguardando o host revelar o impostor...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const impostorPlayer = activePlayers.find(p => p.uid === impostorId);
    const impostorName = impostorPlayer?.name || 'Desconhecido';
    
    const votesForImpostor = votes.filter((v: PlayerVote) => v.targetId === impostorId).length;
    const crewWins = votesForImpostor > totalPlayers / 2;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
        <div className={cn(
          "relative w-full max-w-md rounded-2xl p-6 space-y-5 border-2",
          "bg-[#16213e]",
          crewWins ? "border-[#3d8b5f]" : "border-[#c44536]"
        )}>
          {!isHost && (
            <button
              onClick={onNewRound}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center hover:bg-gray-700 transition-colors z-10"
              data-testid="button-close-result"
            >
              <X className="w-5 h-5 text-gray-300" />
            </button>
          )}
          <div className="space-y-3 text-center">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mx-auto",
              crewWins ? "bg-[#3d8b5f]" : "bg-[#c44536]"
            )}>
              {crewWins ? (
                <Trophy className="w-8 h-8 text-white" />
              ) : (
                <Skull className="w-8 h-8 text-white" />
              )}
            </div>
            
            <h2 className={cn(
              "text-2xl font-bold",
              crewWins ? "text-[#3d8b5f]" : "text-[#c44536]"
            )}>
              {crewWins ? "TRIPULACAO VENCEU!" : "IMPOSTOR VENCEU!"}
            </h2>
            
            <p className="text-gray-300">
              O impostor era: <span className="text-[#c44536] font-bold">{impostorName}</span>
            </p>
          </div>
          
          <div className="w-full h-[1px] bg-[#3d4a5c]"></div>
          
          <div className="space-y-3">
            <p className="text-[#e9c46a] text-xs uppercase tracking-widest font-bold text-center">Resultados da Votacao</p>
            
            <div className="space-y-2 max-h-[180px] overflow-y-auto">
              {activePlayers.map(player => {
                const votesReceived = votes.filter((v: PlayerVote) => v.targetId === player.uid).length;
                const isTheImpostor = player.uid === impostorId;
                return (
                  <div 
                    key={player.uid}
                    className={cn(
                      "w-full p-3 rounded-lg flex items-center justify-between",
                      isTheImpostor 
                        ? "bg-[#c44536]/20 border border-[#c44536]/50"
                        : "bg-[#0a1628]/50"
                    )}
                  >
                    <span className={cn(
                      "font-bold text-sm",
                      isTheImpostor ? "text-[#c44536]" : "text-gray-300"
                    )}>
                      {player.name}
                      {isTheImpostor && " (Impostor)"}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[#e9c46a] font-bold">{votesReceived}</span>
                      <span className="text-gray-500 text-xs">votos</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {isHost && (
            <Button 
              onClick={onNewRound}
              className="w-full h-12 btn-retro-primary font-bold text-base rounded-lg transition-all"
              data-testid="button-new-round"
            >
              <RotateCcw className="mr-2 w-4 h-4" /> Nova Rodada
            </Button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
