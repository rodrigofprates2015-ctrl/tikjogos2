import { useCallback, useEffect, useRef, useState } from "react";
import {
  Clock3, Copy, Flag, Forward, Home, LogOut, Play, RotateCcw,
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

  if (!room) return <div className="min-h-screen bg-[#1a1e2a] text-white"><MobileNav/><div className="grid min-h-[75vh] place-items-center"><div className="text-center"><Forward className="mx-auto h-12 w-12 animate-pulse text-violet-300"/><p className="mt-4 font-bold text-slate-400">{error || "Entrando na sala..."}</p></div></div></div>;

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
      {room.status !== "waiting" && isHost && <button onClick={() => act("lobby", { playerId: me.uid })} className="h-11 rounded-xl border border-slate-700 bg-[#111a30] text-[11px] font-black uppercase text-slate-300 shadow-[0_3px_0_#080d1b] transition-all hover:-translate-y-0.5 hover:border-violet-400 hover:bg-violet-500/10 hover:text-white active:translate-y-1 active:shadow-none"><Home className="mr-1.5 inline h-4 w-4"/> Lobby</button>}
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

  return <div className="min-h-screen bg-[#1a1e2a] text-white"><MobileNav/><div className="flex justify-center">
    <GameIdentityLayout
      players={room.players} userId={me.uid} hostId={room.hostId}
      sidebarHeader={sidebarHeader} sidebarFooter={sidebarFooter}
      detail={player => <p className="mt-1 text-[9px] font-black uppercase text-violet-300">{room.status === "results" ? `${player.score} pontos` : player.finished ? "Cartela completa" : room.status === "waiting" ? "Pronto" : "Respondendo"}</p>}
    >
      {room.status === "waiting" && <section className="flex flex-1 flex-col items-center justify-center py-6 text-center">
        <div className="relative grid h-28 w-28 rotate-3 place-items-center rounded-[2rem] border-4 border-white bg-gradient-to-br from-rose-500 to-red-700 shadow-[0_12px_0_#7f1d1d,0_20px_45px_rgba(244,63,94,.25)]">
          <Flag className="h-12 w-12 fill-white"/><Sparkles className="absolute -right-5 -top-4 h-8 w-8 text-amber-300"/>
        </div>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[.24em] text-rose-300">Uma categoria por vez</p>
        <h1 className="mt-2 text-4xl font-black sm:text-5xl">STOP em sequência</h1>
        <p className="mt-3 max-w-xl text-slate-400">Responda rápido, complete sua cartela e seja o primeiro a bater o STOP.</p>

        {isHost && <button onClick={() => setShowSettings(true)} className="mt-7 flex h-12 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 text-sm font-black text-slate-300 shadow-[0_4px_0_#090e1d] transition-all hover:-translate-y-0.5 hover:border-violet-400 hover:bg-slate-800 hover:text-white active:translate-y-1 active:shadow-none"><Settings className="h-5 w-5"/>Configurações</button>}
        {!isHost && <p className="mt-6 text-sm font-bold text-slate-500">Partida de {room.settings.durationSeconds / 60} minutos</p>}
        {isHost ? <button onClick={() => act("start", { playerId: me.uid })} disabled={busy || room.players.length < 2 || room.settings.excludedLetters.length >= LETTERS.length} className="mt-6 h-16 w-full max-w-2xl rounded-2xl border-b-4 border-violet-800 bg-violet-500 text-lg font-black disabled:opacity-40"><Play className="mr-2 inline h-5 w-5 fill-current"/>SORTEAR LETRA E COMEÇAR</button> : <div className="tj-inset mt-6 w-full max-w-2xl py-5 font-black text-violet-300">Aguardando o capitão...</div>}
      </section>}

      {showSettings && room.status === "waiting" && <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm" onMouseDown={() => setShowSettings(false)}><div onMouseDown={event => event.stopPropagation()} className="w-full max-w-xl rounded-3xl border border-violet-400/30 bg-[#151d34] p-6 shadow-[0_24px_90px_rgba(0,0,0,.55)]"><header className="flex items-center justify-between border-b border-slate-700 pb-4"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-violet-300">STOP em sequência</p><h2 className="mt-1 text-2xl font-black">Configurações da partida</h2></div><button onClick={() => setShowSettings(false)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700 bg-slate-900 text-slate-400 transition hover:border-rose-400 hover:text-white"><X className="h-5 w-5"/></button></header><div className="mt-5"><label className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">Tempo total</label><div className="mt-2 grid grid-cols-5 gap-2">{[120, 180, 300, 480, 600].map(seconds => <button key={seconds} onClick={() => act("settings", { playerId: me.uid, durationSeconds: seconds, excludedLetters: room.settings.excludedLetters })} className={cn("h-11 rounded-xl border font-black transition hover:-translate-y-0.5", room.settings.durationSeconds === seconds ? "border-violet-400 bg-violet-500 text-white shadow-[0_4px_0_#4c1d95]" : "border-slate-700 bg-slate-950 text-slate-400 hover:border-violet-400/60")}>{seconds / 60} min</button>)}</div><label className="mt-6 block text-[10px] font-black uppercase tracking-[.16em] text-slate-400">Letras fora do sorteio</label><p className="mt-1 text-xs text-slate-500">Toque nas letras difíceis que sua turma não quer jogar.</p><div className="mt-3 grid grid-cols-7 gap-2 sm:grid-cols-9">{LETTERS.map(letter => { const excluded = room.settings.excludedLetters.includes(letter); return <button key={letter} onClick={() => act("settings", { playerId: me.uid, durationSeconds: room.settings.durationSeconds, excludedLetters: excluded ? room.settings.excludedLetters.filter(item => item !== letter) : [...room.settings.excludedLetters, letter] })} className={cn("grid aspect-square place-items-center rounded-lg border font-black transition hover:scale-105", excluded ? "border-rose-400 bg-rose-500/20 text-rose-300 line-through" : "border-slate-700 bg-slate-950 text-slate-300 hover:border-violet-400")}>{letter}</button>; })}</div></div><button onClick={() => setShowSettings(false)} className="mt-6 h-12 w-full rounded-xl border-b-4 border-violet-800 bg-violet-500 font-black">SALVAR CONFIGURAÇÕES</button></div></div>}

      {room.status === "rolling" && <section className="grid flex-1 place-items-center py-10 text-center">
        <div><p className="text-[11px] font-black uppercase tracking-[.28em] text-violet-300">A letra da rodada será...</p><div className={cn("relative mx-auto mt-8 grid h-64 w-64 place-items-center rounded-full border-[10px] bg-gradient-to-br from-violet-500/40 to-cyan-500/20 transition-all duration-500", room.revealAt && room.revealAt - now <= 1500 ? "scale-110 border-solid border-amber-300 shadow-[0_0_100px_rgba(251,191,36,.55)]" : "animate-pulse border-dashed border-violet-400 shadow-[0_0_80px_rgba(139,92,246,.35)]")}><span className={cn("text-9xl font-black transition-all", room.revealAt && room.revealAt - now <= 1500 && "scale-110 text-amber-200")}>{room.revealAt && room.revealAt - now <= 1500 ? room.letter : rollingLetter}</span>{room.revealAt && room.revealAt - now <= 1500 && <Sparkles className="absolute -right-6 -top-6 h-14 w-14 text-amber-300"/>}</div><p className="mt-10 font-black text-slate-300">{room.revealAt && room.revealAt - now <= 1500 ? `A letra é ${room.letter}!` : "Sorteando..."}</p></div>
      </section>}

      {room.status === "playing" && <section className="flex flex-1 flex-col py-4">
        <div className="tj-inset p-4"><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-black"><Clock3 className="h-5 w-5 text-rose-300"/>TEMPO DA RODADA</span><strong className={cn("font-mono text-2xl", remaining < 20000 ? "animate-pulse text-rose-400" : "text-white")}>{formatTime(remaining)}</strong></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-950"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-rose-400 transition-all" style={{ width: `${progress}%` }}/></div></div>
        <div className="flex flex-1 flex-col items-center justify-center py-7 text-center">
          <div className="relative w-full max-w-2xl rounded-[2rem] border-2 border-violet-400/40 bg-gradient-to-br from-[#242b4b] to-[#171e36] p-6 shadow-[0_16px_0_#0d1224]">
            <span className="absolute -left-4 -top-5 grid h-20 w-20 -rotate-6 place-items-center rounded-2xl border-4 border-white bg-rose-500 text-5xl font-black shadow-lg">{room.letter}</span>
            <p className="ml-16 text-left text-[10px] font-black uppercase tracking-[.22em] text-violet-300">Categoria {me.currentIndex + 1} de {me.answers.length}</p>
            <h1 className="mt-8 text-4xl font-black sm:text-6xl">{current.category}</h1>
            <p className="mt-2 text-sm text-slate-400">Digite uma resposta que comece com <strong className="text-white">{room.letter}</strong></p>
            <input autoFocus value={value} onChange={event => setValue(event.target.value)} onKeyDown={event => event.key === "Enter" && value.trim() && submit("answer")} placeholder={`${current.category} com ${room.letter}...`} className="mt-6 h-16 w-full rounded-2xl border-2 border-slate-600 bg-slate-950/80 px-5 text-xl font-black outline-none transition focus:border-violet-400 focus:shadow-[0_0_25px_rgba(139,92,246,.2)]"/>
            <div className="mt-3 grid grid-cols-2 gap-3"><button onClick={() => submit("skip")} disabled={busy} className="h-14 rounded-xl border-2 border-amber-400/30 bg-amber-500/10 font-black text-amber-300"><SkipForward className="mr-2 inline h-5 w-5"/>PULAR</button><button onClick={() => submit("answer")} disabled={busy || !value.trim()} className="h-14 rounded-xl border-b-4 border-violet-800 bg-violet-500 font-black disabled:opacity-40">PRÓXIMA <Forward className="ml-2 inline h-5 w-5"/></button></div>
            {current.status === "skipped" && <button onClick={() => submit("noAnswer")} className="mt-3 h-11 w-full rounded-xl border border-slate-600 bg-slate-800 text-sm font-black text-slate-300">NÃO EXISTE PALAVRA</button>}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2">{me.answers.map((answer, index) => <span key={index} className={cn("grid h-8 min-w-8 place-items-center rounded-lg border px-2 text-xs font-black", index === me.currentIndex ? "border-white bg-violet-500" : answer.status === "answered" ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-300" : answer.status === "noAnswer" ? "border-slate-600 bg-slate-800 text-slate-500" : answer.status === "skipped" ? "border-amber-400/50 bg-amber-500/10 text-amber-300" : "border-slate-700 bg-slate-950 text-slate-600")}>{index + 1}</span>)}</div>
        {me.finished ? <button onClick={() => act("stop", { playerId: me.uid })} className="mt-5 h-16 rounded-2xl border-b-4 border-red-900 bg-gradient-to-b from-rose-500 to-red-600 text-2xl font-black shadow-[0_12px_35px_rgba(244,63,94,.25)]"><Flag className="mr-2 inline h-6 w-6 fill-current"/>BATER STOP!</button> : <p className="mt-5 text-center text-xs font-bold text-slate-500">Complete todas as categorias para liberar o STOP.</p>}
      </section>}

      {room.status === "voting" && <section className="flex flex-1 flex-col py-5">
        {room.stopAt && now - room.stopAt < 4200 && <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/90 backdrop-blur-sm"><div className="text-center"><div className="mx-auto grid h-52 w-52 animate-[bounce_.7s_ease-in-out_infinite] rotate-6 place-items-center rounded-[3rem] border-8 border-white bg-rose-600 shadow-[0_22px_0_#7f1d1d,0_35px_90px_rgba(244,63,94,.45)]"><strong className="text-5xl font-black">STOP!</strong></div><p className="mt-10 text-3xl font-black">{room.stopBy ? `${room.stopBy} bateu STOP!` : "O tempo acabou!"}</p><p className="mt-2 font-bold text-rose-200">Canetas na mesa. Hora de conferir!</p></div></div>}
        <div className="text-center"><div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-2"><Clock3 className="h-4 w-4 text-violet-300"/><strong className="font-mono text-violet-200">{room.votingComplete ? "Concluído" : formatTime(Math.max(0, (room.voteEndsAt || now) - now))}</strong></div><p className="mt-5 text-[10px] font-black uppercase tracking-[.24em] text-violet-300">Categoria {voteCategory + 1} de {categories.length}</p><h1 className="mt-2 text-4xl font-black">{categories[voteCategory]}</h1><p className="mt-2 text-slate-400">As respostas já foram analisadas. Toque em uma delas apenas se quiser corrigir.</p></div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">{categoryAnswers.map(({ player, answer }) => { const key = `${player.uid}:${voteCategory}`; const selected = room.votes[key]?.[me.uid] ?? room.prevalidation[key] ?? false; return <button key={player.uid} disabled={room.votingComplete} onClick={() => act("vote", { voterId: me.uid, playerId: player.uid, categoryIndex: voteCategory, valid: !selected })} className={cn("flex min-h-24 items-center gap-3 rounded-2xl border-2 p-4 text-left shadow-[0_6px_0_#080d1b] transition-all hover:-translate-y-0.5 active:translate-y-1 active:shadow-none", selected ? "border-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25" : "border-rose-400 bg-rose-500/15 hover:bg-rose-500/25")}><GameIdentityAvatar player={player} index={player.characterIndex}/><span className="min-w-0 flex-1"><small className="block truncate font-bold text-slate-300">{player.name}{player.uid === me.uid ? " · você" : ""}</small><strong className="block truncate text-lg text-white">{answer.status === "noAnswer" ? "Não existe" : answer.value || "Sem resposta"}</strong></span><span className={cn("grid h-10 w-10 place-items-center rounded-full font-black", selected ? "bg-emerald-400 text-emerald-950" : "bg-rose-400 text-rose-950")}>{selected ? "✓" : "×"}</span></button>; })}</div>
        <div className="mt-7 flex justify-center gap-1.5">{categories.map((_, index) => <span key={index} className={cn("h-2.5 rounded-full transition-all", index < voteCategory || room.votingComplete ? "w-2.5 bg-emerald-400" : index === voteCategory ? "w-8 bg-violet-400" : "w-2.5 bg-slate-700")}/>)}</div>
        {room.votingComplete && isHost ? <button onClick={() => act("finish", { playerId: me.uid })} className="mt-6 h-16 rounded-2xl border-b-4 border-violet-800 bg-violet-500 text-lg font-black">VER RESULTADO DA RODADA</button> : room.votingComplete ? <p className="tj-inset mt-6 py-4 text-center font-bold text-slate-400">Aguardando o capitão mostrar o resultado.</p> : <p className="mt-5 text-center text-xs font-bold text-slate-500">A próxima categoria aparece automaticamente quando o tempo acabar.</p>}
      </section>}

      {room.status === "results" && <section className="flex flex-1 flex-col items-center justify-center py-6 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-3xl border border-amber-300/40 bg-amber-400/10 shadow-[0_0_35px_rgba(251,191,36,.2)]"><Trophy className="h-10 w-10 text-amber-300"/></div><p className="mt-4 text-[10px] font-black uppercase tracking-[.24em] text-amber-300">Resultado da rodada</p><h1 className="mt-2 text-4xl font-black">{ranking[0]?.name} venceu!</h1>
        {ranking[0] && <article className="mt-7 flex w-full max-w-2xl items-center gap-5 rounded-3xl border-2 border-amber-300/50 bg-[#202943] p-5 text-left shadow-[0_8px_0_#11182b,0_18px_45px_rgba(251,191,36,.12)]"><div className="relative"><GameIdentityAvatar player={ranking[0]} index={ranking[0].characterIndex} className="h-24 w-24"/><span className="absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full bg-amber-300 text-lg font-black text-amber-950">1</span></div><div className="min-w-0 flex-1"><small className="font-black uppercase tracking-[.16em] text-amber-300">Campeão da rodada</small><strong className="mt-1 block truncate text-2xl">{ranking[0].name}</strong><span className="mt-1 block text-lg font-black text-violet-300">{ranking[0].score} pontos</span></div></article>}
        <div className="mt-4 grid w-full max-w-2xl gap-2">{ranking.slice(1).map((player, index) => <div key={player.uid} className="tj-player-card flex items-center gap-4 p-4"><span className="grid h-9 w-9 place-items-center rounded-xl border border-slate-600 bg-slate-900 font-black text-slate-300">{index + 2}</span><GameIdentityAvatar player={player} index={player.characterIndex} className="h-14 w-14"/><strong className="min-w-0 flex-1 truncate text-left text-base">{player.name}</strong><span className="font-black text-violet-300">{player.score} pts</span></div>)}</div>
        {isHost ? <button onClick={() => act("lobby", { playerId: me.uid })} className="mt-7 h-16 w-full max-w-2xl rounded-2xl border-b-4 border-violet-800 bg-violet-500 text-lg font-black"><RotateCcw className="mr-2 inline h-5 w-5"/>NOVA PARTIDA</button> : <p className="tj-inset mt-7 w-full max-w-2xl py-4 font-bold text-slate-400">Aguardando o capitão...</p>}
      </section>}

      {error && <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-center font-bold text-rose-300">{error}</p>}
    </GameIdentityLayout>
  </div></div>;
}
