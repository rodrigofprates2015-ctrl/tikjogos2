
import React from 'react';
import { Youtube, HelpCircle, MessageSquare, Instagram, MessageCircle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const logoUrl = "https://tikjogos.com.br/assets/logo_site_impostor_1765071990526-D5j7bYDx.png";

  const navigateTo = (path: string) => {
    window.location.hash = path;
    window.scrollTo(0, 0);
  };

  const handlePlayClick = () => {
    window.location.href = 'https://tikjogos.com.br/';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1b2e] selection:bg-purple-500 selection:text-white">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#1a1b2e]/80 backdrop-blur-md border-b-4 border-[#242642]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center group cursor-pointer" onClick={() => navigateTo('#/')}>
              <img 
                src={logoUrl} 
                alt="TikJogos Impostor" 
                className="h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => navigateTo('#/')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white font-bold transition-colors"
              >
                <MessageSquare size={18} /> Blog
              </button>
              <button 
                onClick={() => navigateTo('#/como-jogar')}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white font-bold transition-colors"
              >
                <HelpCircle size={20} /> Como Jogar
              </button>
              <button 
                onClick={handlePlayClick}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 border-b-4 border-purple-800 rounded-xl font-black text-white transition-all active:translate-y-1 active:border-b-0"
              >
                JOGAR
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] border-t-8 border-[#242642] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center cursor-pointer" onClick={() => navigateTo('#/')}>
                <img 
                  src={logoUrl} 
                  alt="TikJogos Impostor" 
                  className="h-16 w-auto object-contain"
                />
              </div>
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
                <li><button onClick={() => navigateTo('#/')} className="hover:text-purple-400 transition-colors">Início</button></li>
                <li><button onClick={() => navigateTo('#/como-jogar')} className="hover:text-purple-400 transition-colors">Como Jogar</button></li>
                <li><button onClick={() => navigateTo('#/modos')} className="hover:text-purple-400 transition-colors">Modos de Jogo</button></li>
                <li><button onClick={() => navigateTo('#/termos')} className="hover:text-purple-400 transition-colors">Termos de Uso</button></li>
                <li><button onClick={() => navigateTo('#/privacidade')} className="hover:text-purple-400 transition-colors">Privacidade</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black mb-6 text-xl uppercase tracking-tighter">SUPORTE</h4>
              <ul className="flex flex-col gap-3 text-slate-400 font-bold text-left">
                <li><button onClick={() => navigateTo('#/')} className="hover:text-purple-400 transition-colors">FAQ</button></li>
                <li><button onClick={() => navigateTo('#/')} className="hover:text-purple-400 transition-colors">Reportar Bug</button></li>
                <li><button onClick={() => navigateTo('#/')} className="hover:text-purple-400 transition-colors">Contato</button></li>
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
};

export default Layout;
