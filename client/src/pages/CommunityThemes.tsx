import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, Plus, Heart, Play, TrendingUp, Clock, Star, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import backgroundImg from "@assets/background_natal_1765071997985.png";
import logoTikjogos from "@assets/logo tikjogos_1764616571363.png";

type PublicTheme = {
  id: string;
  titulo: string;
  autor: string;
  palavrasCount: number;
  accessCode: string;
  createdAt: string;
  emoji?: string;
  plays?: number;
  likes?: number;
  isHot?: boolean;
};

export default function CommunityThemes() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [publicThemes, setPublicThemes] = useState<PublicTheme[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"trending" | "new" | "popular">("trending");

  useEffect(() => {
    loadPublicThemes();
  }, []);

  const loadPublicThemes = async () => {
    setIsLoadingThemes(true);
    try {
      const res = await fetch("/api/themes/public");
      if (res.ok) {
        const themes = await res.json();
        // Enrich themes with mock data for better UX
        const enrichedThemes = themes.map((theme: PublicTheme, index: number) => ({
          ...theme,
          emoji: ["🎮", "🎯", "🎲", "🎪", "🎨", "🎭", "🎬", "🎤", "🎸", "⚽"][index % 10],
          plays: Math.floor(Math.random() * 1000) + 50,
          likes: Math.floor(Math.random() * 200) + 10,
          isHot: index < 2,
        }));
        setPublicThemes(enrichedThemes);
      }
    } catch (err) {
      console.error("Failed to load themes:", err);
      toast({ title: "Erro", description: "Falha ao carregar temas", variant: "destructive" });
    } finally {
      setIsLoadingThemes(false);
    }
  };

  const filteredThemes = publicThemes.filter(
    (theme) =>
      theme.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.autor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlayTheme = async (theme: PublicTheme) => {
    try {
      // Store theme data for immediate game start
      sessionStorage.setItem("selectedThemeId", theme.id);
      sessionStorage.setItem("selectedThemeCode", theme.accessCode);
      sessionStorage.setItem("autoStartGame", "true");
      
      // Redirect to game
      setLocation("/");
      
      toast({ 
        title: "Iniciando jogo!", 
        description: `Preparando "${theme.titulo}" para jogar` 
      });
    } catch (error) {
      console.error("Error starting game:", error);
      toast({ 
        title: "Erro", 
        description: "Não foi possível iniciar o jogo", 
        variant: "destructive" 
      });
    }
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
            Temas da Comunidade
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Explore, jogue e divirta-se com temas criados por jogadores como você!
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar tema (ex: Futebol, Anime...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-[#16213e]/80 backdrop-blur-sm border-2 border-[#3d4a5c] rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-[#6b4ba3] transition-all text-lg"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex justify-center gap-2 p-1.5 bg-[#16213e]/50 backdrop-blur-sm rounded-2xl border border-[#3d4a5c] max-w-md mx-auto">
            <button
              onClick={() => setFilterTab("trending")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                filterTab === "trending"
                  ? "bg-[#6b4ba3] text-white shadow-lg shadow-[#6b4ba3]/50"
                  : "text-gray-400 hover:text-white hover:bg-[#3d4a5c]/30"
              )}
            >
              <TrendingUp className="w-4 h-4" />
              Em Alta
            </button>
            <button
              onClick={() => setFilterTab("new")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                filterTab === "new"
                  ? "bg-[#6b4ba3] text-white shadow-lg shadow-[#6b4ba3]/50"
                  : "text-gray-400 hover:text-white hover:bg-[#3d4a5c]/30"
              )}
            >
              <Clock className="w-4 h-4" />
              Novos
            </button>
            <button
              onClick={() => setFilterTab("popular")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                filterTab === "popular"
                  ? "bg-[#6b4ba3] text-white shadow-lg shadow-[#6b4ba3]/50"
                  : "text-gray-400 hover:text-white hover:bg-[#3d4a5c]/30"
              )}
            >
              <Star className="w-4 h-4" />
              Popular
            </button>
          </div>
        </div>

        {/* Themes Grid */}
        {isLoadingThemes ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-[#6b4ba3]" />
          </div>
        ) : filteredThemes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🎮</div>
            <h3 className="text-2xl font-bold text-white mb-3">
              {searchQuery ? "Nenhum tema encontrado" : "Nenhum tema disponível ainda"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery ? "Tente buscar por outro termo" : "Seja o primeiro a criar um tema incrível!"}
            </p>
            <Link href="/">
              <button className="btn-orange px-8 py-3 text-base inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Criar Tema
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Create New Card */}
            <Link href="/">
              <div className="group relative h-72 rounded-3xl border-2 border-dashed border-[#3d4a5c] hover:border-[#6b4ba3] bg-[#16213e]/20 hover:bg-[#16213e]/40 backdrop-blur-sm transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-4 text-center p-6">
                <div className="w-20 h-20 rounded-full bg-[#6b4ba3]/10 group-hover:bg-[#6b4ba3]/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                  <Plus className="w-10 h-10 text-[#6b4ba3]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#6b4ba3] transition-colors">
                    Criar Novo Tema
                  </h3>
                  <p className="text-sm text-gray-400 mt-2 group-hover:text-gray-300">
                    Sua ideia pode ser o próximo sucesso!
                  </p>
                </div>
              </div>
            </Link>

            {/* Theme Cards */}
            {filteredThemes.map((theme) => (
              <div
                key={theme.id}
                className="group relative h-72 bg-[#16213e]/80 backdrop-blur-sm rounded-3xl border border-[#3d4a5c] overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#6b4ba3]/20 transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Header with Gradient and Emoji */}
                <div className="h-24 w-full bg-gradient-to-r from-[#6b4ba3] to-[#4a3070] relative flex items-center justify-center">
                  <div className="absolute -bottom-10 w-20 h-20 bg-[#16213e] rounded-full flex items-center justify-center border-4 border-[#16213e] shadow-lg text-4xl">
                    {theme.emoji || "🎯"}
                  </div>
                  {/* Hot Badge */}
                  {theme.isHot && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                      <TrendingUp className="w-3 h-3" />
                      HOT
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="pt-12 px-6 pb-4 flex-1 flex flex-col items-center text-center">
                  <h3 className="text-xl font-bold text-white mb-1 truncate w-full group-hover:text-[#6b4ba3] transition-colors">
                    {theme.titulo}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mb-4">
                    por <span className="text-gray-300">@{theme.autor}</span>
                  </p>

                  {/* Stats */}
                  <div className="mt-auto flex items-center justify-center gap-4 w-full pt-4 border-t border-[#3d4a5c]">
                    <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-semibold">{theme.palavrasCount}</span>
                    </div>
                    {theme.plays !== undefined && (
                      <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                        <Play className="w-4 h-4 fill-gray-400" />
                        <span className="font-semibold">
                          {theme.plays >= 1000 ? (theme.plays / 1000).toFixed(1) + "k" : theme.plays}
                        </span>
                      </div>
                    )}
                    {theme.likes !== undefined && (
                      <div className="flex items-center gap-1.5 text-pink-400 text-sm">
                        <Heart className="w-4 h-4 fill-pink-400" />
                        <span className="font-semibold">{theme.likes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-[#0a1628]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                  <button
                    onClick={() => handlePlayTheme(theme)}
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
