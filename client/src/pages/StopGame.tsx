import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen, CheckCircle2, Clock3, Copy, Flag, Forward, HelpCircle, Home, LogOut, Play, RotateCcw,
  Plus, Settings, SkipForward, Sparkles, Trophy, Users, X,
} from "lucide-react";
import { Link } from "wouter";
import {
  GameIdentityAvatar, GameIdentityCharacterPicker, GameIdentityLayout,
} from "@/components/GameIdentityLayout";
import { MobileNav } from "@/components/MobileNav";
import { LobbyInactivityGuard } from "@/components/LobbyInactivityGuard";
import { cn } from "@/lib/utils";
import { setPageSeo } from "@/lib/pageSeo";
import stopLogo from "@/assets/stop-logo.png";

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
  serverNow: number;
  settings: { durationSeconds: number; excludedLetters: string[]; selectedCategories: string[] };
  revealAt?: number;
  endAt?: number;
  stopBy?: string;
  stopAt?: number;
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const DEFAULT_CATEGORIES = ["Nome", "Animal", "Comida", "Cidade ou país", "Filme ou série", "Profissão", "Objeto", "Marca"];
const EXTRA_CATEGORIES = [
  "Cor", "Fruta", "Cidade", "País", "Filme", "Série", "Parte do corpo", "Personagem", "Desenho animado", "Novela",
  "Cantor ou cantora", "Música", "Esporte", "Time", "Celebridade", "Verbo",
  "Adjetivo", "Roupa", "Lugar", "Órgão", "Livro", "Jogo", "Veículo", "Minha sogra é",
];
const CATEGORY_OPTIONS = [...DEFAULT_CATEGORIES, ...EXTRA_CATEGORIES];

function formatTime(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function anonymousOrder(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return hash >>> 0;
}

function StopLanding({ playerId }: { playerId: string }) {
  const [nickname, setNickname] = useState(() => localStorage.getItem("playerNickname") || "");
  const [code, setCode] = useState("");
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem("playerNickname")));
  const [loading, setLoading] = useState<"create" | "join" | null>(null);
  const [landingError, setLandingError] = useState("");

  useEffect(() => {
    setPageSeo({
      title: "Stop Online Grátis para Jogar com Amigos | TikJogos",
      description: "Jogue Stop, Adedonha ou Adedanha online por categorias. Crie uma sala, sorteie uma letra e jogue gratuitamente com seus amigos.",
      canonical: "https://tikjogos.com.br/stop",
      keywords: "stop online, adedonha online, adedanha online, abecedário online, stop com amigos",
    });
  }, []);

  const enterRoom = (roomCode: string) => {
    sessionStorage.setItem("stop_room_code", roomCode);
    if (remember) localStorage.setItem("playerNickname", nickname.trim());
    else localStorage.removeItem("playerNickname");
    window.location.href = `/stop?room=${encodeURIComponent(roomCode)}`;
  };

  const submit = async (kind: "create" | "join") => {
    const cleanNickname = nickname.trim();
    if (!cleanNickname) return setLandingError("Digite seu apelido para continuar.");
    if (kind === "join" && code.trim().length !== 3) return setLandingError("Digite o código de 3 caracteres da sala.");
    setLoading(kind); setLandingError("");
    try {
      const response = await fetch(kind === "create" ? "/api/stop/rooms" : `/api/stop/rooms/${code.trim().toUpperCase()}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, nickname: cleanNickname }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível entrar na sala.");
      enterRoom(data.code || code.trim().toUpperCase());
    } catch (cause: any) {
      setLandingError(cause.message);
      setLoading(null);
    }
  };

  return <div className="min-h-screen bg-[#17142B] text-white">
    <MobileNav />
    <main>
      <section className="border-b border-[#EBB3F2]/15 px-4 py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_.9fr]">
          <div>
            <img src={stopLogo} alt="Stop Online" className="h-auto w-full max-w-[360px] object-contain" />
            <p className="mt-7 text-xs font-black uppercase tracking-[.2em] text-[#79D9AC]">Stop, Adedonha ou Adedanha</p>
            <h1 className="mt-3 text-4xl font-black leading-tight sm:text-6xl">Stop online grátis para jogar com amigos</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#EBB3F2]/75">Uma letra, várias categorias e pouco tempo para pensar. Crie uma sala, envie o código para sua turma e descubra quem tem as respostas mais rápidas.</p>
          </div>

          <div className="rounded-3xl border-2 border-[#EBB3F2]/25 bg-[#292052] p-5 shadow-[0_10px_0_#503FBF] sm:p-7">
            <h2 className="text-2xl font-black">Comece uma partida</h2>
            <label className="mt-5 block text-xs font-black uppercase tracking-wider text-[#EBB3F2]">Seu apelido</label>
            <input value={nickname} maxLength={18} onChange={event => setNickname(event.target.value)} placeholder="Digite seu apelido" className="mt-2 h-14 w-full rounded-xl border-2 border-[#EBB3F2]/20 bg-[#17142B] px-4 font-bold outline-none focus:border-[#79D9AC]" />
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-[#EBB3F2]/70"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} className="h-4 w-4 accent-[#6650F2]" /> Lembrar meu apelido</label>
            <button onClick={() => submit("create")} disabled={Boolean(loading)} className="mt-5 h-14 w-full rounded-xl border-2 border-[#EBB3F2] border-b-[6px] border-b-[#503FBF] bg-[#6650F2] font-black transition hover:-translate-y-0.5 disabled:opacity-50"><Play className="mr-2 inline h-5 w-5 fill-current" />{loading === "create" ? "CRIANDO..." : "CRIAR SALA"}</button>
            <div className="my-5 flex items-center gap-3 text-xs font-black text-[#EBB3F2]/40"><span className="h-px flex-1 bg-[#EBB3F2]/15" />OU ENTRE COM UM CÓDIGO<span className="h-px flex-1 bg-[#EBB3F2]/15" /></div>
            <div className="grid grid-cols-[1fr_auto] gap-2"><input value={code} maxLength={3} onChange={event => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} placeholder="CÓDIGO" className="h-13 min-w-0 rounded-xl border-2 border-[#EBB3F2]/20 bg-[#17142B] px-4 text-center font-black uppercase tracking-[.25em] outline-none focus:border-[#79D9AC]" /><button onClick={() => submit("join")} disabled={Boolean(loading)} className="rounded-xl bg-[#79D9AC] px-5 font-black text-[#292052] disabled:opacity-50">ENTRAR</button></div>
            {landingError && <p className="mt-4 rounded-xl border border-[#F27052]/40 bg-[#F27052]/10 p-3 text-sm font-bold text-[#F27052]">{landingError}</p>}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="grid gap-6 md:grid-cols-3">{[
          [Users, "Multiplayer online", "Cada amigo entra pelo próprio celular usando o mesmo código de sala."],
          [Clock3, "Tempo configurável", "Escolha a duração da rodada e tente completar todas as categorias."],
          [CheckCircle2, "Validação em grupo", "As respostas são votadas anonimamente antes da pontuação final."],
        ].map(([Icon, title, text]) => { const CardIcon = Icon as typeof Users; return <article key={title as string} className="rounded-2xl border border-[#EBB3F2]/15 bg-[#211B45] p-6"><CardIcon className="h-8 w-8 text-[#79D9AC]"/><h2 className="mt-4 text-xl font-black">{title as string}</h2><p className="mt-2 leading-relaxed text-[#EBB3F2]/65">{text as string}</p></article>; })}</div>

        <article className="mx-auto mt-16 max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#79D9AC]">Regras rápidas</p>
          <h2 className="mt-3 text-3xl font-black sm:text-5xl">Como jogar Stop online</h2>
          <ol className="mt-7 grid gap-4 sm:grid-cols-2">{[
            "Crie uma sala e compartilhe o código com os amigos.",
            "Configure o tempo, as categorias e as letras do sorteio.",
            "Responda cada categoria usando a letra sorteada.",
            "Complete a cartela, bata Stop e valide as respostas da mesa.",
          ].map((step, index) => <li key={step} className="flex gap-4 rounded-2xl border border-[#EBB3F2]/15 bg-[#292052] p-5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F27052] font-black">{index + 1}</span><span className="pt-1 font-bold text-[#EBB3F2]/80">{step}</span></li>)}</ol>
        </article>

        <article className="mx-auto mt-16 max-w-4xl rounded-3xl border border-[#EBB3F2]/15 bg-[#211B45] p-6 sm:p-9">
          <BookOpen className="h-9 w-9 text-[#EBB3F2]"/><h2 className="mt-4 text-3xl font-black">Stop, Adedonha e Adedanha são o mesmo jogo?</h2>
          <p className="mt-4 leading-relaxed text-[#EBB3F2]/70">São nomes regionais para a brincadeira em que todos respondem categorias usando uma letra sorteada. Em alguns lugares ela também é chamada de Abecedário. No TikJogos, a dinâmica acontece online e uma categoria aparece por vez.</p>
        </article>

        <section className="mx-auto mt-16 max-w-4xl" aria-labelledby="stop-faq"><HelpCircle className="h-9 w-9 text-[#79D9AC]"/><h2 id="stop-faq" className="mt-4 text-3xl font-black">Perguntas frequentes</h2><div className="mt-6 space-y-3">{[
          ["O Stop online é gratuito?", "Sim. Você pode criar uma sala e jogar gratuitamente pelo navegador."],
          ["Precisa instalar aplicativo?", "Não. O jogo funciona no navegador do celular e do computador."],
          ["Quantas pessoas podem jogar?", "A sala aceita até dez jogadores. Para uma disputa mais divertida, recomendamos pelo menos três."],
          ["Posso criar minhas próprias categorias?", "Sim. O host pode selecionar categorias prontas e adicionar temas personalizados."],
        ].map(([question, answer]) => <article key={question} className="rounded-2xl border border-[#EBB3F2]/15 bg-[#292052] p-5"><h3 className="font-black">{question}</h3><p className="mt-2 text-[#EBB3F2]/65">{answer}</p></article>)}</div></section>

        <div className="mt-16 text-center"><Link href="/jogos-do-tiktok" className="inline-flex items-center gap-2 rounded-xl border border-[#EBB3F2]/25 px-5 py-3 font-black text-[#EBB3F2] hover:bg-[#503FBF]/30">Conheça outros jogos do TikTok <Forward className="h-4 w-4"/></Link></div>
      </section>
    </main>
  </div>;
}

export default function StopGame() {
  const query = new URLSearchParams(window.location.search);
  const roomCode = (query.get("room") || sessionStorage.getItem("stop_room_code") || "").toUpperCase();
  const playerId = useRef(sessionStorage.getItem("stop_player_id") || crypto.randomUUID());
  const serverOffset = useRef(0);
  const [room, setRoom] = useState<Room | null>(null);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [rollingLetter, setRollingLetter] = useState("A");
  const [showSettings, setShowSettings] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [forcedRollUntil, setForcedRollUntil] = useState(0);
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
    if (!roomCode) return;
    let active = true;
    const load = async () => {
      try {
        const data = await request(`/api/stop/rooms/${roomCode}`);
        if (active) { serverOffset.current = Number(data.serverNow || Date.now()) - Date.now(); setRoom(data); }
      } catch (cause: any) {
        if (active) setError(cause.message);
      }
    };
    void load();
    const poll = window.setInterval(load, 700);
    return () => { active = false; window.clearInterval(poll); };
  }, [request, roomCode]);

  useEffect(() => {
    const clock = window.setInterval(() => setNow(Date.now() + serverOffset.current), 100);
    return () => window.clearInterval(clock);
  }, []);

  useEffect(() => {
    if (room?.status !== "rolling" && Date.now() >= forcedRollUntil) return;
    let index = 0;
    const spin = window.setInterval(() => {
      index = (index + 1) % LETTERS.length;
      setRollingLetter(LETTERS[index]);
    }, 95);
    return () => window.clearInterval(spin);
  }, [room?.status, forcedRollUntil]);

  const act = async (endpoint: string, body: object = {}) => {
    if (!room) return;
    setBusy(true); setError("");
    try { const data = await request(`/api/stop/rooms/${room.code}/${endpoint}`, body); serverOffset.current = Number(data.serverNow || Date.now()) - Date.now(); setNow(Number(data.serverNow || Date.now())); setRoom(data); }
    catch (cause: any) { setError(cause.message); }
    finally { setBusy(false); }
  };

  const leave = async () => {
    if (room) fetch(`/api/stop/rooms/${room.code}/leave`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId: playerId.current }), keepalive: true,
    }).catch(() => {});
    sessionStorage.removeItem("stop_room_code");
    window.location.href = "/";
  };

  const submit = async (action: "answer" | "skip" | "noAnswer") => {
    await act("answer", { playerId: playerId.current, action, value });
    if (action === "answer") setValue("");
  };

  if (!roomCode) return <StopLanding playerId={playerId.current} />;
  if (!room) return <div className="min-h-screen bg-[#17142B] text-white"><MobileNav/><div className="grid min-h-[75vh] place-items-center"><div className="text-center"><Forward className="mx-auto h-12 w-12 animate-pulse text-[#EBB3F2]"/><p className="mt-4 font-bold text-[#EBB3F2]/50">{error || "Entrando na sala..."}</p></div></div></div>;

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
  const anonymousCategoryAnswers = [...categoryAnswers].sort((first, second) => anonymousOrder(`${me.uid}:${voteCategory}:${first.player.uid}`) - anonymousOrder(`${me.uid}:${voteCategory}:${second.player.uid}`));
  const ranking = [...room.players].sort((a, b) => b.score - a.score);
  const selectedCategories = room.settings.selectedCategories?.length ? room.settings.selectedCategories : DEFAULT_CATEGORIES;
  const forcedRollRemaining = Math.max(0, forcedRollUntil - Date.now());
  const showRolling = room.status === "rolling" || (room.status === "playing" && forcedRollRemaining > 0);
  const showPlaying = room.status === "playing" && forcedRollRemaining <= 0;
  const isLetterSpinning = forcedRollRemaining > 1800 || (forcedRollRemaining <= 0 && room.status === "rolling" && Boolean(room.revealAt && room.revealAt - now > 1800));

  const updateSettings = (changes: Partial<Room["settings"]>) => act("settings", {
    playerId: me.uid,
    durationSeconds: room.settings.durationSeconds,
    excludedLetters: room.settings.excludedLetters,
    selectedCategories,
    ...changes,
  });

  const startRound = async () => {
    setForcedRollUntil(Date.now() + 6500);
    await act("start", { playerId: me.uid });
  };

  const addCustomCategory = () => {
    const category = customCategory.trim().replace(/\s+/g, " ");
    if (category.length < 2 || selectedCategories.length >= 20 || selectedCategories.some(item => item.toLocaleLowerCase("pt-BR") === category.toLocaleLowerCase("pt-BR"))) return;
    void updateSettings({ selectedCategories: [...selectedCategories, category] });
    setCustomCategory("");
  };

  const sidebarHeader = <div className="space-y-3">
    <button onClick={() => navigator.clipboard.writeText(room.code)} className="group flex w-full items-center justify-between rounded-xl border border-slate-700 bg-[#111a30] px-4 py-3 text-left shadow-[0_4px_0_#080d1b] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#F27052]/60 hover:bg-[#17213a] hover:shadow-[0_6px_0_#080d1b] active:translate-y-1 active:shadow-none">
      <span><small className="block text-[10px] font-black uppercase tracking-[.2em] text-slate-400">Código da sala</small><strong className="mt-0.5 block text-2xl font-black tracking-[.22em] text-[#EBB3F2]">{room.code}</strong></span>
      <Copy className="h-5 w-5 text-slate-500 transition group-hover:scale-110 group-hover:text-[#EBB3F2]"/>
    </button>
    <div className="grid grid-cols-2 gap-2">
      {room.status !== "waiting" && isHost && <button onClick={() => act("lobby", { playerId: me.uid })} className="h-11 rounded-xl border border-[#F27052]/25 bg-[#503FBF]/25 text-[11px] font-black uppercase text-[#EBB3F2] shadow-[0_3px_0_#503FBF] transition-all hover:-translate-y-0.5 hover:border-[#EBB3F2] hover:bg-[#F27052]/15 hover:text-white active:translate-y-1 active:shadow-none"><Home className="mr-1.5 inline h-4 w-4"/> Lobby</button>}
      <button onClick={leave} className={cn("h-11 rounded-xl border border-[#F27052]/30 bg-[#F27052]/10 text-[11px] font-black uppercase text-[#EBB3F2] shadow-[0_3px_0_#080d1b] transition-all hover:-translate-y-0.5 hover:border-[#F27052] hover:bg-[#F27052]/20 hover:text-white active:translate-y-1 active:shadow-none", !(room.status !== "waiting" && isHost) && "col-span-2")}><LogOut className="mr-1.5 inline h-4 w-4"/> Sair da sala</button>
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

  return <div className="min-h-screen overflow-x-hidden bg-[#17142B] text-white"><LobbyInactivityGuard active={room.status === "waiting"} onExpire={leave} /><MobileNav/><div className="flex min-w-0 justify-center overflow-x-hidden">
    <GameIdentityLayout
      players={room.players} userId={me.uid} hostId={room.hostId}
      sidebarHeader={sidebarHeader} sidebarFooter={sidebarFooter}
      sidebarClassName="!border-[#F27052]/20 !bg-[#211B45]"
      stageClassName="!border-[#F27052]/25 !bg-[#1D1838]"
      backgroundClassName="bg-[#17142B]"
      detail={player => <p className={cn("mt-1 text-[9px] font-black uppercase", room.status === "voting" && room.voteReady[player.uid] ? "text-[#79D9AC]" : "text-[#EBB3F2]")}>{room.status === "results" ? `${player.score} pontos` : room.status === "voting" ? room.voteReady[player.uid] ? "✓ Decisão confirmada" : "Validando respostas" : player.finished ? "Cartela completa" : room.status === "waiting" ? "Pronto" : "Respondendo"}</p>}
    >
      {room.status === "waiting" && <section className="flex flex-1 flex-col items-center justify-center py-6 text-center">
        <div className="relative w-full max-w-[360px]"><img src={stopLogo} alt="STOP" className="mx-auto h-auto w-full object-contain drop-shadow-[0_14px_24px_rgba(242,112,82,.32)]"/><Sparkles className="absolute -right-3 -top-4 h-9 w-9 text-[#EBB3F2]"/></div>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[.24em] text-[#EBB3F2]">Uma categoria por vez</p>
        <h1 className="mt-3 text-3xl font-black sm:text-4xl">STOP em sequência</h1>
        <p className="mt-3 max-w-xl text-slate-400">Responda rápido, complete sua cartela e seja o primeiro a bater o STOP.</p>

        {isHost && <button onClick={() => setShowSettings(true)} className="mt-7 flex h-12 items-center gap-2 rounded-xl border border-[#F27052]/30 bg-[#503FBF]/30 px-5 text-sm font-black text-[#EBB3F2] shadow-[0_4px_0_#3f0b18] transition-all hover:-translate-y-0.5 hover:border-[#EBB3F2] hover:bg-[#F27052]/15 hover:text-white active:translate-y-1 active:shadow-none"><Settings className="h-5 w-5"/>Configurações</button>}
        {!isHost && <p className="mt-6 text-sm font-bold text-slate-500">Partida de {room.settings.durationSeconds / 60} minutos</p>}
        {isHost ? <button onClick={startRound} disabled={busy || room.players.length < 2 || room.settings.excludedLetters.length >= LETTERS.length || selectedCategories.length < 4} className="mt-6 h-16 w-full max-w-2xl rounded-2xl border-2 border-[#EBB3F2] border-b-[6px] border-b-[#503FBF] bg-[#6650F2] text-lg font-black shadow-[0_12px_35px_rgba(244,63,94,.24)] transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-1 active:border-b-2 disabled:opacity-40"><Play className="mr-2 inline h-5 w-5 fill-current"/>SORTEAR LETRA E COMEÇAR</button> : <div className="mt-6 w-full max-w-2xl rounded-2xl border border-[#F27052]/20 bg-[#503FBF]/20 py-5 font-black text-[#EBB3F2]">Aguardando o capitão...</div>}
      </section>}

      {showSettings && room.status === "waiting" && <div className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm" onMouseDown={() => setShowSettings(false)}>
        <div onMouseDown={event => event.stopPropagation()} className="my-4 w-full max-w-2xl rounded-3xl border border-[#F27052]/30 bg-[#292052] p-5 shadow-[0_24px_90px_rgba(0,0,0,.55)] sm:p-6">
          <header className="flex items-center justify-between border-b border-slate-700 pb-4">
            <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#EBB3F2]">STOP em sequência</p><h2 className="mt-1 text-2xl font-black">Configurações da partida</h2></div>
            <button onClick={() => setShowSettings(false)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700 bg-slate-900 text-slate-400 transition hover:border-[#F27052] hover:text-white"><X className="h-5 w-5"/></button>
          </header>

          <div className="mt-5">
            <label className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">Tempo total</label>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">{[120, 180, 300, 480, 600].map(seconds => <button key={seconds} onClick={() => updateSettings({ durationSeconds: seconds })} className={cn("h-11 rounded-xl border font-black transition hover:-translate-y-0.5", room.settings.durationSeconds === seconds ? "border-[#EBB3F2] bg-[#F27052] text-white shadow-[0_4px_0_#503FBF]" : "border-slate-700 bg-slate-950 text-slate-400 hover:border-[#F27052]/60")}>{seconds / 60} min</button>)}</div>

            <div className="mt-6 flex items-end justify-between gap-3">
              <div><label className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">Temas da partida</label><p className="mt-1 text-xs text-slate-500">Os oito clássicos já começam selecionados. Escolha entre 4 e 20.</p></div>
              <strong className="shrink-0 rounded-lg bg-[#503FBF] px-3 py-1 text-xs text-[#EBB3F2]">{selectedCategories.length}/20</strong>
            </div>
            <div className="mt-3 grid max-h-52 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
              {CATEGORY_OPTIONS.map(category => {
                const selected = selectedCategories.includes(category);
                const disabled = selected ? selectedCategories.length <= 4 : selectedCategories.length >= 20;
                return <button key={category} disabled={disabled} onClick={() => updateSettings({ selectedCategories: selected ? selectedCategories.filter(item => item !== category) : [...selectedCategories, category] })} className={cn("min-h-11 rounded-xl border px-3 py-2 text-left text-xs font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30", selected ? "border-[#79D9AC] bg-[#79D9AC] text-[#292052]" : "border-slate-700 bg-slate-950 text-slate-300 hover:border-[#6650F2]")}>{selected ? "✓ " : "+ "}{category}</button>;
              })}
              {selectedCategories.filter(category => !CATEGORY_OPTIONS.includes(category)).map(category => <button key={category} disabled={selectedCategories.length <= 4} onClick={() => updateSettings({ selectedCategories: selectedCategories.filter(item => item !== category) })} className="min-h-11 rounded-xl border border-[#EBB3F2] bg-[#EBB3F2] px-3 py-2 text-left text-xs font-black text-[#292052] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">✓ {category}</button>)}
            </div>
            <div className="mt-3 flex gap-2">
              <input value={customCategory} onChange={event => setCustomCategory(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); addCustomCategory(); } }} maxLength={30} placeholder="Ex.: Órgãos, séries favoritas..." className="h-11 min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm font-bold outline-none placeholder:text-slate-600 focus:border-[#6650F2]"/>
              <button onClick={addCustomCategory} disabled={customCategory.trim().length < 2 || selectedCategories.length >= 20} className="flex h-11 items-center gap-1 rounded-xl border border-[#EBB3F2] bg-[#6650F2] px-4 text-xs font-black transition hover:-translate-y-0.5 disabled:opacity-30"><Plus className="h-4 w-4"/>Adicionar</button>
            </div>
            {selectedCategories.length < 4 && <p className="mt-2 text-xs font-bold text-[#F27052]">Selecione pelo menos 4 temas para começar.</p>}

            <label className="mt-6 block text-[10px] font-black uppercase tracking-[.16em] text-slate-400">Letras fora do sorteio</label>
            <p className="mt-1 text-xs text-slate-500">Toque nas letras difíceis que sua turma não quer jogar.</p>
            <div className="mt-3 grid grid-cols-7 gap-2 sm:grid-cols-9">{LETTERS.map(letter => { const excluded = room.settings.excludedLetters.includes(letter); return <button key={letter} onClick={() => updateSettings({ excludedLetters: excluded ? room.settings.excludedLetters.filter(item => item !== letter) : [...room.settings.excludedLetters, letter] })} className={cn("grid aspect-square place-items-center rounded-lg border font-black transition hover:scale-105", excluded ? "border-[#F27052] bg-[#F27052]/20 text-[#EBB3F2] line-through" : "border-slate-700 bg-slate-950 text-slate-300 hover:border-[#F27052]")}>{letter}</button>; })}</div>
          </div>
          <button onClick={() => setShowSettings(false)} disabled={selectedCategories.length < 4} className="mt-6 h-12 w-full rounded-xl border-b-4 border-[#503FBF] bg-[#6650F2] font-black disabled:opacity-40">SALVAR CONFIGURAÇÕES</button>
        </div>
      </div>}

      {showRolling && <section className="grid flex-1 place-items-center py-10 text-center">
        <div className="min-w-0 w-full max-w-3xl"><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#EBB3F2] sm:text-[11px] sm:tracking-[.28em]">Roleta de letras</p><h1 className="mx-auto mt-2 max-w-full text-3xl font-black leading-tight sm:text-4xl">Qual será a letra?</h1>{isLetterSpinning ? <div className="relative mt-7 w-full min-w-0 overflow-hidden rounded-2xl border-2 border-[#F27052]/30 bg-[#503FBF]/25 px-2 py-9 shadow-[0_8px_0_#503FBF] sm:mt-10 sm:rounded-[2rem] sm:px-6 sm:py-12 sm:shadow-[0_12px_0_#503FBF,0_24px_70px_rgba(244,63,94,.2)]"><div className="pointer-events-none absolute inset-y-0 left-1/2 w-24 -translate-x-1/2 border-x-2 border-[#EBB3F2]/60 bg-[#F27052]/10 sm:w-32"/><div key={rollingLetter} className="relative flex min-w-0 items-center justify-center gap-2 animate-[pulse_.16s_ease-in-out] sm:animate-[bounce_.18s_ease-in-out] sm:gap-4">{[-2,-1,0,1,2].map(offset => { const index = (LETTERS.indexOf(rollingLetter) + offset + LETTERS.length) % LETTERS.length; return <span key={offset} className={cn("place-items-center rounded-xl border-2 font-black transition-all sm:rounded-2xl", offset === 0 ? "grid h-28 w-24 shrink-0 border-white bg-[#F27052] text-6xl text-white shadow-[0_7px_0_#503FBF] sm:h-32 sm:w-28 sm:scale-110 sm:text-7xl" : Math.abs(offset) === 1 ? "grid h-20 w-16 shrink-0 border-[#F27052]/30 bg-[#503FBF]/50 text-3xl text-[#EBB3F2] opacity-65 sm:h-24 sm:w-20 sm:text-4xl" : "hidden h-20 w-16 shrink-0 border-[#F27052]/10 bg-[#503FBF]/30 text-3xl text-[#EBB3F2] opacity-25 sm:grid")}>{LETTERS[index]}</span>; })}</div><p className="mt-7 animate-pulse text-xs font-black uppercase tracking-[.18em] text-[#EBB3F2] sm:mt-8 sm:text-sm sm:tracking-[.24em]">Sorteando...</p></div> : <div className="relative mt-7 w-full min-w-0 overflow-hidden rounded-2xl border-2 border-[#79D9AC] bg-[#503FBF]/25 px-2 py-9 shadow-[0_8px_0_#503FBF] sm:mt-10 sm:rounded-[2rem] sm:px-6 sm:py-12 sm:shadow-[0_12px_0_#503FBF,0_24px_70px_rgba(121,217,172,.2)]"><div className="pointer-events-none absolute inset-y-0 left-1/2 w-24 -translate-x-1/2 border-x-2 border-[#79D9AC] bg-[#79D9AC]/10 sm:w-32"/><div className="relative flex min-w-0 items-center justify-center gap-2 sm:gap-4">{[-2,-1,0,1,2].map(offset => { const index = (LETTERS.indexOf(room.letter) + offset + LETTERS.length) % LETTERS.length; return <span key={offset} className={cn("place-items-center rounded-xl border-2 font-black transition-all duration-500 sm:rounded-2xl", offset === 0 ? "grid h-28 w-24 shrink-0 scale-105 border-white bg-[#79D9AC] text-6xl text-[#292052] shadow-[0_7px_0_#503FBF] sm:h-32 sm:w-28 sm:scale-110 sm:text-7xl" : Math.abs(offset) === 1 ? "grid h-20 w-16 shrink-0 border-[#79D9AC]/35 bg-[#503FBF]/50 text-3xl text-[#EBB3F2] opacity-65 sm:h-24 sm:w-20 sm:text-4xl" : "hidden h-20 w-16 shrink-0 border-[#79D9AC]/15 bg-[#503FBF]/30 text-3xl text-[#EBB3F2] opacity-25 sm:grid")}>{LETTERS[index]}</span>; })}</div><p className="mt-7 text-xs font-black uppercase tracking-[.18em] text-[#79D9AC] sm:mt-8 sm:text-sm sm:tracking-[.24em]">Letra sorteada!</p></div>}<p className="mx-auto mt-9 max-w-full text-xl font-black leading-tight text-white sm:mt-12 sm:text-2xl">{!isLetterSpinning ? `A letra sorteada foi ${room.letter}!` : "A roleta está girando"}</p></div>
      </section>}

      {showPlaying && <section className="flex flex-1 flex-col py-4">
        <div className="relative overflow-hidden rounded-[2rem] border-2 border-[#F27052]/30 bg-[#292052] p-4 shadow-[0_10px_0_#503FBF,0_24px_70px_rgba(244,63,94,.18)] sm:p-6">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#F27052]/10 blur-3xl"/>
          <header className="relative flex items-center justify-between gap-3 border-b border-[#EBB3F2]/15 pb-5"><div className="rounded-xl border border-[#EBB3F2]/25 bg-[#503FBF]/40 px-4 py-2 text-left"><small className="block text-[9px] font-black uppercase tracking-[.18em] text-[#EBB3F2]">Categorias</small><strong className="text-xl">{me.currentIndex + 1}<span className="text-sm text-[#EBB3F2]">/{me.answers.length}</span></strong></div><div className="absolute left-1/2 top-[-8px] -translate-x-1/2"><div className="grid h-24 w-24 place-items-center bg-[#F27052] drop-shadow-[0_8px_0_#503FBF] [clip-path:polygon(25%_3%,75%_3%,100%_50%,75%_97%,25%_97%,0_50%)]"><div className="grid h-[78px] w-[78px] place-items-center border-4 border-white/90 [clip-path:inherit]"><span className="text-5xl font-black text-white">{room.letter}</span></div></div><small className="absolute left-1/2 top-1 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest text-white">Letra</small></div><div className="flex items-center gap-2 rounded-xl border border-[#EBB3F2]/25 bg-[#503FBF]/40 px-3 py-2"><Clock3 className={cn("h-6 w-6 text-[#EBB3F2]", remaining < 20000 && "animate-pulse")}/><strong className={cn("font-mono text-lg", remaining < 20000 && "text-[#EBB3F2]")}>{formatTime(remaining)}</strong></div></header>

          {me.finished ? <div className="relative mt-10 flex min-h-[390px] flex-col items-center justify-center rounded-3xl border border-[#79D9AC]/35 bg-[#79D9AC]/10 p-8 text-center shadow-inner"><div className="grid h-24 w-24 place-items-center bg-[#F27052] drop-shadow-[0_9px_0_#503FBF] [clip-path:polygon(25%_3%,75%_3%,100%_50%,75%_97%,25%_97%,0_50%)]"><Flag className="h-10 w-10 fill-white text-white"/></div><p className="mt-7 text-[10px] font-black uppercase tracking-[.24em] text-[#79D9AC]">8 de 8 categorias respondidas</p><h1 className="mt-2 text-4xl font-black">Cartela completa!</h1><p className="mt-3 max-w-md text-[#EBB3F2]/65">Você terminou todas as palavras. Seja rápido e encerre a rodada antes dos outros.</p><button onClick={() => act("stop", { playerId: me.uid })} disabled={busy} className="mt-8 h-20 w-full max-w-xl rounded-2xl border-2 border-[#EBB3F2] border-b-[7px] border-b-[#503FBF] bg-[#6650F2] text-2xl font-black text-white shadow-[0_15px_40px_rgba(102,80,242,.3)] transition hover:-translate-y-1 hover:brightness-110 active:translate-y-1 active:border-b-2 disabled:opacity-50"><Flag className="mr-3 inline h-7 w-7 fill-current"/>BATER STOP!</button></div> : <div className="relative mt-10 flex min-h-[390px] flex-col items-center justify-center rounded-3xl border border-[#EBB3F2]/15 bg-[#17142B]/75 p-6 text-center shadow-inner sm:p-10"><p className="text-[10px] font-black uppercase tracking-[.24em] text-[#EBB3F2]">Responda agora</p><h1 className="mt-2 text-5xl font-black sm:text-6xl">{current.category}</h1><p className="mt-3 text-sm text-[#EBB3F2]/60">Uma resposta com a letra <strong className="text-[#EBB3F2]">{room.letter}</strong></p><div className="mt-8 w-full max-w-2xl rounded-2xl border-2 border-[#EBB3F2]/25 bg-[#503FBF]/25 p-2 shadow-[0_7px_0_#503FBF]"><input autoFocus value={value} onChange={event => setValue(event.target.value)} onKeyDown={event => event.key === "Enter" && value.trim() && submit("answer")} placeholder={`${current.category} com ${room.letter}...`} className="h-16 w-full rounded-xl border border-[#EBB3F2]/15 bg-[#17142B] px-5 text-center text-xl font-black outline-none transition placeholder:text-[#EBB3F2]/25 focus:border-[#6650F2] focus:shadow-[0_0_30px_rgba(244,63,94,.2)]"/></div><div className="mt-5 grid w-full max-w-2xl grid-cols-2 gap-3"><button onClick={() => submit("skip")} disabled={busy} className="h-14 rounded-xl border-2 border-[#EBB3F2]/25 bg-[#503FBF]/35 font-black text-[#EBB3F2] shadow-[0_5px_0_#503FBF] transition hover:-translate-y-0.5 hover:bg-[#503FBF]/40 active:translate-y-1 active:shadow-none"><SkipForward className="mr-2 inline h-5 w-5"/>PULAR</button><button onClick={() => submit("answer")} disabled={busy || !value.trim()} className="h-14 rounded-xl border-2 border-[#EBB3F2] border-b-[6px] border-b-[#503FBF] bg-[#6650F2] font-black text-white shadow-[0_10px_30px_rgba(244,63,94,.2)] transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-1 active:border-b-2 disabled:opacity-40">PRÓXIMA <Forward className="ml-2 inline h-5 w-5"/></button></div><button onClick={() => submit("noAnswer")} disabled={busy} className="mt-4 h-11 w-full max-w-2xl rounded-xl border border-[#EBB3F2]/20 bg-[#503FBF]/30 text-sm font-black text-[#EBB3F2] transition hover:bg-[#503FBF]/40 disabled:opacity-50">PALAVRA NÃO EXISTE</button><p className="mt-2 max-w-2xl text-[10px] font-bold text-[#EBB3F2]/45">Se a mesa provar que existe uma resposta, você perde 10 pontos.</p></div>}

          <div className="relative mt-5 flex items-center gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-[#EBB3F2]/30 bg-[#503FBF]/40"><Flag className="h-5 w-5 text-[#EBB3F2]"/></div><div className="h-4 flex-1 overflow-hidden rounded-full border-2 border-[#503FBF] bg-[#503FBF]"><div className="h-full rounded-full bg-[#79D9AC] transition-all" style={{ width: `${progress}%` }}/></div></div>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2">{me.answers.map((answer, index) => <span key={index} className={cn("grid h-9 min-w-9 place-items-center rounded-xl border px-2 text-xs font-black transition", index === me.currentIndex ? "scale-110 border-white bg-[#F27052] text-white shadow-[0_4px_0_#503FBF]" : answer.status === "answered" ? "border-[#EBB3F2]/50 bg-[#6650F2]/15 text-[#EBB3F2]" : answer.status === "noAnswer" ? "border-[#503FBF] bg-[#503FBF]/40 text-[#F27052]" : answer.status === "skipped" ? "border-[#F27052]/40 bg-[#F27052]/10 text-[#EBB3F2]" : "border-[#503FBF] bg-[#17142B] text-[#503FBF]")}>{index + 1}</span>)}</div>
      </section>}

      {room.status === "voting" && <section className="flex flex-1 flex-col py-5">
        {room.stopAt && now - room.stopAt < 4200 && <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/90 backdrop-blur-sm"><div className="text-center"><div className="mx-auto grid h-52 w-52 animate-[bounce_.7s_ease-in-out_infinite] rotate-6 place-items-center rounded-[3rem] border-8 border-white bg-[#F27052] shadow-[0_22px_0_#7f1d1d,0_35px_90px_rgba(244,63,94,.45)]"><strong className="text-5xl font-black">STOP!</strong></div><p className="mt-10 text-3xl font-black">{room.stopBy ? `${room.stopBy} bateu STOP!` : "O tempo acabou!"}</p><p className="mt-2 font-bold text-[#EBB3F2]">Canetas na mesa. Hora de conferir!</p></div></div>}
        <div className="relative overflow-hidden rounded-[2rem] border-2 border-[#F27052]/35 bg-[#292052] p-4 shadow-[0_10px_0_#503FBF,0_24px_70px_rgba(244,63,94,.2)] sm:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[#6650F2]/10"/>
          <header className="relative flex items-center justify-between gap-3 border-b border-[#EBB3F2]/20 pb-5">
            <div className="rounded-xl border border-[#EBB3F2]/30 bg-[#503FBF]/40 px-4 py-2 text-left"><small className="block text-[9px] font-black uppercase tracking-[.18em] text-[#EBB3F2]">Categorias</small><strong className="text-xl">{voteCategory + 1}<span className="text-sm text-[#EBB3F2]">/{categories.length}</span></strong></div>
            <div className="absolute left-1/2 top-[-8px] -translate-x-1/2"><div className="grid h-24 w-24 place-items-center bg-[#F27052] drop-shadow-[0_8px_0_#503FBF] [clip-path:polygon(25%_3%,75%_3%,100%_50%,75%_97%,25%_97%,0_50%)]"><div className="grid h-[78px] w-[78px] place-items-center border-4 border-white/90 [clip-path:inherit]"><span className="text-5xl font-black text-white">{room.letter}</span></div></div><small className="absolute left-1/2 top-2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest text-white">Letra</small></div>
            <div className="flex items-center gap-2 rounded-xl border border-[#EBB3F2]/30 bg-[#503FBF]/40 px-3 py-2"><Clock3 className="h-6 w-6 text-[#EBB3F2]"/><strong className="font-mono text-lg">{room.votingComplete ? "OK" : formatTime(Math.max(0, (room.voteEndsAt || now) - now))}</strong></div>
          </header>

          <div className="relative mt-10 min-h-[390px] rounded-3xl border border-[#EBB3F2]/20 bg-[#17142B]/85 p-5 text-center shadow-inner sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#EBB3F2]">Tema da validação</p><h1 className="mt-1 text-4xl font-black">{categories[voteCategory]}</h1><p className="mt-2 text-sm font-bold text-[#EBB3F2]">{Object.keys(room.voteReady).length}/{room.players.length} jogadores prontos</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">{anonymousCategoryAnswers.map(({ player, answer }, anonymousIndex) => { const key = `${player.uid}:${voteCategory}`; const selected = room.votes[key]?.[me.uid] ?? room.prevalidation[key] ?? false; const locked = Boolean(room.voteReady[me.uid]) || room.votingComplete; return <button key={player.uid} disabled={locked} onClick={() => act("vote", { voterId: me.uid, playerId: player.uid, categoryIndex: voteCategory, valid: !selected })} className={cn("group flex min-w-[180px] max-w-[280px] items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left shadow-[0_5px_0_#090b28] transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-none disabled:cursor-default disabled:hover:translate-y-0", selected ? "border-[#79D9AC] bg-[#79D9AC] text-[#503FBF]" : "border-[#EBB3F2] bg-[#F27052] text-[#503FBF]")}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-black/20 text-sm font-black">{anonymousIndex + 1}</span><span className="min-w-0 flex-1"><small className="block truncate text-[9px] font-black uppercase tracking-[.14em] opacity-60">Resposta anônima</small><strong className="block truncate text-base">{answer.status === "noAnswer" ? "Não existe" : answer.value || "Sem resposta"}</strong></span><span className="text-xl font-black">{selected ? "✓" : "×"}</span></button>; })}</div>
          </div>

          <div className="relative mt-5 flex items-center gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-[#EBB3F2]/40 bg-[#503FBF]/40"><Clock3 className="h-5 w-5 text-[#EBB3F2]"/></div><div className="h-4 flex-1 overflow-hidden rounded-full border-2 border-[#503FBF] bg-[#503FBF]"><div className="h-full rounded-full bg-[#79D9AC] transition-all duration-100" style={{ width: `${room.votingComplete ? 100 : Math.max(0, Math.min(100, (((room.voteEndsAt || now) - now) / 20_000) * 100))}%` }}/></div></div>
        </div>

        {!room.votingComplete && <button onClick={() => act("vote-ready", { playerId: me.uid, categoryIndex: voteCategory })} disabled={busy || Boolean(room.voteReady[me.uid])} className="mx-auto mt-6 h-16 w-full max-w-md rounded-2xl border-2 border-[#EBB3F2] border-b-[6px] border-b-[#503FBF] bg-[#6650F2] text-lg font-black text-white shadow-[0_12px_35px_rgba(244,63,94,.25)] transition-all hover:-translate-y-0.5 hover:brightness-110 active:translate-y-1 active:border-b-2 disabled:border-[#503FBF] disabled:bg-[#79D9AC] disabled:text-[#503FBF]"><CheckCircle2 className="mr-2 inline h-6 w-6"/>{room.voteReady[me.uid] ? "AGUARDANDO OS OUTROS" : "PRONTO"}</button>}
        <div className="mt-6 flex justify-center gap-1.5">{categories.map((_, index) => <span key={index} className={cn("h-2.5 rounded-full transition-all", index < voteCategory || room.votingComplete ? "w-2.5 bg-[#79D9AC]" : index === voteCategory ? "w-8 bg-[#F27052]" : "w-2.5 bg-[#503FBF]")}/>)}</div>
        {room.votingComplete && isHost ? <button onClick={() => act("finish", { playerId: me.uid })} className="mt-6 h-16 rounded-2xl border-2 border-[#EBB3F2] border-b-[6px] border-b-[#503FBF] bg-[#6650F2] text-lg font-black shadow-[0_12px_35px_rgba(244,63,94,.22)]">VER RESULTADO DA RODADA</button> : room.votingComplete ? <p className="mt-6 rounded-xl border border-[#F27052]/20 bg-[#503FBF]/20 py-4 text-center font-bold text-[#EBB3F2]/60">Aguardando o capitão mostrar o resultado.</p> : <p className="mt-4 text-center text-xs font-bold text-[#EBB3F2]/40">A categoria avança quando todos apertarem pronto ou quando o tempo acabar.</p>}
      </section>}

      {room.status === "results" && <section className="flex flex-1 flex-col items-center justify-center py-6 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-3xl border border-[#EBB3F2]/40 bg-[#F27052]/10 shadow-[0_0_35px_rgba(251,191,36,.2)]"><Trophy className="h-10 w-10 text-[#EBB3F2]"/></div><p className="mt-4 text-[10px] font-black uppercase tracking-[.24em] text-[#EBB3F2]">Resultado da rodada</p><h1 className="mt-2 text-4xl font-black">{ranking[0]?.name} venceu!</h1>
        {ranking[0] && <article className="mt-7 flex w-full max-w-2xl items-center gap-5 rounded-3xl border-2 border-[#EBB3F2]/50 bg-[#292052] p-5 text-left shadow-[0_8px_0_#503FBF,0_18px_45px_rgba(251,191,36,.12)]"><div className="relative"><GameIdentityAvatar player={ranking[0]} index={ranking[0].characterIndex} className="h-24 w-24"/><span className="absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full bg-[#EBB3F2] text-lg font-black text-[#503FBF]">1</span></div><div className="min-w-0 flex-1"><small className="font-black uppercase tracking-[.16em] text-[#EBB3F2]">Campeão da rodada</small><strong className="mt-1 block truncate text-2xl">{ranking[0].name}</strong><span className="mt-1 block text-lg font-black text-[#EBB3F2]">{ranking[0].score} pontos</span></div></article>}
        <div className="mt-4 grid w-full max-w-2xl gap-2">{ranking.slice(1).map((player, index) => <div key={player.uid} className="tj-player-card flex items-center gap-4 border-[#F27052]/15 bg-[#503FBF]/15 p-4"><span className="grid h-9 w-9 place-items-center rounded-xl border border-[#F27052]/20 bg-[#503FBF]/30 font-black text-[#EBB3F2]">{index + 2}</span><GameIdentityAvatar player={player} index={player.characterIndex} className="h-14 w-14"/><strong className="min-w-0 flex-1 truncate text-left text-base">{player.name}</strong><span className="font-black text-[#EBB3F2]">{player.score} pts</span></div>)}</div>
        {isHost ? <button onClick={() => act("lobby", { playerId: me.uid })} className="mt-7 h-16 w-full max-w-2xl rounded-2xl border-2 border-[#EBB3F2] border-b-[6px] border-b-[#503FBF] bg-[#6650F2] text-lg font-black"><RotateCcw className="mr-2 inline h-5 w-5"/>NOVA PARTIDA</button> : <p className="mt-7 w-full max-w-2xl rounded-xl border border-[#F27052]/20 bg-[#503FBF]/20 py-4 font-bold text-[#EBB3F2]/50">Aguardando o capitão...</p>}
      </section>}

      {error && <p className="rounded-xl border border-[#F27052]/30 bg-[#F27052]/10 p-3 text-center font-bold text-[#EBB3F2]">{error}</p>}
    </GameIdentityLayout>
  </div></div>;
}
