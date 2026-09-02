import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle2, Clock3, Copy, Flag, Forward, Home, LogOut, Play, RotateCcw,
  Settings, SkipForward, Sparkles, Trophy, X,
} from "lucide-react";
import {
  GameIdentityAvatar, GameIdentityCharacterPicker, GameIdentityLayout,
} from "@/components/GameIdentityLayout";
import { MobileNav } from "@/components/MobileNav";
import { cn } from "@/lib/utils";

type Answer = { category: string; value: string; status: "pending" | "skipped" | "answered" | "noAnswer" };
type Player = { uid: string; name: string; connected: boolean; characterIndex: number; answers: Answer[]; currentIndex: number; finished: boolean; score: number };
type Room = {
  code: string;
  hostId: string;
  status: "waiting" | "rolling" | "playing" | "voting" | "results";
  letter: string;
  players: Player[];
  votes: Record<string, Record<string, boolean>>;
  prevalidation: Record<string, boolean>;
  voteCategoryIndex: number;
  voteEndsAt?: number;
  voteReady: Record<string, boolean>;
  votingComplete: boolean;
  settings: { durationSeconds: number; excludedLetters: string[] };
  revealAt?: number;
  endAt?: number;
  stopBy?: string;
  stopAt?: number;
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function formatTime(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function StopGame() {
  const query = new URLSearchParams(window.location.search);
  const roomCode = (query.get("room") || sessionStorage.getItem("stop_room_code") || "").toUpperCase();
  const playerId = useRef(sessionStorage.getItem("stop_player_id") || crypto.randomUUID());
  const [room, setRoom] = useState<Room | null>(null);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [rollingLetter, setRollingLetter] = useState("A");
  const [showSettings, setShowSettings] = useState(false);
  sessionStorage.setItem("stop_player_id", playerId.current);

  const request = useCallback(async (path: string, body?: object) => {
    const response = await fetch(path, body ? {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    } : undefined);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Não foi possível continuar.");
    return data;
  }, []);

  useEffect(() => {
    if (!roomCode) { window.location.replace("/"); return; }
    let active = true;
    const load = async () => {
      try {
        const data = await request(`/api/stop/rooms/${roomCode}`);
        if (active) setRoom(data);
      } catch (cause: any) {
        if (active) setError(cause.message);
      }
    };
    void load();
    const poll = window.setInterval(load, 700);
    return () => { active = false; window.clearInterval(poll); };
  }, [request, roomCode]);

  useEffect(() => {
    const clock = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(clock);
  }, []);

  useEffect(() => {
    if (room?.status !== "rolling") return;
    let index = 0;
    const spin = window.setInterval(() => {
      index = (index + 1) % LETTERS.length;
      setRollingLetter(LETTERS[index]);
    }, 80);
    return () => window.clearInterval(spin);
  }, [room?.status]);

  const act = async (endpoint: string, body: object = {}) => {
    if (!room) return;
    setBusy(true); setError("");
    try { setRoom(await request(`/api/stop/rooms/${room.code}/${endpoint}`, body)); }
    catch (cause: any) { setError(cause.message); }
    finally { setBusy(false); }
  };

  const leave = async () => {
    if (room) fetch(`/api/stop/rooms/${room.code}/leave`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId: playerId.current }),
    }).catch(() => {});
    sessionStorage.removeItem("stop_room_code");
    window.location.href = "/";
  };

  const submit = async (action: "answer" | "skip" | "noAnswer") => {
    await act("answer", { playerId: playerId.current, action, value });
    if (action === "answer") setValue("");
  };

  if (!room) return <div className="min-h-screen bg-[#170d18] text-white"><MobileNav/><div className="grid min-h-[75vh] place-items-center"><div className="text-center"><Forward className="mx-auto h-12 w-12 animate-pulse text-rose-300"/><p className="mt-4 font-bold text-rose-100/50">{error || "Entrando na sala..."}</p></div></div></div>;

  const me = room.players.find(player => player.uid === playerId.current);
  if (!me) return <div className="grid min-h-screen place-items-center bg-[#1a1e2a] text-white">Jogador não encontrado.</div>;

  const isHost = room.hostId === me.uid;
  const current = me.answers[me.currentIndex];
  const completed = me.answers.filter(answer => answer.status === "answered" || answer.status === "noAnswer").length;
  const remaining = Math.max(0, (room.endAt || now) - now);
  const progress = room.settings?.durationSeconds
    ? Math.max(0, Math.min(100, (remaining / (room.settings.durationSeconds * 1000)) * 100))
    : 100;
  const voteCategory = room.voteCategoryIndex || 0;
  const categories = me.answers.map(answer => answer.category);
  const categoryAnswers = room.players.map(player => ({ player, answer: player.answers[voteCategory] }))
    .filter((item): item is { player: Player; answer: Answer } => Boolean(item.answer));
  const ranking = [...room.players].sort((a, b) => b.score - a.score);

  const sidebarHeader = <div className="space-y-3">
    <button onClick={() => navigator.clipboard.writeText(room.code)} className="group flex w-full items-center justify-between rounded-xl border border-slate-700 bg-[#111a30] px-4 py-3 text-left shadow-[0_4px_0_#080d1b] transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400/60 hover:bg-[#17213a] hover:shadow-[0_6px_0_#080d1b] active:translate-y-1 active:shadow-none">
      <span><small className="block text-[10px] font-black uppercase tracking-[.2em] text-slate-400">Código da sala</small><strong className="mt-0.5 block text-2xl font-black tracking-[.22em] text-amber-300">{room.code}</strong></span>
      <Copy className="h-5 w-5 text-slate-500 transition group-hover:scale-110 group-hover:text-amber-300"/>
    </button>
    <div className="grid grid-cols-2 gap-2">
      {room.status !== "waiting" && isHost && <button onClick={() => act("lobby", { playerId: me.uid })} className="h-11 rounded-xl border border-rose-400/25 bg-rose-950/25 text-[11px] font-black uppercase text-rose-100 shadow-[0_3px_0_#3f0a18] transition-all hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-500/15 hover:text-white active:translate-y-1 active:shadow-none"><Home className="mr-1.5 inline h-4 w-4"/> Lobby</button>}
      <button onClick={leave} className={cn("h-11 rounded-xl border border-rose-400/30 bg-rose-500/10 text-[11px] font-black uppercase text-rose-200 shadow-[0_3px_0_#080d1b] transition-all hover:-translate-y-0.5 hover:border-rose-400 hover:bg-rose-500/20 hover:text-white active:translate-y-1 active:shadow-none", !(room.status !== "waiting" && isHost) && "col-span-2")}><LogOut className="mr-1.5 inline h-4 w-4"/> Sair da sala</button>
    </div>
  </div>;

  const sidebarFooter = room.status === "waiting" ? <div className="tj-inset p-3">
    <p className="mb-2 text-[9px] font-black uppercase tracking-[.16em] text-slate-500">Seu personagem</p>
    <GameIdentityCharacterPicker
      selectedIndex={me.characterIndex}
      takenIndexes={room.players.filter(player => player.uid !== me.uid).map(player => player.characterIndex)}
      onSelect={characterIndex => act("character", { playerId: me.uid, characterIndex })}
    />
  </div> : undefined;

  return <div className="min-h-screen bg-[#170d18] text-white [background-image:radial-gradient(circle_at_85%_10%,rgba(244,63,94,.18),transparent_30%),radial-gradient(circle_at_10%_80%,rgba(190,24,93,.16),transparent_34%)]"><MobileNav/><div className="flex justify-center">
    <GameIdentityLayout
      players={room.players} userId={me.uid} hostId={room.hostId}
      sidebarHeader={sidebarHeader} sidebarFooter={sidebarFooter}
      sidebarClassName="!border-rose-400/20 !bg-[#211526]"
      stageClassName="!border-rose-400/25 !bg-[#1d111f]"
      detail={player => <p className={cn("mt-1 text-[9px] font-black uppercase", room.status === "voting" && room.voteReady[player.uid] ? "text-emerald-300" : "text-pink-300")}>{room.status === "results" ? `${player.score} pontos` : room.status === "voting" ? room.voteReady[player.uid] ? "✓ Decisão confirmada" : "Validando respostas" : player.finished ? "Cartela completa" : room.status === "waiting" ? "Pronto" : "Respondendo"}</p>}
    >
      {room.status === "waiting" && <section className="flex flex-1 flex-col items-center justify-center py-6 text-center">
        <div className="relative grid h-28 w-28 rotate-3 place-items-center rounded-[2rem] border-4 border-white bg-gradient-to-br from-rose-500 to-red-700 shadow-[0_12px_0_#7f1d1d,0_20px_45px_rgba(244,63,94,.25)]">
          <Flag className="h-12 w-12 fill-white"/><Sparkles className="absolute -right-5 -top-4 h-8 w-8 text-pink-200"/>
        </div>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[.24em] text-pink-300">Uma categoria por vez</p>
        <h1 className="mt-2 text-4xl font-black sm:text-5xl">STOP em sequência</h1>
        <p className="mt-3 max-w-xl text-slate-400">Responda rápido, complete sua cartela e seja o primeiro a bater o STOP.</p>

        {isHost && <button onClick={() => setShowSettings(true)} className="mt-7 flex h-12 items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-950/30 px-5 text-sm font-black text-rose-100 shadow-[0_4px_0_#3f0b18] transition-all hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-500/15 hover:text-white active:translate-y-1 active:shadow-none"><Settings className="h-5 w-5"/>Configurações</button>}
        {!isHost && <p className="mt-6 text-sm font-bold text-slate-500">Partida de {room.settings.durationSeconds / 60} minutos</p>}
        {isHost ? <button onClick={() => act("start", { playerId: me.uid })} disabled={busy || room.players.length < 2 || room.settings.excludedLetters.length >= LETTERS.length} className="mt-6 h-16 w-full max-w-2xl rounded-2xl border-2 border-rose-300 border-b-[6px] border-b-rose-900 bg-gradient-to-r from-rose-600 to-pink-600 text-lg font-black shadow-[0_12px_35px_rgba(244,63,94,.24)] transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-1 active:border-b-2 disabled:opacity-40"><Play className="mr-2 inline h-5 w-5 fill-current"/>SORTEAR LETRA E COMEÇAR</button> : <div className="mt-6 w-full max-w-2xl rounded-2xl border border-rose-400/20 bg-rose-950/20 py-5 font-black text-rose-200">Aguardando o capitão...</div>}
      </section>}

      {showSettings && room.status === "waiting" && <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm" onMouseDown={() => setShowSettings(false)}><div onMouseDown={event => event.stopPropagation()} className="w-full max-w-xl rounded-3xl border border-rose-400/30 bg-[#28121f] p-6 shadow-[0_24px_90px_rgba(0,0,0,.55)]"><header className="flex items-center justify-between border-b border-slate-700 pb-4"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-pink-300">STOP em sequência</p><h2 className="mt-1 text-2xl font-black">Configurações da partida</h2></div><button onClick={() => setShowSettings(false)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700 bg-slate-900 text-slate-400 transition hover:border-rose-400 hover:text-white"><X className="h-5 w-5"/></button></header><div className="mt-5"><label className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">Tempo total</label><div className="mt-2 grid grid-cols-5 gap-2">{[120, 180, 300, 480, 600].map(seconds => <button key={seconds} onClick={() => act("settings", { playerId: me.uid, durationSeconds: seconds, excludedLetters: room.settings.excludedLetters })} className={cn("h-11 rounded-xl border font-black transition hover:-translate-y-0.5", room.settings.durationSeconds === seconds ? "border-rose-300 bg-rose-500 text-white shadow-[0_4px_0_#881337]" : "border-slate-700 bg-slate-950 text-slate-400 hover:border-rose-400/60")}>{seconds / 60} min</button>)}</div><label className="mt-6 block text-[10px] font-black uppercase tracking-[.16em] text-slate-400">Letras fora do sorteio</label><p className="mt-1 text-xs text-slate-500">Toque nas letras difíceis que sua turma não quer jogar.</p><div className="mt-3 grid grid-cols-7 gap-2 sm:grid-cols-9">{LETTERS.map(letter => { const excluded = room.settings.excludedLetters.includes(letter); return <button key={letter} onClick={() => act("settings", { playerId: me.uid, durationSeconds: room.settings.durationSeconds, excludedLetters: excluded ? room.settings.excludedLetters.filter(item => item !== letter) : [...room.settings.excludedLetters, letter] })} className={cn("grid aspect-square place-items-center rounded-lg border font-black transition hover:scale-105", excluded ? "border-rose-400 bg-rose-500/20 text-rose-300 line-through" : "border-slate-700 bg-slate-950 text-slate-300 hover:border-rose-400")}>{letter}</button>; })}</div></div><button onClick={() => setShowSettings(false)} className="mt-6 h-12 w-full rounded-xl border-b-4 border-rose-900 bg-gradient-to-r from-rose-500 to-pink-600 font-black">SALVAR CONFIGURAÇÕES</button></div></div>}

      {room.status === "rolling" && <section className="grid flex-1 place-items-center py-10 text-center">
        <div className="w-full max-w-3xl"><p className="text-[11px] font-black uppercase tracking-[.28em] text-pink-300">Roleta de letras</p><h1 className="mt-2 text-4xl font-black">Qual será a letra?</h1>{room.revealAt && room.revealAt - now > 1500 ? <div className="relative mt-10 overflow-hidden rounded-[2rem] border-2 border-rose-400/30 bg-rose-950/25 px-6 py-12 shadow-[0_12px_0_#3f0a18,0_24px_70px_rgba(244,63,94,.2)]"><div className="pointer-events-none absolute inset-y-0 left-1/2 w-32 -translate-x-1/2 border-x-2 border-rose-300/60 bg-rose-400/10"/><div key={rollingLetter} className="relative flex items-center justify-center gap-4 animate-[pulse_.16s_ease-in-out]">{[-2,-1,0,1,2].map(offset => { const index = (LETTERS.indexOf(rollingLetter) + offset + LETTERS.length) % LETTERS.length; return <span key={offset} className={cn("grid place-items-center rounded-2xl border-2 font-black transition-all", offset === 0 ? "h-32 w-28 scale-110 border-white bg-gradient-to-b from-rose-500 to-pink-700 text-7xl text-white shadow-[0_8px_0_#881337]" : Math.abs(offset) === 1 ? "h-24 w-20 border-rose-400/30 bg-rose-950/50 text-4xl text-rose-200 opacity-65" : "h-20 w-16 border-rose-400/10 bg-rose-950/30 text-3xl text-rose-300 opacity-25")}>{LETTERS[index]}</span>; })}</div><p className="mt-8 animate-pulse text-sm font-black uppercase tracking-[.24em] text-rose-200">Sorteando...</p></div> : <div className="relative mx-auto mt-12 grid h-64 w-64 scale-110 place-items-center bg-gradient-to-b from-rose-500 to-pink-700 drop-shadow-[0_18px_0_#881337] [clip-path:polygon(25%_3%,75%_3%,100%_50%,75%_97%,25%_97%,0_50%)]"><div className="grid h-[220px] w-[220px] place-items-center border-[6px] border-white/90 [clip-path:inherit]"><span className="text-9xl font-black text-white">{room.letter}</span></div><Sparkles className="absolute -right-8 -top-7 h-16 w-16 text-pink-200"/></div>}<p className="mt-12 text-2xl font-black text-white">{room.revealAt && room.revealAt - now <= 1500 ? `A letra sorteada foi ${room.letter}!` : "A roleta está girando"}</p></div>
      </section>}

      {room.status === "playing" && <section className="flex flex-1 flex-col py-4">
        <div className="relative overflow-hidden rounded-[2rem] border-2 border-rose-400/30 bg-gradient-to-br from-[#3a1426] via-[#291326] to-[#1b101d] p-4 shadow-[0_10px_0_#380916,0_24px_70px_rgba(244,63,94,.18)] sm:p-6">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl"/>
          <header className="relative flex items-center justify-between gap-3 border-b border-rose-300/15 pb-5"><div className="rounded-xl border border-rose-300/25 bg-rose-950/40 px-4 py-2 text-left"><small className="block text-[9px] font-black uppercase tracking-[.18em] text-rose-200">Categorias</small><strong className="text-xl">{me.currentIndex + 1}<span className="text-sm text-rose-300">/{me.answers.length}</span></strong></div><div className="absolute left-1/2 top-[-8px] -translate-x-1/2"><div className="grid h-24 w-24 place-items-center bg-gradient-to-b from-rose-500 to-pink-700 drop-shadow-[0_8px_0_#881337] [clip-path:polygon(25%_3%,75%_3%,100%_50%,75%_97%,25%_97%,0_50%)]"><div className="grid h-[78px] w-[78px] place-items-center border-4 border-white/90 [clip-path:inherit]"><span className="text-5xl font-black text-white">{room.letter}</span></div></div><small className="absolute left-1/2 top-1 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest text-white">Letra</small></div><div className="flex items-center gap-2 rounded-xl border border-rose-300/25 bg-rose-950/40 px-3 py-2"><Clock3 className={cn("h-6 w-6 text-pink-300", remaining < 20000 && "animate-pulse")}/><strong className={cn("font-mono text-lg", remaining < 20000 && "text-rose-300")}>{formatTime(remaining)}</strong></div></header>

          <div className="relative mt-10 flex min-h-[390px] flex-col items-center justify-center rounded-3xl border border-rose-300/15 bg-[#160d18]/75 p-6 text-center shadow-inner sm:p-10"><p className="text-[10px] font-black uppercase tracking-[.24em] text-pink-300">Responda agora</p><h1 className="mt-2 text-5xl font-black sm:text-6xl">{current.category}</h1><p className="mt-3 text-sm text-rose-100/60">Uma resposta com a letra <strong className="text-pink-200">{room.letter}</strong></p><div className="mt-8 w-full max-w-2xl rounded-2xl border-2 border-rose-300/25 bg-rose-950/25 p-2 shadow-[0_7px_0_#350914]"><input autoFocus value={value} onChange={event => setValue(event.target.value)} onKeyDown={event => event.key === "Enter" && value.trim() && submit("answer")} placeholder={`${current.category} com ${room.letter}...`} className="h-16 w-full rounded-xl border border-rose-300/15 bg-[#100a12] px-5 text-center text-xl font-black outline-none transition placeholder:text-rose-100/25 focus:border-pink-400 focus:shadow-[0_0_30px_rgba(244,63,94,.2)]"/></div><div className="mt-5 grid w-full max-w-2xl grid-cols-2 gap-3"><button onClick={() => submit("skip")} disabled={busy} className="h-14 rounded-xl border-2 border-rose-300/25 bg-rose-950/35 font-black text-rose-100 shadow-[0_5px_0_#350914] transition hover:-translate-y-0.5 hover:bg-rose-900/40 active:translate-y-1 active:shadow-none"><SkipForward className="mr-2 inline h-5 w-5"/>PULAR</button><button onClick={() => submit("answer")} disabled={busy || !value.trim()} className="h-14 rounded-xl border-2 border-pink-200 border-b-[6px] border-b-rose-900 bg-gradient-to-r from-rose-500 to-pink-600 font-black text-white shadow-[0_10px_30px_rgba(244,63,94,.2)] transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-1 active:border-b-2 disabled:opacity-40">PRÓXIMA <Forward className="ml-2 inline h-5 w-5"/></button></div>{current.status === "skipped" && <button onClick={() => submit("noAnswer")} className="mt-4 h-11 w-full max-w-2xl rounded-xl border border-rose-300/20 bg-rose-950/30 text-sm font-black text-rose-200 transition hover:bg-rose-900/40">NÃO EXISTE PALAVRA</button>}</div>

          <div className="relative mt-5 flex items-center gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-rose-300/30 bg-rose-950/40"><Flag className="h-5 w-5 text-pink-300"/></div><div className="h-4 flex-1 overflow-hidden rounded-full border-2 border-[#350914] bg-[#350914]"><div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-300 transition-all" style={{ width: `${progress}%` }}/></div></div>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2">{me.answers.map((answer, index) => <span key={index} className={cn("grid h-9 min-w-9 place-items-center rounded-xl border px-2 text-xs font-black transition", index === me.currentIndex ? "scale-110 border-white bg-rose-500 text-white shadow-[0_4px_0_#881337]" : answer.status === "answered" ? "border-pink-300/50 bg-pink-500/15 text-pink-200" : answer.status === "noAnswer" ? "border-rose-900 bg-rose-950/40 text-rose-400" : answer.status === "skipped" ? "border-rose-400/40 bg-rose-500/10 text-rose-300" : "border-rose-950 bg-[#130b15] text-rose-900")}>{index + 1}</span>)}</div>
        {me.finished ? <button onClick={() => act("stop", { playerId: me.uid })} className="mt-5 h-16 rounded-2xl border-b-4 border-red-900 bg-gradient-to-b from-rose-500 to-red-600 text-2xl font-black shadow-[0_12px_35px_rgba(244,63,94,.25)]"><Flag className="mr-2 inline h-6 w-6 fill-current"/>BATER STOP!</button> : <p className="mt-5 text-center text-xs font-bold text-slate-500">Complete todas as categorias para liberar o STOP.</p>}
      </section>}

      {room.status === "voting" && <section className="flex flex-1 flex-col py-5">
        {room.stopAt && now - room.stopAt < 4200 && <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/90 backdrop-blur-sm"><div className="text-center"><div className="mx-auto grid h-52 w-52 animate-[bounce_.7s_ease-in-out_infinite] rotate-6 place-items-center rounded-[3rem] border-8 border-white bg-rose-600 shadow-[0_22px_0_#7f1d1d,0_35px_90px_rgba(244,63,94,.45)]"><strong className="text-5xl font-black">STOP!</strong></div><p className="mt-10 text-3xl font-black">{room.stopBy ? `${room.stopBy} bateu STOP!` : "O tempo acabou!"}</p><p className="mt-2 font-bold text-rose-200">Canetas na mesa. Hora de conferir!</p></div></div>}
        <div className="relative overflow-hidden rounded-[2rem] border-2 border-rose-400/35 bg-[#3a1426] p-4 shadow-[0_10px_0_#3f0a18,0_24px_70px_rgba(244,63,94,.2)] sm:p-6">
          <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_15%_20%,#8b5cf6_0,transparent_28%),radial-gradient(circle_at_85%_80%,#06b6d4_0,transparent_30%)]"/>
          <header className="relative flex items-center justify-between gap-3 border-b border-rose-300/20 pb-5">
            <div className="rounded-xl border border-rose-300/30 bg-rose-950/40 px-4 py-2 text-left"><small className="block text-[9px] font-black uppercase tracking-[.18em] text-rose-200">Categorias</small><strong className="text-xl">{voteCategory + 1}<span className="text-sm text-rose-300">/{categories.length}</span></strong></div>
            <div className="absolute left-1/2 top-[-8px] -translate-x-1/2"><div className="grid h-24 w-24 place-items-center bg-gradient-to-b from-rose-500 to-pink-700 drop-shadow-[0_8px_0_#881337] [clip-path:polygon(25%_3%,75%_3%,100%_50%,75%_97%,25%_97%,0_50%)]"><div className="grid h-[78px] w-[78px] place-items-center border-4 border-white/90 [clip-path:inherit]"><span className="text-5xl font-black text-white">{room.letter}</span></div></div><small className="absolute left-1/2 top-2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest text-white">Letra</small></div>
            <div className="flex items-center gap-2 rounded-xl border border-rose-300/30 bg-rose-950/40 px-3 py-2"><Clock3 className="h-6 w-6 text-pink-300"/><strong className="font-mono text-lg">{room.votingComplete ? "OK" : formatTime(Math.max(0, (room.voteEndsAt || now) - now))}</strong></div>
          </header>

          <div className="relative mt-10 min-h-[390px] rounded-3xl border border-rose-300/20 bg-[#160d18]/85 p-5 text-center shadow-inner sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[.22em] text-pink-300">Tema da validação</p><h1 className="mt-1 text-4xl font-black">{categories[voteCategory]}</h1><p className="mt-2 text-sm font-bold text-rose-200">{Object.keys(room.voteReady).length}/{room.players.length} jogadores prontos</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">{categoryAnswers.map(({ player, answer }) => { const key = `${player.uid}:${voteCategory}`; const selected = room.votes[key]?.[me.uid] ?? room.prevalidation[key] ?? false; const locked = Boolean(room.voteReady[me.uid]) || room.votingComplete; return <button key={player.uid} disabled={locked} onClick={() => act("vote", { voterId: me.uid, playerId: player.uid, categoryIndex: voteCategory, valid: !selected })} className={cn("group flex min-w-[180px] max-w-[280px] items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left shadow-[0_5px_0_#090b28] transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-none disabled:cursor-default disabled:hover:translate-y-0", selected ? "border-emerald-200 bg-emerald-300 text-emerald-950" : "border-rose-200 bg-rose-400 text-rose-950")}><GameIdentityAvatar player={player} index={player.characterIndex} className="h-11 w-11 border-black/10"/><span className="min-w-0 flex-1"><small className="block truncate text-[10px] font-black uppercase opacity-70">{player.name}</small><strong className="block truncate text-base">{answer.status === "noAnswer" ? "Não existe" : answer.value || "Sem resposta"}</strong></span><span className="text-xl font-black">{selected ? "✓" : "×"}</span></button>; })}</div>
          </div>

          <div className="relative mt-5 flex items-center gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-rose-300/40 bg-rose-950/40"><Clock3 className="h-5 w-5 text-pink-300"/></div><div className="h-4 flex-1 overflow-hidden rounded-full border-2 border-[#3f0a18] bg-[#3f0a18]"><div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-300 transition-all duration-100" style={{ width: `${room.votingComplete ? 100 : Math.max(0, Math.min(100, (((room.voteEndsAt || now) - now) / 20_000) * 100))}%` }}/></div></div>
        </div>

        {!room.votingComplete && <button onClick={() => act("vote-ready", { playerId: me.uid, categoryIndex: voteCategory })} disabled={busy || Boolean(room.voteReady[me.uid])} className="mx-auto mt-6 h-16 w-full max-w-md rounded-2xl border-2 border-pink-200 border-b-[6px] border-b-rose-900 bg-gradient-to-r from-rose-500 to-pink-600 text-lg font-black text-white shadow-[0_12px_35px_rgba(244,63,94,.25)] transition-all hover:-translate-y-0.5 hover:brightness-110 active:translate-y-1 active:border-b-2 disabled:border-emerald-700 disabled:from-emerald-400 disabled:to-emerald-500 disabled:text-emerald-950"><CheckCircle2 className="mr-2 inline h-6 w-6"/>{room.voteReady[me.uid] ? "PRONTO — AGUARDANDO OS OUTROS" : "PRONTO, ESSA É MINHA DECISÃO"}</button>}
        <div className="mt-6 flex justify-center gap-1.5">{categories.map((_, index) => <span key={index} className={cn("h-2.5 rounded-full transition-all", index < voteCategory || room.votingComplete ? "w-2.5 bg-emerald-400" : index === voteCategory ? "w-8 bg-rose-400" : "w-2.5 bg-rose-950")}/>)}</div>
        {room.votingComplete && isHost ? <button onClick={() => act("finish", { playerId: me.uid })} className="mt-6 h-16 rounded-2xl border-2 border-pink-200 border-b-[6px] border-b-rose-900 bg-gradient-to-r from-rose-500 to-pink-600 text-lg font-black shadow-[0_12px_35px_rgba(244,63,94,.22)]">VER RESULTADO DA RODADA</button> : room.votingComplete ? <p className="mt-6 rounded-xl border border-rose-400/20 bg-rose-950/20 py-4 text-center font-bold text-rose-100/60">Aguardando o capitão mostrar o resultado.</p> : <p className="mt-4 text-center text-xs font-bold text-rose-100/40">A categoria avança quando todos apertarem pronto ou quando o tempo acabar.</p>}
      </section>}

      {room.status === "results" && <section className="flex flex-1 flex-col items-center justify-center py-6 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-3xl border border-amber-300/40 bg-amber-400/10 shadow-[0_0_35px_rgba(251,191,36,.2)]"><Trophy className="h-10 w-10 text-amber-300"/></div><p className="mt-4 text-[10px] font-black uppercase tracking-[.24em] text-amber-300">Resultado da rodada</p><h1 className="mt-2 text-4xl font-black">{ranking[0]?.name} venceu!</h1>
        {ranking[0] && <article className="mt-7 flex w-full max-w-2xl items-center gap-5 rounded-3xl border-2 border-amber-300/50 bg-[#301522] p-5 text-left shadow-[0_8px_0_#3f0a18,0_18px_45px_rgba(251,191,36,.12)]"><div className="relative"><GameIdentityAvatar player={ranking[0]} index={ranking[0].characterIndex} className="h-24 w-24"/><span className="absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full bg-amber-300 text-lg font-black text-amber-950">1</span></div><div className="min-w-0 flex-1"><small className="font-black uppercase tracking-[.16em] text-amber-300">Campeão da rodada</small><strong className="mt-1 block truncate text-2xl">{ranking[0].name}</strong><span className="mt-1 block text-lg font-black text-pink-300">{ranking[0].score} pontos</span></div></article>}
        <div className="mt-4 grid w-full max-w-2xl gap-2">{ranking.slice(1).map((player, index) => <div key={player.uid} className="tj-player-card flex items-center gap-4 border-rose-400/15 bg-rose-950/15 p-4"><span className="grid h-9 w-9 place-items-center rounded-xl border border-rose-400/20 bg-rose-950/30 font-black text-rose-200">{index + 2}</span><GameIdentityAvatar player={player} index={player.characterIndex} className="h-14 w-14"/><strong className="min-w-0 flex-1 truncate text-left text-base">{player.name}</strong><span className="font-black text-pink-300">{player.score} pts</span></div>)}</div>
        {isHost ? <button onClick={() => act("lobby", { playerId: me.uid })} className="mt-7 h-16 w-full max-w-2xl rounded-2xl border-2 border-pink-200 border-b-[6px] border-b-rose-900 bg-gradient-to-r from-rose-500 to-pink-600 text-lg font-black"><RotateCcw className="mr-2 inline h-5 w-5"/>NOVA PARTIDA</button> : <p className="mt-7 w-full max-w-2xl rounded-xl border border-rose-400/20 bg-rose-950/20 py-4 font-bold text-rose-100/50">Aguardando o capitão...</p>}
      </section>}

      {error && <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-center font-bold text-rose-300">{error}</p>}
    </GameIdentityLayout>
  </div></div>;
}
