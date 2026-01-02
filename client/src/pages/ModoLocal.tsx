import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Users, Play, Plus, Minus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import logoTikjogos from "@assets/logo tikjogos_1764616571363.png";

type GameMode = "palavraSecreta" | "palavras" | "duasFaccoes";

const AVAILABLE_THEMES = [
  { id: "classico", name: "Clássico", mode: "palavraSecreta" },
  { id: "disney", name: "Disney", mode: "palavraSecreta" },
  { id: "futebol", name: "Futebol", mode: "palavraSecreta" },
  { id: "animais", name: "Animais", mode: "palavraSecreta" },
  { id: "profissoes", name: "Profissões", mode: "palavraSecreta" },
  { id: "comidas", name: "Comidas", mode: "palavraSecreta" },
];

export default function ModoLocal() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [numPlayers, setNumPlayers] = useState(3);
  const [numImpostors, setNumImpostors] = useState(1);
  const [playerNames, setPlayerNames] = useState<string[]>(["", "", ""]);
  const [selectedTheme, setSelectedTheme] = useState("");
  const [selectedMode, setSelectedMode] = useState<GameMode>("palavraSecreta");
  const [saveNamesChecked, setSaveNamesChecked] = useState(false);

  // Carregar nomes salvos ao montar o componente
  useEffect(() => {
    const savedNames = localStorage.getItem("modoLocal_playerNames");
    const savedNumPlayers = localStorage.getItem("modoLocal_numPlayers");
    const savedNumImpostors = localStorage.getItem("modoLocal_numImpostors");
    
    if (savedNames) {
      const names = JSON.parse(savedNames);
      setPlayerNames(names);
      setNumPlayers(names.length);
      setSaveNamesChecked(true);
    }
    
    if (savedNumPlayers) {
      setNumPlayers(parseInt(savedNumPlayers));
    }
    
    if (savedNumImpostors) {
      setNumImpostors(parseInt(savedNumImpostors));
    }
  }, []);

  const handleNumPlayersChange = (delta: number) => {
    const newNum = Math.max(3, Math.min(10, numPlayers + delta));
    setNumPlayers(newNum);
    
    const newNames = [...playerNames];
    if (newNum > playerNames.length) {
      for (let i = playerNames.length; i < newNum; i++) {
        newNames.push("");
      }
    } else {
      newNames.length = newNum;
    }
    setPlayerNames(newNames);
    
    if (numImpostors >= newNum) {
      setNumImpostors(Math.max(1, newNum - 1));
    }
    
    // Salvar no localStorage apenas se checkbox estiver marcado
    if (saveNamesChecked) {
      localStorage.setItem("modoLocal_numPlayers", newNum.toString());
    }
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
    
    // Salvar no localStorage apenas se checkbox estiver marcado
    if (saveNamesChecked) {
      localStorage.setItem("modoLocal_playerNames", JSON.stringify(newNames));
    }
  };

  const handleClearNames = () => {
    localStorage.removeItem("modoLocal_playerNames");
    localStorage.removeItem("modoLocal_numPlayers");
    localStorage.removeItem("modoLocal_numImpostors");
    setPlayerNames(Array(numPlayers).fill(""));
    setSaveNamesChecked(false);
    toast({
      title: "Nomes limpos",
      description: "Os nomes salvos foram removidos"
    });
  };

  const handleStartGame = () => {
    // Validações
    if (!selectedTheme) {
      toast({
        title: "Selecione um tema",
        description: "Escolha um tema para jogar",
        variant: "destructive"
      });
      return;
    }

    const emptyNames = playerNames.filter(name => !name.trim());
    if (emptyNames.length > 0) {
      toast({
        title: "Preencha todos os nomes",
        description: "Todos os jogadores precisam ter um nome",
        variant: "destructive"
      });
      return;
    }

    if (numImpostors >= numPlayers) {
      toast({
        title: "Número de impostores inválido",
        description: "Deve haver pelo menos 1 jogador comum",
        variant: "destructive"
      });
      return;
    }

    // Salvar nomes e configurações no localStorage apenas se checkbox estiver marcado
    if (saveNamesChecked) {
      localStorage.setItem("modoLocal_playerNames", JSON.stringify(playerNames.filter(n => n.trim())));
      localStorage.setItem("modoLocal_numPlayers", numPlayers.toString());
      localStorage.setItem("modoLocal_numImpostors", numImpostors.toString());
    }

    // Salvar configuração no sessionStorage
    const config = {
      players: playerNames.filter(n => n.trim()),
      numImpostors,
      theme: selectedTheme,
      mode: selectedMode
    };
    
    sessionStorage.setItem("modoLocalConfig", JSON.stringify(config));
    
    // Redirecionar para a página do jogo
    setLocation("/modo-local/jogo");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a2a3a] to-[#0a1628] flex flex-col">
      {/* Header com logo e botão voltar */}
      <div className="w-full bg-[#0a1628]/90 backdrop-blur-sm border-b border-[#3d4a5c] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 cursor-pointer group">
            <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            <img src={logoTikjogos} alt="TikJogos" className="h-8" />
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-[#16213e]/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-[#3d4a5c]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">
              Modo Local
            </h1>
            <p className="text-slate-400">
              Configure o jogo para jogar em um só celular
            </p>
          </div>

        {/* Número de Jogadores */}
        <div className="mb-6">
          <Label className="text-white font-bold mb-2 block">
            Número de Jogadores
          </Label>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => handleNumPlayersChange(-1)}
              disabled={numPlayers <= 3}
              className="bg-slate-700 hover:bg-slate-600"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <div className="flex-1 text-center">
              <span className="text-4xl font-black text-white">{numPlayers}</span>
            </div>
            <Button
              onClick={() => handleNumPlayersChange(1)}
              disabled={numPlayers >= 10}
              className="bg-slate-700 hover:bg-slate-600"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Nomes dos Jogadores */}
        <div className="mb-6">
          <Label className="text-white font-bold mb-2 block">
            Nome dos Jogadores
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {playerNames.map((name, index) => (
              <Input
                key={index}
                placeholder={`Jogador ${index + 1}`}
                value={name}
                onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            ))}
          </div>
          
          {/* Checkbox para guardar nomes */}
          <div className="flex items-center justify-between px-1 mt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={saveNamesChecked}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSaveNamesChecked(checked);
                  
                  if (checked) {
                    // Salvar imediatamente quando marcar
                    localStorage.setItem("modoLocal_playerNames", JSON.stringify(playerNames));
                    localStorage.setItem("modoLocal_numPlayers", numPlayers.toString());
                    localStorage.setItem("modoLocal_numImpostors", numImpostors.toString());
                  }
                }}
                className="w-4 h-4 rounded bg-[#1a2a3a] border-2 border-[#4a6a8a] cursor-pointer accent-[#e8a045]"
              />
              <span className="text-sm text-[#8aa0b0]">Guardar nomes</span>
            </label>
            {saveNamesChecked && playerNames.some(n => n.trim()) && (
              <button
                onClick={handleClearNames}
                className="text-xs text-[#6a8aaa] hover:text-white transition-colors underline"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Número de Impostores */}
        <div className="mb-6">
          <Label className="text-white font-bold mb-2 block">
            Número de Impostores
          </Label>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                const newNum = Math.max(1, numImpostors - 1);
                setNumImpostors(newNum);
                if (saveNamesChecked) {
                  localStorage.setItem("modoLocal_numImpostors", newNum.toString());
                }
              }}
              disabled={numImpostors <= 1}
              className="bg-slate-700 hover:bg-slate-600"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <div className="flex-1 text-center">
              <span className="text-4xl font-black text-white">{numImpostors}</span>
            </div>
            <Button
              onClick={() => {
                const newNum = Math.min(numPlayers - 1, numImpostors + 1);
                setNumImpostors(newNum);
                if (saveNamesChecked) {
                  localStorage.setItem("modoLocal_numImpostors", newNum.toString());
                }
              }}
              disabled={numImpostors >= numPlayers - 1}
              className="bg-slate-700 hover:bg-slate-600"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Seleção de Tema */}
        <div className="mb-8">
          <Label className="text-white font-bold mb-2 block">
            Escolha o Tema
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {AVAILABLE_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  setSelectedTheme(theme.id);
                  setSelectedMode(theme.mode as GameMode);
                }}
                className={`p-4 rounded-xl font-bold transition-all ${
                  selectedTheme === theme.id
                    ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-105"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>

        {/* Botão Iniciar */}
        <Button
          onClick={handleStartGame}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black text-lg py-6 rounded-xl border-b-[6px] border-purple-800 active:border-b-0 active:translate-y-2 transition-all"
        >
          <Play className="w-6 h-6 mr-2" />
          Começar Jogo
        </Button>
        </div>
      </div>
    </div>
  );
}
