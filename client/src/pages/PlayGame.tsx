import { useLocation, useRoute } from "wouter";
import { ArrowLeft, RotateCcw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import gameFeed from "@/assets/feed_1768102619275.json";
import { AdBlockBottom } from "@/components/AdBlocks";

export default function PlayGame() {
  const [, params] = useRoute("/jogar/:id");
  const gameId = params?.id;
  const game = gameFeed.find((g) => g.id === gameId);
  const [key, setKey] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Bloquear anúncios laterais do AdSense (Auto Ads) nesta página
    const style = document.createElement('style');
    style.id = 'hide-adsense-sidebars';
    style.innerHTML = `
      /* Ocultar trilhos laterais e containers automáticos */
      .google-ads-side-rail,
      .google-ads-side-rail-container,
      .google-ads-side-rail-left,
      .google-ads-side-rail-right,
      .google-ads-vignette,
      #google_ads_iframe_auto_ads,
      div[id^="google_ads_iframe_auto_ads"],
      div[class*="google-auto-placed"],
      ins.adsbygoogle[data-ad-format="vertical"],
      ins.adsbygoogle[data-ad-format="rectangle"],
      ins.adsbygoogle[data-ad-format="auto"]:not(footer .adsbygoogle) {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        height: 0 !important;
        width: 0 !important;
      }

      /* Tentar bloquear o iframe específico por nome se ele for injetado */
      iframe[name^="google_ads_iframe"]:not(footer iframe),
      iframe[id^="google_ads_iframe"]:not(footer iframe) {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }

      /* Garantir que o jogo ocupe o espaço correto */
      main {
        z-index: 50 !important;
      }

      /* Permitir apenas o anúncio do footer */
      footer .adsbygoogle,
      footer .adsbygoogle * {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        height: auto !important;
        width: auto !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById('hide-adsense-sidebars');
      if (existingStyle) existingStyle.remove();
    };
  }, [gameId, key]);

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#121a31] text-white p-4">
        <h1 className="text-2xl font-bold mb-4">Jogo não encontrado</h1>
        <Button onClick={() => window.history.back()}>Voltar para Outros Jogos</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#121a31] overflow-hidden">
      <header className="flex items-center justify-between p-3 border-b border-[#3a3a3c] bg-[#1a1a1b] shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            className="text-white hover:bg-[#3a3a3c]"
            data-testid="button-back-play"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <img src={game.thumb} alt="" className="w-8 h-8 rounded object-cover border border-[#3a3a3c]" />
            <h1 className="text-sm md:text-base font-bold text-white truncate max-w-[150px] md:max-w-md">
              {game.title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setKey((prev) => prev + 1)}
            className="text-white hover:bg-[#3a3a3c]"
            title="Reiniciar"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <a
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-white hover:bg-[#3a3a3c] rounded-md transition-colors"
            title="Abrir em nova aba"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </header>

      <main className="flex-1 relative bg-black">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#121a31]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
          </div>
        )}
        <iframe
          key={`${game.id}-${key}`}
          src={game.url}
          className="absolute inset-0 w-full h-full border-0"
          allow="autoplay; fullscreen; keyboard; gamepad"
          title={game.title}
          onLoad={() => setLoading(false)}
        />
      </main>

      <footer className="shrink-0 bg-[#1a1a1b] border-t border-[#3a3a3c]">
        <div className="max-w-4xl mx-auto py-2">
          <AdBlockBottom />
        </div>
        <div className="p-4 hidden lg:flex items-start gap-4">
          <div className="flex-1">
            <h2 className="text-white font-bold mb-1">{game.title}</h2>
            <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{game.description}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {game.category}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
