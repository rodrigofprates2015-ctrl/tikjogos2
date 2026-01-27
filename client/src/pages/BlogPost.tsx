import { Link, useRoute } from "wouter";
import { useEffect } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoTikjogos from "@assets/logo tikjogos_1764616571363.png";
import { getArticleBySlug } from "@/data/articles";
import { BlogAd } from "@/components/AdSense";

function ArticleNotFound() {
  return (
    <div className="text-center py-20 bg-[#16213e]/80 border border-[#3d4a5c] rounded-lg p-12 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-4">Artigo nao encontrado</h1>
      <p className="text-gray-400 mb-8">O conteúdo que você está procurando não existe ou foi movido.</p>
      <Link href="/blog">
        <Button className="btn-orange px-8" data-testid="button-back-to-blog">Voltar ao Blog</Button>
      </Link>
    </div>
  );
}

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";
  const article = getArticleBySlug(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (article) {
      document.title = `${article.title} - TikJogos Blog`;
    }
  }, [article]);

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
            <Link href="/blog" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Blog
            </Link>
            <Link href="/" className="btn-orange px-4 py-2 text-sm" data-testid="button-play">
              Jogar Agora
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!article ? (
          <ArticleNotFound />
        ) : (
          <div className="fade-in">
            <Link href="/blog" className="mb-8 flex items-center text-gray-400 hover:text-white transition" data-testid="button-back">
              <ArrowLeft className="h-5 w-5 mr-2" /> Voltar para Blog
            </Link>

            <header className="mb-10">
              <div className="flex items-center gap-4 mb-6 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-[#4a90a4]/20 text-[#4a90a4] text-sm border border-[#4a90a4]/30">
                  {article.type}
                </span>
                <span className="text-gray-500 text-sm flex items-center">
                  <Clock className="h-4 w-4 mr-1" /> {article.readTime} de leitura
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight" data-testid="text-title">
                {article.title}
              </h1>
              <p className="text-xl text-gray-400 italic border-l-4 border-[#4a90a4] pl-4 bg-[#16213e]/50 py-4 rounded-r-lg">
                {article.summary}
              </p>
            </header>

            <article className="bg-[#16213e]/80 border border-[#3d4a5c] rounded-lg p-8 md:p-12 mb-12">
              <div 
                className="prose prose-invert prose-lg text-gray-300 max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
              
              <BlogAd />
            </article>

            <div className="bg-[#16213e]/80 border border-[#3d4a5c] rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Pronto para colocar em prática?</h3>
              <p className="text-gray-400 mb-6">Junte seus amigos e organize uma partida agora mesmo usando o TikJogos.</p>
              <Link href="/">
                <Button className="btn-orange px-8 py-3 text-lg" data-testid="button-play-now">
                  Jogar Agora
                </Button>
              </Link>
            </div>
          </div>
        )}
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
