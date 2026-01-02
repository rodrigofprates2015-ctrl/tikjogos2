import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Play, AlertTriangle, ArrowLeft, Home, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { OrderWheelIcon } from "@/components/OrderWheelIcon";
import logoTikjogos from "@assets/logo tikjogos_1764616571363.png";
import tripulanteImg from "@assets/tripulante_natal_1765071995242.png";
import impostorImg from "@assets/impostor_natal_1765071992843.png";

type Player = {
  name: string;
  role: "player" | "impostor";
  word: string | null;
};

export default function ModoLocalJogo() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [allPlayersRevealed, setAllPlayersRevealed] = useState(false);
  const [showSorteio, setShowSorteio] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [speakingOrder, setSpeakingOrder] = useState<string[]>([]);
  const [showOrderResults, setShowOrderResults] = useState(false);

  useEffect(() => {
    // Carregar configuração do sessionStorage
    const configStr = sessionStorage.getItem("modoLocalConfig");
    
    if (!configStr) {
      toast({
        title: "Configuração não encontrada",
        description: "Voltando para a configuração",
        variant: "destructive"
      });
      setLocation("/modo-local");
      return;
    }

    const config = JSON.parse(configStr);
    
    // Buscar palavra do tema selecionado
    fetchWordForTheme(config.theme, config.mode).then(word => {
      // Sortear impostores
      const playerList: Player[] = config.players.map((name: string) => ({
        name,
        role: "player" as const,
        word
      }));

      // Sortear impostores aleatoriamente
      const impostorIndices = new Set<number>();
      while (impostorIndices.size < config.numImpostors) {
        const randomIndex = Math.floor(Math.random() * playerList.length);
        impostorIndices.add(randomIndex);
      }

      // Marcar impostores
      impostorIndices.forEach(index => {
        playerList[index].role = "impostor";
        playerList[index].word = null;
      });

      setPlayers(playerList);
    });
  }, []);

  const fetchWordForTheme = async (theme: string, mode: string): Promise<string> => {
    // Palavras hardcoded por tema (reutilizando o banco existente)
    const wordsByTheme: Record<string, string[]> = {
      classico: [
        "Cachorro", "Gato", "Casa", "Carro", "Livro", "Telefone", "Computador",
        "Mesa", "Cadeira", "Porta", "Janela", "Árvore", "Flor", "Sol", "Lua"
      ],
      disney: [
        "Mickey", "Minnie", "Donald", "Pateta", "Plutão", "Princesa", "Castelo",
        "Elsa", "Ana", "Simba", "Ariel", "Moana", "Rapunzel", "Buzz", "Woody"
      ],
      futebol: [
        "Flamengo", "Corinthians", "São Paulo", "Palmeiras", "Santos", "Vasco",
        "Cruzeiro", "Grêmio", "Internacional", "Atlético", "Fluminense", "Botafogo"
      ],
      animais: [
        "Leão", "Tigre", "Elefante", "Girafa", "Zebra", "Macaco", "Urso",
        "Lobo", "Raposa", "Coelho", "Pássaro", "Peixe", "Golfinho", "Baleia"
      ],
      profissoes: [
        "Médico", "Professor", "Engenheiro", "Advogado", "Policial", "Bombeiro",
        "Cozinheiro", "Motorista", "Piloto", "Dentista", "Enfermeiro", "Arquiteto"
      ],
      comidas: [
        "Pizza", "Hambúrguer", "Macarrão", "Arroz", "Feijão", "Bolo", "Sorvete",
        "Chocolate", "Café", "Suco", "Refrigerante", "Salada", "Frango", "Carne"
      ]
    };

    const words = wordsByTheme[theme] || wordsByTheme.classico;
    const randomWord = words[Math.floor(Math.random() * words.length)];
    return randomWord;
  };

  const handleRevealClick = () => {
    if (!isRevealed) {
      setShowWarning(true);
    } else {
      // Esconder palavra
      setIsRevealed(false);
      setShowWarning(false);
      
      // Avançar para próximo jogador
      if (currentPlayerIndex < players.length - 1) {
        setCurrentPlayerIndex(currentPlayerIndex + 1);
      } else {
        setAllPlayersRevealed(true);
      }
    }
  };

  const handleConfirmReveal = () => {
    setShowWarning(false);
    setIsRevealed(true);
  };

  const handleStartRound = () => {
    setGameStarted(true);
    toast({
      title: "Jogo iniciado!",
      description: "Boa sorte descobrindo o impostor!",
    });
  };

  const handleStartSorteio = () => {
    setShowSorteio(true);
    setRotation(0);
    setShowOrderResults(false);
    
    let currentRotation = 0;
    const interval = setInterval(() => {
      currentRotation += 15;
      setRotation(currentRotation);
    }, 30);

    setTimeout(() => {
      clearInterval(interval);
      
      const order = [...players].sort(() => Math.random() - 0.5).map(p => p.name);
      setSpeakingOrder(order);
      setRotation(360 * 3 + 45);
      
      setTimeout(() => setShowOrderResults(true), 500);
    }, 3000);
  };

  const handleBackToConfig = () => {
    sessionStorage.removeItem("modoLocalConfig");
    setLocation("/modo-local");
  };

  if (players.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a2a3a] to-[#0a1628] flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  const currentPlayer = players[currentPlayerIndex];

  if (allPlayersRevealed && !gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a2a3a] to-[#0a1628] flex flex-col">
        {/* Header */}
        <div className="w-full bg-[#0a1628]/90 backdrop-blur-sm border-b border-[#3d4a5c]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 cursor-pointer group">
              <Home className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              <img src={logoTikjogos} alt="TikJogos" className="h-8" />
            </a>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#16213e]/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-[#3d4a5c] text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-black text-white mb-4">
            Todos receberam suas palavras!
          </h2>
          <p className="text-slate-400 mb-8">
            Agora podem começar o jogo e descobrir quem é o impostor
          </p>
          <Button
            onClick={handleStartRound}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-black text-lg py-6 rounded-xl mb-4"
          >
            <Play className="w-6 h-6 mr-2" />
            Iniciar Rodada
          </Button>
          <Button
            onClick={handleBackToConfig}
            variant="outline"
            className="w-full"
          >
            Voltar para Configuração
          </Button>
          </div>
        </div>
      </div>
    );
  }

  if (gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a2a3a] to-[#0a1628] flex flex-col">
        {/* Header */}
        <div className="w-full bg-[#0a1628]/90 backdrop-blur-sm border-b border-[#3d4a5c]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 cursor-pointer group">
              <Home className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              <img src={logoTikjogos} alt="TikJogos" className="h-8" />
            </a>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#16213e]/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-[#3d4a5c]">
          
          {showSorteio ? (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700/50">
                <Zap className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm uppercase tracking-widest font-bold">
                  Ordem de Fala
                </span>
              </div>

              {!showOrderResults && (
                <>
                  <div className="relative w-32 h-32 mx-auto">
                    <OrderWheelIcon 
                      className="w-full h-full drop-shadow-lg"
                      rotation={rotation}
                    />
                  </div>
                  <p className="text-gray-400 text-sm animate-pulse">
                    Sorteando ordem...
                  </p>
                </>
              )}

              {showOrderResults && speakingOrder.length > 0 && (
                <div className="animate-fade-in space-y-3">
                  <p className="text-center text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">
                    Ordem Sorteada
                  </p>
                  <div className="space-y-2">
                    {speakingOrder.map((name, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl border border-slate-600/30"
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 border-2 border-purple-500/50 flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-400 font-black text-sm">{index + 1}</span>
                        </div>
                        <span className="text-white font-bold flex-1">{name}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => setShowSorteio(false)}
                    className="w-full mt-4 bg-slate-700 hover:bg-slate-600"
                  >
                    Voltar
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-6">🎮</div>
              <h2 className="text-3xl font-black text-white mb-4">
                Jogo em Andamento
              </h2>
              <p className="text-slate-400 mb-8">
                Discutam e descubram quem é o impostor!
              </p>
              <div className="bg-slate-700 rounded-xl p-4 mb-6">
                <p className="text-slate-300 text-sm mb-2">Jogadores:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {players.map((player, index) => (
                    <span
                      key={index}
                      className="bg-slate-600 px-3 py-1 rounded-full text-white text-sm"
                    >
                      {player.name}
                    </span>
                  ))}
                </div>
              </div>
              
              <Button
                onClick={handleStartSorteio}
                className="w-full mb-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                <Zap className="mr-2 w-5 h-5" /> Sortear Ordem de Fala
              </Button>
              
              <Button
                onClick={handleBackToConfig}
                variant="outline"
                className="w-full"
              >
                Novo Jogo
              </Button>
            </div>
          )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a2a3a] to-[#0a1628] flex flex-col">
      {/* Header */}
      <div className="w-full bg-[#0a1628]/90 backdrop-blur-sm border-b border-[#3d4a5c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button 
            onClick={handleBackToConfig}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            <img src={logoTikjogos} alt="TikJogos" className="h-8" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Indicador de progresso */}
        <div className="mb-4 text-center">
          <span className="text-slate-400 text-sm">
            Jogador {currentPlayerIndex + 1} de {players.length}
          </span>
        </div>

        <div className="bg-[#16213e]/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-[#3d4a5c]">
          {/* Nome do jogador */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-white mb-2">
              Agora é a vez de
            </h2>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {currentPlayer.name}
            </h1>
          </div>

          {/* Área da palavra */}
          {!showWarning && (
            <div className="mb-8">
              {isRevealed ? (
                <div className="flex flex-col items-center gap-4 animate-fade-in w-full">
                  <div className="flex items-center gap-4 w-full">
                    <div 
                      className={cn(
                        "w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-xl border-4",
                        currentPlayer.role === "impostor" ? "border-rose-500/50 bg-rose-500/10" : "border-emerald-500/50 bg-emerald-500/10"
                      )}
                    >
                      <img 
                        src={currentPlayer.role === "impostor" ? impostorImg : tripulanteImg} 
                        alt={currentPlayer.role === "impostor" ? "Impostor" : "Tripulante"}
                        className="w-full h-auto"
                        style={{ transform: 'scale(1.5) translateY(18%)' }}
                      />
                    </div>
                    <div className="text-left flex-1">
                      <h2 
                        className={cn(
                          "text-2xl sm:text-3xl font-black tracking-wider uppercase",
                          currentPlayer.role === "impostor" ? "text-rose-400" : "text-emerald-400"
                        )}
                      >
                        {currentPlayer.role === "impostor" ? "IMPOSTOR" : "TRIPULANTE"}
                      </h2>
                      <p className="text-slate-400 text-xs mt-1">
                        {currentPlayer.role === "impostor" ? "Engane todos!" : "Descubra o impostor!"}
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-slate-600/30 to-transparent"></div>

                  <div className="w-full">
                    {currentPlayer.role === "impostor" ? (
                      <div className="text-center p-4 bg-rose-500/5 rounded-2xl border-2 border-rose-500/20">
                        <p className="text-slate-300 text-sm font-medium leading-relaxed">
                          Finja que você sabe a palavra! Engane a todos.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 text-center p-4 bg-emerald-500/5 rounded-2xl border-2 border-emerald-500/20">
                        <p className="text-emerald-400 text-xs uppercase tracking-[0.3em] font-bold">Palavra Secreta</p>
                        <h2 className="text-3xl sm:text-4xl text-white font-black tracking-tight">{currentPlayer.word}</h2>
                        <p className="text-slate-400 text-sm">Dê dicas sutis sobre a palavra!</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center">
                    <Eye className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                    Toque para Revelar
                  </h3>
                  <p className="text-slate-400 text-sm">Descubra seu papel no jogo</p>
                </div>
              )}
            </div>
          )}

          {/* Aviso antes de revelar */}
          {showWarning && (
            <div className="mb-8 bg-yellow-500/20 border-2 border-yellow-500 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                <p className="text-yellow-500 font-bold">Atenção!</p>
              </div>
              <p className="text-white mb-6">
                Certifique-se de que só você está vendo a tela antes de revelar sua palavra.
              </p>
              <Button
                onClick={handleConfirmReveal}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
              >
                Ok, revelar
              </Button>
            </div>
          )}

          {/* Botão de ação */}
          {!showWarning && (
            <Button
              onClick={handleRevealClick}
              className={`w-full font-black text-lg py-6 rounded-xl ${
                isRevealed
                  ? "bg-slate-700 hover:bg-slate-600"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              }`}
            >
              {isRevealed ? (
                <>
                  <EyeOff className="w-6 h-6 mr-2" />
                  Esconder e Avançar
                </>
              ) : (
                <>
                  <Eye className="w-6 h-6 mr-2" />
                  Revelar Palavra
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
