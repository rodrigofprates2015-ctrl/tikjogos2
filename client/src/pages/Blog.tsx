import { Link } from "wouter";
import { useEffect } from "react";
import { Clock, Ghost, ArrowRight } from "lucide-react";
import logoTikjogos from "@assets/logo tikjogos_1764616571363.png";
import { articles } from "@/data/articles";

export default function Blog() {
  useEffect(() => {
    document.title = "TikJogos Blog - Domine o Jogo do Impostor";
    window.scrollTo(0, 0);
  }, []);

  const getBadgeColor = (type: string) => {
    if (type === "Pilar") return "bg-[#4a90a4] text-white";
    return "bg-[#3d4a5c] text-gray-300";
  };

  return (
    <div 
      className="min-h-screen w-full relative flex flex-col"
      style={{
        backgroundColor: '#063970'
      }}
    >
      <nav className="bg-[#0a1628]/90 backdrop-blur-sm border-b border-[#3d4a5c] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center cursor-pointer">
            <img src={logoTikjogos} alt="TikJogos" className="h-8" />
          </Link>
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Inicio
            </Link>
            <Link href="/comojogar" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Como Jogar
            </Link>
            <Link href="/" className="btn-orange px-4 py-2 text-sm" data-testid="button-play">
              Jogar Agora
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 md:py-20 fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Domine a Arte da <span className="text-[#4a90a4]">Deducao</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Dicas, estratégias e análises profundas sobre o Jogo do Impostor. Melhore sua lábia, descubra mentiras e organize partidas épicas.
          </p>
        </div>

        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-2xl font-bold text-white">Últimos Artigos</h2>
          <span className="text-gray-500 text-sm">{articles.length} publicacoes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 fade-in">
          {articles.map((article) => (
            <Link 
              key={article.id} 
              href={`/blog/${article.slug}`}
              className="group"
              data-testid={`card-article-${article.id}`}
            >
              <div className="bg-[#16213e]/80 border border-[#3d4a5c] rounded-lg overflow-hidden h-full flex flex-col transition-all hover:border-[#4a90a4]/50 hover:translate-y-[-4px] hover:shadow-lg hover:shadow-[#4a90a4]/10">
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-4 gap-2 flex-wrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(article.type)}`}>
                      {article.type}
                    </span>
                    <span className="text-gray-500 text-xs flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> {article.readTime}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#4a90a4] transition" data-testid={`text-title-${article.id}`}>
                    {article.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">
                    {article.summary}
                  </p>
                  <div className="mt-auto pt-4 border-t border-[#3d4a5c] flex items-center text-[#4a90a4] text-sm font-medium">
                    Ler artigo completo 
                    <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="bg-[#0a1628]/90 border-t border-[#3d4a5c] py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2024 TikJogos. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <Link href="/privacidade" className="text-gray-400 hover:text-[#4a90a4] text-sm transition">Privacidade</Link>
            <Link href="/termos" className="text-gray-400 hover:text-[#4a90a4] text-sm transition">Termos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
