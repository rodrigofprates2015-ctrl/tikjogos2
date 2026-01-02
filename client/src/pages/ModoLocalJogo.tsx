import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Play, AlertTriangle, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import logoTikjogos from "@assets/logo tikjogos_1764616571363.png";

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
          <div className="w-full max-w-md bg-[#16213e]/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-[#3d4a5c] text-center">
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
            onClick={handleBackToConfig}
            variant="outline"
            className="w-full"
          >
            Novo Jogo
          </Button>
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
              <p className="text-slate-400 text-center mb-4">
                {isRevealed ? "Sua palavra é:" : "Palavra escondida"}
              </p>
              
              <div
                className={`relative min-h-[120px] rounded-2xl flex items-center justify-center transition-all ${
                  isRevealed
                    ? currentPlayer.role === "impostor"
                      ? "bg-gradient-to-br from-red-500 to-orange-500"
                      : "bg-gradient-to-br from-purple-500 to-pink-500"
                    : "bg-slate-700"
                }`}
                style={{
                  filter: isRevealed ? "none" : "blur(20px)",
                }}
              >
                {isRevealed && (
                  <div className="text-center p-6">
                    {currentPlayer.role === "impostor" ? (
                      <>
                        <div className="text-6xl mb-2">😈</div>
                        <p className="text-white font-black text-2xl">
                          Você é o Impostor!
                        </p>
                      </>
                    ) : (
                      <p className="text-white font-black text-3xl">
                        {currentPlayer.word}
                      </p>
                    )}
                  </div>
                )}
                {!isRevealed && (
                  <div className="text-slate-500 text-xl">???</div>
                )}
              </div>
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
  );
}
