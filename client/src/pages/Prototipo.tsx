import { useEffect } from "react";
import { Link } from "wouter";
import backgroundImg from "@assets/background_natal_1765071997985.png";
import logoTikjogos from "@assets/logo tikjogos_1764616571363.png";

export default function Prototipo() {
  useEffect(() => {
    // Carregar o sistema de anúncios
    const script = document.createElement('script');
    script.src = '/ad-engine.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      className="min-h-screen w-full relative"
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
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Voltar ao Jogo
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-[#0a1628]/90 backdrop-blur-sm rounded-2xl border border-[#3d4a5c] p-6">
              <h2 className="text-xl font-bold text-white mb-4">Menu</h2>
              <nav className="space-y-2">
                <a href="#" className="block text-gray-300 hover:text-white transition-colors py-2">
                  Jogos
                </a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors py-2">
                  Notícias
                </a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors py-2">
                  Comunidade
                </a>
              </nav>
            </div>

            {/* Ad Slot - Sidebar */}
            <div id="partner-slot-sidebar" className="partner-content-wrapper"></div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9 space-y-6">
            {/* Hero Section */}
            <div className="bg-[#0a1628]/90 backdrop-blur-sm rounded-2xl border border-[#3d4a5c] p-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                Bem-vindo ao TikJogos - Protótipo de Anúncios
              </h1>
              <p className="text-gray-300 text-lg mb-6">
                Esta é uma página de demonstração do sistema de gerenciamento de anúncios (House Ads).
                Os banners são carregados dinamicamente com base em peso e categoria.
              </p>
              
              {/* Ad Slot - Top Banner */}
              <div id="partner-slot-top" className="partner-content-wrapper mb-6"></div>

              <div className="prose prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-white mb-3">Características do Sistema</h2>
                <ul className="text-gray-300 space-y-2">
                  <li>✅ Weighted Random Algorithm - Anúncios com maior peso aparecem mais</li>
                  <li>✅ Filtragem por dispositivo (mobile/desktop)</li>
                  <li>✅ Anti-AdBlock naming conventions</li>
                  <li>✅ Tracking de cliques</li>
                  <li>✅ Design responsivo e moderno</li>
                  <li>✅ Performance otimizada</li>
                </ul>

                <h2 className="text-2xl font-bold text-white mt-8 mb-3">Como Funciona</h2>
                <p className="text-gray-300">
                  O sistema carrega anúncios de um arquivo JSON (ads-data.js) e os renderiza
                  dinamicamente usando JavaScript puro. Cada anúncio tem um "peso" que determina
                  sua probabilidade de exibição.
                </p>

                {/* Ad Slot - Middle Content */}
                <div id="partner-slot-middle" className="partner-content-wrapper my-8"></div>

                <h2 className="text-2xl font-bold text-white mt-8 mb-3">Exemplo de Conteúdo</h2>
                <p className="text-gray-300 mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                  nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p className="text-gray-300 mb-4">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
                  eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
                  in culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </div>
            </div>

            {/* Ad Slot - Bottom Banner */}
            <div id="partner-slot-bottom" className="partner-content-wrapper"></div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-[#0a1628]/90 backdrop-blur-sm rounded-2xl border border-[#3d4a5c] p-6 hover:border-[#6b4ba3] transition-all"
                >
                  <h3 className="text-xl font-bold text-white mb-2">Card {i}</h3>
                  <p className="text-gray-300 text-sm">
                    Exemplo de conteúdo do card. Clique para saber mais sobre este item.
                  </p>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0a1628]/90 backdrop-blur-sm border-t border-[#3d4a5c] mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 TikJogos - Protótipo de Sistema de Anúncios
          </p>
        </div>
      </footer>
    </div>
  );
}
