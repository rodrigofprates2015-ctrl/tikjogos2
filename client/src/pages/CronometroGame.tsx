import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Clock3, Copy, Crown, Eye, EyeOff, LogOut, Play, RefreshCw, Repeat2, RotateCcw, Trophy, UserX, Users } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";

type Room = {
  code: string;
  hostId: string;
  status: "waiting" | "playing" | "results";
  players: Array<{ uid: string; name: string; connected: boolean }>;
  targetMs: number | null;
  startedAt: number | null;
  attempts: Array<{ playerId: string; playerName: string; elapsedMs: number; differenceMs: number }>;
  showTimer: boolean;
  round: number;
  serverNow: number;
  winnerIds: string[];
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

export default function CronometroGame() {
  const playerId = useRef(sessionStorage.getItem("cronometro_player_id") || crypto.randomUUID());
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [localStartedAt, setLocalStartedAt] = useState<number | null>(null);
  const [displayElapsed, setDisplayElapsed] = useState(0);
  const localStartedAtRef = useRef<number | null>(null);
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
        if (!data.players.some((p: any) => p.uid === playerId.current)) throw new Error("Você não está mais nesta sala.");
        setRoom(data); setError("");
      } catch (e: any) { if (active) setError(e.message); }
      finally { if (active) setLoading(false); }
    };
    load(); const poll = window.setInterval(load, 500);
    return () => { active = false; window.clearInterval(poll); };
  }, [code]);

  useEffect(() => {
    setPressed(!!room?.attempts.some(a => a.playerId === playerId.current));
  }, [room?.attempts.length]);
  useEffect(() => {
    localStartedAtRef.current = null;
    setLocalStartedAt(null);
    setDisplayElapsed(0);
    setPressed(false);
  }, [room?.round]);
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
  const canUseTimer = room?.status === "playing" && !pressed;
  const myAttempt = room?.attempts.find(a => a.playerId === playerId.current);
  const isHost = room?.hostId === playerId.current;

  const act = async (endpoint: string, extra: Record<string, unknown> = {}) => {
    if (!room) return;
    setBusy(true); setError("");
    try { setRoom(await request(`/api/cronometro/rooms/${room.code}/${endpoint}`, { playerId: playerId.current, ...extra })); }
    catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  };

  const handleTimer = useCallback(async () => {
    if (!room || !canUseTimer || busy) return;
    if (localStartedAtRef.current === null) {
      const startedAt = performance.now();
      localStartedAtRef.current = startedAt;
      setLocalStartedAt(startedAt);
      setDisplayElapsed(0);
      return;
    }
    const stoppedAt = performance.now();
    const elapsedMs = Math.max(0, Math.round(stoppedAt - localStartedAtRef.current));
    setDisplayElapsed(elapsedMs);
    setPressed(true);
    await act("attempt", { elapsedMs });
  }, [room, canUseTimer, busy]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => { if (event.code === "Space" && !event.repeat) { event.preventDefault(); handleTimer(); } };
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  }, [handleTimer]);

  const leave = async () => { if (room) await request(`/api/cronometro/rooms/${room.code}/leave`, { playerId: playerId.current }).catch(() => {}); sessionStorage.removeItem("cronometro_room_code"); window.location.href = "/"; };
  const waiting = room?.players.filter(p => !room.attempts.some(a => a.playerId === p.uid)) || [];
  const bestDifference = room?.attempts[0]?.differenceMs;

  if (loading) return <div className="min-h-screen bg-[#111827] text-white"><MobileNav/><div className="grid min-h-[70vh] place-items-center"><RefreshCw className="animate-spin text-cyan-400" /></div></div>;
  if (!room) return <div className="min-h-screen bg-[#111827] text-white"><MobileNav/><div className="mx-auto max-w-md px-5 py-24 text-center"><Clock3 className="mx-auto h-14 w-14 text-cyan-400"/><h1 className="mt-5 text-3xl font-black">Sala não encontrada</h1><p className="mt-3 text-slate-400">{error || "Crie ou entre em uma sala pela Home."}</p><Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-black text-slate-950"><ArrowLeft/>Voltar para a Home</Link></div></div>;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#15314b_0,#111827_42%,#090d18_100%)] text-white">
      <MobileNav />
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <button onClick={leave} style={{ backgroundColor: "#ef3340", color: "#ffffff" }} className="flex items-center gap-2 rounded-xl border border-red-400/60 px-4 py-2 font-black shadow-lg shadow-red-950/30 transition-all hover:brightness-110"><LogOut className="h-4 w-4"/> Sair</button>
        <DigitalLogo compact />
        <button onClick={() => navigator.clipboard.writeText(room.code)} style={{ backgroundColor: "#18bff2", color: "#07152b" }} className="flex items-center gap-2 rounded-xl border border-cyan-200/70 px-4 py-2 font-black shadow-lg shadow-cyan-950/30 transition-all hover:brightness-110"><Copy className="h-4 w-4"/> {room.code}</button>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 pb-16 pt-5">
        {room.status === "waiting" && <>
          <section className="text-center"><span className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">Sala de espera</span><h1 className="mt-3 font-mono text-4xl font-black tracking-wider">T3:MP:00</h1><p className="mt-3 text-slate-400">O jogo do cronômetro para disputar o tempo exato.</p></section>
          <section className="rounded-3xl border border-slate-700 bg-slate-900/80 p-5 md:p-7">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><Users className="text-cyan-400"/> Jogadores ({room.players.length})</h2>
            <div className="grid gap-3 sm:grid-cols-2">{room.players.map(p => <div key={p.uid} className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/60 p-3"><span className={`grid h-9 w-9 place-items-center rounded-full font-black ${p.uid === room.hostId ? "bg-yellow-400 text-slate-950" : "bg-slate-700"}`}>{p.uid === room.hostId ? <Crown className="h-4 w-4"/> : p.name[0]?.toUpperCase()}</span><strong className="flex-1 truncate">{p.name}</strong>{isHost && p.uid !== room.hostId && !p.uid.startsWith("chrono-bot-") && <button onClick={() => act("kick", { targetId: p.uid })} aria-label={`Expulsar ${p.name}`} style={{ backgroundColor: "#7f1d2d", color: "#fecdd3" }} className="rounded-lg p-2 hover:brightness-110"><UserX className="h-4 w-4"/></button>}</div>)}</div>
            {isHost && <div className="mt-5 rounded-2xl border border-slate-600 bg-slate-950/70 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><strong className="flex items-center gap-2 text-base">{room.showTimer ? <Eye className="h-5 w-5 text-cyan-300"/> : <EyeOff className="h-5 w-5 text-slate-400"/>} Visualização do contador</strong><p className="mt-1 text-sm text-slate-400">{room.showTimer ? "O tempo ficará visível enquanto estiver rodando." : "O tempo ficará oculto até o jogador parar."}</p></div><button onClick={() => act("settings", { showTimer: !room.showTimer })} disabled={busy} style={{ backgroundColor: room.showTimer ? "#ef3340" : "#18bff2", color: room.showTimer ? "#ffffff" : "#07152b" }} className="min-w-32 rounded-xl px-5 py-3 font-black shadow-lg transition-all hover:brightness-110 disabled:opacity-50">{room.showTimer ? "DESATIVAR" : "ATIVAR"}</button></div></div>}
            {isHost ? <button onClick={() => act("start")} disabled={busy} style={{ backgroundColor: "#18bff2", color: "#07152b" }} className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border-b-4 border-cyan-800 px-6 py-5 text-xl font-black shadow-xl shadow-cyan-950/30 transition-all hover:brightness-110 active:translate-y-1 active:border-b-0 disabled:opacity-40"><Play className="fill-current"/> INICIAR PARTIDA</button> : <p className="mt-6 text-center font-bold text-slate-400">Aguardando o líder iniciar...</p>}
          </section>
        </>}

        {room.status === "playing" && <>
          <section className="text-center"><span className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">Rodada {room.round}</span><h1 className="mt-3 text-3xl font-black">Pare exatamente em</h1><div className="mx-auto mt-5 w-fit rounded-3xl border-2 border-cyan-400 bg-slate-950 px-7 py-5 font-mono text-5xl font-black tracking-wider text-cyan-300 shadow-[0_0_40px_rgba(34,211,238,.2)]">{formatTime(room.targetMs || 0)}</div></section>
          <button onPointerDown={(event) => { event.preventDefault(); handleTimer(); }} onClick={(event) => { if (event.detail === 0) handleTimer(); }} disabled={!canUseTimer} style={{ backgroundColor: canUseTimer ? "#123653" : "#111827", color: "#ffffff" }} className={`min-h-[300px] w-full touch-none rounded-[2.5rem] border-4 p-8 text-center shadow-xl transition-all ${canUseTimer ? "border-cyan-400 active:scale-[.98]" : "border-slate-600"}`}>
            {myAttempt ? <><Clock3 className="mx-auto h-16 w-16 text-emerald-400"/><strong className="mt-5 block font-mono text-5xl">{formatTime(myAttempt.elapsedMs)}</strong><span className="mt-3 block font-bold text-slate-300">Diferença de {formatTime(myAttempt.differenceMs)}</span></> : localStartedAt !== null ? <><strong className="block font-mono text-6xl tracking-wider">{room.showTimer ? formatTime(displayElapsed) : "??:??:??"}</strong><span className="mt-6 block text-xl font-black text-red-300">TOQUE PARA PARAR</span><small className="mt-2 block text-slate-300">O cronômetro está rodando. Pressione espaço novamente para parar.</small></> : <><strong className="block font-mono text-6xl tracking-wider">00:00:00</strong><span className="mt-6 block text-xl font-black text-cyan-300">TOQUE PARA INICIAR</span><small className="mt-2 block text-slate-300">No computador, pressione a barra de espaço</small></>}
          </button>
          {waiting.length > 0 && <p className="text-center text-sm text-slate-400">Aguardando: {waiting.map(p => p.name).join(", ")}</p>}
        </>}

        {room.status === "results" && <>
          <section className="text-center"><Trophy className="mx-auto h-14 w-14 text-yellow-400"/><span className="mt-3 block text-xs font-black uppercase tracking-[.2em] text-cyan-300">Resultado da rodada {room.round}</span><h1 className="mt-3 text-3xl font-black">Alvo: {formatTime(room.targetMs || 0)}</h1></section>
          <section className="space-y-3 rounded-3xl border border-slate-700 bg-slate-900/80 p-5 md:p-7">{room.attempts.map((a, i) => <article key={a.playerId} className={`flex items-center gap-4 rounded-2xl border p-4 ${a.differenceMs === bestDifference ? "border-yellow-400/60 bg-yellow-400/10" : "border-slate-700 bg-slate-950/50"}`}><span className={`grid h-10 w-10 place-items-center rounded-xl font-black ${i === 0 ? "bg-yellow-400 text-slate-950" : "bg-slate-700"}`}>{i + 1}</span><div className="min-w-0 flex-1"><strong className="block truncate">{a.playerName}</strong><span className="text-sm text-slate-400">Diferença: {formatTime(a.differenceMs)}</span></div><strong className="font-mono text-lg text-cyan-300">{formatTime(a.elapsedMs)}</strong></article>)}</section>
          {isHost ? <div className="grid gap-3 md:grid-cols-3"><button onClick={() => act("repeat")} disabled={busy} style={{ backgroundColor: "#ffca28", color: "#171329" }} className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-amber-700 px-5 py-5 font-black shadow-xl shadow-amber-950/30 transition-all hover:brightness-110 active:translate-y-1 active:border-b-0 disabled:opacity-50"><Repeat2/> REPETIR TEMPO</button><button onClick={() => act("next")} disabled={busy} style={{ backgroundColor: "#18bff2", color: "#07152b" }} className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-cyan-800 px-5 py-5 font-black shadow-xl shadow-cyan-950/30 transition-all hover:brightness-110 active:translate-y-1 active:border-b-0 disabled:opacity-50"><RotateCcw/> NOVO TEMPO</button><button onClick={() => act("lobby")} disabled={busy} style={{ backgroundColor: "#7c3aed", color: "#ffffff" }} className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-violet-900 px-5 py-5 font-black shadow-xl shadow-violet-950/30 transition-all hover:brightness-110 active:translate-y-1 active:border-b-0 disabled:opacity-50"><Users/> VOLTAR AO LOBBY</button></div> : <p className="text-center font-bold text-slate-400">Aguardando o líder escolher a próxima ação...</p>}
        </>}
        {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center font-bold text-red-300">{error}</p>}
      </main>
    </div>
  );
}
