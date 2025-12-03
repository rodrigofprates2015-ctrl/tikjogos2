import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Vote, Check, Users, Send, Skull, Trophy, RotateCcw, 
  Zap, Crown, ArrowRight 
} from 'lucide-react';
import { Player, PlayerVote } from '@shared/schema';

export type RoundStage = 
  | 'WORD_REVEAL' 
  | 'SPEAKING_ORDER' 
  | 'VOTING' 
  | 'VOTING_FEEDBACK' 
  | 'ROUND_RESULT';

interface SpeakingOrderStageProps {
  players: Player[];
  serverOrder?: string[] | null;
  onComplete: (order: string[]) => void;
}

export function SpeakingOrderStage({ players, serverOrder, onComplete }: SpeakingOrderStageProps) {
  const [rotation, setRotation] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [speakingOrder, setSpeakingOrder] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (isComplete) return;

    let currentRotation = 0;
    const interval = setInterval(() => {
      currentRotation += 15;
      setRotation(currentRotation);
    }, 30);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      
      const order = serverOrder && serverOrder.length > 0 
        ? serverOrder 
        : [...players].sort(() => Math.random() - 0.5).map(p => p.uid);
      
      setSpeakingOrder(order);
      setIsComplete(true);
      setRotation(360 * 3 + 45);
      
      setTimeout(() => setShowResults(true), 500);
      setTimeout(() => onComplete(order), 5000);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isComplete, players, onComplete, serverOrder]);

  const displayOrder = speakingOrder.length > 0 
    ? speakingOrder.map(uid => players.find(p => p.uid === uid)?.name || 'Desconhecido')
    : [];

  return (
    <div className="animate-stage-fade-in w-full flex flex-col items-center gap-6 py-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00f2ea]/10 border border-[#00f2ea]/30">
          <Zap className="w-5 h-5 text-[#00f2ea]" />
          <span className="text-[#00f2ea] text-sm uppercase tracking-widest font-bold">
            Ordem de Fala
          </span>
        </div>
      </div>

      <div className="relative w-48 h-48">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-0 h-0 border-l-3 border-r-3 border-t-6 border-l-transparent border-r-transparent border-t-[#00f2ea]" 
               style={{ filter: 'drop-shadow(0 0 8px rgba(0, 242, 234, 0.8))' }}>
          </div>
        </div>

        <div
          className="w-full h-full rounded-full border-4 border-[#00f2ea]/50 flex items-center justify-center transition-transform"
          style={{
            transform: `rotate(${rotation}deg)`,
            background: 'conic-gradient(from 0deg, #ff0050 0%, #00f2ea 25%, #ff0050 50%, #00f2ea 75%, #ff0050 100%)',
            boxShadow: '0 0 30px rgba(0, 242, 234, 0.4), inset 0 0 30px rgba(255, 0, 80, 0.2)'
          }}
        >
          <div className="absolute w-16 h-16 rounded-full bg-[#0a1628] border-3 border-[#00f2ea] flex items-center justify-center"
               style={{ boxShadow: '0 0 15px rgba(0, 242, 234, 0.4)' }}>
            <Zap className="w-8 h-8 text-[#00f2ea]" />
          </div>
        </div>
      </div>

      {!showResults && (
        <p className="text-gray-400 text-sm animate-pulse">
          Sorteando ordem para {players.length} jogadores...
        </p>
      )}

      {showResults && displayOrder.length > 0 && (
        <div className="animate-stage-fade-in w-full space-y-3">
          <p className="text-center text-[#00f2ea] text-sm font-bold uppercase tracking-wider mb-3">
            Ordem Definida
          </p>
          <div className="space-y-2">
            {displayOrder.map((name, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#00f2ea]/10 to-[#ff0050]/10 border border-[#00f2ea]/30 rounded-xl"
                style={{ animation: `stageSlideIn 0.4s ease-out ${idx * 0.1}s backwards` }}
              >
                <div className="w-8 h-8 rounded-full bg-[#00f2ea]/20 border border-[#00f2ea] flex items-center justify-center">
                  <span className="text-[#00f2ea] font-bold text-sm">{idx + 1}</span>
                </div>
                <span className="text-white font-medium flex-1">{name}</span>
                {idx === 0 && <Crown className="w-5 h-5 text-[#e9c46a]" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface VotingStageProps {
  activePlayers: Player[];
  userId: string;
  onSubmitVote: (targetId: string) => void;
  isSubmitting: boolean;
}

export function VotingStage({ activePlayers, userId, onSubmitVote, isSubmitting }: VotingStageProps) {
  const [selectedVote, setSelectedVote] = useState<string | null>(null);

  return (
    <div className="animate-stage-fade-in w-full space-y-4 py-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e9c46a]/10 border border-[#e9c46a]/30">
          <Vote className="w-5 h-5 text-[#e9c46a]" />
          <span className="text-[#e9c46a] text-sm uppercase tracking-widest font-bold">
            Hora de Votar!
          </span>
        </div>
        <p className="text-gray-400 text-sm">Quem você acha que é o impostor?</p>
      </div>
      
      <div className="w-full h-[1px] bg-[#3d4a5c]"></div>
      
      <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-hide">
        {activePlayers.filter(p => p.uid !== userId).map(player => (
          <button
            key={player.uid}
            onClick={() => setSelectedVote(player.uid)}
            className={cn(
              "w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3",
              selectedVote === player.uid
                ? "bg-[#e9c46a]/15 border-[#e9c46a] text-[#e9c46a]"
                : "bg-[#16213e]/50 border-[#3d4a5c] text-gray-300 hover:border-[#e9c46a]/50"
            )}
            data-testid={`button-vote-${player.uid}`}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold",
              selectedVote === player.uid ? "bg-[#e9c46a] text-black" : "bg-gray-600 text-gray-200"
            )}>
              {player.name.charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-base">{player.name}</span>
            {selectedVote === player.uid && (
              <Check className="w-5 h-5 ml-auto" />
            )}
          </button>
        ))}
      </div>

      <Button 
        onClick={() => selectedVote && onSubmitVote(selectedVote)}
        disabled={!selectedVote || isSubmitting}
        className="w-full h-12 bg-[#e9c46a] hover:bg-[#e9c46a]/80 text-black font-bold text-base rounded-xl transition-all disabled:opacity-30"
        style={{ boxShadow: '0 4px 0 rgba(233, 196, 106, 0.4)' }}
        data-testid="button-confirm-vote"
      >
        <Send className="mr-2 w-5 h-5" /> {isSubmitting ? 'Votando...' : 'Confirmar Voto'}
      </Button>
    </div>
  );
}

interface VotingFeedbackStageProps {
  activePlayers: Player[];
  votes: PlayerVote[];
  userId: string;
  isHost: boolean;
  onRevealImpostor: () => void;
}

export function VotingFeedbackStage({ activePlayers, votes, userId, isHost, onRevealImpostor }: VotingFeedbackStageProps) {
  const totalPlayers = activePlayers.length;
  const votedCount = votes.length;
  const allVoted = votedCount >= totalPlayers;
  const myVote = votes.find(v => v.playerId === userId);

  return (
    <div className="animate-stage-fade-in w-full space-y-4 py-4">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-[#3d8b5f]/20 border-2 border-[#3d8b5f] flex items-center justify-center mx-auto">
          <Check className="w-7 h-7 text-[#3d8b5f]" />
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3d8b5f]/10 border border-[#3d8b5f]/30">
          <span className="text-[#3d8b5f] text-sm uppercase tracking-widest font-bold">
            Voto Enviado!
          </span>
        </div>
        <p className="text-white text-base">
          Você votou em: <span className="text-[#e9c46a] font-bold">{myVote?.targetName}</span>
        </p>
      </div>
      
      <div className="w-full h-[1px] bg-[#3d4a5c]"></div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Users className="w-5 h-5 text-[#4a90a4]" />
          <p className="text-gray-300">
            <span className="text-[#4a90a4] font-bold">{votedCount}</span> de <span className="font-bold">{totalPlayers}</span> votaram
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center">
          {activePlayers.map(player => {
            const hasVoted = votes.some(v => v.playerId === player.uid);
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
          onClick={onRevealImpostor}
          className="w-full h-12 bg-[#c44536] hover:bg-[#c44536]/80 text-white font-bold text-base rounded-xl transition-all"
          style={{ boxShadow: '0 4px 0 rgba(196, 69, 54, 0.4)' }}
          data-testid="button-reveal-impostor"
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

interface RoundResultStageProps {
  activePlayers: Player[];
  votes: PlayerVote[];
  impostorId: string;
  isHost: boolean;
  onNewRound: () => void;
}

export function RoundResultStage({ activePlayers, votes, impostorId, isHost, onNewRound }: RoundResultStageProps) {
  const totalPlayers = activePlayers.length;
  const impostorPlayer = activePlayers.find(p => p.uid === impostorId);
  const impostorName = impostorPlayer?.name || 'Desconhecido';
  
  const votesForImpostor = votes.filter(v => v.targetId === impostorId).length;
  const crewWins = votesForImpostor > totalPlayers / 2;

  return (
    <div className="animate-stage-fade-in w-full space-y-4 py-4">
      <div className="text-center space-y-3">
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
          "text-xl font-bold uppercase tracking-wider",
          crewWins ? "text-[#3d8b5f]" : "text-[#c44536]"
        )}>
          {crewWins ? "Tripulação Venceu!" : "Impostor Venceu!"}
        </h2>
        
        <p className="text-gray-300">
          O impostor era: <span className="text-[#c44536] font-bold">{impostorName}</span>
        </p>
      </div>
      
      <div className="w-full h-[1px] bg-[#3d4a5c]"></div>
      
      <div className="space-y-3">
        <p className="text-[#e9c46a] text-xs uppercase tracking-widest font-bold text-center">
          Resultados da Votação
        </p>
        
        <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-hide">
          {activePlayers.map(player => {
            const votesReceived = votes.filter(v => v.targetId === player.uid).length;
            const isTheImpostor = player.uid === impostorId;
            return (
              <div 
                key={player.uid}
                className={cn(
                  "w-full p-3 rounded-xl flex items-center justify-between",
                  isTheImpostor 
                    ? "bg-[#c44536]/15 border border-[#c44536]/40"
                    : "bg-[#16213e]/50"
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
          className="w-full h-12 btn-retro-primary font-bold text-base rounded-xl transition-all"
          data-testid="button-new-round"
        >
          <RotateCcw className="mr-2 w-4 h-4" /> Nova Rodada
        </Button>
      )}
    </div>
  );
}

interface DiscussionStageProps {
  isHost: boolean;
  onStartVoting: () => void;
  onStartSorteio: () => void;
  onNewRound: () => void;
}

export function DiscussionStage({ isHost, onStartVoting, onStartSorteio, onNewRound }: DiscussionStageProps) {
  return (
    <div className="animate-stage-fade-in w-full space-y-3 py-2">
      {isHost ? (
        <>
          <Button 
            onClick={onStartSorteio}
            className="w-full h-11 bg-[#0d4a4a] hover:bg-[#0d5a5a] border-2 border-cyan-400/50 text-cyan-300 rounded-xl font-medium"
            data-testid="button-sorteio"
          >
            <Zap className="mr-2 w-4 h-4" /> Sortear Ordem de Fala
          </Button>
          <Button 
            onClick={onStartVoting}
            className="w-full h-11 bg-[#e9c46a] hover:bg-[#e9c46a]/80 text-black font-bold rounded-xl"
            style={{ boxShadow: '0 4px 0 rgba(233, 196, 106, 0.4)' }}
            data-testid="button-start-voting"
          >
            <Vote className="mr-2 w-4 h-4" /> Iniciar Votação
          </Button>
          <Button 
            onClick={onNewRound}
            variant="ghost"
            className="w-full h-10 text-gray-400 hover:text-gray-200 rounded-xl"
            data-testid="button-return-lobby"
          >
            <ArrowRight className="mr-2 w-4 h-4" /> Nova Rodada
          </Button>
        </>
      ) : (
        <p className="text-gray-400 text-sm text-center py-4">
          Aguardando o host iniciar a votação...
        </p>
      )}
    </div>
  );
}
