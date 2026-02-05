import { Link, useRoute, useLocation } from "wouter";
import { useEffect } from "react";
import { ArrowLeft, Clock, Calendar, Share2, MessageSquare, ThumbsUp, Youtube, Instagram, MessageCircle } from "lucide-react";
import { getBlogPostById, BLOG_POSTS } from "@/data/blogPosts";
import { MobileNav } from "@/components/MobileNav";

function ArticleNotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center bg-[#242642] border-4 border-[#2f3252] rounded-[3rem] p-12">
        <h1 className="text-3xl font-black text-white mb-4">Artigo não encontrado</h1>
        <p className="text-slate-400 mb-8 text-lg">O conteúdo que você está procurando não existe ou foi movido.</p>
        <Link href="/blog" className="inline-flex px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-full border-2 border-purple-800 transition-all">
          Voltar ao Blog
        </Link>
      </div>
    </div>
  );
}

export default function BlogPost() {
  const [, params] = useRoute("/blog/:id");
  const [, setLocation] = useLocation();
  const id = params?.id || "";
  const post = getBlogPostById(id);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (post) {
      document.title = `${post.title} - TikJogos Blog`;
    }
  }, [post]);

  const handleBack = () => {
    setLocation("/blog");
  };

  if (!post) {
    return (
      <div className="min-h-screen w-full" style={{ backgroundColor: '#1a1b2e' }}>
        <MobileNav />
        <ArticleNotFound />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ backgroundColor: '#1a1b2e' }}>
      {/* Navigation */}
      <MobileNav />

      <main className="flex-grow pb-20">
        {/* Article Header */}
        <div className="relative h-[400px] md:h-[600px] w-full">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b2e] via-[#1a1b2e]/60 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 w-full">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
              <button 
                onClick={handleBack}
                className="mb-8 flex items-center gap-2 px-6 py-2 bg-slate-900/80 backdrop-blur-md rounded-xl border-2 border-slate-700 text-white font-black hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
              >
                <ArrowLeft className="w-5 h-5" /> VOLTAR AO BLOG
              </button>
              
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <span className="px-4 py-1.5 bg-purple-600 rounded-full border-2 border-purple-800 font-black text-xs uppercase tracking-wider text-white shadow-lg">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300 font-bold text-sm bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4 text-purple-400" /> {post.date}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300 font-bold text-sm bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4 text-blue-400" /> {post.readTime}
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-6xl lg:text-7xl text-white leading-tight font-black drop-shadow-2xl">
                  {post.title}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="flex flex-col gap-12">
            
            {/* Article Body */}
            <article className="space-y-8 w-full">
              <div className="bg-[#242642] rounded-[3rem] p-8 md:p-12 border-4 border-[#2f3252] shadow-2xl relative overflow-hidden">
                {/* Subtle accent light */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 blur-[80px] rounded-full"></div>
                
                <div className="prose prose-invert prose-purple max-w-none relative z-10">
                  {post.content.split('\n').map((line, i) => {
                    if (line.startsWith('###')) {
                      return <h3 key={i} className="text-3xl font-black text-white mt-12 mb-6 uppercase tracking-tight border-b-2 border-purple-500/20 pb-2">{line.replace('###', '')}</h3>;
                    }
                    if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
                      return (
                        <div key={i} className="flex items-start gap-4 mb-4 bg-slate-800/50 p-6 rounded-2xl border-l-4 border-rose-500 shadow-md">
                          <span className="text-rose-400 font-black text-2xl">{line.split('.')[0]}.</span>
                          <p className="text-slate-200 text-lg leading-relaxed">{line.split('.').slice(1).join('.').trim()}</p>
                        </div>
                      );
                    }
                    if (line.startsWith('-')) {
                      return (
                        <div key={i} className="flex items-start gap-4 mb-4">
                          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 mt-2.5 shrink-0 shadow-[0_0_8px_rgba(139,92,246,0.6)]"></div>
                          <p className="text-slate-300 text-lg font-medium leading-relaxed">{line.replace('-', '').trim()}</p>
                        </div>
                      );
                    }
                    return line.trim() ? (
                      <p key={i} className="text-slate-400 text-xl font-medium leading-relaxed mb-6">
                        {line}
                      </p>
                    ) : null;
                  })}
                </div>

                {/* Interaction Bar */}
                <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 bg-purple-600/10 hover:bg-purple-600/20 border-2 border-purple-500/30 rounded-2xl text-purple-400 font-black transition-all hover:scale-105 active:scale-95">
                      <ThumbsUp className="w-5 h-5" /> 245
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 rounded-2xl text-slate-300 font-black transition-all hover:scale-105 active:scale-95">
                      <MessageSquare className="w-5 h-5" /> 18 Comentários
                    </button>
                  </div>
                  <button className="p-4 bg-slate-800 hover:bg-blue-600 rounded-2xl border-2 border-slate-700 transition-all text-white group shadow-lg">
                    <Share2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Author Card */}
              <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-[3rem] p-8 border-4 border-purple-500/20 flex flex-col md:flex-row items-center gap-8 shadow-xl">
                <img src={post.author.avatar} alt={post.author.name} className="w-32 h-32 rounded-[2rem] border-4 border-purple-500 shadow-xl object-cover" />
                <div className="text-center md:text-left flex-1">
                  <p className="text-purple-400 font-black text-sm uppercase tracking-widest mb-1">SOBRE O AUTOR</p>
                  <h4 className="text-3xl font-black text-white mb-2">{post.author.name}</h4>
                  <p className="text-slate-400 text-lg font-medium mb-4">{post.author.role}</p>
                  <div className="flex justify-center md:justify-start gap-4">
                    <button className="text-slate-500 hover:text-white transition-colors font-bold text-sm uppercase tracking-wider">Ver Perfil</button>
                    <button className="text-slate-500 hover:text-white transition-colors font-bold text-sm uppercase tracking-wider">Mais Artigos</button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] border-t-8 border-[#242642] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <Link href="/" className="flex items-center cursor-pointer">
                <img 
                  src={logoTikjogos} 
                  alt="TikJogos Impostor" 
                  className="h-16 w-auto object-contain"
                />
              </Link>
              <p className="text-slate-400 max-w-md text-lg font-medium">
                A experiência definitiva de dedução social no espaço. Junte-se a milhares de tripulantes e descubra quem é o traidor.
              </p>
              <div className="flex gap-4">
                <a href="https://www.youtube.com/@RAPMUGEN?sub_confirmation=1" target="_blank" rel="noopener noreferrer" title="YouTube" className="w-12 h-12 bg-slate-800 hover:bg-purple-600 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1">
                  <Youtube className="w-6 h-6 text-white" />
                </a>
                <a href="https://www.instagram.com/jogodoimpostor/" target="_blank" rel="noopener noreferrer" title="Instagram" className="w-12 h-12 bg-slate-800 hover:bg-purple-600 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1">
                  <Instagram className="w-6 h-6 text-white" />
                </a>
                <a href="https://discord.gg/H3cjkcd7Pz" target="_blank" rel="noopener noreferrer" title="Discord" className="w-12 h-12 bg-slate-800 hover:bg-purple-600 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1">
                  <MessageCircle className="w-6 h-6 text-white" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-black mb-6 text-xl uppercase tracking-tighter">NAVEGAÇÃO</h4>
              <ul className="flex flex-col gap-3 text-slate-400 font-bold text-left">
                <li><Link href="/" className="hover:text-purple-400 transition-colors">Início</Link></li>
                <li><Link href="/comojogar" className="hover:text-purple-400 transition-colors">Como Jogar</Link></li>
                <li><Link href="/modos" className="hover:text-purple-400 transition-colors">Modos de Jogo</Link></li>
                <li><Link href="/termos" className="hover:text-purple-400 transition-colors">Termos de Uso</Link></li>
                <li><Link href="/privacidade" className="hover:text-purple-400 transition-colors">Privacidade</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black mb-6 text-xl uppercase tracking-tighter">SUPORTE</h4>
              <ul className="flex flex-col gap-3 text-slate-400 font-bold text-left">
                <li><Link href="/" className="hover:text-purple-400 transition-colors">FAQ</Link></li>
                <li><Link href="/" className="hover:text-purple-400 transition-colors">Reportar Bug</Link></li>
                <li><Link href="/" className="hover:text-purple-400 transition-colors">Contato</Link></li>
                <li>
                  <a href="https://discord.gg/H3cjkcd7Pz" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
                    Discord Oficial
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div className="space-y-2">
              <p className="text-slate-500 font-bold">© 2026 TikJogos Entertainment. Todos os direitos reservados.</p>
              <p className="text-slate-600 text-[10px] md:text-xs italic max-w-3xl leading-relaxed">
                O TikJogos é um projeto independente de fãs. Todas as marcas registradas (como nomes de personagens e franquias) pertencem aos seus respectivos proprietários e são usadas aqui apenas para fins de referência em contexto de jogo de palavras/trivia.
              </p>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-bold whitespace-nowrap">
              <span>Feito com 💜 na Galáxia TikJogos</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
