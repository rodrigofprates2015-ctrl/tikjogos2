import { useState, useEffect, useRef, useCallback } from 'react';
import { useDesafioStore } from '@/lib/desafioStore';
import { notifyGameEnded } from '@/hooks/useFeedback';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Zap, Loader2, Heart, Swords, ArrowLeft,
  Users, Copy, Share2, Trophy, RotateCcw, Crown,
  LogOut, Home, AlertTriangle, Delete,
} from 'lucide-react';
import logoDesafio from '@assets/logo_desafio_palavra_small.webp';
import logoTikjogos from '@assets/logo_nova_tikjogos (1).png';

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M','⌫'],
];

function HeartIcons({ count, max = 3 }: { count: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Heart key={i} className={cn('w-4 h-4 transition-all', i < count ? 'fill-red-500 text-red-500' : 'text-gray-600 fill-gray-700')} />
      ))}
    </div>
  );
}

function NotificationToast() {
  const notifications = useDesafioStore(s => s.notifications);
  const remove = useDesafioStore(s => s.removeNotification);
  const colorMap = { info: 'bg-[#4a90a4] border-[#3a7a8a]', warning: 'bg-[#e8a045] border-[#b87020]', success: 'bg-[#3d9970] border-[#1d6050]', error: 'bg-[#c44536] border-[#842516]' };
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-xs">
      {notifications.map(n => (
        <div key={n.id} onClick={() => remove(n.id)} className={cn('px-4 py-3 rounded-xl text-white text-sm font-semibold shadow-xl pointer-events-auto border-b-4 cursor-pointer animate-fade-in', colorMap[n.type])}>
          {n.message}
        </div>
      ))}
    </div>
  );
}



// ─── LobbyScreen ──────────────────────────────────────────────────────────────

function LobbyScreen() {
  const { room, user, startGame, leaveGame, isLoading } = useDesafioStore();
  const { toast } = useToast();

  if (!room || !user) return null;

  const isHost = room.hostId === user.uid;
  const players = room.players || [];
  const connectedPlayers = players.filter(p => p.connected !== false);
  const canStart = isHost && connectedPlayers.length >= 2;

  const copyLink = () => {
    const link = `${window.location.origin}/desafio/${room.code}`;
    navigator.clipboard.writeText(link);
    toast({ title: 'Copiado!', description: 'Link da sala copiado.' });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#1a1b2e] px-4 py-6">
      {/* Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1000ms' }} />
      </div>

      <div className="bg-[#242642] rounded-[3rem] p-6 md:p-10 shadow-2xl border-4 border-[#2f3252] w-[90%] max-w-md animate-fade-in relative z-10 flex flex-col gap-6">

        {/* Header: código + sair */}
        <div className="flex items-start justify-between gap-4">
          <div onClick={copyLink} className="cursor-pointer group flex-1">
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-1 font-bold group-hover:text-orange-400 transition-colors">
              Código da Sala
            </p>
            <div className="flex items-center gap-3">
              <h2 className="text-5xl font-black tracking-widest font-mono text-orange-500 group-hover:text-orange-400 transition-colors">
                {room.code}
              </h2>
              <div className="p-3 bg-orange-500/10 rounded-2xl border-2 border-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
                <Copy className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-1 font-medium">Clique para copiar o link</p>
          </div>

          <button
            onClick={leaveGame}
            className="p-3 bg-slate-800 rounded-2xl hover:bg-rose-500 transition-all border-b-4 border-slate-950 hover:border-rose-700 active:border-b-0 active:translate-y-1 text-slate-400 hover:text-white"
          >
            <LogOut size={22} strokeWidth={3} />
          </button>
        </div>

        {/* Lista de jogadores */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-xl border-2 border-blue-500/20">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-white text-lg font-black">Jogadores</h3>
            <div className="px-3 py-1 bg-blue-500 text-white text-sm font-black rounded-full border-2 border-blue-700">
              {connectedPlayers.length}/4
            </div>
          </div>

          <ul className="space-y-3">
            {players.map(p => {
              const isMe = p.uid === user.uid;
              const isPlayerHost = p.uid === room.hostId;
              const isDisconnected = p.connected === false;
              const initial = p.name.charAt(0).toUpperCase();

              return (
                <li
                  key={p.uid}
                  className={cn(
                    'relative p-4 rounded-3xl flex items-center gap-4 border-4 transition-all duration-200',
                    isDisconnected
                      ? 'bg-slate-900 border-slate-800 opacity-50'
                      : isMe
                        ? 'bg-emerald-500 border-emerald-700 shadow-[0_6px_0_0_rgba(0,0,0,0.2)]'
                        : 'bg-slate-800 border-slate-900 shadow-lg'
                  )}
                >
                  {/* Crown badge */}
                  {isPlayerHost && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full p-1.5 border-2 border-yellow-600 shadow-sm z-10">
                      <Crown size={14} fill="currentColor" />
                    </div>
                  )}

                  {/* Avatar */}
                  <div className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black border-2 border-black/10 shrink-0',
                    isMe ? 'bg-white/20 text-white' : 'bg-blue-500 text-white'
                  )}>
                    {initial}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('font-black text-base leading-tight', isMe ? 'text-white' : 'text-slate-100')}>
                        {p.name}
                      </span>
                      {isMe && (
                        <span className="text-xs font-bold px-2 py-0.5 bg-white/20 text-white rounded-full border border-white/30">
                          VOCÊ
                        </span>
                      )}
                    </div>
                    {isPlayerHost && (
                      <span className="text-xs text-yellow-400 font-bold mt-0.5 flex items-center gap-1">
                        <Crown className="w-3 h-3" fill="currentColor" /> HOST
                      </span>
                    )}
                    {isDisconnected && (
                      <span className="text-xs text-slate-500 font-medium mt-0.5">desconectado…</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Ação */}
        {isHost ? (
          <div className="space-y-3">
            <button
              onClick={startGame}
              disabled={!canStart || isLoading}
              className={cn(
                'w-full px-8 py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl',
                canStart && !isLoading
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 border-violet-900 text-white hover:brightness-110 active:border-b-0 active:translate-y-2'
                  : 'bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed opacity-50'
              )}
            >
              {isLoading
                ? <Loader2 size={28} className="animate-spin" />
                : <Zap size={28} className={canStart ? 'animate-bounce' : ''} />}
              {canStart ? 'INICIAR JOGO' : 'AGUARDANDO JOGADORES'}
            </button>
            {!canStart && (
              <p className="text-center text-rose-400 text-sm font-bold">
                Mínimo de 2 jogadores para iniciar
              </p>
            )}
          </div>
        ) : (
          <div className="w-full text-center py-5 flex flex-col items-center gap-3 bg-blue-500/10 rounded-3xl border-4 border-blue-500/20">
            <div className="p-3 bg-blue-500/20 rounded-2xl">
              <Crown className="w-7 h-7 text-blue-400 animate-pulse" />
            </div>
            <p className="text-blue-400 font-black text-base">Aguardando o host iniciar…</p>
            <div className="flex gap-2">
              {[0, 150, 300].map(d => (
                <div key={d} className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <img src={logoTikjogos} alt="TikJogos" className="h-4 w-auto opacity-60" />
      </div>
    </div>
  );
}

// ─── GameScreen ───────────────────────────────────────────────────────────────

function GameScreen() {
  const {
    room, user, status,
    inserirLetra, desafiar, defender,
    defenseInput, setDefenseInput,
    returnToLobby,
  } = useDesafioStore();
  const defenseRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (status === 'defendendo' && defenseRef.current) defenseRef.current.focus();
  }, [status]);

  if (!room || !user) return null;
  const gd = room.gameData;
  if (!gd) return null;

  const vidasMap = gd.vidasMap ?? {};
  const currentWord = gd.currentWord ?? '';
  const turnIndex = gd.turnIndex ?? 0;
  const wordStatus = gd.wordStatus ?? 'jogando';
  const lastAction = gd.lastAction;

  // All players sorted by fixed turn order
  const allSortedPlayers = [...room.players].sort((a, b) => (a.ordem ?? 99) - (b.ordem ?? 99));
  const alivePlayers = allSortedPlayers.filter(p => (vidasMap[p.uid] ?? 0) > 0);

  // Walk forward from turnIndex, skipping eliminated players, to find whose turn it is.
  // turnIndex is a global counter so the sequence 1-2-3-1-2-3 never resets.
  const currentTurnPlayer = (() => {
    const n = allSortedPlayers.length;
    if (n === 0) return undefined;
    for (let i = 0; i < n; i++) {
      const candidate = allSortedPlayers[(turnIndex + i) % n];
      if ((vidasMap[candidate.uid] ?? 0) > 0) return candidate;
    }
    return undefined;
  })();

  const isMyTurn = currentTurnPlayer?.uid === user.uid;
  const myVidas = vidasMap[user.uid] ?? 0;
  const iAmAlive = myVidas > 0;

  // Defense state
  const isDefending = wordStatus === 'defendendo';
  const iAmDefending = isDefending && gd.lastAction?.desafiadoId === user.uid;
  const defenderPlayer = room.players.find(p => p.uid === gd.lastAction?.desafiadoId);
  const challengerPlayer = room.players.find(p => p.uid === gd.lastAction?.desafianteId);

  const isGameOver = wordStatus === 'fim_de_jogo';
  const isHost = room.hostId === user.uid;

  const handleKey = useCallback((key: string) => {
    if (!isMyTurn || !iAmAlive || isDefending || isGameOver) return;
    if (key === '⌫') return; // backspace não faz sentido aqui
    inserirLetra(key);
  }, [isMyTurn, iAmAlive, isDefending, isGameOver, inserirLetra]);

  const handleDefend = () => {
    if (!defenseInput.trim()) { toast({ title: 'Digite a palavra', variant: 'destructive' }); return; }
    const norm = defenseInput.trim().toUpperCase();
    if (!norm.startsWith(currentWord.toUpperCase())) {
      toast({ title: `A palavra deve começar com "${currentWord}"`, variant: 'destructive' });
      return;
    }
    defender(defenseInput.trim());
  };

  // ── Last action feedback ──
  const renderFeedback = () => {
    if (!lastAction) return null;
    if (lastAction.type === 'inserir') {
      return (
        <div className="text-center text-sm text-slate-400 animate-fade-in">
          <span className="font-bold text-white">{lastAction.playerName}</span> adicionou{' '}
          <span className="font-black text-orange-400 text-base">"{lastAction.letra}"</span>
        </div>
      );
    }
    if (lastAction.type === 'desafio' && lastAction.resultado !== undefined) {
      const loser = room.players.find(p => p.uid === (lastAction.resultado ? lastAction.desafianteId : lastAction.desafiadoId));
      const won = lastAction.resultado;
      return (
        <div className={cn(
          'text-center text-sm font-bold px-4 py-2 rounded-2xl border-2 animate-fade-in',
          won ? 'bg-emerald-900/40 border-emerald-600 text-emerald-300' : 'bg-rose-900/40 border-rose-600 text-rose-300'
        )}>
          {won
            ? `✅ Palavra válida! ${loser?.name} perdeu uma ❤️`
            : `❌ Palavra inválida! ${loser?.name} perdeu uma ❤️`}
        </div>
      );
    }
    return null;
  };

  // ── Game Over ──
  if (isGameOver) {
    notifyGameEnded();
    const winner = room.players.find(p => p.uid === gd.vencedorId);
    const iWon = gd.vencedorId === user.uid;
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#1a1b2e] px-4 py-6">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1000ms' }} />
        </div>
        <div className="bg-[#242642] rounded-[3rem] p-6 md:p-10 shadow-2xl border-4 border-[#2f3252] w-[90%] max-w-md animate-fade-in relative z-10 flex flex-col gap-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <Trophy className={cn('w-20 h-20', iWon ? 'text-yellow-400' : 'text-slate-500')} />
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Fim de Jogo</p>
            <p className="text-3xl font-black text-white">
              {winner ? `${winner.name} venceu!` : 'Empate!'}
            </p>
          </div>

          {/* Placar final */}
          <div className="bg-[#1a1c2e] rounded-2xl border border-[#2f3252] divide-y divide-[#2f3252]">
            {room.players
              .sort((a, b) => (vidasMap[b.uid] ?? 0) - (vidasMap[a.uid] ?? 0))
              .map((p, i) => (
                <div key={p.uid} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-slate-500 font-black w-5 text-sm">{i + 1}.</span>
                  <span className={cn('font-black flex-1 text-left', p.uid === user.uid ? 'text-emerald-400' : 'text-white')}>
                    {p.name}{p.uid === user.uid ? ' (você)' : ''}
                  </span>
                  <HeartIcons count={vidasMap[p.uid] ?? 0} />
                </div>
              ))}
          </div>

          {isHost ? (
            <button
              onClick={returnToLobby}
              className="w-full px-8 py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl bg-gradient-to-r from-violet-600 to-purple-600 border-violet-900 text-white hover:brightness-110 active:border-b-0 active:translate-y-2"
            >
              <RotateCcw size={24} /> NOVA RODADA
            </button>
          ) : (
            <p className="text-slate-400 text-sm font-bold">Aguardando o host iniciar nova rodada…</p>
          )}
        </div>
      </div>
    );
  }

  // ── Main game ──
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#1a1b2e]" style={{ backgroundColor: '#1a1b2e' }}>
      {/* Fixed blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-lg flex flex-col min-h-screen relative z-10">

        {/* Header */}
        <header className="w-full pt-4 pb-3 px-4 flex items-center justify-between border-b border-[#2f3252]">
          <img src={logoDesafio} alt="Desafio da Palavra" className="h-8 object-contain" />
          <button
            onClick={returnToLobby}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500 transition-all border-b-4 border-slate-950 hover:border-rose-700 active:border-b-0 active:translate-y-1 text-slate-400 hover:text-white"
          >
            <Home size={18} strokeWidth={3} />
          </button>
        </header>

        {/* Players bar */}
        <div className="flex gap-2 px-3 pt-3 overflow-x-auto pb-1 scrollbar-hide">
          {room.players.map(p => {
            const vidas = vidasMap[p.uid] ?? 0;
            const isActive = currentTurnPlayer?.uid === p.uid && !isDefending;
            const isDead = vidas === 0;
            return (
              <div
                key={p.uid}
                className={cn(
                  'flex-shrink-0 flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl border-2 transition-all min-w-[80px]',
                  isDead
                    ? 'opacity-30 border-slate-800 bg-slate-900/30'
                    : isActive
                      ? 'border-orange-400 bg-orange-500/10 shadow-lg shadow-orange-500/20'
                      : 'border-[#2f3252] bg-[#242642]'
                )}
              >
                <span className={cn(
                  'text-xs font-black truncate max-w-[72px]',
                  p.uid === user.uid ? 'text-emerald-400' : 'text-white'
                )}>
                  {p.name}
                </span>
                <HeartIcons count={vidas} />
                {isActive && !isDead && (
                  <span className="text-orange-400 text-[10px] font-black">← VEZ</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Word display */}
        <div className="flex flex-col items-center gap-3 px-4 pt-4 pb-2">
          <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Palavra na mesa</p>

          {/* Letter tiles */}
          <div className="flex flex-wrap justify-center gap-2 min-h-[56px] items-center">
            {currentWord.length === 0 ? (
              <span className="text-slate-600 text-2xl font-black">—</span>
            ) : (
              currentWord.split('').map((ch, i) => (
                <div
                  key={i}
                  className="w-12 h-14 flex items-center justify-center rounded-lg border-2 border-b-4 border-[#3a3a3c] bg-[#121213] text-white text-2xl font-black uppercase"
                >
                  {ch}
                </div>
              ))
            )}
          </div>

          {/* Feedback */}
          {renderFeedback()}
        </div>

        {/* Defense overlay */}
        {isDefending && (
          <div className="mx-4 mb-2 bg-yellow-900/30 border-2 border-yellow-500/50 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-yellow-300 font-black">
              <AlertTriangle className="w-5 h-5" />
              MODO DEFESA
            </div>
            <p className="text-yellow-200 text-sm">
              <strong>{challengerPlayer?.name}</strong> desafiou <strong>{defenderPlayer?.name}</strong>!
              {iAmDefending
                ? ' Revele a palavra que você tinha em mente.'
                : ` Aguardando ${defenderPlayer?.name} revelar a palavra…`}
            </p>
            {iAmDefending && (
              <div className="flex gap-2">
                <input
                  ref={defenseRef}
                  value={defenseInput}
                  onChange={e => setDefenseInput(e.target.value.toUpperCase())}
                  placeholder={`Começa com "${currentWord}"…`}
                  className="input-dark flex-1 uppercase"
                  onKeyDown={e => e.key === 'Enter' && handleDefend()}
                />
                <button
                  onClick={handleDefend}
                  className="px-5 py-3 rounded-2xl font-black text-base border-b-4 bg-yellow-500 border-yellow-700 text-black hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all"
                >
                  REVELAR
                </button>
              </div>
            )}
          </div>
        )}

        {/* Turn indicator + action buttons */}
        {!isDefending && !isGameOver && (
          <div className="px-4 pb-2 flex flex-col gap-2">
            <div className="text-center text-sm font-bold">
              {isMyTurn && iAmAlive
                ? <span className="text-orange-400">Sua vez! Escolha uma letra.</span>
                : !iAmAlive
                  ? <span className="text-slate-500">Você foi eliminado. Aguarde o fim da rodada.</span>
                  : <span className="text-slate-400">Vez de <strong className="text-white">{currentTurnPlayer?.name}</strong></span>
              }
            </div>

            {/* Desafiar — jogador da vez, quando há letras na mesa */}
            {iAmAlive && isMyTurn && currentWord.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={desafiar}
                  className="flex-1 px-4 py-3 rounded-2xl font-black text-sm border-b-4 bg-yellow-500 border-yellow-700 text-black hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  <Swords size={18} /> DESAFIAR
                </button>
              </div>
            )}
          </div>
        )}

        {/* Keyboard — sticky at bottom, compact for mobile */}
        {!isDefending && !isGameOver && (
          <div className="sticky bottom-0 w-full bg-[#1a1b2e] pt-1 pb-[env(safe-area-inset-bottom,8px)] px-[max(8px,env(safe-area-inset-left,8px))]" style={{ paddingRight: 'max(8px, env(safe-area-inset-right, 8px))' }}>
            <div className="flex flex-col gap-1">
              {KEYBOARD_ROWS.map((row, i) => (
                <div key={i} className="flex justify-center gap-[3px]">
                  {row.map(key => {
                    const isBackspace = key === '⌫';
                    const disabled = !isMyTurn || !iAmAlive;
                    return (
                      <button
                        key={key}
                        onClick={() => handleKey(key)}
                        disabled={disabled}
                        className={cn(
                          'flex items-center justify-center rounded font-bold select-none transition-all active:scale-95 text-[11px] h-10',
                          isBackspace ? 'px-2 min-w-[34px] flex-none' : 'flex-1 min-w-0',
                          disabled
                            ? 'bg-[#2a2a2c] text-slate-600 cursor-not-allowed'
                            : 'bg-[#818384] text-white active:bg-[#a0a0a2]'
                        )}
                      >
                        {isBackspace ? <Delete size={14} /> : key}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DesafioDaPalavra({ initialCode }: { initialCode?: string }) {
  const { status, room, user, setUser, loadSavedNickname } = useDesafioStore();
  const { toast } = useToast();

  // Se chegou aqui sem estar em jogo, volta para a home onde fica o formulário
  useEffect(() => {
    if (status === 'home' && !initialCode) {
      window.location.replace('/');
    }
  }, [status, initialCode]);

  // Deep-link via /desafio/:codigo — auto-join se tiver nickname salvo
  useEffect(() => {
    if (!initialCode) return;
    const saved = loadSavedNickname();
    if (!saved) return;
    if (user && room?.code === initialCode.toUpperCase()) return;
    setUser(saved);
    setTimeout(async () => {
      const ok = await useDesafioStore.getState().joinRoom(initialCode);
      if (!ok) toast({ title: 'Sala não encontrada', variant: 'destructive' });
    }, 0);
  }, [initialCode]);

  return (
    <>
      <NotificationToast />
      {status === 'lobby' && <LobbyScreen />}
      {(status === 'playing' || status === 'defendendo') && <GameScreen />}
    </>
  );
}
