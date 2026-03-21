import { useState, useEffect, useRef } from 'react';
import { useDesafioStore } from '@/lib/desafioStore';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Copy,
  LogOut,
  Play,
  Crown,
  Loader2,
  Heart,
  Swords,
  Flag,
  ArrowLeft,
  Users,
  Share2,
  Trophy,
  AlertTriangle,
  RotateCcw,
  Keyboard,
} from 'lucide-react';
import logoDesafio from '@assets/logo_desafio_palavra.png';

// ─── Helpers ────────────────────────────────────────────────────────────────

function HeartIcons({ count, max = 3 }: { count: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Heart
          key={i}
          className={cn(
            'w-4 h-4',
            i < count ? 'fill-red-500 text-red-500' : 'text-gray-600 fill-gray-700'
          )}
        />
      ))}
    </div>
  );
}

function NotificationToast() {
  const notifications = useDesafioStore(s => s.notifications);
  const remove = useDesafioStore(s => s.removeNotification);

  const colorMap = {
    info: 'bg-blue-600',
    warning: 'bg-yellow-600',
    success: 'bg-green-600',
    error: 'bg-red-600',
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map(n => (
        <div
          key={n.id}
          className={cn(
            'px-4 py-2 rounded-lg text-white text-sm shadow-lg pointer-events-auto',
            colorMap[n.type]
          )}
          onClick={() => remove(n.id)}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}

// ─── HomeScreen ──────────────────────────────────────────────────────────────

function HomeScreen() {
  const { setUser, saveNickname, loadSavedNickname, createRoom, joinRoom, isLoading } = useDesafioStore();
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'idle' | 'join'>('idle');
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    const saved = loadSavedNickname();
    if (saved) setName(saved);
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({ title: 'Digite seu nome', variant: 'destructive' });
      return;
    }
    saveNickname(name.trim());
    setUser(name.trim());
    // createRoom is called after setUser — need to wait for state
    setTimeout(() => useDesafioStore.getState().createRoom(), 0);
  };

  const handleJoin = async () => {
    if (!name.trim()) {
      toast({ title: 'Digite seu nome', variant: 'destructive' });
      return;
    }
    if (!joinCode.trim()) {
      toast({ title: 'Digite o código da sala', variant: 'destructive' });
      return;
    }
    saveNickname(name.trim());
    setUser(name.trim());
    setTimeout(async () => {
      const ok = await useDesafioStore.getState().joinRoom(joinCode.trim());
      if (!ok) toast({ title: 'Sala não encontrada', variant: 'destructive' });
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        {/* Logo */}
        <img src={logoDesafio} alt="Desafio da Palavra" className="w-48 object-contain drop-shadow-2xl" />

        <p className="text-purple-300 text-sm text-center -mt-2">
          Jogo de palavras multiplayer — até 4 jogadores
        </p>

        {/* Name input */}
        <div className="w-full">
          <label className="text-purple-200 text-xs mb-1 block">Seu nome</label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Como você quer ser chamado?"
            maxLength={20}
            className="bg-white/10 border-purple-500/40 text-white placeholder:text-purple-400 focus:border-purple-400"
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
        </div>

        {/* Buttons */}
        {mode === 'idle' && (
          <div className="w-full flex flex-col gap-3">
            <Button
              onClick={handleCreate}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 text-base"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              Criar Sala
            </Button>
            <Button
              onClick={() => setMode('join')}
              variant="outline"
              className="w-full border-purple-500/50 text-purple-200 hover:bg-purple-900/40"
            >
              <Users className="w-4 h-4 mr-2" />
              Entrar em Sala
            </Button>
          </div>
        )}

        {mode === 'join' && (
          <div className="w-full flex flex-col gap-3">
            <Input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Código da sala (ex: AB3)"
              maxLength={3}
              className="bg-white/10 border-purple-500/40 text-white placeholder:text-purple-400 text-center text-xl tracking-widest uppercase"
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              autoFocus
            />
            <Button
              onClick={handleJoin}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Entrar
            </Button>
            <Button
              onClick={() => setMode('idle')}
              variant="ghost"
              className="text-purple-400 hover:text-purple-200"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
          </div>
        )}

        {/* How to play */}
        <div className="w-full bg-white/5 rounded-xl p-4 text-xs text-purple-300 space-y-1.5 border border-purple-500/20">
          <p className="font-semibold text-purple-200 text-sm mb-2">Como jogar</p>
          <p>• Cada jogador adiciona <strong>uma letra</strong> por vez, formando uma palavra.</p>
          <p>• <strong className="text-yellow-400">Desafiar</strong>: acha que a letra anterior não leva a nenhuma palavra? Desafie! O desafiado deve revelar a palavra que tinha em mente.</p>
          <p>• <strong className="text-green-400">Finalizar</strong>: acha que a palavra na mesa já está completa e não pode crescer? Acuse o fim!</p>
          <p>• Quem perde um desafio ou acusação perde uma ❤️. Sem vidas = eliminado.</p>
          <p>• Último com vidas vence!</p>
        </div>
      </div>
    </div>
  );
}

// ─── LobbyScreen ─────────────────────────────────────────────────────────────

function LobbyScreen() {
  const { room, user, startGame, leaveGame, isLoading } = useDesafioStore();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  if (!room || !user) return null;

  const isHost = room.hostId === user.uid;
  const connectedPlayers = room.players.filter(p => p.connected !== false);
  const canStart = isHost && connectedPlayers.length >= 2;

  const shareUrl = `${window.location.origin}/desafio/${room.code}`;

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    toast({ title: `Código copiado: ${room.code}` });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: 'Link copiado!' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <img src={logoDesafio} alt="Desafio da Palavra" className="h-10 object-contain" />
          <Button
            variant="ghost"
            size="sm"
            onClick={leaveGame}
            className="text-purple-400 hover:text-red-400"
          >
            <LogOut className="w-4 h-4 mr-1" /> Sair
          </Button>
        </div>

        {/* Room code */}
        <div className="bg-white/5 rounded-2xl p-5 border border-purple-500/30 text-center">
          <p className="text-purple-400 text-xs mb-1">Código da sala</p>
          <p className="text-5xl font-black text-white tracking-widest">{room.code}</p>
          <div className="flex gap-2 mt-3 justify-center">
            <Button size="sm" variant="outline" onClick={copyCode} className="border-purple-500/40 text-purple-300 hover:bg-purple-900/40">
              <Copy className="w-3 h-3 mr-1" /> Copiar código
            </Button>
            <Button size="sm" variant="outline" onClick={copyLink} className="border-purple-500/40 text-purple-300 hover:bg-purple-900/40">
              <Share2 className="w-3 h-3 mr-1" /> Compartilhar link
            </Button>
          </div>
        </div>

        {/* Players */}
        <div className="bg-white/5 rounded-2xl p-4 border border-purple-500/30">
          <p className="text-purple-400 text-xs mb-3">
            Jogadores ({connectedPlayers.length}/4)
          </p>
          <div className="flex flex-col gap-2">
            {room.players.map(p => (
              <div
                key={p.uid}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg',
                  p.connected === false ? 'opacity-50' : 'bg-white/5'
                )}
              >
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  p.connected === false ? 'bg-gray-500' : 'bg-green-400'
                )} />
                <span className="text-white text-sm flex-1">{p.name}</span>
                {p.uid === room.hostId && (
                  <Crown className="w-4 h-4 text-yellow-400" />
                )}
                {p.uid === user.uid && (
                  <span className="text-purple-400 text-xs">(você)</span>
                )}
              </div>
            ))}
          </div>
          {room.players.length < 2 && (
            <p className="text-purple-400 text-xs mt-3 text-center">
              Aguardando mais jogadores…
            </p>
          )}
        </div>

        {/* Start button */}
        {isHost ? (
          <Button
            onClick={startGame}
            disabled={!canStart || isLoading}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 text-base disabled:opacity-40"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {canStart ? 'Iniciar Jogo' : 'Aguardando jogadores…'}
          </Button>
        ) : (
          <div className="text-center text-purple-400 text-sm py-2">
            Aguardando o host iniciar o jogo…
          </div>
        )}
      </div>
    </div>
  );
}

// ─── GameScreen ───────────────────────────────────────────────────────────────

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function GameScreen() {
  const { room, user, status, inserirLetra, desafiar, finalizar, defender, defenseInput, setDefenseInput, returnToLobby } = useDesafioStore();
  const defenseRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (status === 'defendendo' && defenseRef.current) {
      defenseRef.current.focus();
    }
  }, [status]);

  if (!room || !user) return null;

  const gd = room.gameData;
  if (!gd) return null;

  const vidasMap = gd.vidasMap ?? {};
  const currentWord = gd.currentWord ?? '';
  const turnIndex = gd.turnIndex ?? 0;
  const wordStatus = gd.wordStatus ?? 'jogando';
  const lastAction = gd.lastAction;

  // Players sorted by turn order, only alive ones
  const alivePlayers = room.players
    .filter(p => (vidasMap[p.uid] ?? 0) > 0)
    .sort((a, b) => (a.ordem ?? 99) - (b.ordem ?? 99));

  const currentTurnPlayer = alivePlayers[turnIndex % Math.max(alivePlayers.length, 1)];
  const isMyTurn = currentTurnPlayer?.uid === user.uid;
  const myVidas = vidasMap[user.uid] ?? 0;
  const iAmAlive = myVidas > 0;

  // Defense mode
  const isDefending = wordStatus === 'defendendo';
  const iAmDefending = isDefending && gd.lastAction?.desafiadoId === user.uid;
  const defenderPlayer = room.players.find(p => p.uid === gd.lastAction?.desafiadoId);
  const challengerPlayer = room.players.find(p => p.uid === gd.lastAction?.desafianteId);

  // Game over
  const isGameOver = wordStatus === 'fim_de_jogo';
  const isHost = room.hostId === user.uid;

  const handleLetterClick = (letra: string) => {
    if (!isMyTurn || !iAmAlive || isDefending || isGameOver) return;
    inserirLetra(letra);
  };

  const handleDefend = () => {
    if (!defenseInput.trim()) {
      toast({ title: 'Digite a palavra', variant: 'destructive' });
      return;
    }
    defender(defenseInput.trim());
  };

  // Last action feedback
  const renderLastAction = () => {
    if (!lastAction) return null;
    if (lastAction.type === 'inserir') {
      return (
        <div className="text-center text-purple-300 text-xs animate-fade-in">
          <span className="font-semibold text-white">{lastAction.playerName}</span> adicionou{' '}
          <span className="font-black text-purple-200 text-sm">"{lastAction.letra}"</span>
        </div>
      );
    }
    if (lastAction.type === 'desafio' && lastAction.resultado !== undefined) {
      const loser = lastAction.resultado
        ? room.players.find(p => p.uid === lastAction.desafianteId)
        : room.players.find(p => p.uid === lastAction.desafiadoId);
      return (
        <div className={cn(
          'text-center text-xs px-3 py-1.5 rounded-lg',
          lastAction.resultado ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'
        )}>
          {lastAction.resultado
            ? `✅ Palavra válida! ${loser?.name} perdeu uma vida.`
            : `❌ Palavra inválida! ${loser?.name} perdeu uma vida.`}
        </div>
      );
    }
    if (lastAction.type === 'finalizar' && lastAction.resultado !== undefined) {
      const acusador = room.players.find(p => p.uid === lastAction.acusadorId);
      return (
        <div className={cn(
          'text-center text-xs px-3 py-1.5 rounded-lg',
          lastAction.resultado ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'
        )}>
          {lastAction.resultado
            ? `✅ Palavra morta! ${acusador?.name} acertou.`
            : `❌ Palavra pode crescer! ${acusador?.name} perdeu uma vida.`}
        </div>
      );
    }
    return null;
  };

  if (isGameOver) {
    const winner = room.players.find(p => p.uid === gd.vencedorId);
    const iWon = gd.vencedorId === user.uid;
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
          <Trophy className={cn('w-20 h-20', iWon ? 'text-yellow-400' : 'text-gray-500')} />
          <div>
            <p className="text-purple-300 text-sm mb-1">Fim de jogo!</p>
            <p className="text-3xl font-black text-white">
              {winner ? winner.name : 'Empate'} venceu!
            </p>
          </div>
          {/* Final standings */}
          <div className="w-full bg-white/5 rounded-2xl p-4 border border-purple-500/30">
            {room.players
              .sort((a, b) => (vidasMap[b.uid] ?? 0) - (vidasMap[a.uid] ?? 0))
              .map((p, i) => (
                <div key={p.uid} className="flex items-center gap-3 py-2">
                  <span className="text-purple-400 text-sm w-5">{i + 1}.</span>
                  <span className="text-white text-sm flex-1">{p.name}</span>
                  <HeartIcons count={vidasMap[p.uid] ?? 0} />
                </div>
              ))}
          </div>
          {isHost ? (
            <Button
              onClick={returnToLobby}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Nova Rodada
            </Button>
          ) : (
            <p className="text-purple-400 text-sm">Aguardando o host iniciar nova rodada…</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col p-3 gap-3">
      {/* Header: players + lives */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {room.players.map(p => {
          const vidas = vidasMap[p.uid] ?? 0;
          const isActive = currentTurnPlayer?.uid === p.uid && !isDefending;
          return (
            <div
              key={p.uid}
              className={cn(
                'flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all',
                vidas === 0 ? 'opacity-40 border-gray-700 bg-gray-900/30' :
                isActive ? 'border-purple-400 bg-purple-900/40 shadow-lg shadow-purple-500/20' :
                'border-purple-500/20 bg-white/5'
              )}
            >
              <span className={cn('text-xs font-semibold', p.uid === user.uid ? 'text-purple-300' : 'text-white')}>
                {p.name}{p.uid === user.uid ? ' (você)' : ''}
              </span>
              <HeartIcons count={vidas} />
              {isActive && <span className="text-purple-400 text-xs">← vez</span>}
            </div>
          );
        })}
      </div>

      {/* Word display */}
      <div className="bg-white/5 rounded-2xl border border-purple-500/30 p-5 text-center flex flex-col gap-2">
        <p className="text-purple-400 text-xs">Palavra na mesa</p>
        <div className="flex justify-center gap-1 flex-wrap min-h-[3rem] items-center">
          {currentWord.length === 0 ? (
            <span className="text-purple-600 text-2xl">—</span>
          ) : (
            currentWord.split('').map((ch, i) => (
              <span
                key={i}
                className="text-3xl font-black text-white bg-purple-900/40 rounded-lg w-10 h-12 flex items-center justify-center border border-purple-500/30"
              >
                {ch}
              </span>
            ))
          )}
        </div>
        {renderLastAction()}
      </div>

      {/* Defense modal overlay */}
      {isDefending && (
        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-yellow-300">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold text-sm">Modo Defesa</span>
          </div>
          <p className="text-yellow-200 text-xs">
            <strong>{challengerPlayer?.name}</strong> desafiou{' '}
            <strong>{defenderPlayer?.name}</strong>!
            {iAmDefending
              ? ' Você foi desafiado — revele a palavra que tinha em mente.'
              : ` Aguardando ${defenderPlayer?.name} revelar a palavra…`}
          </p>
          {iAmDefending && (
            <div className="flex gap-2">
              <Input
                ref={defenseRef}
                value={defenseInput}
                onChange={e => setDefenseInput(e.target.value.toUpperCase())}
                placeholder={`Começa com "${currentWord}"…`}
                className="bg-white/10 border-yellow-500/40 text-white placeholder:text-yellow-600 uppercase"
                onKeyDown={e => e.key === 'Enter' && handleDefend()}
              />
              <Button onClick={handleDefend} className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold">
                Revelar
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Turn indicator + action buttons */}
      {!isDefending && (
        <>
          <div className="text-center text-sm">
            {isMyTurn && iAmAlive ? (
              <span className="text-purple-200 font-semibold">Sua vez! Escolha uma letra.</span>
            ) : (
              <span className="text-purple-400">
                Vez de <strong className="text-white">{currentTurnPlayer?.name}</strong>
              </span>
            )}
          </div>

          {/* Action buttons */}
          {iAmAlive && !isMyTurn && currentWord.length > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={desafiar}
                variant="outline"
                className="flex-1 border-yellow-500/50 text-yellow-300 hover:bg-yellow-900/30 text-sm"
              >
                <Swords className="w-4 h-4 mr-1" /> Desafiar
              </Button>
              <Button
                onClick={finalizar}
                variant="outline"
                className="flex-1 border-green-500/50 text-green-300 hover:bg-green-900/30 text-sm"
              >
                <Flag className="w-4 h-4 mr-1" /> Finalizar
              </Button>
            </div>
          )}

          {/* Keyboard */}
          {isMyTurn && iAmAlive && (
            <div className="bg-white/5 rounded-2xl border border-purple-500/20 p-3">
              <div className="flex items-center gap-1 mb-2 text-purple-400 text-xs">
                <Keyboard className="w-3 h-3" /> Toque na letra para adicionar
              </div>
              <div className="grid grid-cols-9 gap-1">
                {ALPHABET.map(letra => (
                  <button
                    key={letra}
                    onClick={() => handleLetterClick(letra)}
                    className="aspect-square rounded-lg bg-purple-900/50 hover:bg-purple-700/60 active:scale-95 text-white font-bold text-sm border border-purple-500/30 transition-all"
                  >
                    {letra}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dead player message */}
          {!iAmAlive && (
            <div className="text-center text-gray-500 text-sm py-4">
              Você foi eliminado. Aguarde o fim da rodada.
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function DesafioDaPalavra({ initialCode }: { initialCode?: string }) {
  const { status, room, user, joinRoom, setUser, loadSavedNickname } = useDesafioStore();
  const { toast } = useToast();

  // Auto-join from URL code (e.g. /desafio/AB3)
  useEffect(() => {
    if (!initialCode) return;
    const saved = loadSavedNickname();
    if (!saved) return; // User needs to enter name first — HomeScreen handles it
    if (user && room?.code === initialCode.toUpperCase()) return;
    if (!user) {
      setUser(saved);
      setTimeout(async () => {
        const ok = await useDesafioStore.getState().joinRoom(initialCode);
        if (!ok) toast({ title: 'Sala não encontrada', variant: 'destructive' });
      }, 0);
    }
  }, [initialCode]);

  return (
    <>
      <NotificationToast />
      {status === 'home' && <HomeScreen />}
      {status === 'lobby' && <LobbyScreen />}
      {(status === 'playing' || status === 'defendendo') && <GameScreen />}
    </>
  );
}
