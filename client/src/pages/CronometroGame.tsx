import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Clock3, Copy, Crown, Eye, EyeOff, LogOut, Play, RefreshCw, Repeat2, RotateCcw, ShieldAlert, Skull, Swords, Trophy, UserX, Users } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";

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
  return <div className={`mx-auto w-fit rounded-2xl border-2 border-cyan-400/40 bg-[#080d19] px-5 py-3 font-mono font-black tracking-[.12em] text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,.18)] ${compact ? "text-xl" : "text-3xl md:text-4xl"}`}><span className="text-slate-400">T3:</span>MP:00</div>;
}

function ResolutionCard({ resolution }: { resolution: Resolution }) {
  return <section className={`rounded-3xl border-2 p-5 text-center ${resolution.wasOver ? "border-red-500/60 bg-red-500/10" : "border-amber-400/60 bg-amber-400/10"}`}>
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

  return <div className="min-h-screen bg-[radial-gradient(circle_at_top,#15314b_0,#111827_42%,#090d18_100%)] text-white">
    <MobileNav/>
    <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4"><button onClick={leave} className="flex items-center gap-2 rounded-xl border border-red-400/60 bg-red-600 px-4 py-2 font-black shadow-lg"><LogOut className="h-4 w-4"/> Sair</button><DigitalLogo compact/><button onClick={() => navigator.clipboard.writeText(room.code)} className="flex items-center gap-2 rounded-xl border border-cyan-200/70 bg-cyan-400 px-4 py-2 font-black text-[#07152b] shadow-lg"><Copy className="h-4 w-4"/> {room.code}</button></header>
    <main className="mx-auto max-w-4xl space-y-6 px-4 pb-16 pt-5">
      {room.status === "waiting" && <>
        <section className="text-center"><span className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">Sala de espera</span><h1 className="mt-3 font-mono text-4xl font-black tracking-wider">T3:MP:00</h1><p className="mt-3 text-slate-400">Escolha o modo e prepare a disputa.</p></section>
        <section className="rounded-3xl border border-slate-700 bg-slate-900/80 p-5 md:p-7">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><Users className="text-cyan-400"/> Jogadores ({room.players.length})</h2>
          <div className="grid gap-3 sm:grid-cols-2">{room.players.map(player => <div key={player.uid} className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/60 p-3"><span className={`grid h-9 w-9 place-items-center rounded-full font-black ${player.uid === room.hostId ? "bg-yellow-400 text-slate-950" : "bg-slate-700"}`}>{player.uid === room.hostId ? <Crown className="h-4 w-4"/> : player.name[0]?.toUpperCase()}</span><strong className="flex-1 truncate">{player.name}</strong>{isHost && player.uid !== room.hostId && !player.uid.startsWith("chrono-bot-") && <button onClick={() => act("kick", { targetId: player.uid })} className="rounded-lg bg-red-950 p-2 text-red-200"><UserX className="h-4 w-4"/></button>}</div>)}</div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {(["classic", "challenge"] as GameMode[]).map(mode => <button key={mode} onClick={() => isHost && act("settings", { gameMode: mode })} disabled={!isHost || busy} className={`rounded-2xl border-2 p-4 text-left transition ${room.gameMode === mode ? mode === "classic" ? "border-cyan-400 bg-cyan-400/10" : "border-fuchsia-400 bg-fuchsia-400/10" : "border-slate-700 bg-slate-950/50 opacity-60"}`}><strong className="flex items-center gap-2 text-lg">{mode === "classic" ? <Clock3 className="text-cyan-300"/> : <Swords className="text-fuchsia-300"/>}{mode === "classic" ? "MODO CLÁSSICO" : "MODO DESAFIO"}</strong><span className="mt-2 block text-sm text-slate-400">{mode === "classic" ? "Todos tentam parar no tempo exato; vence a menor diferença." : "O tempo acumula. Desafie o jogador anterior e elimine quem errar."}</span></button>)}
          </div>
          {isHost && <div className="mt-4 rounded-2xl border border-slate-600 bg-slate-950/70 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><strong className="flex items-center gap-2">{room.showTimer ? <Eye className="text-cyan-300"/> : <EyeOff className="text-slate-400"/>} Visualização do contador</strong><p className="mt-1 text-sm text-slate-400">{room.showTimer ? "O tempo fica visível enquanto roda." : "O tempo fica oculto até parar."}</p></div><button onClick={() => act("settings", { showTimer: !room.showTimer })} className={`rounded-xl px-5 py-3 font-black ${room.showTimer ? "bg-red-600" : "bg-cyan-400 text-slate-950"}`}>{room.showTimer ? "DESATIVAR" : "ATIVAR"}</button></div></div>}
          {isHost ? <button onClick={() => act("start")} disabled={busy || (room.gameMode === "challenge" && room.players.length < 2)} className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border-b-4 border-cyan-800 bg-cyan-400 px-6 py-5 text-xl font-black text-[#07152b] shadow-xl disabled:opacity-40"><Play className="fill-current"/> INICIAR {room.gameMode === "challenge" ? "DESAFIO" : "PARTIDA"}</button> : <p className="mt-6 text-center font-bold text-slate-400">Aguardando o líder iniciar...</p>}
        </section>
      </>}

      {room.gameMode === "classic" && room.status === "playing" && <>
        <section className="text-center"><span className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">Rodada {room.round} · Clássico</span><h1 className="mt-3 text-3xl font-black">Pare exatamente em</h1><div className="mx-auto mt-5 w-fit rounded-3xl border-2 border-cyan-400 bg-slate-950 px-7 py-5 font-mono text-5xl font-black text-cyan-300">{formatTime(room.targetMs || 0)}</div></section>
        <TimerPad canUse={canUseTimer} started={localStartedAt !== null} pressed={pressed} showTimer={room.showTimer} displayElapsed={displayElapsed} attempt={myAttempt} onTimer={handleTimer}/>
        {waiting.length > 0 && <p className="text-center text-sm text-slate-400">Aguardando: {waiting.map(player => player.name).join(", ")}</p>}
      </>}

      {room.gameMode === "challenge" && room.status === "playing" && <>
        {room.lastResolution && <ResolutionCard resolution={room.lastResolution}/>}
        <section className="text-center"><span className="text-xs font-black uppercase tracking-[.2em] text-fuchsia-300">Rodada {room.round} · Desafio</span><h1 className="mt-3 text-3xl font-black">{room.challengePhase === "suggesting" ? "Novo tempo" : "Não deixe o total passar de"}</h1>{room.targetMs && <div className="mx-auto mt-5 w-fit rounded-3xl border-2 border-fuchsia-400 bg-slate-950 px-7 py-5 font-mono text-5xl font-black text-fuchsia-300">{formatTime(room.targetMs)}</div>}</section>
        <div className="flex flex-wrap justify-center gap-2">{room.players.map(player => <span key={player.uid} className={`rounded-full border px-3 py-1.5 text-sm font-bold ${player.eliminated ? "border-red-500/30 bg-red-500/10 text-red-300 line-through" : player.uid === room.currentPlayerId || player.uid === room.suggesterId ? "border-fuchsia-400 bg-fuchsia-400/15 text-fuchsia-200" : "border-slate-700 bg-slate-900 text-slate-400"}`}>{player.name}</span>)}</div>
        {room.challengePhase === "suggesting" && (room.suggesterId === playerId.current ? <section className="rounded-3xl border-2 border-fuchsia-400/60 bg-fuchsia-400/10 p-6 text-center"><Swords className="mx-auto h-10 w-10 text-fuchsia-300"/><h2 className="mt-3 text-2xl font-black">Sua vez de sugerir</h2><p className="mt-2 text-slate-300">Escolha o limite acumulado da nova rodada.</p><div className="mx-auto mt-5 flex max-w-sm gap-3"><input value={suggestedSeconds} onChange={event => setSuggestedSeconds(event.target.value)} inputMode="decimal" className="min-w-0 flex-1 rounded-xl border-2 border-fuchsia-400/50 bg-slate-950 px-4 py-3 text-center text-xl font-black"/><button onClick={submitSuggestion} disabled={busy} className="rounded-xl bg-fuchsia-500 px-5 font-black">SUGERIR</button></div><small className="mt-2 block text-slate-400">Tempo em segundos, por exemplo: 4,00</small></section> : <p className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 text-center font-bold text-slate-300">{suggester?.name} está escolhendo o próximo tempo...</p>)}
        {room.challengePhase === "turn" && <>
          <p className="text-center text-lg font-black">É a vez de <span className="text-fuchsia-300">{currentPlayer?.name}</span></p>
          {isMyChallengeTurn && room.lastChallengeAttempt && <button onClick={() => act("challenge")} disabled={busy || localStartedAt !== null || pressed} className="flex w-full items-center justify-center gap-3 rounded-2xl border-b-4 border-red-900 bg-red-600 px-6 py-5 text-xl font-black shadow-xl transition disabled:border-slate-700 disabled:bg-slate-600 disabled:text-slate-300 disabled:shadow-none"><ShieldAlert/> DESAFIAR {room.lastChallengeAttempt.playerName.toUpperCase()}</button>}
          {isMyChallengeTurn ? <TimerPad canUse={canUseTimer} started={localStartedAt !== null} pressed={pressed} showTimer={false} displayElapsed={displayElapsed} onTimer={handleTimer} challenge/> : <ChallengeTimerSignal running={room.timerActivePlayerId === room.currentPlayerId} playerName={currentPlayer?.name}/>}
          <p className="text-center text-sm text-slate-400">O total permanece oculto e só será revelado quando houver um desafio.</p>
        </>}
      </>}

      {room.status === "results" && room.gameMode === "classic" && (
        <ClassicResults room={room} bestDifference={bestDifference} busy={busy} isHost={isHost} act={act}/>
      )}
      {room.status === "results" && room.gameMode === "challenge" && <><section className="text-center"><Trophy className="mx-auto h-16 w-16 text-yellow-400"/><span className="mt-3 block text-xs font-black uppercase tracking-[.2em] text-fuchsia-300">Fim do desafio</span><h1 className="mt-3 text-4xl font-black">{winner?.name} venceu!</h1><p className="mt-2 text-slate-400">Último jogador sobrevivente.</p></section>{room.lastResolution && <ResolutionCard resolution={room.lastResolution}/>} {isHost ? <button onClick={() => act("lobby")} className="flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-violet-900 bg-violet-600 px-5 py-5 font-black"><Users/> VOLTAR AO LOBBY</button> : <p className="text-center text-slate-400">Aguardando o líder...</p>}</>}
      {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center font-bold text-red-300">{error}</p>}
    </main>
  </div>;
}

function ChallengeTimerSignal({ running, playerName }: { running: boolean; playerName?: string }) {
  return <div className={`min-h-[300px] w-full rounded-[2.5rem] border-4 p-8 text-center shadow-xl transition-all duration-300 ${running ? "border-emerald-300 bg-emerald-500 shadow-[0_0_45px_rgba(34,197,94,.45)]" : "border-red-400 bg-red-600"}`}><Clock3 className={`mx-auto h-20 w-20 ${running ? "animate-pulse text-white" : "text-red-100"}`}/><strong className="mt-6 block text-3xl font-black">{running ? "CRONÔMETRO LIGADO" : "CRONÔMETRO PARADO"}</strong><span className="mt-3 block text-lg font-bold text-white/85">{running ? `${playerName || "O jogador"} está contando` : `Aguardando ${playerName || "o jogador"} iniciar`}</span><span className="mt-5 block font-mono text-5xl font-black">??:??:??</span></div>;
}

function TimerPad({ canUse, started, pressed, showTimer, displayElapsed, attempt, onTimer, challenge = false }: { canUse: boolean; started: boolean; pressed: boolean; showTimer: boolean; displayElapsed: number; attempt?: Room["attempts"][number] | null; onTimer: () => void; challenge?: boolean }) {
  const activeColors = challenge ? (started ? "border-emerald-300 bg-emerald-500 shadow-[0_0_45px_rgba(34,197,94,.45)]" : "border-red-400 bg-red-600") : "border-cyan-400 bg-[#123653]";
  return <button onPointerDown={event => { event.preventDefault(); onTimer(); }} onClick={event => { if (event.detail === 0) onTimer(); }} disabled={!canUse} className={`min-h-[300px] w-full touch-none rounded-[2.5rem] border-4 p-8 text-center shadow-xl transition-all ${canUse ? `${activeColors} active:scale-[.98]` : "border-slate-600 bg-[#111827]"}`}>
    {attempt ? <><Clock3 className="mx-auto h-16 w-16 text-emerald-400"/><strong className="mt-5 block font-mono text-5xl">{formatTime(attempt.elapsedMs)}</strong><span className="mt-3 block font-bold text-slate-300">Diferença de {formatTime(attempt.differenceMs)}</span></> : started ? <><strong className="block font-mono text-6xl tracking-wider">{showTimer ? formatTime(displayElapsed) : "??:??:??"}</strong><span className="mt-6 block text-xl font-black text-red-300">TOQUE PARA PARAR</span><small className="mt-2 block text-slate-300">Pressione espaço novamente para parar.</small></> : <><strong className="block font-mono text-6xl tracking-wider">00:00:00</strong><span className="mt-6 block text-xl font-black text-cyan-300">TOQUE PARA INICIAR</span><small className="mt-2 block text-slate-300">No computador, pressione a barra de espaço</small></>}
  </button>;
}

function ClassicResults({ room, bestDifference, busy, isHost, act }: { room: Room; bestDifference?: number; busy: boolean; isHost: boolean; act: (endpoint: string, extra?: Record<string, unknown>) => Promise<void> }) {
  return <><section className="text-center"><Trophy className="mx-auto h-14 w-14 text-yellow-400"/><span className="mt-3 block text-xs font-black uppercase tracking-[.2em] text-cyan-300">Resultado da rodada {room.round}</span><h1 className="mt-3 text-3xl font-black">Alvo: {formatTime(room.targetMs || 0)}</h1></section><section className="space-y-3 rounded-3xl border border-slate-700 bg-slate-900/80 p-5 md:p-7">{room.attempts.map((attempt, index) => <article key={attempt.playerId} className={`flex items-center gap-4 rounded-2xl border p-4 ${attempt.differenceMs === bestDifference ? "border-yellow-400/60 bg-yellow-400/10" : "border-slate-700 bg-slate-950/50"}`}><span className={`grid h-10 w-10 place-items-center rounded-xl font-black ${index === 0 ? "bg-yellow-400 text-slate-950" : "bg-slate-700"}`}>{index + 1}</span><div className="min-w-0 flex-1"><strong className="block truncate">{attempt.playerName}</strong><span className="text-sm text-slate-400">Diferença: {formatTime(attempt.differenceMs)}</span></div><strong className="font-mono text-lg text-cyan-300">{formatTime(attempt.elapsedMs)}</strong></article>)}</section>{isHost ? <div className="grid gap-3 md:grid-cols-3"><button onClick={() => act("repeat")} disabled={busy} className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-amber-700 bg-yellow-400 px-5 py-5 font-black text-slate-950"><Repeat2/> REPETIR TEMPO</button><button onClick={() => act("next")} disabled={busy} className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-cyan-800 bg-cyan-400 px-5 py-5 font-black text-slate-950"><RotateCcw/> NOVO TEMPO</button><button onClick={() => act("lobby")} disabled={busy} className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-violet-900 bg-violet-600 px-5 py-5 font-black"><Users/> VOLTAR AO LOBBY</button></div> : <p className="text-center font-bold text-slate-400">Aguardando o líder...</p>}</>;
}
