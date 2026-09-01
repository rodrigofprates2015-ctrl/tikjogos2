import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft, ChevronRight, Clock3, Copy, Flag, Forward, Home,
  LogOut, Play, RotateCcw, Settings, SkipForward, Sparkles, Trophy,
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
  settings: { durationSeconds: number; excludedLetters: string[] };
  revealAt?: number;
  endAt?: number;
  stopBy?: string;
  stopAt?: number;
};

const LETTERS = "ABCMPRST".split("");

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
  const [voteCategory, setVoteCategory] = useState(0);
  const [rollingLetter, setRollingLetter] = useState("A");
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
  const categories = me.answers.map(answer => answer.category);
  const categoryAnswers = room.players.map(player => ({ player, answer: player.answers[voteCategory] }))
    .filter((item): item is { player: Player; answer: Answer } => Boolean(item.answer));
  const ranking = [...room.players].sort((a, b) => b.score - a.score);

  const sidebarHeader = <div className="space-y-2">
    <button onClick={() => navigator.clipboard.writeText(room.code)} className="tj-inset flex w-full items-center justify-between p-3 text-left">
      <span><small className="block text-[9px] font-black uppercase tracking-[.18em] text-slate-500">Código da sala</small><strong className="font-mono text-2xl tracking-[.18em] text-amber-300">{room.code}</strong></span>
      <Copy className="h-4 w-4 text-amber-300"/>
    </button>
    <div className="grid grid-cols-2 gap-2">
      {room.status !== "waiting" && isHost && <button onClick={() => act("lobby", { playerId: me.uid })} className="tj-inset h-10 text-[10px] font-black uppercase text-slate-300"><Home className="mr-1 inline h-4 w-4"/> Lobby</button>}
      <button onClick={leave} className={cn("tj-inset h-10 text-[10px] font-black uppercase text-rose-300", !(room.status !== "waiting" && isHost) && "col-span-2")}><LogOut className="mr-1 inline h-4 w-4"/> Sair</button>
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

        <div className="tj-inset mt-7 w-full max-w-2xl p-5 text-left">
          <div className="mb-4 flex items-center gap-2"><Settings className="h-5 w-5 text-violet-300"/><strong>Configurações da rodada</strong></div>
          <label className="text-[10px] font-black uppercase tracking-[.16em] text-slate-500">Tempo total</label>
          <div className="mt-2 grid grid-cols-5 gap-2">{[60, 90, 120, 180, 300].map(seconds => <button key={seconds} disabled={!isHost} onClick={() => act("settings", { playerId: me.uid, durationSeconds: seconds, excludedLetters: room.settings.excludedLetters })} className={cn("h-11 rounded-xl border font-black", room.settings.durationSeconds === seconds ? "border-violet-400 bg-violet-500/25 text-violet-200" : "border-slate-700 bg-slate-950 text-slate-500")}>{seconds < 60 ? `${seconds}s` : `${seconds / 60}m`}</button>)}</div>
          <label className="mt-5 block text-[10px] font-black uppercase tracking-[.16em] text-slate-500">Excluir letras do sorteio</label>
          <div className="mt-2 flex flex-wrap gap-2">{LETTERS.map(letter => { const excluded = room.settings.excludedLetters.includes(letter); return <button key={letter} disabled={!isHost} onClick={() => act("settings", { playerId: me.uid, durationSeconds: room.settings.durationSeconds, excludedLetters: excluded ? room.settings.excludedLetters.filter(item => item !== letter) : [...room.settings.excludedLetters, letter] })} className={cn("grid h-10 w-10 place-items-center rounded-xl border-2 font-black", excluded ? "border-rose-400 bg-rose-500/20 text-rose-300 line-through" : "border-emerald-400/40 bg-emerald-500/10 text-emerald-300")}>{letter}</button>; })}</div>
          {!isHost && <p className="mt-3 text-xs text-slate-500">O capitão está configurando a partida.</p>}
        </div>
        {isHost ? <button onClick={() => act("start", { playerId: me.uid })} disabled={busy || room.players.length < 2 || room.settings.excludedLetters.length >= LETTERS.length} className="mt-6 h-16 w-full max-w-2xl rounded-2xl border-b-4 border-violet-800 bg-violet-500 text-lg font-black disabled:opacity-40"><Play className="mr-2 inline h-5 w-5 fill-current"/>SORTEAR LETRA E COMEÇAR</button> : <div className="tj-inset mt-6 w-full max-w-2xl py-5 font-black text-violet-300">Aguardando o capitão...</div>}
      </section>}

      {room.status === "rolling" && <section className="grid flex-1 place-items-center py-10 text-center">
        <div><p className="text-[11px] font-black uppercase tracking-[.28em] text-violet-300">A letra da rodada será...</p><div className="relative mx-auto mt-8 grid h-64 w-64 place-items-center rounded-full border-[10px] border-dashed border-violet-400 bg-gradient-to-br from-violet-500/40 to-cyan-500/20 shadow-[0_0_80px_rgba(139,92,246,.35)] animate-spin"><span className="-rotate-12 text-9xl font-black">{rollingLetter}</span></div><p className="mt-10 animate-pulse font-black text-slate-400">Preparar...</p></div>
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
        {room.stopAt && now - room.stopAt < 2600 && <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/85 backdrop-blur-sm"><div className="animate-bounce text-center"><div className="mx-auto grid h-48 w-48 rotate-6 place-items-center rounded-[3rem] border-8 border-white bg-rose-600 shadow-[0_20px_0_#7f1d1d]"><strong className="text-5xl font-black">STOP!</strong></div><p className="mt-8 text-2xl font-black">{room.stopBy ? `${room.stopBy} parou a rodada!` : "O tempo acabou!"}</p></div></div>}
        <div className="text-center"><p className="text-[10px] font-black uppercase tracking-[.24em] text-violet-300">Validação da mesa</p><h1 className="mt-2 text-3xl font-black">{categories[voteCategory]}</h1><p className="mt-2 text-slate-400">Toque numa resposta para alternar entre <span className="text-emerald-300">válida</span> e <span className="text-rose-300">inválida</span>.</p></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">{categoryAnswers.map(({ player, answer }) => { const key = `${player.uid}:${voteCategory}`; const vote = room.votes[key]?.[me.uid]; const own = player.uid === me.uid; return <button key={player.uid} disabled={own} onClick={() => act("vote", { voterId: me.uid, playerId: player.uid, categoryIndex: voteCategory, valid: vote !== true })} className={cn("flex min-h-24 items-center gap-3 rounded-2xl border-2 p-4 text-left transition", vote === true ? "border-emerald-400 bg-emerald-500/15 shadow-[0_8px_0_#064e3b]" : vote === false ? "border-rose-400 bg-rose-500/15 shadow-[0_8px_0_#881337]" : "border-slate-700 bg-slate-950/50 shadow-[0_8px_0_#0b1020] hover:border-violet-400", own && "cursor-default opacity-80")}><GameIdentityAvatar player={player} index={player.characterIndex}/><span className="min-w-0 flex-1"><small className="block truncate font-bold text-slate-400">{player.name}{own ? " · você" : ""}</small><strong className={cn("block truncate text-lg", answer.status === "noAnswer" ? "text-amber-300" : "text-white")}>{answer.status === "noAnswer" ? "Não existe" : answer.value || "Sem resposta"}</strong></span><span className={cn("grid h-9 w-9 place-items-center rounded-full border font-black", vote === true ? "border-emerald-300 bg-emerald-400 text-emerald-950" : vote === false ? "border-rose-300 bg-rose-400 text-rose-950" : "border-slate-600 text-slate-500")}>{vote === true ? "✓" : vote === false ? "×" : "?"}</span></button>; })}</div>
        <div className="mt-6 flex items-center justify-center gap-4"><button onClick={() => setVoteCategory(index => Math.max(0, index - 1))} disabled={voteCategory === 0} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-700 bg-slate-950 disabled:opacity-30"><ChevronLeft/></button><div className="flex gap-1.5">{categories.map((_, index) => <button key={index} onClick={() => setVoteCategory(index)} className={cn("h-2.5 rounded-full transition-all", index === voteCategory ? "w-8 bg-violet-400" : "w-2.5 bg-slate-700")}/>)}</div><button onClick={() => setVoteCategory(index => Math.min(categories.length - 1, index + 1))} disabled={voteCategory === categories.length - 1} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-700 bg-slate-950 disabled:opacity-30"><ChevronRight/></button></div>
        {isHost ? <button onClick={() => act("finish", { playerId: me.uid })} className="mt-6 h-16 rounded-2xl border-b-4 border-violet-800 bg-violet-500 text-lg font-black">ENCERRAR VOTAÇÃO E VER PÓDIO</button> : <p className="tj-inset mt-6 py-4 text-center font-bold text-slate-400">O capitão encerrará a votação.</p>}
      </section>}

      {room.status === "results" && <section className="flex flex-1 flex-col items-center justify-center py-6 text-center">
        <Trophy className="h-14 w-14 text-amber-300"/><p className="mt-3 text-[10px] font-black uppercase tracking-[.24em] text-amber-300">Pódio da rodada</p><h1 className="mt-2 text-4xl font-black">Mandaram bem!</h1>
        <div className="mt-8 flex w-full max-w-2xl items-end justify-center gap-3">{ranking.slice(0, 3).map((player, index) => { const heights = ["h-64", "h-52", "h-44"]; const colors = ["from-amber-400/35", "from-slate-300/25", "from-orange-500/25"]; return <article key={player.uid} style={{ order: index === 0 ? 1 : index === 1 ? 0 : 2 }} className={cn("flex flex-1 flex-col items-center justify-center rounded-t-3xl border border-white/10 bg-gradient-to-b to-slate-950 p-3", heights[index], colors[index])}><span className="text-3xl font-black text-amber-300">#{index + 1}</span><GameIdentityAvatar player={player} index={player.characterIndex}/><strong className="mt-2 max-w-full truncate">{player.name}</strong><span className="mt-1 font-black text-violet-300">{player.score} pts</span></article>; })}</div>
        {ranking.length > 3 && <div className="mt-4 grid w-full max-w-2xl gap-2 sm:grid-cols-2">{ranking.slice(3).map((player, index) => <div key={player.uid} className="tj-player-card flex items-center gap-3 p-3"><GameIdentityAvatar player={player} index={player.characterIndex}/><strong className="min-w-0 flex-1 truncate text-left">#{index + 4} {player.name}</strong><span className="font-black text-violet-300">{player.score}</span></div>)}</div>}
        {isHost ? <button onClick={() => act("lobby", { playerId: me.uid })} className="mt-7 h-16 w-full max-w-2xl rounded-2xl border-b-4 border-violet-800 bg-violet-500 text-lg font-black"><RotateCcw className="mr-2 inline h-5 w-5"/>NOVA PARTIDA</button> : <p className="tj-inset mt-7 w-full max-w-2xl py-4 font-bold text-slate-400">Aguardando o capitão...</p>}
      </section>}

      {error && <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-center font-bold text-rose-300">{error}</p>}
    </GameIdentityLayout>
  </div></div>;
}
