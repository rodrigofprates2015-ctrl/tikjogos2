import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, Play, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import backgroundImg from "@assets/background_natal_1765071997985.png";
import logoTikjogos from "@assets/logo tikjogos_1764616571363.png";

type WordCategory = {
  id: string;
  name: string;
  emoji: string;
  words: string[];
  difficulty: "fácil" | "médio" | "difícil";
  plays?: number;
  isHot?: boolean;
};

const WORD_CATEGORIES: WordCategory[] = [
  {
    id: "animais",
    name: "Animais",
    emoji: "🦁",
    difficulty: "fácil",
    words: ["Leão", "Elefante", "Girafa", "Zebra", "Tigre", "Urso", "Panda", "Coala", "Canguru", "Pinguim"],
    plays: 1250,
    isHot: true
  },
  {
    id: "frutas",
    name: "Frutas",
    emoji: "🍎",
    difficulty: "fácil",
    words: ["Abacaxi", "Banana", "Manga", "Uva", "Melancia", "Morango", "Laranja", "Limão", "Kiwi", "Maçã"],
    plays: 980
  },
  {
    id: "objetos",
    name: "Objetos do Dia a Dia",
    emoji: "🔧",
    difficulty: "médio",
    words: ["Escada", "Relógio", "Espelho", "Garfo", "Almofada", "Janela", "Tesoura", "Guarda-chuva", "Chave", "Caneta"],
    plays: 750,
    isHot: true
  },
  {
    id: "profissoes",
    name: "Profissões",
    emoji: "👨‍⚕️",
    difficulty: "médio",
    words: ["Médico", "Professor", "Bombeiro", "Policial", "Chef", "Piloto", "Dentista", "Mecânico", "Arquiteto", "Jornalista"],
    plays: 620
  },
  {
    id: "tecnologia",
    name: "Tecnologia",
    emoji: "💻",
    difficulty: "médio",
    words: ["Computador", "Celular", "Tablet", "Mouse", "Teclado", "Monitor", "Fone", "Carregador", "Webcam", "Impressora"],
    plays: 890
  },
  {
    id: "esportes",
    name: "Esportes",
    emoji: "⚽",
    difficulty: "fácil",
    words: ["Futebol", "Basquete", "Vôlei", "Tênis", "Natação", "Corrida", "Ciclismo", "Boxe", "Judô", "Skate"],
    plays: 1100
  },
  {
    id: "comidas",
    name: "Comidas",
    emoji: "🍕",
    difficulty: "fácil",
    words: ["Pizza", "Hambúrguer", "Sushi", "Pastel", "Feijoada", "Lasanha", "Tacos", "Panqueca", "Sorvete", "Bolo"],
    plays: 1350,
    isHot: true
  },
  {
    id: "lugares",
    name: "Lugares",
    emoji: "🏖️",
    difficulty: "médio",
    words: ["Praia", "Montanha", "Deserto", "Floresta", "Cidade", "Fazenda", "Ilha", "Caverna", "Vulcão", "Cachoeira"],
    plays: 540
  },
  {
    id: "veiculos",
    name: "Veículos",
    emoji: "🚗",
    difficulty: "fácil",
    words: ["Carro", "Moto", "Avião", "Barco", "Trem", "Ônibus", "Bicicleta", "Helicóptero", "Caminhão", "Submarino"],
    plays: 720
  },
  {
    id: "instrumentos",
    name: "Instrumentos Musicais",
    emoji: "🎸",
    difficulty: "médio",
    words: ["Violão", "Piano", "Bateria", "Flauta", "Saxofone", "Trompete", "Violino", "Harpa", "Gaita", "Pandeiro"],
    plays: 430
  },
  {
    id: "natureza",
    name: "Natureza",
    emoji: "🌳",
    difficulty: "médio",
    words: ["Árvore", "Flor", "Nuvem", "Estrela", "Sol", "Lua", "Chuva", "Vento", "Neve", "Arco-íris"],
    plays: 680
  },
  {
    id: "cientifico",
    name: "Científico",
    emoji: "🔬",
    difficulty: "difícil",
    words: ["Microscópio", "Telescópio", "Átomo", "Molécula", "Célula", "DNA", "Proteína", "Elétron", "Neurônio", "Enzima"],
    plays: 290
  }
];

export default function PalavraSecretaGallery() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [categories, setCategories] = useState<WordCategory[]>(WORD_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<"todos" | "fácil" | "médio" | "difícil">("todos");

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = filterDifficulty === "todos" || cat.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const handlePlayCategory = (category: WordCategory) => {
    // Store selected category for game
    sessionStorage.setItem("selectedGameMode", "palavraSecreta");
    sessionStorage.setItem("selectedCategory", category.id);
    sessionStorage.setItem("autoStartGame", "true");
    
    setLocation("/");
    
    toast({ 
      title: "Iniciando jogo!", 
      description: `Preparando categoria "${category.name}"` 
    });
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Navigation */}
      <nav className="bg-[#0a1628]/90 backdrop-blur-sm border-b border-[#3d4a5c] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center cursor-pointer">
            <img src={logoTikjogos} alt="TikJogos" className="h-8" />
          </Link>
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Voltar ao Jogo
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white drop-shadow-lg">
            Palavra Secreta
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Escolha uma categoria e divirta-se tentando descobrir a palavra secreta!
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar categoria (ex: Animais, Frutas...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-[#16213e]/80 backdrop-blur-sm border-2 border-[#3d4a5c] rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-[#6b4ba3] transition-all text-lg"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex justify-center gap-2 p-1.5 bg-[#16213e]/50 backdrop-blur-sm rounded-2xl border border-[#3d4a5c] max-w-md mx-auto">
            <button
              onClick={() => setFilterDifficulty("todos")}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                filterDifficulty === "todos"
                  ? "bg-[#6b4ba3] text-white shadow-lg shadow-[#6b4ba3]/50"
                  : "text-gray-400 hover:text-white hover:bg-[#3d4a5c]/30"
              )}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterDifficulty("fácil")}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                filterDifficulty === "fácil"
                  ? "bg-green-600 text-white shadow-lg shadow-green-600/50"
                  : "text-gray-400 hover:text-white hover:bg-[#3d4a5c]/30"
              )}
            >
              Fácil
            </button>
            <button
              onClick={() => setFilterDifficulty("médio")}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                filterDifficulty === "médio"
                  ? "bg-yellow-600 text-white shadow-lg shadow-yellow-600/50"
                  : "text-gray-400 hover:text-white hover:bg-[#3d4a5c]/30"
              )}
            >
              Médio
            </button>
            <button
              onClick={() => setFilterDifficulty("difícil")}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                filterDifficulty === "difícil"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/50"
                  : "text-gray-400 hover:text-white hover:bg-[#3d4a5c]/30"
              )}
            >
              Difícil
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🎮</div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Nenhuma categoria encontrada
            </h3>
            <p className="text-gray-400 mb-6">
              Tente buscar por outro termo
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="group relative h-72 bg-[#16213e]/80 backdrop-blur-sm rounded-3xl border border-[#3d4a5c] overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#6b4ba3]/20 transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Header with Gradient and Emoji */}
                <div className={cn(
                  "h-24 w-full relative flex items-center justify-center",
                  category.difficulty === "fácil" && "bg-gradient-to-r from-green-600 to-green-700",
                  category.difficulty === "médio" && "bg-gradient-to-r from-yellow-600 to-yellow-700",
                  category.difficulty === "difícil" && "bg-gradient-to-r from-red-600 to-red-700"
                )}>
                  <div className="absolute -bottom-10 w-20 h-20 bg-[#16213e] rounded-full flex items-center justify-center border-4 border-[#16213e] shadow-lg text-4xl">
                    {category.emoji}
                  </div>
                  {/* Hot Badge */}
                  {category.isHot && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                      🔥 HOT
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="pt-12 px-6 pb-4 flex-1 flex flex-col items-center text-center">
                  <h3 className="text-xl font-bold text-white mb-1 truncate w-full group-hover:text-[#6b4ba3] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mb-4 capitalize">
                    Dificuldade: {category.difficulty}
                  </p>

                  {/* Stats */}
                  <div className="mt-auto flex items-center justify-center gap-4 w-full pt-4 border-t border-[#3d4a5c]">
                    <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-semibold">{category.words.length} palavras</span>
                    </div>
                    {category.plays !== undefined && (
                      <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                        <Play className="w-4 h-4 fill-gray-400" />
                        <span className="font-semibold">
                          {category.plays >= 1000 ? (category.plays / 1000).toFixed(1) + "k" : category.plays}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-[#0a1628]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                  <button
                    onClick={() => handlePlayCategory(category)}
                    className="bg-[#6b4ba3] hover:bg-[#7b5bb3] text-white font-bold py-3 px-8 rounded-full transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg hover:shadow-[#6b4ba3]/50 flex items-center gap-2"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    JOGAR
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
