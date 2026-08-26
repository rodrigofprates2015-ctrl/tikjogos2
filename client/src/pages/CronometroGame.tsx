import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Check, Clock3, Copy, Crown, Eye, EyeOff, LogOut, Play, RefreshCw, Repeat2, RotateCcw, Settings, ShieldAlert, Skull, Swords, Trophy, UserX, Users } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { LobbyAd } from "@/components/AdSense";
import { Button } from "@/components/ui/button";

type GameMode = "classic" | "challenge";
type Player = { uid: string; name: string; connected: boolean; eliminated: boolean };
type Resolution = { challengerId: string; challengerName: string; challengedId: string; challengedName: string; loserId: string; loserName: string; wasOver: boolean; accumulatedMs: number; targetMs: number };
type Room = {
  code: string; hostId: string; status: "waiting" | "playing" | "results"; gameMode: GameMode;
  players: Player[]; targetMs: number | null; startedAt: number | null;
  attempts: Array<{ playerId: string; playerName: string; elapsedMs: number; differenceMs: number }>;
  showTimer: boolean; round: number; serverNow: number; winnerIds: string[];
  challengePhase: "suggesting" | "turn" | "finished" | null; accumulatedMs: number;
  currentPlayerId: string | null; suggesterId: string | null;
  lastChallengeAttempt: { playerId: string; playerName: string; elapsedMs: number; accumulatedAfterMs: number } | null;
  lastResolution: Resolution | null; winnerId: string | null;
  timerActivePlayerId: string | null;
};

function formatTime(ms: number) {
  const safe = Math.max(0, Math.round(ms));
  const minutes = Math.floor(safe / 60000);
  const seconds = Math.floor((safe % 60000) / 1000);
  const centiseconds = Math.floor((safe % 1000) / 10);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}:${String(centiseconds).padStart(2, "0")}`;
}

async function request(url: string, body: unknown) {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const text = await response.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { throw new Error("O servidor devolveu uma resposta inválida."); }
  if (!response.ok) throw new Error(data.error || "Não foi possível concluir a ação.");
  return data;
}

function DigitalLogo({ compact = false }: { compact?: boolean }) {
  return <div className={`tj-theme-card mx-auto w-fit px-5 py-3 font-mono font-black tracking-[.12em] text-violet-300 ${compact ? "text-xl" : "text-3xl md:text-4xl"}`}><span className="text-slate-400">T3:</span>MP:00</div>;
}

function ResolutionCard({ resolution }: { resolution: Resolution }) {
  return <section className={`tj-inset p-5 text-center ${resolution.wasOver ? "border-rose-500/60" : "border-amber-400/60"}`}>
    <Skull className={`mx-auto h-9 w-9 ${resolution.wasOver ? "text-red-400" : "text-amber-300"}`}/>
    <h3 className="mt-2 text-xl font-black">{resolution.loserName} foi eliminado</h3>
    <p className="mt-2 text-sm text-slate-300">{resolution.challengerName} desafiou {resolution.challengedName}. O acumulado era <strong className="text-white">{formatTime(resolution.accumulatedMs)}</strong> para um alvo de <strong className="text-white">{formatTime(resolution.targetMs)}</strong>.</p>
    <p className="mt-2 font-bold">{resolution.wasOver ? "O tempo havia ultrapassado. Desafio correto!" : "O tempo ainda não havia ultrapassado. O desafiante perdeu!"}</p>
  </section>;
}

export default function CronometroGame() {
  const playerId = useRef(sessionStorage.getItem("cronometro_player_id") || crypto.randomUUID());
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [localStartedAt, setLocalStartedAt] = useState<number | null>(null);
  const [displayElapsed, setDisplayElapsed] = useState(0);
  const [suggestedSeconds, setSuggestedSeconds] = useState("4,00");
  const localStartedAtRef = useRef<number | null>(null);
  const timerSignalPromiseRef = useRef<Promise<Room> | null>(null);
  const code = (new URLSearchParams(window.location.search).get("room") || sessionStorage.getItem("cronometro_room_code") || "").toUpperCase();

  useEffect(() => { sessionStorage.setItem("cronometro_player_id", playerId.current); document.title = "Jogo do Cronômetro Online | TikJogos"; }, []);
  useEffect(() => {
    if (!code) { setLoading(false); return; }
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(`/api/cronometro/rooms/${code}`);
        if (!response.ok) throw new Error("Sala não encontrada.");
        const data = await response.json();
        if (!active) return;
        if (!data.players.some((player: Player) => player.uid === playerId.current)) throw new Error("Você não está mais nesta sala.");
        setRoom(data); setError("");
      } catch (caught: any) { if (active) setError(caught.message); }
      finally { if (active) setLoading(false); }
    };
    load(); const poll = window.setInterval(load, 500);
    return () => { active = false; window.clearInterval(poll); };
  }, [code]);

  const turnKey = room?.gameMode === "challenge" ? `${room.round}:${room.challengePhase}:${room.currentPlayerId}` : `${room?.round}`;
  useEffect(() => {
    localStartedAtRef.current = null; timerSignalPromiseRef.current = null; setLocalStartedAt(null); setDisplayElapsed(0); setPressed(false);
  }, [turnKey]);
  useEffect(() => {
    if (room?.gameMode === "classic") setPressed(!!room.attempts.some(attempt => attempt.playerId === playerId.current));
  }, [room?.gameMode, room?.attempts.length]);
  useEffect(() => {
    if (room?.status !== "playing" || localStartedAt === null || pressed) return;
    let frame = 0;
    const render = (timestamp: number) => {
      const startedAt = localStartedAtRef.current;
      if (startedAt !== null) setDisplayElapsed(Math.max(0, timestamp - startedAt));
      frame = window.requestAnimationFrame(render);
    };
    frame = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(frame);
  }, [room?.status, localStartedAt, pressed]);

  const isHost = room?.hostId === playerId.current;
  const me = room?.players.find(player => player.uid === playerId.current);
  const isMyChallengeTurn = room?.gameMode === "challenge" && room.challengePhase === "turn" && room.currentPlayerId === playerId.current && !me?.eliminated;
  const canUseTimer = room?.status === "playing" && !pressed && (room.gameMode === "classic" || isMyChallengeTurn);
  const myAttempt = room?.gameMode === "classic" ? room.attempts.find(attempt => attempt.playerId === playerId.current) : null;
  const currentPlayer = room?.players.find(player => player.uid === room.currentPlayerId);
  const suggester = room?.players.find(player => player.uid === room.suggesterId);
  const winner = room?.players.find(player => player.uid === room.winnerId);

  const act = async (endpoint: string, extra: Record<string, unknown> = {}) => {
    if (!room) return;
    setBusy(true); setError("");
    try { setRoom(await request(`/api/cronometro/rooms/${room.code}/${endpoint}`, { playerId: playerId.current, ...extra })); }
    catch (caught: any) { setError(caught.message); }
    finally { setBusy(false); }
  };

  const handleTimer = useCallback(async () => {
    if (!room || !canUseTimer || busy) return;
    if (localStartedAtRef.current === null) {
      const startedAt = performance.now(); localStartedAtRef.current = startedAt; setLocalStartedAt(startedAt); setDisplayElapsed(0);
      if (room.gameMode === "challenge") {
        setError("");
        const signal = request(`/api/cronometro/rooms/${room.code}/timer-state`, { playerId: playerId.current, running: true });
        timerSignalPromiseRef.current = signal;
        signal.then(setRoom).catch((caught: any) => {
          localStartedAtRef.current = null; timerSignalPromiseRef.current = null; setLocalStartedAt(null); setDisplayElapsed(0); setPressed(false); setError(caught.message);
        });
      }
      return;
    }
    const elapsedMs = Math.max(0, Math.round(performance.now() - localStartedAtRef.current));
    setDisplayElapsed(elapsedMs); setPressed(true);
    if (timerSignalPromiseRef.current) {
      try { await timerSignalPromiseRef.current; } catch { return; }
      timerSignalPromiseRef.current = null;
    }
    await act("attempt", { elapsedMs });
  }, [room, canUseTimer, busy]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => { if (event.code === "Space" && !event.repeat) { event.preventDefault(); handleTimer(); } };
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  }, [handleTimer]);

  const submitSuggestion = () => {
    const seconds = Number(suggestedSeconds.replace(",", "."));
    if (!Number.isFinite(seconds) || seconds < 0.5 || seconds > 120) { setError("Escolha um tempo entre 0,50 e 120 segundos."); return; }
    void act("suggest", { targetMs: Math.round(seconds * 1000) });
  };
  const leave = async () => { if (room) await request(`/api/cronometro/rooms/${room.code}/leave`, { playerId: playerId.current }).catch(() => {}); sessionStorage.removeItem("cronometro_room_code"); window.location.href = "/"; };
  const waiting = room?.players.filter(player => !room.attempts.some(attempt => attempt.playerId === player.uid)) || [];
  const bestDifference = room?.attempts[0]?.differenceMs;

  if (loading) return <div className="min-h-screen bg-[#111827] text-white"><MobileNav/><div className="grid min-h-[70vh] place-items-center"><RefreshCw className="animate-spin text-cyan-400"/></div></div>;
  if (!room) return <div className="min-h-screen bg-[#111827] text-white"><MobileNav/><div className="mx-auto max-w-md px-5 py-24 text-center"><Clock3 className="mx-auto h-14 w-14 text-cyan-400"/><h1 className="mt-5 text-3xl font-black">Sala não encontrada</h1><p className="mt-3 text-slate-400">{error || "Crie ou entre em uma sala pela Home."}</p><Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-black text-slate-950"><ArrowLeft/>Voltar para a Home</Link></div></div>;

  return <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(141,81,251,.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(44,126,252,.10),transparent_32%),#1A1E2A] text-white">
    <MobileNav/>
    <div className="relative z-10 mx-auto grid w-full max-w-[1480px] grid-cols-1 items-stretch gap-4 px-2 py-3 sm:px-5 lg:grid-cols-[350px_minmax(0,1fr)] lg:gap-5 lg:py-8">
      <aside className="tj-surface order-2 flex min-w-0 flex-col p-3 sm:p-5 lg:order-1">
        <Button onClick={leave} variant="gameSecondary" size="game" className="w-full"><LogOut className="h-4 w-4"/> Sair da Sala</Button>
        <div className="mt-6 flex items-center justify-between px-1"><h2 className="text-2xl font-black uppercase tracking-tight">Jogadores</h2><span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-sm font-black text-emerald-300">{room.players.length}/10</span></div>
        <div className="mt-4 space-y-2.5">{room.players.map((player, index) => <article key={player.uid} className={`tj-player-card flex min-w-0 items-center gap-3 p-3 ${player.uid === playerId.current ? "is-current" : ""} ${player.eliminated ? "is-danger opacity-60" : ""}`}><span className="tj-icon-box h-12 w-12 bg-violet-500/15 text-lg font-black text-violet-200">{player.uid === room.hostId ? <Crown className="h-5 w-5"/> : player.name[0]?.toUpperCase()}</span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><strong className="truncate text-sm">{player.name}</strong>{player.uid === playerId.current && <span className="rounded bg-violet-600 px-1.5 py-0.5 text-[9px] font-black uppercase">Você</span>}</div><div className="mt-1.5 flex items-center gap-2"><span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-300"><Check className="h-3 w-3"/>{player.eliminated ? "Eliminado" : "Pronto"}</span><span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-300"><Trophy className="h-3 w-3"/>0</span></div></div>{isHost && player.uid !== room.hostId && !player.uid.startsWith("chrono-bot-") && <button onClick={() => act("kick", { targetId: player.uid })} className="tj-icon-box h-9 w-9 text-slate-500 hover:border-rose-400 hover:text-rose-300" aria-label={`Expulsar ${player.name}`}><UserX className="h-4 w-4"/></button>}</article>)}</div>
      </aside>

      <section className="tj-surface tj-surface--stage order-1 flex min-h-[650px] min-w-0 flex-col overflow-hidden p-3 sm:p-6 lg:order-2 lg:min-h-[760px] lg:p-8">
        <header className="flex min-w-0 flex-col gap-4 border-b-2 border-[#2C334F] pb-5 sm:flex-row sm:items-start sm:justify-between">
          <button onClick={() => navigator.clipboard.writeText(room.code)} className="group text-left"><span className="text-[10px] font-black uppercase tracking-[.22em] text-slate-400">Código da sala</span><span className="mt-1 flex items-center gap-3 font-mono text-3xl font-black tracking-widest text-amber-400">{room.code}<span className="tj-icon-box h-9 w-9 text-slate-400 group-hover:text-amber-300"><Copy className="h-4 w-4"/></span></span></button>
          <div className="flex min-w-0 flex-col gap-2 sm:w-[390px]"><Button onClick={() => document.getElementById("cronometro-settings")?.scrollIntoView({ behavior: "smooth" })} variant="gameSecondary" size="game" className="w-full" disabled={!isHost || room.status !== "waiting"}><Settings className="h-4 w-4"/> Configurações</Button></div>
        </header>
        <div className="mt-5"><DigitalLogo compact/></div>
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center space-y-6 py-5">
      {room.status === "waiting" && <>
        <section className="text-center"><span className="text-xs font-black uppercase tracking-[.2em] text-violet-300">Sala de espera</span><h1 className="mt-3 text-3xl font-black">Como vamos jogar hoje?</h1><p className="mt-2 text-slate-400">Escolha o modo e prepare a disputa.</p></section>
        <section id="cronometro-settings" className="tj-inset p-5 md:p-7">
          <div className="grid gap-3 md:grid-cols-2">
            {(["classic", "challenge"] as GameMode[]).map(mode => <button key={mode} onClick={() => isHost && act("settings", { gameMode: mode })} disabled={!isHost || busy} className={`tj-selection-card p-4 text-left ${room.gameMode === mode ? "is-selected" : "opacity-70"}`}><span className={`tj-icon-box ${mode === "classic" ? "bg-blue-500 text-white" : "bg-violet-600 text-white"}`}>{mode === "classic" ? <Clock3/> : <Swords/>}</span><strong className="mt-4 block text-lg">{mode === "classic" ? "MODO CLÁSSICO" : "MODO DESAFIO"}</strong><span className="mt-2 block text-sm text-slate-400">{mode === "classic" ? "Todos tentam parar no tempo exato; vence a menor diferença." : "O tempo acumula. Desafie o jogador anterior e elimine quem errar."}</span></button>)}
          </div>
          {isHost && <div className="tj-theme-card mt-4 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><strong className="flex items-center gap-2">{room.showTimer ? <Eye className="text-violet-300"/> : <EyeOff className="text-slate-400"/>} Visualização do contador</strong><p className="mt-1 text-sm text-slate-400">{room.showTimer ? "O tempo fica visível enquanto roda." : "O tempo fica oculto até parar."}</p></div><Button onClick={() => act("settings", { showTimer: !room.showTimer })} variant="gameSecondary" size="game">{room.showTimer ? "OCULTAR" : "MOSTRAR"}</Button></div></div>}
          {isHost ? <Button onClick={() => act("start")} disabled={busy || (room.gameMode === "challenge" && room.players.length < 2)} variant="gamePrimary" size="gameLg" className="mt-6 w-full"><Play className="fill-current"/> INICIAR {room.gameMode === "challenge" ? "DESAFIO" : "PARTIDA"}</Button> : <p className="mt-6 text-center font-bold text-slate-400">Aguardando o líder iniciar...</p>}
          <div className="mt-5"><LobbyAd/></div>
        </section>
      </>}

      {room.gameMode === "classic" && room.status === "playing" && <>
        <section className="text-center"><span className="text-xs font-black uppercase tracking-[.2em] text-violet-300">Rodada {room.round} · Clássico</span><h1 className="mt-3 text-3xl font-black">Pare exatamente em</h1><div className="tj-theme-card is-selected mx-auto mt-5 w-fit px-7 py-5 font-mono text-5xl font-black text-fuchsia-300">{formatTime(room.targetMs || 0)}</div></section>
        <TimerPad canUse={canUseTimer} started={localStartedAt !== null} pressed={pressed} showTimer={room.showTimer} displayElapsed={displayElapsed} attempt={myAttempt} onTimer={handleTimer}/>
        {waiting.length > 0 && <p className="text-center text-sm text-slate-400">Aguardando: {waiting.map(player => player.name).join(", ")}</p>}
      </>}

      {room.gameMode === "challenge" && room.status === "playing" && <>
        {room.lastResolution && <ResolutionCard resolution={room.lastResolution}/>}
        <section className="text-center"><span className="text-xs font-black uppercase tracking-[.2em] text-violet-300">Rodada {room.round} · Desafio</span><h1 className="mt-3 text-3xl font-black">{room.challengePhase === "suggesting" ? "Novo tempo" : "Não deixe o total passar de"}</h1>{room.targetMs && <div className="tj-theme-card is-selected mx-auto mt-5 w-fit px-7 py-5 font-mono text-5xl font-black text-fuchsia-300">{formatTime(room.targetMs)}</div>}</section>
        <div className="flex flex-wrap justify-center gap-2">{room.players.map(player => <span key={player.uid} className={`rounded-full border px-3 py-1.5 text-sm font-bold ${player.eliminated ? "border-rose-500/40 bg-rose-500/10 text-rose-300 line-through" : player.uid === room.currentPlayerId || player.uid === room.suggesterId ? "border-violet-400 bg-violet-500/15 text-violet-200" : "border-[#454F66] bg-[#1D293D] text-slate-400"}`}>{player.name}</span>)}</div>
        {room.challengePhase === "suggesting" && (room.suggesterId === playerId.current ? <section className="tj-inset border-violet-400/50 p-6 text-center"><span className="tj-icon-box tj-icon-box--lg mx-auto bg-violet-600 text-white"><Swords className="h-7 w-7"/></span><h2 className="mt-3 text-2xl font-black">Sua vez de sugerir</h2><p className="mt-2 text-slate-300">Escolha o limite acumulado da nova rodada.</p><div className="mx-auto mt-5 flex max-w-sm gap-3"><input value={suggestedSeconds} onChange={event => setSuggestedSeconds(event.target.value)} inputMode="decimal" className="min-w-0 flex-1 rounded-xl border-2 border-violet-400/50 bg-slate-950 px-4 py-3 text-center text-xl font-black"/><Button onClick={submitSuggestion} disabled={busy} variant="gamePrimary" size="game">SUGERIR</Button></div><small className="mt-2 block text-slate-400">Tempo em segundos, por exemplo: 4,00</small></section> : <p className="tj-inset p-5 text-center font-bold text-slate-300">{suggester?.name} está escolhendo o próximo tempo...</p>)}
        {room.challengePhase === "turn" && <>
          <p className="text-center text-lg font-black">É a vez de <span className="text-violet-300">{currentPlayer?.name}</span></p>
          {isMyChallengeTurn && room.lastChallengeAttempt && <Button onClick={() => act("challenge")} disabled={busy || localStartedAt !== null || pressed} variant="gameDanger" size="gameLg" className="w-full"><ShieldAlert/> DESAFIAR {room.lastChallengeAttempt.playerName.toUpperCase()}</Button>}
          {isMyChallengeTurn ? <TimerPad canUse={canUseTimer} started={localStartedAt !== null} pressed={pressed} showTimer={false} displayElapsed={displayElapsed} onTimer={handleTimer} challenge/> : <ChallengeTimerSignal running={room.timerActivePlayerId === room.currentPlayerId} playerName={currentPlayer?.name}/>}
          <p className="text-center text-sm text-slate-400">O total permanece oculto e só será revelado quando houver um desafio.</p>
        </>}
      </>}

      {room.status === "results" && room.gameMode === "classic" && (
        <ClassicResults room={room} bestDifference={bestDifference} busy={busy} isHost={isHost} act={act}/>
      )}
      {room.status === "results" && room.gameMode === "challenge" && <><section className="text-center"><Trophy className="mx-auto h-16 w-16 text-yellow-400"/><span className="mt-3 block text-xs font-black uppercase tracking-[.2em] text-violet-300">Fim do desafio</span><h1 className="mt-3 text-4xl font-black">{winner?.name} venceu!</h1><p className="mt-2 text-slate-400">Último jogador sobrevivente.</p></section>{room.lastResolution && <ResolutionCard resolution={room.lastResolution}/>} {isHost ? <Button onClick={() => act("lobby")} variant="gamePrimary" size="gameLg" className="w-full"><Users/> VOLTAR AO LOBBY</Button> : <p className="text-center text-slate-400">Aguardando o líder...</p>}</>}
      {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center font-bold text-red-300">{error}</p>}
        </main>
      </section>
    </div>
  </div>;
}

function ChallengeTimerSignal({ running, playerName }: { running: boolean; playerName?: string }) {
  return <div className={`tj-theme-card min-h-[300px] w-full p-8 text-center transition-all duration-300 ${running ? "border-emerald-300 bg-emerald-500 shadow-[0_7px_0_#047857]" : "border-rose-300 bg-rose-600 shadow-[0_7px_0_#9f1239]"}`}><Clock3 className={`mx-auto h-20 w-20 ${running ? "animate-pulse text-white" : "text-rose-100"}`}/><strong className="mt-6 block text-3xl font-black">{running ? "CRONÔMETRO LIGADO" : "CRONÔMETRO PARADO"}</strong><span className="mt-3 block text-lg font-bold text-white/85">{running ? `${playerName || "O jogador"} está contando` : `Aguardando ${playerName || "o jogador"} iniciar`}</span><span className="mt-5 block font-mono text-5xl font-black">??:??:??</span></div>;
}

function TimerPad({ canUse, started, pressed, showTimer, displayElapsed, attempt, onTimer, challenge = false }: { canUse: boolean; started: boolean; pressed: boolean; showTimer: boolean; displayElapsed: number; attempt?: Room["attempts"][number] | null; onTimer: () => void; challenge?: boolean }) {
  const activeColors = challenge ? (started ? "border-emerald-300 bg-emerald-500 shadow-[0_7px_0_#047857]" : "border-rose-300 bg-rose-600 shadow-[0_7px_0_#9f1239]") : "border-blue-400 bg-blue-600 shadow-[0_7px_0_#1d4ed8]";
  return <button onPointerDown={event => { event.preventDefault(); onTimer(); }} onClick={event => { if (event.detail === 0) onTimer(); }} disabled={!canUse} className={`tj-theme-card min-h-[300px] w-full touch-none p-8 text-center transition-all ${canUse ? `${activeColors} active:translate-y-1 active:shadow-none` : "border-[#454F66] bg-[#1D293D] opacity-70"}`}>
    {attempt ? <><Clock3 className="mx-auto h-16 w-16 text-emerald-300"/><strong className="mt-5 block font-mono text-5xl">{formatTime(attempt.elapsedMs)}</strong><span className="mt-3 block font-bold text-slate-200">Diferença de {formatTime(attempt.differenceMs)}</span></> : started ? <><strong className="block font-mono text-6xl tracking-wider">{showTimer ? formatTime(displayElapsed) : "??:??:??"}</strong><span className="mt-6 block text-xl font-black text-white">TOQUE PARA PARAR</span><small className="mt-2 block text-white/80">Pressione espaço novamente para parar.</small></> : <><strong className="block font-mono text-6xl tracking-wider">00:00:00</strong><span className="mt-6 block text-xl font-black text-white">TOQUE PARA INICIAR</span><small className="mt-2 block text-white/80">No computador, pressione a barra de espaço</small></>}
  </button>;
}

function ClassicResults({ room, bestDifference, busy, isHost, act }: { room: Room; bestDifference?: number; busy: boolean; isHost: boolean; act: (endpoint: string, extra?: Record<string, unknown>) => Promise<void> }) {
  return <><section className="text-center"><Trophy className="mx-auto h-14 w-14 text-yellow-400"/><span className="mt-3 block text-xs font-black uppercase tracking-[.2em] text-violet-300">Resultado da rodada {room.round}</span><h1 className="mt-3 text-3xl font-black">Alvo: {formatTime(room.targetMs || 0)}</h1></section><section className="tj-inset space-y-3 p-5 md:p-7">{room.attempts.map((attempt, index) => <article key={attempt.playerId} className={`tj-player-card flex items-center gap-4 p-4 ${attempt.differenceMs === bestDifference ? "is-selected" : ""}`}><span className={`grid h-10 w-10 place-items-center rounded-xl font-black ${index === 0 ? "bg-violet-500 text-white" : "bg-slate-700"}`}>{index + 1}</span><div className="min-w-0 flex-1"><strong className="block truncate">{attempt.playerName}</strong><span className="text-sm text-slate-400">Diferença: {formatTime(attempt.differenceMs)}</span></div><strong className="font-mono text-lg text-violet-300">{formatTime(attempt.elapsedMs)}</strong></article>)}</section>{isHost ? <div className="grid gap-3 md:grid-cols-3"><Button onClick={() => act("repeat")} disabled={busy} variant="gameSecondary" size="gameLg"><Repeat2/> REPETIR TEMPO</Button><Button onClick={() => act("next")} disabled={busy} variant="gamePrimary" size="gameLg"><RotateCcw/> NOVO TEMPO</Button><Button onClick={() => act("lobby")} disabled={busy} variant="gameSecondary" size="gameLg"><Users/> VOLTAR AO LOBBY</Button></div> : <p className="text-center font-bold text-slate-400">Aguardando o líder...</p>}</>;
}
