import { useEffect } from "react";
import { Link } from "wouter";
import { Rocket, Star, Key, MapPin, Package, Users, HelpCircle, Youtube, Instagram, MessageCircle } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { SideAds, BottomAd } from "@/components/AdSense";
import logoTikjogos from "@assets/logo tikjogos_1764616571363.png";

interface GameMode {
  id: string;
  title: string;
  desc: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  iconName: string;
}

const GAME_MODES: GameMode[] = [
  {
    id: 'palavra-secreta',
    title: 'Palavra Secreta',
    desc: 'Uma palavra para todos. O Impostor tenta adivinhar!',
    difficulty: 'Fácil',
    iconName: 'Key'
  },
  {
    id: 'locais-funcoes',
    title: 'Locais & Funções',
    desc: 'Cada um recebe um Local e uma Função. O Impostor não sabe o local.',
    difficulty: 'Médio',
    iconName: 'MapPin'
  },
  {
    id: 'categoria-item',
    title: 'Categoria + Item',
    desc: 'Todos sabem a categoria e o item. O Impostor só sabe a categoria.',
    difficulty: 'Médio',
    iconName: 'Package'
  },
  {
    id: 'duas-faccoes',
    title: 'Duas Facções',
    desc: 'Dois times com palavras diferentes. O Impostor não sabe nenhuma.',
    difficulty: 'Difícil',
    iconName: 'Users'
  },
  {
    id: 'perguntas-diferentes',
    title: 'Perguntas Diferentes',
    desc: 'Tripulantes e Impostor recebem perguntas parecidas, mas diferentes.',
    difficulty: 'Difícil',
    iconName: 'HelpCircle'
  }
];

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  Key,
  MapPin,
  Package,
  Users,
  HelpCircle
};

export default function GameModes() {
  useEffect(() => {
    document.title = "Modos de Jogo - TikJogos Impostor";
    window.scrollTo(0, 0);
  }, []);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Fácil': return 'bg-emerald-500 text-white border-emerald-700';
      case 'Médio': return 'bg-orange-500 text-white border-orange-700';
      case 'Difícil': return 'bg-rose-500 text-white border-rose-700';
      default: return 'bg-slate-700 text-white border-slate-900';
    }
  };

  const getIconColor = (diff: string) => {
    switch (diff) {
      case 'Fácil': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Médio': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Difícil': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ backgroundColor: '#1a1b2e' }}>
      {/* Navigation */}
      <MobileNav />

      {/* Side Ads */}
      <SideAds />

      {/* Bottom Ad */}
      <BottomAd />

      <main className="flex-grow pb-20 pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 rounded-2xl border-2 border-purple-500/20 text-purple-400 font-black text-sm uppercase tracking-widest mb-6">
              <Rocket className="w-5 h-5" /> PREPARE SUA TRIPULAÇÃO
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl text-white font-black mb-6 leading-none">
              Modos de <span className="text-purple-500">Jogo</span>
            </h1>
            <p className="text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto font-medium">
              Escolha sua missão. Cada modo oferece uma dinâmica única de dedução e estratégia.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {GAME_MODES.map((mode) => {
              const IconComponent = iconMap[mode.iconName] || HelpCircle;
              
              return (
                <div
                  key={mode.id}
                  className="group relative p-8 rounded-[3rem] bg-[#242642] border-4 border-[#2f3252] shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                >
                  {/* Header do Card */}
                  <div className="flex justify-between items-start mb-8">
                    <div className={`p-4 rounded-3xl border-2 transition-all group-hover:scale-110 ${getIconColor(mode.difficulty)}`}>
                      <IconComponent size={32} strokeWidth={2.5} />
                    </div>
                    
                    <div className={`text-xs font-black px-4 py-1.5 rounded-full border-2 uppercase tracking-widest ${getDifficultyColor(mode.difficulty)}`}>
                      {mode.difficulty}
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="space-y-4">
                    <h3 className="text-3xl text-white font-black leading-tight group-hover:text-purple-400 transition-colors">
                      {mode.title}
                    </h3>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed">
                      {mode.desc}
                    </p>
                  </div>

                  {/* Bottom Decor */}
                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#242642] bg-slate-700 flex items-center justify-center text-[10px] font-black text-white">
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                      ))}
                    </div>
                    <button className="px-6 py-2 bg-slate-800 hover:bg-purple-600 rounded-xl font-black text-xs text-white uppercase tracking-wider transition-all">
                      Selecionar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Footer Section */}
          <section className="mt-24 p-12 rounded-[4rem] bg-gradient-to-br from-purple-600 to-indigo-900 border-4 border-white/10 relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl text-white font-black mb-6">PRONTO PARA A SABOTAGEM?</h2>
              <p className="text-white/80 text-xl font-medium max-w-2xl mx-auto mb-10">
                A nave está prestes a decolar. Reúna seus amigos e descubra quem é o impostor agora mesmo!
              </p>
              <Link 
                href="/"
                className="inline-block px-12 py-5 bg-white text-purple-900 rounded-3xl font-black text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all border-b-8 border-purple-200"
              >
                LANÇAR NAVE
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] border-t-8 border-[#242642] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <Link href="/" className="flex items-center cursor-pointer">
                <img src={logoTikjogos} alt="TikJogos Impostor" className="h-16 w-auto object-contain" />
              </Link>
              <p className="text-slate-400 max-w-md text-lg font-medium">
                A experiência definitiva de dedução social no espaço. Junte-se a milhares de tripulantes e descubra quem é o traidor.
              </p>
              <div className="flex gap-4">
                <a href="https://www.youtube.com/@RAPMUGEN?sub_confirmation=1" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-slate-800 hover:bg-purple-600 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1">
                  <Youtube className="w-6 h-6 text-white" />
                </a>
                <a href="https://www.instagram.com/jogodoimpostor/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-slate-800 hover:bg-purple-600 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1">
                  <Instagram className="w-6 h-6 text-white" />
                </a>
                <a href="https://discord.gg/H3cjkcd7Pz" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-slate-800 hover:bg-purple-600 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1">
                  <MessageCircle className="w-6 h-6 text-white" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-black mb-6 text-xl uppercase tracking-tighter">NAVEGAÇÃO</h4>
              <ul className="flex flex-col gap-3 text-slate-400 font-bold">
                <li><Link href="/" className="hover:text-purple-400 transition-colors">Início</Link></li>
                <li><Link href="/blog" className="hover:text-purple-400 transition-colors">Blog</Link></li>
                <li><Link href="/comojogar" className="hover:text-purple-400 transition-colors">Como Jogar</Link></li>
                <li><Link href="/modos" className="hover:text-purple-400 transition-colors">Modos de Jogo</Link></li>
                <li><Link href="/termos" className="hover:text-purple-400 transition-colors">Termos de Uso</Link></li>
                <li><Link href="/privacidade" className="hover:text-purple-400 transition-colors">Privacidade</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black mb-6 text-xl uppercase tracking-tighter">SUPORTE</h4>
              <ul className="flex flex-col gap-3 text-slate-400 font-bold">
                <li><Link href="/" className="hover:text-purple-400 transition-colors">FAQ</Link></li>
                <li><Link href="/" className="hover:text-purple-400 transition-colors">Reportar Bug</Link></li>
                <li><Link href="/" className="hover:text-purple-400 transition-colors">Contato</Link></li>
                <li><a href="https://discord.gg/H3cjkcd7Pz" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">Discord Oficial</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div className="space-y-2">
              <p className="text-slate-500 font-bold">© 2026 TikJogos Entertainment. Todos os direitos reservados.</p>
              <p className="text-slate-600 text-[10px] md:text-xs italic max-w-3xl leading-relaxed">
                O TikJogos é um projeto independente de fãs. Todas as marcas registradas pertencem aos seus respectivos proprietários.
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
