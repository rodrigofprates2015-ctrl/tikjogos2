import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useRankMasterStore, type RankMasterItem } from "@/lib/rankMasterStore";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { MobileNav } from "@/components/MobileNav";
import {
  Copy, LogOut, Play, Crown, Loader2, Users, Zap,
  Trophy, ArrowLeft, CheckCircle, Clock,
  GripVertical, Star, ChevronUp, ChevronDown,
  Medal, RotateCcw, RefreshCw
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function NotificationCenter() {
  const { notifications, removeNotification } = useRankMasterStore();
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

function SortableItem({ item, rank, submitted }: { item: RankMasterItem; rank: number; submitted: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: submitted });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-2xl border-2 transition-all select-none",
        isDragging
          ? "bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/20 z-50 scale-105"
          : submitted
          ? "bg-[#1e2040] border-[#2f3252] opacity-75"
          : "bg-[#242642] border-[#2f3252] hover:border-amber-500/40 active:border-amber-500/60"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0",
        rank === 1 ? "bg-amber-500 text-black" :
        rank === 2 ? "bg-slate-400 text-black" :
        rank === 3 ? "bg-amber-700 text-white" :
        "bg-[#1a1c2e] text-slate-400"
      )}>
        {rank}
      </div>
      <span className="flex-1 text-white font-semibold text-sm leading-snug">{item.label}</span>
      {!submitted && (
        <div
          {...attributes}
          {...listeners}
          className="p-1 text-slate-500 cursor-grab active:cursor-grabbing touch-none"
          data-testid={`drag-handle-${item.id}`}
        >
          <GripVertical size={20} />
        </div>
      )}
      {submitted && (
        <CheckCircle size={18} className="text-green-400 shrink-0" />
      )}
    </div>
  );
}

const RANKMASTER_THEMES = [
  { id: 'all',        label: 'Todos os Temas',  emoji: '🎲' },
  { id: 'esportes',   label: 'Esportes',         emoji: '⚽' },
  { id: 'cinema-tv',  label: 'Cinema & TV',      emoji: '🎬' },
  { id: 'musica',     label: 'Música',            emoji: '🎵' },
  { id: 'tecnologia', label: 'Tecnologia',        emoji: '💻' },
  { id: 'brasil',     label: 'Brasil',            emoji: '🇧🇷' },
  { id: 'geografia',  label: 'Geografia',         emoji: '🌍' },
  { id: 'dinheiro',   label: 'Dinheiro & Luxo',   emoji: '💰' },
];

function LobbyScreen() {
  const { room, user, leaveGame, startGame } = useRankMasterStore();
  const { toast } = useToast();
  const [totalRounds, setTotalRounds] = useState(3);
  const [topCount, setTopCount] = useState<5 | 10>(10);
  const [selectedTheme, setSelectedTheme] = useState('all');

  if (!room || !user) return null;
  const isHost = room.hostId === user.uid;
  const canStart = room.players.length >= 1;

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    toast({ title: "Código copiado!" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1b2e]">
      <MobileNav />
      <NotificationCenter />

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 bg-orange-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1200ms' }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10 max-w-md mx-auto w-full">
        <div className="w-full space-y-4">
          <div className="text-center mb-2">
            <div className="flex justify-center">
              <img src="/rankify-logo.png" alt="Rankify" className="h-16 drop-shadow-lg" />
            </div>
            <p className="text-slate-400 text-sm mt-1">Sala de Espera</p>
          </div>

          <div className="bg-[#242642] rounded-3xl p-5 border-2 border-[#2f3252] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Código da Sala</p>
                <p className="text-4xl font-black text-white tracking-widest">{room.code}</p>
              </div>
              <button
                onClick={copyCode}
                className="p-3 bg-amber-500/10 hover:bg-amber-500/20 border-2 border-amber-500/30 rounded-2xl transition-colors"
                data-testid="button-copy-code"
              >
                <Copy size={20} className="text-amber-400" />
              </button>
            </div>

            <div className="h-px bg-[#2f3252]" />

            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                <Users size={12} /> Jogadores ({room.players.length})
              </p>
              <div className="space-y-2">
                {room.players.map((p) => (
                  <div
                    key={p.uid}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl",
                      p.uid === user.uid ? "bg-amber-500/10 border border-amber-500/30" : "bg-[#1a1c2e]"
                    )}
                    data-testid={`player-${p.uid}`}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-black text-sm",
                      p.uid === room.hostId ? "bg-amber-500 text-black" : "bg-[#2f3252] text-slate-300"
                    )}>
                      {p.uid === room.hostId ? <Crown size={14} /> : p.name[0].toUpperCase()}
                    </div>
                    <span className="text-white font-semibold text-sm flex-1">{p.name}</span>
                    {p.uid === room.hostId && (
                      <span className="text-amber-400 text-xs font-bold">HOST</span>
                    )}
                    {p.connected === false && (
                      <span className="text-slate-500 text-xs">desconectado</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isHost && (
              <>
                <div className="h-px bg-[#2f3252]" />
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Modo de Jogo</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTopCount(5)}
                      className={cn(
                        "flex-1 py-3 rounded-xl font-black text-sm border-2 transition-all",
                        topCount === 5
                          ? "bg-amber-500 border-amber-500 text-black"
                          : "bg-[#1a1c2e] border-[#2f3252] text-slate-400 hover:border-amber-500/40"
                      )}
                      data-testid="button-top5"
                    >
                      TOP 5
                    </button>
                    <button
                      onClick={() => setTopCount(10)}
                      className={cn(
                        "flex-1 py-3 rounded-xl font-black text-sm border-2 transition-all",
                        topCount === 10
                          ? "bg-amber-500 border-amber-500 text-black"
                          : "bg-[#1a1c2e] border-[#2f3252] text-slate-400 hover:border-amber-500/40"
                      )}
                      data-testid="button-top10"
                    >
                      TOP 10
                    </button>
                  </div>
                  <p className="text-slate-600 text-xs mt-1.5">
                    {topCount === 5 ? "Ordene os 5 primeiros colocados" : "Ordene os 10 primeiros colocados"}
                  </p>
                </div>
                <div className="h-px bg-[#2f3252]" />
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Tema das Perguntas</p>
                  <div className="grid grid-cols-2 gap-2">
                    {RANKMASTER_THEMES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTheme(t.id)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition-all text-left",
                          selectedTheme === t.id
                            ? "bg-amber-500 border-amber-500 text-black"
                            : "bg-[#1a1c2e] border-[#2f3252] text-slate-400 hover:border-amber-500/40"
                        )}
                        data-testid={`button-theme-${t.id}`}
                      >
                        <span className="text-base leading-none">{t.emoji}</span>
                        <span className="leading-tight">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-px bg-[#2f3252]" />
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Número de Rodadas</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setTotalRounds(r => Math.max(1, r - 1))}
                      className="w-10 h-10 rounded-xl bg-[#1a1c2e] border-2 border-[#2f3252] text-white flex items-center justify-center hover:border-amber-500/40 transition-colors"
                      data-testid="button-rounds-minus"
                    >
                      <ChevronDown size={18} />
                    </button>
                    <span className="text-white font-black text-2xl w-12 text-center">{totalRounds}</span>
                    <button
                      onClick={() => setTotalRounds(r => Math.min(10, r + 1))}
                      className="w-10 h-10 rounded-xl bg-[#1a1c2e] border-2 border-[#2f3252] text-white flex items-center justify-center hover:border-amber-500/40 transition-colors"
                      data-testid="button-rounds-plus"
                    >
                      <ChevronUp size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {isHost && (
            <button
              onClick={() => startGame(totalRounds, topCount, selectedTheme)}
              disabled={!canStart}
              className={cn(
                "w-full py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border-b-[6px] shadow-2xl",
                canStart
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 border-amber-900 text-black hover:brightness-110 active:border-b-0 active:translate-y-2"
                  : "bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed"
              )}
              data-testid="button-start-game"
            >
              <Play size={24} />
              INICIAR JOGO
            </button>
          )}

          {!isHost && (
            <div className="flex items-center gap-3 justify-center py-4">
              <Loader2 size={20} className="animate-spin text-amber-400" />
              <span className="text-slate-400 font-semibold">Aguardando o host iniciar...</span>
            </div>
          )}

          <button
            onClick={leaveGame}
            className="w-full py-3 rounded-xl font-bold text-sm text-slate-400 hover:text-red-400 flex items-center justify-center gap-2 transition-colors"
            data-testid="button-leave"
          >
            <LogOut size={16} />
            Sair da sala
          </button>
        </div>
      </div>
    </div>
  );
}

function PreparingScreen() {
  const { room } = useRankMasterStore();
  const [countdown, setCountdown] = useState(5);
  const gameData = room?.gameData;

  useEffect(() => {
    if (!gameData?.preparingEndsAt) {
      setCountdown(5);
      return;
    }
    const update = () => {
      const remaining = Math.max(0, Math.ceil((gameData.preparingEndsAt! - Date.now()) / 1000));
      setCountdown(remaining);
    };
    update();
    const interval = setInterval(update, 200);
    return () => clearInterval(interval);
  }, [gameData?.preparingEndsAt]);

  if (!gameData) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a1b2e] px-4">
      <NotificationCenter />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] animate-pulse" />
      </div>
      <div className="relative z-10 text-center space-y-8 max-w-sm w-full">
        <div>
          <p className="text-amber-400 font-black text-sm uppercase tracking-widest mb-3">
            Rodada {gameData.roundNumber} de {gameData.totalRounds}
          </p>
          <p className="text-slate-400 text-base font-semibold">Ordene o Top {gameData.topCount}...</p>
        </div>

        <div className="bg-[#242642] border-4 border-amber-500/40 rounded-3xl p-8 shadow-2xl shadow-amber-500/10">
          <div className="flex items-center justify-center mb-4">
            <Trophy size={40} className="text-amber-400" />
          </div>
          <h2 className="text-white font-black text-2xl leading-tight">
            {gameData.challenge.category}
          </h2>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full border-4 border-amber-500/40 bg-amber-500/10 flex items-center justify-center">
            <span className="text-4xl font-black text-amber-400">{countdown}</span>
          </div>
          <p className="text-slate-500 text-sm">O jogo começa em breve...</p>
        </div>
      </div>
    </div>
  );
}

function OrderingScreen() {
  const { room, user, submitOrder, myOrder, revealResults, skipChallenge } = useRankMasterStore();
  const gameData = room?.gameData;
  const [items, setItems] = useState<RankMasterItem[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    if (gameData?.shuffledItems && !initialized.current) {
      setItems([...gameData.shuffledItems]);
      initialized.current = true;
    }
  }, [gameData?.shuffledItems]);

  useEffect(() => {
    initialized.current = false;
  }, [gameData?.roundNumber]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!gameData || !room || !user) return null;

  const myOrderEntry = gameData.orders.find(o => o.playerId === user.uid);
  const submitted = !!myOrderEntry || !!myOrder;
  const submittedCount = gameData.orders.length;
  const totalActive = room.players.filter(p => p.connected !== false).length;
  const isHost = room.hostId === user.uid;
  const allSubmitted = submittedCount >= totalActive;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex(i => i.id === active.id);
        const newIndex = prev.findIndex(i => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = () => {
    submitOrder(items.map(i => i.id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1b2e]">
      <NotificationCenter />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-amber-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-6 relative z-10">
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-amber-400 font-black text-sm uppercase tracking-widest">
              Rodada {gameData.roundNumber}/{gameData.totalRounds}
            </p>
            <div className="flex items-center gap-1 text-slate-400 text-sm">
              <CheckCircle size={14} />
              <span>{submittedCount}/{totalActive}</span>
            </div>
          </div>
          <h2 className="text-white font-black text-xl leading-tight">{gameData.challenge.category}</h2>
          <p className="text-slate-500 text-sm mt-0.5">Ordene do 1º ao {gameData.topCount}º lugar</p>
        </div>

        <div className="flex-1 overflow-y-auto pb-4">
          {items.length > 0 && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      rank={index + 1}
                      submitted={submitted}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="pt-3 space-y-2 shrink-0">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              className="w-full py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 border-b-[6px] border-amber-900 text-black hover:brightness-110 active:border-b-0 active:translate-y-2 transition-all duration-200 shadow-2xl"
              data-testid="button-confirm-order"
            >
              <CheckCircle size={24} />
              CONFIRMAR ORDEM
            </button>
          ) : (
            <div className="w-full py-4 rounded-2xl bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center gap-3">
              <CheckCircle size={20} className="text-green-400" />
              <span className="text-green-400 font-bold">Ordem enviada! Aguardando...</span>
            </div>
          )}

          {isHost && !submitted && (
            <button
              onClick={skipChallenge}
              className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 bg-[#1a1c2e] border-2 border-[#2f3252] text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-all duration-200"
              data-testid="button-skip-challenge"
            >
              <RefreshCw size={16} />
              Sortear novo desafio
            </button>
          )}

          {isHost && submitted && allSubmitted && (
            <button
              onClick={revealResults}
              className="w-full py-4 rounded-2xl font-black text-base tracking-wide flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white transition-colors border-b-4 border-purple-900 active:border-b-0 active:translate-y-1"
              data-testid="button-reveal-results"
            >
              <Trophy size={20} />
              REVELAR RESULTADOS
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function RevealScreen() {
  const { room, user, nextRound, returnToLobby } = useRankMasterStore();
  const gameData = room?.gameData;
  const [revealedCount, setRevealedCount] = useState(0);
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    setRevealedCount(0);
    setAnimating(true);
    const total = gameData?.challenge.items.length ?? 10;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setRevealedCount(count);
      if (count >= total) {
        clearInterval(interval);
        setAnimating(false);
      }
    }, 350);
    return () => clearInterval(interval);
  }, [gameData?.roundNumber]);

  if (!gameData || !room || !user) return null;

  const isHost = room.hostId === user.uid;
  const correctItems = [...gameData.challenge.items].sort((a, b) => a.trueRank - b.trueRank);

  const myOrder = gameData.orders.find(o => o.playerId === user.uid);
  const roundWinners = gameData.roundWinnerIds
    .map(id => room.players.find(p => p.uid === id)?.name ?? id)
    .filter(Boolean);

  const isLastRound = gameData.roundNumber >= gameData.totalRounds;

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1b2e]">
      <NotificationCenter />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-64 bg-amber-500/5 blur-[100px]" />
      </div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-6 relative z-10">
        <div className="mb-4 text-center">
          <p className="text-amber-400 font-black text-sm uppercase tracking-widest">
            Rodada {gameData.roundNumber}/{gameData.totalRounds}
          </p>
          <h2 className="text-white font-black text-2xl">Gabarito</h2>
          <p className="text-slate-400 text-sm">{gameData.challenge.category}</p>
        </div>

        {roundWinners.length > 0 && (
          <div className="mb-4 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-3 text-center">
            <p className="text-amber-400 font-black text-sm mb-1">
              {roundWinners.length === 1 ? '🏆 Vencedor da rodada' : '🏆 Empate!'}
            </p>
            <p className="text-white font-bold">{roundWinners.join(' & ')} +100 pontos</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2 pb-4">
          {correctItems.map((item, index) => {
            const revealed = index < revealedCount;
            const myPos = myOrder ? myOrder.orderedIds.indexOf(item.id) + 1 : null;
            const penalty = myPos !== null ? Math.abs(item.trueRank - myPos) : null;

            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-500",
                  revealed
                    ? penalty === 0
                      ? "bg-green-500/10 border-green-500/40"
                      : "bg-[#242642] border-[#2f3252]"
                    : "bg-[#1a1c2e] border-[#1a1c2e] opacity-30"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0",
                  item.trueRank === 1 ? "bg-amber-500 text-black" :
                  item.trueRank === 2 ? "bg-slate-400 text-black" :
                  item.trueRank === 3 ? "bg-amber-700 text-white" :
                  "bg-[#2f3252] text-slate-300"
                )}>
                  {revealed ? item.trueRank : "?"}
                </div>
                <span className={cn("flex-1 font-semibold text-sm", revealed ? "text-white" : "text-transparent")}>
                  {item.label}
                </span>
                {revealed && myPos !== null && (
                  <div className={cn(
                    "text-xs font-bold px-2 py-1 rounded-lg",
                    penalty === 0 ? "bg-green-500/20 text-green-400" :
                    penalty! <= 2 ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-red-500/20 text-red-400"
                  )}>
                    {penalty === 0 ? "✓" : `${myPos}º`}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isHost && !animating && (
          <div className="pt-3 space-y-2 shrink-0">
            {!isLastRound ? (
              <button
                onClick={nextRound}
                className="w-full py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 border-b-[6px] border-amber-900 text-black hover:brightness-110 active:border-b-0 active:translate-y-2 transition-all duration-200 shadow-2xl"
                data-testid="button-next-round"
              >
                <Zap size={24} />
                PRÓXIMA RODADA
              </button>
            ) : (
              <button
                onClick={nextRound}
                className="w-full py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 border-b-[6px] border-purple-900 text-white hover:brightness-110 active:border-b-0 active:translate-y-2 transition-all duration-200 shadow-2xl"
                data-testid="button-see-final-score"
              >
                <Trophy size={24} />
                VER PLACAR FINAL
              </button>
            )}
          </div>
        )}

        {!isHost && !animating && (
          <div className="flex items-center gap-3 justify-center py-4">
            <Loader2 size={20} className="animate-spin text-amber-400" />
            <span className="text-slate-400 font-semibold">Aguardando o host...</span>
          </div>
        )}
      </div>
    </div>
  );
}

function GameoverScreen() {
  const { room, user, returnToLobby } = useRankMasterStore();
  const gameData = room?.gameData;

  if (!gameData || !room || !user) return null;

  const isHost = room.hostId === user.uid;
  const sorted = [...room.players].sort((a, b) => b.score - a.score);
  const topScore = sorted[0]?.score ?? 0;
  const winners = sorted.filter(p => p.score === topScore);

  const getMedalColor = (index: number) => {
    if (index === 0) return "text-amber-400";
    if (index === 1) return "text-slate-400";
    if (index === 2) return "text-amber-700";
    return "text-slate-600";
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1b2e]">
      <NotificationCenter />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] animate-pulse" />
      </div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-8 relative z-10 items-center">
        <div className="text-center mb-8">
          <Trophy size={56} className="text-amber-400 mx-auto mb-3" />
          <h1 className="text-white font-black text-3xl">Fim de Jogo!</h1>
          {winners.length === 1 ? (
            <p className="text-amber-400 font-bold text-lg mt-1">{winners[0].name} venceu!</p>
          ) : (
            <p className="text-amber-400 font-bold text-lg mt-1">Empate entre {winners.map(w => w.name).join(' & ')}!</p>
          )}
        </div>

        <div className="w-full bg-[#242642] rounded-3xl border-2 border-[#2f3252] overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-[#2f3252]">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Placar Final</p>
          </div>
          <div className="divide-y divide-[#2f3252]">
            {sorted.map((p, i) => (
              <div
                key={p.uid}
                className={cn(
                  "flex items-center gap-4 px-4 py-3",
                  p.uid === user.uid ? "bg-amber-500/5" : ""
                )}
                data-testid={`score-row-${p.uid}`}
              >
                <Medal size={20} className={getMedalColor(i)} />
                <span className="text-white font-bold flex-1">{p.name}</span>
                {p.uid === user.uid && (
                  <span className="text-amber-400/60 text-xs">(você)</span>
                )}
                <span className="text-white font-black text-lg">{p.score}</span>
                <span className="text-slate-500 text-xs">pts</span>
              </div>
            ))}
          </div>
        </div>

        {isHost && (
          <button
            onClick={returnToLobby}
            className="w-full py-5 rounded-2xl font-black text-xl tracking-wide flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 border-b-[6px] border-amber-900 text-black hover:brightness-110 active:border-b-0 active:translate-y-2 transition-all duration-200 shadow-2xl"
            data-testid="button-play-again"
          >
            <RotateCcw size={24} />
            JOGAR NOVAMENTE
          </button>
        )}

        {!isHost && (
          <div className="flex items-center gap-3 justify-center py-4">
            <Loader2 size={20} className="animate-spin text-amber-400" />
            <span className="text-slate-400 font-semibold">Aguardando o host...</span>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayingScreen() {
  const { room } = useRankMasterStore();
  const phase = room?.gameData?.phase;

  if (phase === 'preparing') return <PreparingScreen />;
  if (phase === 'ordering') return <OrderingScreen />;
  if (phase === 'revealing') return <RevealScreen />;
  if (phase === 'gameover') return <GameoverScreen />;
  return null;
}

export default function RankMasterGame() {
  const { phase } = useRankMasterStore();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (phase === 'home') {
      const timer = setTimeout(() => navigate('/'), 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, navigate]);

  if (phase === 'lobby') return <LobbyScreen />;
  if (phase === 'playing') return <PlayingScreen />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a1b2e] gap-4">
      <div className="flex items-center gap-3 text-slate-400">
        <Loader2 size={24} className="animate-spin" />
        <span>Carregando...</span>
      </div>
      <p className="text-slate-600 text-sm">Redirecionando para o início...</p>
    </div>
  );
}
