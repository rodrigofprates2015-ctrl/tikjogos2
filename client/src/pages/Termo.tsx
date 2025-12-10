import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { ArrowLeft, Delete, CornerDownLeft, Share2, Trophy, Clock, HelpCircle } from "lucide-react";
import logoTikjogos from "@assets/logo tikjogos_1764616571363.png";
import logoTermo from "@/assets/Termo_Logo_58x58_1765323385999.png";
import { useToast } from "@/hooks/use-toast";

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

const WORDS = [
  "TERMO", "JOGOS", "PRAIA", "CHUVA", "NUVEM", "PEDRA", "FOLHA", "TARDE", "NOITE", "MUNDO",
  "TEMPO", "FESTA", "SONHO", "BRAVO", "CALMO", "FORTE", "FELIZ", "RAPAZ", "MORAR", "AMIGO",
  "PULAR", "NADAR", "ANDAR", "FALAR", "OUVIR", "DIZER", "FAZER", "PODER", "SABER", "VIVER",
  "ACHAR", "OLHAR", "FICAR", "LEVAR", "SUBIR", "ABRIR", "JOGAR", "COMER", "BEBER", "TERRA",
  "PLANO", "LIVRO", "CARTA", "PAPEL", "PORTA", "PONTO", "LONGO", "VERDE", "PRETO", "CORES",
  "GRUPO", "COISA", "PARTE", "LUGAR", "HOMEM", "FILHO", "GENTE", "VELHO", "JOVEM", "BAIXO",
  "LARGO", "CURSO", "FORMA", "CONTA", "FUNDO", "CAUSA", "CAMPO", "CORPO", "PASSO", "BANCO",
  "BARCO", "CANTO", "CARRO", "CERCA", "CHAVE", "CRIME", "DENTE", "DISCO", "DRAMA", "FONTE",
  "GASTO", "GOLPE", "GRADE", "GREVE", "HOTEL", "IDEIA", "LANCE", "MARCA", "METRO", "MONTE",
  "MOTOR", "NOBRE", "ORDEM", "PALCO", "PASTA", "PESCA", "PIZZA", "PLACA", "PRATO", "QUEDA",
  "RAZAO", "REGRA", "RESTO", "RITMO", "ROUPA", "RUIDO", "SABOR", "SAIDA", "SANTO", "SETOR",
  "SIGNO", "SORTE", "TEXTO", "TIGRE", "TINTA", "TOTAL", "TURMA", "UNIAO", "UNICO", "VAPOR",
  "VIDEO", "VINHO", "VISAO", "VOLTA", "ZEBRA", "BAIXA", "BOLSA", "BUSCA", "CALMA", "CARNE",
  "CIFRA", "CLIMA", "COROA", "DANCA", "DIETA", "DUPLA", "ETAPA", "FAIXA", "FALHA", "FORCA",
  "GARRA", "HONRA", "LENDA", "LINHA", "LISTA", "MEDIA", "MOEDA", "NIVEL", "PAUSA", "PERDA",
  "PISTA", "PROVA", "RENDA", "RISCO", "SAUDE", "SELVA", "SERIE", "TECLA", "TORRE", "TROCA",
  "VENDA", "AREIA", "CALOR", "CLARA", "CORTE", "CURVA", "DOBRA", "FIBRA", "FLORA", "FAUNA",
  "GALHO", "GRAMA", "GRUTA", "HORTA", "INFRA", "LARGA", "LONGE", "MEDIR", "MIGRA", "NORMA",
  "OUTRA", "PALMA", "PERNA", "PLENA", "PRETA", "PRIMA", "QUASE", "RUIVA", "SOLTA", "SULCO",
  "TRAMA", "TROPA", "TURNO", "ULTRA", "VALSA", "VULTO", "ZEROS", "APOIO", "BRISA", "CABRA",
  "DARDO", "ELEVA", "FARDO", "GAROA", "HEROI", "IDEAI", "JEITO", "KARMA", "LAPSO", "MANHA",
  "NAVAL", "OPACO", "PILHA", "QUOTA", "RAIVA", "SALTO", "TACHO", "USUAL", "VAZIO", "XEQUE",
  "ABETO", "BESTA", "CASAL", "DARDO", "EXATO", "FIRME", "GESSO", "HASTE", "IDADE", "JANTA",
  "KOALA", "LIMPO", "MAGRO", "NAIPE", "OLIVA", "PARGO", "QUILO", "RASGO", "SURDO", "TELHA",
  "USINA", "VIDRO", "XEROX", "ANCLA", "BORDO", "CEDRO", "DISCO", "ERETO", "FALSO", "GENIO",
  "HINDU", "IGUAL", "JUNTO", "LENTO", "MUITO", "NERVO", "OPTAR", "POMBO", "QUEDA", "REINO",
  "SUAVE", "TRENS", "URUBU", "VIGOR", "VULGO", "ANEXO", "BARRO", "CUSTO", "DENSO", "EMAIL",
  "FOGAO", "GRAVE", "HARPA", "ICONE", "JULHO", "LATIM", "MUNDO", "NERVO", "OBESO", "POLVO"
];

const VALID_KEYS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "⌫"],
  ["Z", "X", "C", "V", "B", "N", "M", "ENTER"]
];

function getDailyWord(): string {
  const brasiliaOffset = -3 * 60;
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const brasiliaTime = new Date(utc + (brasiliaOffset * 60000));
  
  const startDate = new Date(2024, 0, 1);
  const diffTime = brasiliaTime.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return WORDS[diffDays % WORDS.length];
}

function getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number } {
  const brasiliaOffset = -3 * 60;
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const brasiliaTime = new Date(utc + (brasiliaOffset * 60000));
  
  const midnight = new Date(brasiliaTime);
  midnight.setHours(24, 0, 0, 0);
  
  const diff = midnight.getTime() - brasiliaTime.getTime();
  
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000)
  };
}

type LetterState = "correct" | "present" | "absent" | "empty";

interface LetterResult {
  letter: string;
  state: LetterState;
}

function checkWord(guess: string, target: string): LetterResult[] {
  const result: LetterResult[] = [];
  const targetLetters = target.split("");
  const remaining: string[] = [...targetLetters];
  
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === target[i]) {
      result[i] = { letter: guess[i], state: "correct" };
      remaining[i] = "";
    } else {
      result[i] = { letter: guess[i], state: "absent" };
    }
  }
  
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i].state !== "correct") {
      const idx = remaining.indexOf(guess[i]);
      if (idx !== -1) {
        result[i].state = "present";
        remaining[idx] = "";
      }
    }
  }
  
  return result;
}

function getStorageKey(): string {
  const brasiliaOffset = -3 * 60;
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const brasiliaTime = new Date(utc + (brasiliaOffset * 60000));
  return `termo_${brasiliaTime.toISOString().split('T')[0]}`;
}

interface GameState {
  guesses: string[];
  currentGuess: string;
  gameStatus: "playing" | "won" | "lost";
}

function loadGameState(targetWord: string): GameState {
  const key = getStorageKey();
  const saved = localStorage.getItem(key);
  
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return { guesses: [], currentGuess: "", gameStatus: "playing" };
    }
  }
  
  return { guesses: [], currentGuess: "", gameStatus: "playing" };
}

function saveGameState(state: GameState): void {
  const key = getStorageKey();
  localStorage.setItem(key, JSON.stringify(state));
}

export default function Termo() {
  const { toast } = useToast();
  const [targetWord] = useState(() => getDailyWord());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [keyboardState, setKeyboardState] = useState<Record<string, LetterState>>({});
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const saved = loadGameState(targetWord);
    setGuesses(saved.guesses);
    setCurrentGuess(saved.currentGuess);
    setGameStatus(saved.gameStatus);
    
    const newKeyboardState: Record<string, LetterState> = {};
    saved.guesses.forEach((guess) => {
      const result = checkWord(guess, targetWord);
      result.forEach(({ letter, state }) => {
        const current = newKeyboardState[letter];
        if (!current || state === "correct" || (state === "present" && current === "absent")) {
          newKeyboardState[letter] = state;
        }
      });
    });
    setKeyboardState(newKeyboardState);
  }, [targetWord]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    saveGameState({ guesses, currentGuess, gameStatus });
  }, [guesses, currentGuess, gameStatus]);

  const handleKeyPress = useCallback((key: string) => {
    if (gameStatus !== "playing") return;

    if (key === "ENTER") {
      if (currentGuess.length !== WORD_LENGTH) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        toast({ title: "Palavra incompleta", description: `Digite ${WORD_LENGTH} letras`, variant: "destructive" });
        return;
      }

      const newGuesses = [...guesses, currentGuess];
      const result = checkWord(currentGuess, targetWord);
      
      const newKeyboardState = { ...keyboardState };
      result.forEach(({ letter, state }) => {
        const current = newKeyboardState[letter];
        if (!current || state === "correct" || (state === "present" && current === "absent")) {
          newKeyboardState[letter] = state;
        }
      });
      
      setGuesses(newGuesses);
      setKeyboardState(newKeyboardState);
      setCurrentGuess("");

      if (currentGuess === targetWord) {
        setGameStatus("won");
        toast({ title: "Parabéns!", description: `Você acertou em ${newGuesses.length} tentativa${newGuesses.length > 1 ? 's' : ''}!` });
      } else if (newGuesses.length >= MAX_ATTEMPTS) {
        setGameStatus("lost");
        toast({ title: "Fim de jogo", description: `A palavra era: ${targetWord}`, variant: "destructive" });
      }
    } else if (key === "⌫" || key === "BACKSPACE") {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => prev + key);
    }
  }, [currentGuess, gameStatus, guesses, keyboardState, targetWord, toast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      handleKeyPress(key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress]);

  const shareResult = () => {
    const emojiGrid = guesses.map((guess) => {
      const result = checkWord(guess, targetWord);
      return result.map(({ state }) => {
        if (state === "correct") return "🟩";
        if (state === "present") return "🟨";
        return "⬛";
      }).join("");
    }).join("\n");

    const text = `Termo ${guesses.length}/${MAX_ATTEMPTS}\n\n${emojiGrid}\n\nJogue em tikjogos.com.br`;
    
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: "Copiado!", description: "Resultado copiado para a área de transferência" });
    }
  };

  const getKeyStyle = (key: string) => {
    const state = keyboardState[key];
    if (state === "correct") return "bg-[#538d4e] text-white";
    if (state === "present") return "bg-[#b59f3b] text-white";
    if (state === "absent") return "bg-[#3a3a3c] text-[#818384]";
    return "bg-[#818384] text-white";
  };

  const renderGrid = () => {
    const rows = [];
    
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const guess = guesses[i];
      const isCurrentRow = i === guesses.length && gameStatus === "playing";
      const cells = [];
      
      for (let j = 0; j < WORD_LENGTH; j++) {
        let letter = "";
        let state: LetterState = "empty";
        
        if (guess) {
          const result = checkWord(guess, targetWord);
          letter = result[j].letter;
          state = result[j].state;
        } else if (isCurrentRow) {
          letter = currentGuess[j] || "";
        }
        
        let cellClass = "flex items-center justify-center text-2xl font-bold uppercase transition-all duration-300 transform select-none rounded border-2";
        
        if (state === "correct") {
          cellClass += " bg-[#538d4e] border-[#538d4e] text-white";
        } else if (state === "present") {
          cellClass += " bg-[#b59f3b] border-[#b59f3b] text-white";
        } else if (state === "absent") {
          cellClass += " bg-[#3a3a3c] border-[#3a3a3c] text-white";
        } else {
          cellClass += " border-[#3a3a3c] bg-transparent text-white";
        }
        
        if (isCurrentRow && shake) {
          cellClass += " animate-shake";
        }
        
        cells.push(
          <div key={j} className={cellClass}>
            {letter}
          </div>
        );
      }
      
      rows.push(
        <div key={i} className="grid grid-cols-5 gap-2">
          {cells}
        </div>
      );
    }
    
    return rows;
  };

  const renderKeyboard = () => {
    return VALID_KEYS.map((row, i) => (
      <div key={i} className="flex justify-center gap-1.5">
        {row.map((key) => {
          const isEnter = key === "ENTER";
          const isBackspace = key === "⌫";
          const isSpecial = isEnter || isBackspace;
          const baseStyle = "flex items-center justify-center rounded font-bold select-none transition-all active:scale-95";
          const sizeStyle = isEnter 
            ? "px-4 py-3 min-w-[70px] text-xs" 
            : isBackspace 
              ? "px-3 py-3 min-w-[44px] text-sm" 
              : "w-9 h-14 flex-1 max-w-[44px] text-sm";
          
          let content: React.ReactNode = key;
          if (isEnter) content = "ENTER";
          if (isBackspace) content = <Delete size={20} />;

          return (
            <button 
              key={key} 
              onClick={() => handleKeyPress(key)}
              className={`${baseStyle} ${sizeStyle} ${!isSpecial ? getKeyStyle(key) : 'bg-[#818384] text-white'}`}
              data-testid={`key-${key}`}
            >
              {content}
            </button>
          );
        })}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-[#121a31] text-white flex flex-col items-center font-sans antialiased">
      
      {/* Header */}
      <header className="w-full max-w-lg pt-4 pb-4 px-4 flex flex-col items-center relative border-b border-[#3a3a3c]">
        
        {/* Navigation Icons */}
        <div className="absolute top-4 left-4 flex gap-3">
          <Link href="/outros-jogos">
            <ArrowLeft className="w-6 h-6 text-white cursor-pointer hover:text-emerald-400 transition-colors" data-testid="button-back" />
          </Link>
          <HelpCircle className="w-6 h-6 text-white cursor-pointer hover:text-emerald-400 transition-colors" data-testid="button-help" />
        </div>

        {/* Title with Logo */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 mb-2">
            <img src={logoTermo} alt="Termo" className="w-10 h-10 rounded-lg" />
            <h1 className="text-3xl font-bold text-white tracking-tight">Termo</h1>
          </div>
          
          <p className="text-gray-300 text-sm mb-3">Descubra a palavra do dia</p>
          
          {/* Timer */}
          <div className="flex items-center gap-2 text-sm text-white bg-[#3a3a3c] px-4 py-2 rounded-full">
            <Clock size={16} className="text-emerald-400" />
            <span>Próxima palavra em: <span className="font-mono font-bold text-emerald-400 ml-1">{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span></span>
          </div>
        </div>
      </header>

      {/* Game Area */}
      <main className="flex-1 flex flex-col justify-center items-center w-full max-w-lg px-2 py-4 gap-6">
        
        {/* Word Grid */}
        <div className="grid grid-rows-6 gap-2 w-full max-w-[320px] aspect-[5/6]">
          {renderGrid()}
        </div>

        {/* Victory/Loss Message */}
        {gameStatus !== "playing" && (
          <div className="bg-[#1a1a1b] border border-[#3a3a3c] px-6 py-4 rounded-lg flex flex-col items-center gap-3 w-full max-w-[320px]">
            {gameStatus === "won" ? (
              <span className="text-[#538d4e] font-bold text-lg tracking-wide uppercase flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Parabéns!
              </span>
            ) : (
              <span className="text-red-400 font-bold text-lg tracking-wide uppercase">
                A palavra era: {targetWord}
              </span>
            )}
            <button 
              onClick={shareResult}
              className="w-full flex items-center justify-center gap-2 bg-[#538d4e] text-white text-sm font-bold py-3 px-4 rounded transition-all"
              data-testid="button-share"
            >
              <Share2 size={16} /> Compartilhar
            </button>
          </div>
        )}

      </main>

      {/* Keyboard */}
      <div className="w-full max-w-lg px-2 pb-6 pt-2">
        <div className="flex flex-col gap-2 w-full">
          {renderKeyboard()}
        </div>
      </div>

      {/* Legend */}
      <div className="pb-4 text-center text-gray-300 text-xs max-w-sm flex flex-wrap justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#538d4e] rounded"></div>
          <span>Correta</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#b59f3b] rounded"></div>
          <span>Posição errada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#3a3a3c] rounded"></div>
          <span>Não está</span>
        </div>
      </div>

      {/* Logo */}
      <div className="pb-4 text-center">
        <img src={logoTikjogos} alt="TikJogos" className="h-4 md:h-5 mx-auto" />
      </div>

      <style>{`
        .animate-shake {
          animation: shake 0.5s ease-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
      `}</style>
    </div>
  );
}
