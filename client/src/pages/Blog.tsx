import { useLocation } from "wouter";
import { useEffect } from "react";
import { Sparkles, TrendingUp, Zap, Youtube, Instagram, MessageCircle } from "lucide-react";
import BlogCard from "@/components/BlogCard";
import { BLOG_POSTS } from "@/data/blogPosts";
import { MobileNav } from "@/components/MobileNav";

export default function Blog() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Blog do Impostor - TikJogos";
    window.scrollTo(0, 0);
  }, []);

  const featured = BLOG_POSTS.find(p => p.featured) || BLOG_POSTS[0];
  const others = BLOG_POSTS.filter(p => p.id !== featured.id);

  const handleSelectPost = (id: string) => {
    setLocation(`/blog/${id}`);
  };

  return (
    <div 
      className="min-h-screen w-full relative flex flex-col"
      style={{ backgroundColor: '#1a1b2e' }}
    >
      {/* Navigation */}
      <MobileNav />

      <main className="flex-grow w-full">
        {/* Hero / Featured Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-16 overflow-hidden">
          {/* Background blobs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-rose-600/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

          <div className="max-w-7xl mx-auto">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-purple-400 font-black uppercase tracking-widest text-sm">
                  <Sparkles className="w-5 h-5" /> CENTRAL DE COMANDO
                </div>
                <h1 className="text-5xl md:text-7xl text-white font-black">
                  Blog do <span className="text-purple-500">Impostor</span>
                </h1>
                <p className="text-slate-400 text-xl max-w-2xl font-medium">
                  Notícias galácticas, estratégias de sabotagem e atualizações direto da central TikJogos.
                </p>
              </div>
            </header>

            {/* Featured Post */}
            <div 
              onClick={() => handleSelectPost(featured.id)}
              className="group relative rounded-[3rem] border-4 border-purple-500/30 bg-[#242642] overflow-hidden shadow-2xl hover:border-purple-500 transition-all cursor-pointer"
            >
              <div className="flex flex-col lg:flex-row min-h-[500px]">
                <div className="lg:w-3/5 relative overflow-hidden">
                  <img src={featured.image} alt={featured.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#242642] via-transparent to-transparent hidden lg:block"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#242642] via-transparent to-transparent lg:hidden"></div>
                </div>
                
                <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center space-y-6">
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 rounded-full w-fit border-2 border-purple-800 font-black text-xs uppercase text-white animate-pulse">
                    <TrendingUp className="w-4 h-4" /> DESTAQUE DA SEMANA
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl text-white leading-tight font-black group-hover:text-purple-400 transition-colors">
                    {featured.title}
                  </h2>
                  
                  <p className="text-slate-400 text-lg font-medium leading-relaxed">
                    {featured.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    <img src={featured.author.avatar} alt={featured.author.name} className="w-12 h-12 rounded-2xl border-2 border-purple-500/50" />
                    <div>
                      <p className="text-white font-black">{featured.author.name}</p>
                      <p className="text-slate-500 text-sm font-bold">{featured.date} • {featured.readTime} leitura</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Grid Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-500/10 rounded-2xl border-2 border-blue-500/20">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">MAIS TRANSMISSÕES</h2>
              <p className="text-slate-500 font-medium">Fique por dentro das últimas comunicações da nave</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {others.map((post) => (
              <BlogCard key={post.id} post={post} onClick={() => handleSelectPost(post.id)} />
            ))}
          </div>
        </section>
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
