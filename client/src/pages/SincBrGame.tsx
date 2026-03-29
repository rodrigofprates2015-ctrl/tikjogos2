import { useState, useEffect, useRef } from 'react';
import { useSincBRStore } from '@/lib/sincBrStore';
import { notifyGameEnded } from '@/hooks/useFeedback';
import type { BRAnswerGroup, BRLeaderboardEntry } from '@/lib/sincBrStore';
import { useLocation } from 'wouter';
import { Users, Trophy, Send, Clock, LogOut, ArrowLeft, Zap, Crown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import sincroniaLogo from '@/assets/Sincronia.png';

// ── Room Selection Screen ──

function RoomSelection() {
  const { rooms, fetchRooms, joinRoom, setName, name, uid, isConnecting } = useSincBRStore();
  const [nickname, setNickname] = useState('');
  const [, navigate] = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem('tikjogos_saved_nickname');
    if (saved) setNickname(saved);
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  const handleJoin = (roomId: string) => {
    if (!nickname.trim()) return;
    if (!uid) setName(nickname.trim());
    joinRoom(roomId);
  };

  const categoryColors: Record<string, string> = {
    todas: 'from-purple-600 to-indigo-600',
    animes: 'from-pink-600 to-rose-600',
    jogos: 'from-emerald-600 to-teal-600',
  };

  const categoryEmoji: Record<string, string> = {
    todas: '🌍',
    animes: '⚔️',
    jogos: '🎮',
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#1a1b2e] px-4 py-8">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-amber-600/15 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-orange-600/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="z-10 w-full max-w-lg">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={18} /> Voltar
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-2">
          <img src={sincroniaLogo} alt="Sincronia" className="h-24 md:h-32 object-contain" />
        </div>
        <div className="text-center mb-6">
          <span className="inline-block bg-gradient-to-r from-amber-400 to-orange-500 text-transparent bg-clip-text font-black text-2xl tracking-wider">
            BATTLE ROYALE
          </span>
          <p className="text-white/50 text-sm mt-1">Jogo contínuo e público — entre e jogue!</p>
        </div>

        {/* Nickname input */}
        <div className="bg-[#242642] rounded-2xl p-4 mb-4 border border-[#2f3252]">
          <input
            type="text"
            placeholder="Seu nickname"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            maxLength={20}
            className="w-full bg-[#1a1b2e] text-white rounded-xl px-4 py-3 border border-[#3a3d5c] focus:border-amber-500 focus:outline-none transition-colors placeholder:text-white/30"
          />
        </div>

        {/* Room list */}
        <div className="space-y-3">
          {rooms.map(room => (
            <button
              key={room.id}
              onClick={() => handleJoin(room.id)}
              disabled={isConnecting || !nickname.trim()}
              className={cn(
                'w-full bg-gradient-to-r p-[2px] rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
                categoryColors[room.category] || categoryColors.todas
              )}
            >
              <div className="bg-[#242642] rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{categoryEmoji[room.category] || '🌍'}</span>
                  <div className="text-left">
                    <div className="text-white font-bold text-lg">{room.label}</div>
                    <div className="text-white/50 text-sm flex items-center gap-1">
                      <Users size={14} />
                      {room.playerCount}/{room.maxPlayers} jogadores
                    </div>
                  </div>
                </div>
                <ChevronRight className="text-white/40" size={24} />
              </div>
            </button>
          ))}

          {rooms.length === 0 && (
            <div className="text-center text-white/40 py-8">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Carregando salas...
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 bg-[#242642]/60 rounded-xl p-4 border border-[#2f3252]">
          <p className="text-white/40 text-xs text-center leading-relaxed">
            Responda perguntas e ganhe pontos por sincronizar com outros jogadores.
            Quanto mais pessoas pensam como você, mais pontos você ganha!
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Leaderboard Component ──

function Leaderboard({ entries, myUid }: { entries: BRLeaderboardEntry[]; myUid: string }) {
  const top10 = entries.slice(0, 10);
  const myEntry = entries.find(e => e.uid === myUid);
  const myInTop10 = top10.some(e => e.uid === myUid);

  return (
    <div className="bg-[#242642] rounded-xl border border-[#2f3252] overflow-hidden">
      <div className="px-3 py-2 bg-[#2f3252] flex items-center gap-2">
        <Trophy size={14} className="text-amber-400" />
        <span className="text-white/80 text-xs font-bold uppercase tracking-wider">Ranking</span>
      </div>
      <div className="divide-y divide-[#2f3252]">
        {top10.map((entry, i) => (
          <div
            key={entry.uid}
            className={cn(
              'flex items-center px-3 py-1.5 text-sm',
              entry.uid === myUid ? 'bg-amber-500/10' : ''
            )}
          >
            <span className={cn(
              'w-6 text-center font-bold text-xs',
              i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-white/40'
            )}>
              {i === 0 ? '👑' : `${i + 1}`}
            </span>
            <span className={cn(
              'flex-1 truncate ml-2',
              entry.uid === myUid ? 'text-amber-300 font-bold' : 'text-white/70'
            )}>
              {entry.name} {entry.uid === myUid ? '(você)' : ''}
            </span>
            <span className="text-amber-400 font-bold text-xs">{entry.score} pts</span>
          </div>
        ))}
        {top10.length === 0 && (
          <div className="px-3 py-4 text-white/30 text-xs text-center">Aguardando jogadores...</div>
        )}
      </div>
      {myEntry && !myInTop10 && (
        <div className="border-t border-amber-500/30 bg-amber-500/10 flex items-center px-3 py-1.5 text-sm">
          <span className="w-6 text-center font-bold text-xs text-white/40">{myEntry.rank}</span>
          <span className="flex-1 truncate ml-2 text-amber-300 font-bold">{myEntry.name} (você)</span>
          <span className="text-amber-400 font-bold text-xs">{myEntry.score} pts</span>
        </div>
      )}
    </div>
  );
}

// ── Result Overlay ──

function ResultOverlay({ result, myUid, pointsGained }: { result: import('@/lib/sincBrStore').BRRoundResult; myUid: string; pointsGained: number }) {
  const myGroup = result.groups.find(g => g.players.some(p => p.uid === myUid));
  const didNotAnswer = result.noAnswer.some(p => p.uid === myUid);

  return (
    <div className="space-y-3 animate-fade-in">
      {/* My result banner */}
      <div className={cn(
        'rounded-xl p-3 text-center border',
        pointsGained > 0
          ? 'bg-emerald-500/20 border-emerald-500/40'
          : 'bg-red-500/10 border-red-500/30'
      )}>
        {didNotAnswer ? (
          <p className="text-white/60 text-sm">Você não respondeu</p>
        ) : myGroup ? (
          <>
            <p className="text-white/60 text-xs">Sua resposta: <span className="text-white font-bold">{myGroup.original[myGroup.players.findIndex(p => p.uid === myUid)] || myGroup.original[0]}</span></p>
            <p className={cn('font-black text-xl', pointsGained > 0 ? 'text-emerald-400' : 'text-red-400')}>
              {pointsGained > 0 ? `+${pointsGained} pontos` : '0 pontos'}
            </p>
            <p className="text-white/40 text-xs">{myGroup.players.length} pessoa{myGroup.players.length > 1 ? 's' : ''} responderam igual</p>
          </>
        ) : (
          <p className="text-white/60 text-sm">Sem resultado</p>
        )}
      </div>

      {/* Answer groups */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {result.groups.slice(0, 5).map((g, i) => {
          const hasMe = g.players.some(p => p.uid === myUid);
          return (
            <div key={i} className={cn(
              'rounded-lg p-2 border text-xs',
              hasMe ? 'bg-amber-500/10 border-amber-500/30' : 'bg-[#1a1b2e] border-[#2f3252]'
            )}>
              <div className="flex justify-between items-center">
                <span className="text-white font-bold truncate">{g.original[0]}</span>
                <span className={cn('font-bold', g.points > 0 ? 'text-emerald-400' : 'text-white/30')}>
                  +{g.points} pts
                </span>
              </div>
              <div className="text-white/40 mt-0.5">
                {g.players.length} pessoa{g.players.length > 1 ? 's' : ''}: {g.players.map(p => p.name).join(', ')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Game Screen ──

// ── Match End Overlay ──

function MatchEndOverlay({ leaderboard, myUid }: { leaderboard: BRLeaderboardEntry[]; myUid: string }) {
  const top5 = leaderboard.slice(0, 5);
  const myEntry = leaderboard.find(e => e.uid === myUid);
  const myRank = myEntry?.rank || 0;

  useEffect(() => { notifyGameEnded(); }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#242642] rounded-3xl border-2 border-amber-500/50 p-6 max-w-md w-full text-center space-y-4">
        <div className="flex justify-center">
          <Trophy size={48} className="text-amber-400 animate-bounce" />
        </div>
        <h2 className="text-2xl font-black text-white">Partida Encerrada!</h2>
        <p className="text-white/50 text-sm">Nova partida começa em instantes...</p>

        {/* My result */}
        {myEntry && (
          <div className={cn(
            'rounded-xl p-3 border',
            myRank <= 3 ? 'bg-amber-500/20 border-amber-500/40' : 'bg-[#1a1b2e] border-[#2f3252]'
          )}>
            <p className="text-white/60 text-xs">Sua posição</p>
            <p className="text-3xl font-black text-amber-400">#{myRank}</p>
            <p className="text-white font-bold">{myEntry.score} pontos</p>
          </div>
        )}

        {/* Top 5 */}
        <div className="space-y-1">
          {top5.map((entry, i) => (
            <div
              key={entry.uid}
              className={cn(
                'flex items-center px-3 py-2 rounded-lg text-sm',
                entry.uid === myUid ? 'bg-amber-500/15' : 'bg-[#1a1b2e]'
              )}
            >
              <span className={cn(
                'w-8 text-center font-black text-lg',
                i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-white/40'
              )}>
                {i === 0 ? <Crown size={20} className="inline text-amber-400" /> : `${i + 1}`}
              </span>
              <span className={cn(
                'flex-1 truncate ml-2 text-left',
                entry.uid === myUid ? 'text-amber-300 font-bold' : 'text-white/70'
              )}>
                {entry.name} {entry.uid === myUid ? '(você)' : ''}
              </span>
              <span className="text-amber-400 font-bold">{entry.score} pts</span>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <div className="w-6 h-6 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/30 text-xs mt-2">Reiniciando...</p>
        </div>
      </div>
    </div>
  );
}

function GameScreen() {
  const {
    question, questionNumber, timeLeft, duration, myAnswer, hasSubmitted,
    playerCount, myScore, leaderboard, roundResult, showingResult,
    lastPointsGained, uid, currentRoomLabel, leaveRoom, submitAnswer, setMyAnswer,
    matchTimeLeft, showingMatchEnd, matchEndLeaderboard,
  } = useSincBRStore();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showingResult && !hasSubmitted && !showingMatchEnd && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showingResult, hasSubmitted, questionNumber, showingMatchEnd]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hasSubmitted && myAnswer.trim()) submitAnswer();
  };

  const progressPct = duration > 0 ? (timeLeft / duration) * 100 : 0;

  // Format match time as mm:ss
  const matchMin = Math.floor(matchTimeLeft / 60);
  const matchSec = matchTimeLeft % 60;
  const matchTimeStr = `${matchMin}:${matchSec.toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen w-full bg-[#1a1b2e] flex flex-col">
      {/* Match End Overlay */}
      {showingMatchEnd && (
        <MatchEndOverlay leaderboard={matchEndLeaderboard} myUid={uid} />
      )}

      {/* Header */}
      <div className="bg-[#242642] border-b border-[#2f3252] px-4 py-2 flex items-center justify-between">
        <button onClick={leaveRoom} className="text-white/50 hover:text-white transition-colors flex items-center gap-1 text-sm">
          <LogOut size={16} /> Sair
        </button>
        <div className="text-center flex items-center gap-3">
          <span className="text-amber-400 font-bold text-sm">{currentRoomLabel}</span>
          <span className="text-white/30 text-xs">#{questionNumber}</span>
          {/* Match timer */}
          <span className={cn(
            'font-mono font-bold text-sm px-2 py-0.5 rounded-lg border',
            matchTimeLeft <= 30
              ? 'text-red-400 border-red-500/40 bg-red-500/10 animate-pulse'
              : matchTimeLeft <= 60
                ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                : 'text-white/60 border-[#3a3d5c] bg-[#1a1b2e]'
          )}>
            <Clock size={12} className="inline mr-1" />
            {matchTimeStr}
          </span>
        </div>
        <div className="flex items-center gap-1 text-white/50 text-sm">
          <Users size={14} /> {playerCount}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row p-3 gap-3 max-w-5xl mx-auto w-full">
        {/* Left: Question + Answer */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Timer bar */}
          <div className="w-full bg-[#2f3252] rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-1000 ease-linear',
                timeLeft > 10 ? 'bg-emerald-500' : timeLeft > 5 ? 'bg-amber-500' : 'bg-red-500'
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Timer + Score */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Clock size={14} />
              <span className={cn('font-bold', timeLeft <= 5 ? 'text-red-400' : '')}>{timeLeft}s</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-amber-400" />
              <span className="text-amber-400 font-bold text-sm">{myScore} pts</span>
            </div>
          </div>

          {/* Question card */}
          <div className="bg-[#242642] rounded-2xl p-5 border border-[#2f3252] flex-shrink-0">
            {showingResult && roundResult ? (
              <ResultOverlay result={roundResult} myUid={uid} pointsGained={lastPointsGained} />
            ) : (
              <>
                <p className="text-white font-bold text-lg md:text-xl text-center leading-snug">
                  {question || 'Aguardando pergunta...'}
                </p>

                {/* Answer input */}
                <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={hasSubmitted ? 'Resposta enviada!' : 'Digite sua resposta...'}
                    value={myAnswer}
                    onChange={e => setMyAnswer(e.target.value)}
                    disabled={hasSubmitted}
                    maxLength={100}
                    className={cn(
                      'flex-1 bg-[#1a1b2e] text-white rounded-xl px-4 py-3 border focus:outline-none transition-colors placeholder:text-white/30',
                      hasSubmitted
                        ? 'border-emerald-500/50 opacity-60'
                        : 'border-[#3a3d5c] focus:border-amber-500'
                    )}
                  />
                  <button
                    type="submit"
                    disabled={hasSubmitted || !myAnswer.trim()}
                    className={cn(
                      'px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-1',
                      hasSubmitted
                        ? 'bg-emerald-600/30 text-emerald-400 cursor-default'
                        : 'bg-amber-500 hover:bg-amber-400 text-black active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed'
                    )}
                  >
                    <Send size={16} />
                  </button>
                </form>

                {hasSubmitted && (
                  <p className="text-emerald-400/60 text-xs text-center mt-2">
                    Aguardando outros jogadores...
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right: Leaderboard */}
        <div className="w-full md:w-64 flex-shrink-0">
          <Leaderboard entries={leaderboard} myUid={uid} />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──

export default function SincBrGame() {
  const { phase } = useSincBRStore();

  if (phase === 'playing') return <GameScreen />;
  return <RoomSelection />;
}
