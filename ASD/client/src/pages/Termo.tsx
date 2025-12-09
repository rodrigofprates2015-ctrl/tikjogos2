import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { ArrowLeft, Delete, CornerDownLeft, RotateCcw, Share2, Trophy, Clock } from "lucide-react";
import backgroundImg from "@assets/background_natal_1765071997985.png";
import logoTikjogos from "@assets/logo tikjogos_1764616571363.png";
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
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"]
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
        
        const bgColor = {
          correct: "bg-green-600 border-green-600",
          present: "bg-yellow-600 border-yellow-600",
          absent: "bg-gray-700 border-gray-700",
          empty: "bg-transparent border-[#3a5a7a]"
        }[state];
        
        cells.push(
          <div
            key={j}
            className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-2xl font-bold text-white border-2 rounded-lg ${bgColor} ${isCurrentRow && shake ? "animate-shake" : ""} transition-all duration-200`}
          >
            {letter}
          </div>
        );
      }
      
      rows.push(
        <div key={i} className="flex gap-1.5 justify-center">
          {cells}
        </div>
      );
    }
    
    return rows;
  };

  const renderKeyboard = () => {
    return VALID_KEYS.map((row, i) => (
      <div key={i} className="flex gap-1 justify-center">
        {row.map((key) => {
          const state = keyboardState[key];
          const isSpecial = key === "ENTER" || key === "⌫";
          
          const bgColor = state === "correct" ? "bg-green-600" 
            : state === "present" ? "bg-yellow-600" 
            : state === "absent" ? "bg-gray-700" 
            : "bg-[#2a3a4a]";
          
          return (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className={`${isSpecial ? "px-3 md:px-4" : "w-8 md:w-10"} h-12 md:h-14 rounded-lg font-bold text-white ${bgColor} hover:opacity-80 transition-opacity flex items-center justify-center text-sm md:text-base`}
            >
              {key === "⌫" ? <Delete className="w-5 h-5" /> : key === "ENTER" ? <CornerDownLeft className="w-5 h-5" /> : key}
            </button>
          );
        })}
      </div>
    ));
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center relative py-4 px-2"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Link 
        href="/outros-jogos"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-[#1a2a3a] border-2 border-[#3a5a7a] rounded-xl text-white hover:bg-[#2a3a4a] transition-all font-semibold shadow-lg"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Voltar</span>
      </Link>

      <div className="mt-16 mb-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">🟩 Termo</h1>
        <p className="text-[#8aa0b0] text-sm">Descubra a palavra do dia</p>
      </div>

      <div className="flex items-center gap-2 text-[#8aa0b0] text-sm mb-4">
        <Clock className="w-4 h-4" />
        <span>Próxima palavra em: {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
      </div>

      <div className="bg-[#1a2a3a]/80 backdrop-blur-sm rounded-2xl border-2 border-[#3a5a7a] p-4 md:p-6 mb-4">
        <div className="flex flex-col gap-1.5">
          {renderGrid()}
        </div>
      </div>

      {gameStatus !== "playing" && (
        <div className="flex gap-3 mb-4">
          {gameStatus === "won" && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-600 rounded-xl text-green-400">
              <Trophy className="w-5 h-5" />
              <span className="font-bold">Vitória!</span>
            </div>
          )}
          <button
            onClick={shareResult}
            className="flex items-center gap-2 px-4 py-2 bg-[#e8a045] rounded-xl text-white font-bold hover:bg-[#d89035] transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar
          </button>
        </div>
      )}

      <div className="bg-[#1a2a3a]/80 backdrop-blur-sm rounded-2xl border-2 border-[#3a5a7a] p-3 md:p-4">
        <div className="flex flex-col gap-1.5">
          {renderKeyboard()}
        </div>
      </div>

      <div className="mt-6 text-center text-[#6a8aaa] text-xs max-w-sm">
        <p>🟩 Letra correta na posição certa</p>
        <p>🟨 Letra correta na posição errada</p>
        <p>⬛ Letra não está na palavra</p>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center z-20">
        <img src={logoTikjogos} alt="TikJogos" className="h-4 md:h-5 mx-auto mb-2" />
      </div>
    </div>
  );
}
