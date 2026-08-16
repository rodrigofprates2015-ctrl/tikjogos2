import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Bomb, Check, Copy, Crown, Play, Plus, RotateCcw, Settings, Shuffle, Trash2, Users, Volume2, X } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import bombaLogo from "@/assets/bomba-logo.png";
import "./bomba-game.css?online=2";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const THEMES = [
  "Bebidas", "Animais", "Comidas", "Filmes", "Séries", "Países", "Cidades",
  "Profissões", "Esportes", "Frutas", "Marcas", "Objetos da casa", "Celebridades",
  "Personagens", "Coisas da escola", "Músicas", "Jogos", "Super-heróis",
];

type GamePhase = "setup" | "playing" | "exploded" | "completed";
type OnlineRoom = {
  code: string;
  hostId: string;
  status: "waiting" | "playing" | "exploded" | "completed";
  players: Array<{ uid: string; name: string; connected: boolean }>;
  theme: string | null;
  usedLetters: string[];
  answers: Array<{ playerId: string; playerName: string; letter: string; answer: string }>;
  currentPlayerIndex: number;
  selectedLetter: string | null;
  endAt: number | null;
  duration: number;
  serverNow: number;
  loserId: string | null;
  settings: { roundSeconds: number; bannedLetters: string[] };
};

function randomTheme(previous?: string) {
  const available = THEMES.filter((theme) => theme !== previous);
  return available[Math.floor(Math.random() * available.length)];
}

export default function BombaGame() {
  const isLocalMode = new URLSearchParams(window.location.search).get("local") === "1";
  const [onlineRoom, setOnlineRoom] = useState<OnlineRoom | null>(null);
  const [onlineLetter, setOnlineLetter] = useState<string | null>(null);
  const [onlineAnswer, setOnlineAnswer] = useState("");
  const [onlineError, setOnlineError] = useState("");
  const [onlineBusy, setOnlineBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [serverClockOffset, setServerClockOffset] = useState(0);
  const [roomLoading, setRoomLoading] = useState(!isLocalMode);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [roundSeconds, setRoundSeconds] = useState(10);
  const [bannedLetters, setBannedLetters] = useState<string[]>([]);
  const [codeCopied, setCodeCopied] = useState(false);
  const playerIdRef = useRef(sessionStorage.getItem("bomba_player_id") || crypto.randomUUID());
  const [players, setPlayers] = useState(["Jogador 1", "Jogador 2"]);
  const [phase, setPhase] = useState<GamePhase>("setup");
  const [theme, setTheme] = useState("Bebidas");
  const [usedLetters, setUsedLetters] = useState<string[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [roundDuration, setRoundDuration] = useState(10);
  const [lastLetter, setLastLetter] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const currentName = players[currentPlayer] || "Jogador";
  const progress = Math.max(0, (timeLeft / roundDuration) * 100);
  const remainingLetters = ALPHABET.length - usedLetters.length;

  useEffect(() => {
    sessionStorage.setItem("bomba_player_id", playerIdRef.current);
    if (isLocalMode) return;
    const queryCode = new URLSearchParams(window.location.search).get("room");
    const code = (queryCode || sessionStorage.getItem("bomba_room_code") || "").toUpperCase();
    if (!code) { setRoomLoading(false); return; }
    fetch(`/api/bomba/rooms/${code}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Sala não encontrada.");
        const room = await response.json();
        setOnlineRoom(room);
        setRoundSeconds(room.settings?.roundSeconds || 10);
        setBannedLetters(room.settings?.bannedLetters || []);
      })
      .catch((error) => setOnlineError(error.message))
      .finally(() => setRoomLoading(false));
  }, []);

  useEffect(() => {
    if (!onlineRoom) return;
    const poll = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/bomba/rooms/${onlineRoom.code}`);
        if (response.ok) setOnlineRoom(await response.json());
      } catch {}
    }, 600);
    return () => window.clearInterval(poll);
  }, [onlineRoom?.code]);

  useEffect(() => {
    if (!onlineRoom?.serverNow) return;
    setServerClockOffset(onlineRoom.serverNow - Date.now());
    setOnlineLetter(onlineRoom.selectedLetter || null);
  }, [onlineRoom?.serverNow, onlineRoom?.selectedLetter]);

  useEffect(() => {
    if (onlineRoom?.status !== "playing") return;
    const timer = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(timer);
  }, [onlineRoom?.status]);

  const onlineRequest = async (url: string, body: unknown) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Não foi possível concluir a ação.");
    return data;
  };

  const fuseColor = useMemo(() => {
    if (progress <= 25) return "#ef4444";
    if (progress <= 50) return "#ffca28";
    return "#09a9f5";
  }, [progress]);

  const playTone = (frequency: number, duration = 0.08) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const context = audioContextRef.current || new AudioContextClass();
      audioContextRef.current = context;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = frequency;
      oscillator.type = "square";
      gain.gain.setValueAtTime(0.045, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration);
    } catch {}
  };

  useEffect(() => {
    document.title = "Bomba! — TikJogos";
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = window.setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 0.1));
    }, 100);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "playing" && timeLeft <= 0) {
      setPhase("exploded");
      playTone(90, 0.65);
    }
  }, [timeLeft, phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    const urgency = progress <= 25 ? 350 : progress <= 50 ? 650 : 1000;
    const tick = window.setInterval(() => playTone(progress <= 25 ? 620 : 440, 0.045), urgency);
    return () => window.clearInterval(tick);
  }, [phase, progress <= 25, progress <= 50]);

  const updatePlayer = (index: number, value: string) => {
    setPlayers((current) => current.map((player, playerIndex) => playerIndex === index ? value : player));
  };

  const addPlayer = () => {
    if (players.length >= 10) return;
    setPlayers((current) => [...current, `Jogador ${current.length + 1}`]);
  };

  const removePlayer = (index: number) => {
    if (players.length <= 2) return;
    setPlayers((current) => current.filter((_, playerIndex) => playerIndex !== index));
  };

  const startRound = (keepTheme = false) => {
    const cleanedPlayers = players.map((player, index) => player.trim() || `Jogador ${index + 1}`);
    const duration = roundSeconds;
    setPlayers(cleanedPlayers);
    setTheme((current) => keepTheme ? current : randomTheme(current));
    setRoundDuration(duration);
    setTimeLeft(duration);
    setUsedLetters([...bannedLetters]);
    setLastLetter(null);
    setCurrentPlayer(Math.floor(Math.random() * cleanedPlayers.length));
    setPhase("playing");
    playTone(520, 0.12);
  };

  const useLetter = (letter: string) => {
    if (phase !== "playing" || usedLetters.includes(letter)) return;
    const nextUsed = [...usedLetters, letter];
    setUsedLetters(nextUsed);
    setLastLetter(letter);
    playTone(760, 0.07);

    if (nextUsed.length === ALPHABET.length) {
      setPhase("completed");
      playTone(880, 0.35);
      return;
    }

    setCurrentPlayer((current) => (current + 1) % players.length);
    setTimeLeft(roundDuration);
  };

  const startOnlineRound = async (keepTheme?: boolean) => {
    if (!onlineRoom) return;
    setOnlineBusy(true); setOnlineError("");
    try {
      const endpoint = onlineRoom.status === "waiting" ? "start" : "restart";
      setOnlineRoom(await onlineRequest(`/api/bomba/rooms/${onlineRoom.code}/${endpoint}`, {
        playerId: playerIdRef.current,
        keepTheme: !!keepTheme,
      }));
      setOnlineLetter(null); setOnlineAnswer("");
    } catch (error: any) { setOnlineError(error.message); }
    finally { setOnlineBusy(false); }
  };

  const submitOnlineAnswer = async () => {
    if (!onlineRoom || !onlineLetter) return;
    setOnlineBusy(true); setOnlineError("");
    try {
      setOnlineRoom(await onlineRequest(`/api/bomba/rooms/${onlineRoom.code}/answer`, {
        playerId: playerIdRef.current,
        letter: onlineLetter,
        answer: onlineAnswer,
      }));
      setOnlineLetter(null); setOnlineAnswer("");
      playTone(760, 0.07);
    } catch (error: any) { setOnlineError(error.message); }
    finally { setOnlineBusy(false); }
  };

  const selectOnlineLetter = async (letter: string) => {
    if (!onlineRoom || onlineRoom.selectedLetter || onlineBusy) return;
    setOnlineLetter(letter);
    setOnlineBusy(true);
    setOnlineError("");
    try {
      setOnlineRoom(await onlineRequest(`/api/bomba/rooms/${onlineRoom.code}/letter`, {
        playerId: playerIdRef.current,
        letter,
      }));
    } catch (error: any) {
      setOnlineLetter(null);
      setOnlineError(error.message);
    } finally {
      setOnlineBusy(false);
    }
  };

  const toggleBannedLetter = (letter: string) => {
    setBannedLetters((current) => current.includes(letter) ? current.filter((item) => item !== letter) : [...current, letter]);
  };

  const openRoomSettings = () => {
    if (!onlineRoom) return;
    setRoundSeconds(onlineRoom.settings?.roundSeconds || 10);
    setBannedLetters(onlineRoom.settings?.bannedLetters || []);
    setSettingsOpen(true);
  };

  const saveRoomSettings = async () => {
    if (!onlineRoom) return;
    setOnlineBusy(true); setOnlineError("");
    try {
      setOnlineRoom(await onlineRequest(`/api/bomba/rooms/${onlineRoom.code}/settings`, {
        playerId: playerIdRef.current, roundSeconds, bannedLetters,
      }));
      setSettingsOpen(false);
    } catch (error: any) { setOnlineError(error.message); }
    finally { setOnlineBusy(false); }
  };

  const copyRoomCode = async () => {
    if (!onlineRoom) return;
    await navigator.clipboard.writeText(`${window.location.origin}/?bomba=${onlineRoom.code}`);
    setCodeCopied(true);
    window.setTimeout(() => setCodeCopied(false), 1600);
  };

  const leaveOnlineRoom = async () => {
    if (onlineRoom) {
      fetch(`/api/bomba/rooms/${onlineRoom.code}/leave`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ playerId: playerIdRef.current }),
      }).catch(() => {});
    }
    sessionStorage.removeItem("bomba_room_code");
    window.location.href = "/";
  };

  if (!isLocalMode && !onlineRoom) {
    return (
      <div className="bomba-page bomba-page--setup">
        <MobileNav />
        <main className="bomba-entry">
          <Link href="/" className="bomba-back"><ArrowLeft size={18} /> Voltar</Link>
          <img className="bomba-brand-logo" src={bombaLogo} alt="Bomba" />
          <h1>{roomLoading ? "Entrando na sala..." : "Sala indisponível"}</h1>
          <p>{roomLoading ? "Aguarde um instante." : onlineError || "Crie ou entre em uma sala pelo formulário da Home."}</p>
          {!roomLoading && <Link href="/" className="bomba-start">VOLTAR PARA A HOME</Link>}
        </main>
      </div>
    );
  }

  if (onlineRoom?.status === "waiting") {
    const isHost = onlineRoom.hostId === playerIdRef.current;
    return (
      <div className="bomba-page bomba-page--setup">
        <MobileNav />
        <main className="bomba-lobby-shell">
          <section className="bomba-lobby-card">
          <header className="bomba-lobby-header">
            <button className="bomba-leave-button" onClick={leaveOnlineRoom}><ArrowLeft size={20} /><span>SAIR DA SALA</span></button>
            <button className="bomba-code-button" onClick={copyRoomCode} aria-label="Copiar código da sala">
              <small>CÓDIGO DA SALA</small>
              <span><strong>{onlineRoom.code}</strong><i>{codeCopied ? <Check size={19}/> : <Copy size={19}/>}</i></span>
            </button>
            {isHost ? (
              <button className="bomba-config-icon" onClick={openRoomSettings} title="Configurações da partida" aria-label="Configurar partida"><Settings size={23}/></button>
            ) : <div className="bomba-header-spacer" />}
          </header>

          <div className="bomba-lobby-hero">
            <img className="bomba-brand-logo" src={bombaLogo} alt="Bomba" />
            <h1>Sala de espera</h1>
            <p>Compartilhe o código e prepare-se antes que a bomba exploda.</p>
          </div>

          {!isHost && <div className="bomba-settings-summary"><Settings size={16}/> {onlineRoom.settings.roundSeconds}s por jogador · {onlineRoom.settings.bannedLetters.length} letras vetadas</div>}
          {settingsOpen && (
            <section className="bomba-settings-panel">
              <div className="bomba-settings-panel__title"><strong>Configuração da partida</strong><button onClick={() => setSettingsOpen(false)} aria-label="Fechar configurações"><X size={19}/></button></div>
              <label>Tempo por jogador</label>
              <div className="bomba-time-options">
                {[5, 10, 15, 20].map((seconds) => <button key={seconds} className={roundSeconds === seconds ? "is-active" : ""} onClick={() => setRoundSeconds(seconds)}>{seconds}s</button>)}
              </div>
              <label>Vetar letras <small>({bannedLetters.length})</small></label>
              <div className="bomba-ban-grid">
                {ALPHABET.map((letter) => <button key={letter} className={bannedLetters.includes(letter) ? "is-banned" : ""} onClick={() => toggleBannedLetter(letter)}>{letter}</button>)}
              </div>
              <button className="bomba-save-settings" onClick={saveRoomSettings} disabled={onlineBusy}>SALVAR CONFIGURAÇÕES</button>
            </section>
          )}
          <div className="bomba-player-section-title"><span><Users size={18}/> JOGADORES</span><strong>{onlineRoom.players.length} / 10</strong></div>
          <div className="bomba-lobby__players">
            {onlineRoom.players.map((player, index) => (
              <div key={player.uid}>
                <span>{index + 1}</span>
                <div><strong>{player.name}</strong><small><Check size={12}/> PRONTO</small></div>
                {player.uid === onlineRoom.hostId && <em><Crown size={12}/> CAPITÃO</em>}
              </div>
            ))}
          </div>
          {onlineError && <p className="bomba-error">{onlineError}</p>}
          {isHost ? (
            <button className="bomba-start" onClick={() => startOnlineRound()} disabled={onlineBusy || onlineRoom.players.length < 2}>
              <Play size={24} fill="currentColor" /> {onlineRoom.players.length < 2 ? "AGUARDANDO JOGADORES" : "COMEÇAR PARTIDA"}
            </button>
          ) : <div className="bomba-waiting"><Crown size={23}/> <div><strong>Aguardando o capitão...</strong><small>O capitão iniciará a partida</small></div></div>}
          {isHost && onlineRoom.players.length < 2 && <small className="bomba-minimum-note">Mínimo de 2 jogadores para iniciar</small>}
          </section>
        </main>
      </div>
    );
  }

  if (onlineRoom) {
    const currentOnlinePlayer = onlineRoom.players[onlineRoom.currentPlayerIndex];
    const isMyTurn = onlineRoom.status === "playing" && currentOnlinePlayer?.uid === playerIdRef.current;
    const isHost = onlineRoom.hostId === playerIdRef.current;
    const onlineTimeLeft = onlineRoom.endAt ? Math.max(0, (onlineRoom.endAt - (now + serverClockOffset)) / 1000) : 0;
    const onlineProgress = onlineRoom.duration ? Math.max(0, (onlineTimeLeft / onlineRoom.duration) * 100) : 0;
    const loser = onlineRoom.players.find((player) => player.uid === onlineRoom.loserId);
    const onlineRemaining = ALPHABET.length - onlineRoom.usedLetters.length;

    return (
      <div className={`bomba-page bomba-page--game ${onlineRoom.status === "exploded" ? "is-exploded" : ""}`}>
        <header className="bomba-game-header">
          <button onClick={leaveOnlineRoom}><ArrowLeft size={18} /> Sair</button>
          <img className="bomba-game-logo-image" src={bombaLogo} alt="Bomba" />
          <span>SALA {onlineRoom.code}</span>
        </header>
        <main className="bomba-game">
          <section className="bomba-theme-card"><span>TEMA SORTEADO</span><strong>{onlineRoom.theme}</strong></section>
          <section className="bomba-turn">
            {onlineRoom.status === "playing" && <><span>{isMyTurn ? "É A SUA VEZ" : "AGORA É A VEZ DE"}</span><strong>{currentOnlinePlayer?.name}</strong><small>{isMyTurn ? "Escolha uma letra e responda antes do tempo acabar" : `${Math.ceil(onlineTimeLeft)}s para o jogador responder`}</small></>}
            {onlineRoom.status === "exploded" && <><span>A BOMBA EXPLODIU COM</span><strong>{loser?.name || "Jogador"}</strong><small>Eliminado desta rodada!</small></>}
            {onlineRoom.status === "completed" && <><span>ALFABETO COMPLETO!</span><strong>Vocês venceram!</strong><small>Todas as letras foram usadas.</small></>}
          </section>

          <section className="bomba-device" aria-label="Alfabeto do jogo Bomba online">
            <div className="bomba-fuse" style={{ "--fuse-progress": `${onlineProgress}%`, "--fuse-color": onlineProgress <= 25 ? "#ef4444" : onlineProgress <= 50 ? "#ffca28" : "#09a9f5" } as React.CSSProperties} />
            <div className="bomba-letter-ring">
              {ALPHABET.map((letter, index) => {
                const angle = (360 / ALPHABET.length) * index;
                const used = onlineRoom.usedLetters.includes(letter);
                const selected = (onlineRoom.selectedLetter || onlineLetter) === letter;
                return (
                  <button
                    type="button"
                    key={letter}
                    className={`bomba-letter ${used ? "is-used" : ""} ${selected ? "is-selected" : ""}`}
                    style={{ "--letter-angle": `${angle}deg` } as React.CSSProperties}
                    onPointerDown={(event) => { event.preventDefault(); if (isMyTurn && !used) selectOnlineLetter(letter); }}
                    disabled={used || !isMyTurn || !!onlineRoom.selectedLetter || onlineBusy}
                    aria-label={used ? `Letra ${letter} eliminada` : `Escolher letra ${letter}`}
                  ><span style={{ transform: `rotate(${-angle}deg)` }}>{letter}</span></button>
                );
              })}
              <div className={`bomba-center ${onlineRoom.status === "exploded" ? "is-boom" : ""}`}>
                <div className="bomba-center__light" /><Bomb className="bomba-center__icon" />
                <strong>{onlineRoom.status === "exploded" ? "BOOM!" : Math.ceil(onlineTimeLeft)}</strong><span>{onlineRoom.status === "exploded" ? "" : "segundos"}</span>
              </div>
            </div>
          </section>

          {isMyTurn && (
            <div className="bomba-online-answer">
              <div className="bomba-online-answer__letter">{onlineRoom.selectedLetter || onlineLetter || "?"}</div>
              <input
                value={onlineAnswer}
                onChange={(event) => setOnlineAnswer(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter") submitOnlineAnswer(); }}
                placeholder={(onlineRoom.selectedLetter || onlineLetter) ? `Digite uma palavra com ${onlineRoom.selectedLetter || onlineLetter}` : "Escolha uma letra acima"}
                disabled={!(onlineRoom.selectedLetter || onlineLetter) || onlineBusy}
                maxLength={60}
                autoFocus={!!onlineLetter}
              />
              <button onClick={submitOnlineAnswer} disabled={!onlineLetter || !onlineAnswer.trim() || onlineBusy}>CONFIRMAR</button>
            </div>
          )}
          {onlineError && <p className="bomba-error">{onlineError}</p>}
          {onlineRoom.answers.length > 0 && <p className="bomba-last-answer"><strong>{onlineRoom.answers.at(-1)?.letter}</strong> {onlineRoom.answers.at(-1)?.answer} — {onlineRoom.answers.at(-1)?.playerName}</p>}
          {onlineRoom.status === "playing" && <p className="bomba-rule"><strong>{onlineRemaining}</strong> letras disponíveis. Se o tempo zerar, a bomba explode no jogador da vez e ele é eliminado da rodada.</p>}
          {onlineRoom.status !== "playing" && isHost && (
            <div className="bomba-result-actions">
              <button onClick={() => startOnlineRound(true)}><RotateCcw size={19} /> Mesmo tema</button>
              <button onClick={() => startOnlineRound(false)}><Shuffle size={19} /> Novo tema</button>
            </div>
          )}
          {onlineRoom.status !== "playing" && !isHost && <div className="bomba-waiting">Aguardando o líder iniciar outra rodada...</div>}
        </main>
      </div>
    );
  }

  if (phase === "setup") {
    return (
      <div className="bomba-page bomba-page--setup">
        <MobileNav />
        <main className="bomba-setup">
          <Link href="/" className="bomba-back"><ArrowLeft size={18} /> Voltar para a Home</Link>
          <img className="bomba-brand-logo" src={bombaLogo} alt="Bomba" />
          <h1>Prepare os jogadores</h1>
          <p>Joguem no mesmo aparelho. Na sua vez, escolha uma letra e diga uma resposta antes da bomba explodir.</p>

          <section className="bomba-settings-panel bomba-settings-panel--local">
            <div className="bomba-settings-panel__title"><strong><Settings size={18}/> Configuração da partida</strong></div>
            <label>Tempo por jogador</label>
            <div className="bomba-time-options">
              {[5, 10, 15, 20].map((seconds) => <button key={seconds} className={roundSeconds === seconds ? "is-active" : ""} onClick={() => setRoundSeconds(seconds)}>{seconds}s</button>)}
            </div>
            <label>Vetar letras <small>({bannedLetters.length})</small></label>
            <div className="bomba-ban-grid">
              {ALPHABET.map((letter) => <button key={letter} className={bannedLetters.includes(letter) ? "is-banned" : ""} onClick={() => toggleBannedLetter(letter)}>{letter}</button>)}
            </div>
          </section>

          <div className="bomba-player-list">
            {players.map((player, index) => (
              <div className="bomba-player-input" key={index}>
                <span>{index + 1}</span>
                <input
                  value={player}
                  onChange={(event) => updatePlayer(index, event.target.value)}
                  maxLength={18}
                  aria-label={`Nome do jogador ${index + 1}`}
                />
                <button onClick={() => removePlayer(index)} disabled={players.length <= 2} aria-label={`Remover ${player}`}>
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>

          <button className="bomba-add-player" onClick={addPlayer} disabled={players.length >= 10}>
            <Plus size={18} /> Adicionar jogador
          </button>
          <button className="bomba-start" onClick={() => startRound()}>
            <Bomb size={25} /> SORTEAR TEMA E COMEÇAR
          </button>
          <small>Cada jogador terá {roundSeconds} segundos para responder. A partida começará com {bannedLetters.length} letras vetadas.</small>
        </main>
      </div>
    );
  }

  return (
    <div className={`bomba-page bomba-page--game ${phase === "exploded" ? "is-exploded" : ""}`}>
      <header className="bomba-game-header">
        <button onClick={() => setPhase("setup")}><ArrowLeft size={18} /> Sair</button>
        <img className="bomba-game-logo-image" src={bombaLogo} alt="Bomba" />
        <span><Volume2 size={17} /> Som</span>
      </header>

      <main className="bomba-game">
        <section className="bomba-theme-card">
          <span>TEMA SORTEADO</span>
          <strong>{theme}</strong>
          <button onClick={() => setTheme((current) => randomTheme(current))} disabled={phase !== "playing"} aria-label="Sortear outro tema">
            <Shuffle size={17} />
          </button>
        </section>

        <section className="bomba-turn">
          {phase === "playing" ? <><span>AGORA É A VEZ DE</span><strong>{currentName}</strong><small>Escolha uma letra e responda antes do tempo acabar</small></> : null}
          {phase === "exploded" ? <><span>A BOMBA EXPLODIU COM</span><strong>{currentName}</strong><small>Eliminado desta rodada!</small></> : null}
          {phase === "completed" ? <><span>ALFABETO COMPLETO!</span><strong>Vocês venceram!</strong><small>Todas as letras foram usadas antes da explosão.</small></> : null}
        </section>

        <section className="bomba-device" aria-label="Alfabeto do jogo Bomba">
          <div className="bomba-fuse" style={{ "--fuse-progress": `${progress}%`, "--fuse-color": fuseColor } as React.CSSProperties} />
          <div className="bomba-letter-ring">
            {ALPHABET.map((letter, index) => {
              const angle = (360 / ALPHABET.length) * index;
              const used = usedLetters.includes(letter);
              return (
                <button
                  type="button"
                  key={letter}
                  className={`bomba-letter ${used ? "is-used" : ""} ${lastLetter === letter ? "is-last" : ""}`}
                  style={{ "--letter-angle": `${angle}deg` } as React.CSSProperties}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    useLetter(letter);
                  }}
                  disabled={used || phase !== "playing"}
                  aria-label={used ? `Letra ${letter} eliminada` : `Escolher letra ${letter}`}
                >
                  <span style={{ transform: `rotate(${-angle}deg)` }}>{letter}</span>
                </button>
              );
            })}

            <div className={`bomba-center ${phase === "exploded" ? "is-boom" : ""}`}>
              <div className="bomba-center__light" />
              <Bomb className="bomba-center__icon" />
              <strong>{phase === "exploded" ? "BOOM!" : Math.ceil(timeLeft)}</strong>
              <span>{phase === "exploded" ? "" : "segundos"}</span>
            </div>
          </div>
        </section>

        {phase !== "playing" && (
          <div className="bomba-result-actions">
            <button onClick={() => startRound(true)}><RotateCcw size={19} /> Mesmo tema</button>
            <button onClick={() => startRound()}><Shuffle size={19} /> Novo tema</button>
          </div>
        )}

        <p className="bomba-rule"><strong>{remainingLetters}</strong> letras disponíveis. Falou? Toque na letra usada: a vez passa e o cronômetro reinicia. Se zerar, a bomba explode no jogador atual.</p>
      </main>
    </div>
  );
}
