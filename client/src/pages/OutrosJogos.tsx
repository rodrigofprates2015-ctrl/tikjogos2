import { Link } from "wouter";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import logoTikjogos from "@assets/logo tikjogos_1764616571363.png";
import logoTermo from "@/assets/Termo_Logo_58x58_1765323385999.png";
import { AdBlockTop, AdBlockBottom } from "@/components/AdBlocks";
import { OutrosJogosAd, SideAds, BottomAd } from "@/components/AdSense";
import { useLanguage } from "@/hooks/useLanguage";

export default function OutrosJogos() {
  const { t, langPath } = useLanguage();

  const internalGames = [
    {
      id: "wordle",
      name: "Termo",
      description: t('otherGamesPage.termoDesc', 'Adivinhe a palavra do dia em 6 tentativas'),
      href: "/termo",
      logo: logoTermo
    }
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#121a31] py-8 px-4">
      {/* Side Ads */}
      <SideAds />

      {/* Bottom Ad */}
      <BottomAd />

      {/* Top Ad Block */}
      <AdBlockTop />
      
      <OutrosJogosAd />

      <Link 
        href={langPath("/")}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-[#3a3a3c] rounded-lg text-white transition-all font-semibold hover-elevate active-elevate-2"
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">{t('otherGamesPage.back', 'Voltar')}</span>
      </Link>

      <div className="mt-16 mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Gamepad2 className="w-8 h-8 text-emerald-400" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">{t('otherGamesPage.title', 'Outros Jogos')}</h1>
        </div>
        <p className="text-gray-400 text-sm md:text-base">{t('otherGamesPage.description', 'Escolha um jogo para se divertir!')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
        {/* Jogos Internos */}
        {internalGames.map((game) => (
          <Link
            key={game.id}
            href={langPath(game.href)}
            className="group relative overflow-hidden rounded-xl bg-[#1a1a1b] border border-[#3a3a3c] p-6 transition-all duration-300 hover-elevate active-elevate-2"
            data-testid={`card-game-${game.id}`}
          >
            <div className="relative z-10">
              <img src={game.logo} alt={game.name} className="w-12 h-12 mb-3 rounded-lg object-cover" />
              <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
              <p className="text-gray-400 text-sm">{game.description}</p>
            </div>
          </Link>
        ))}

        <div className="relative overflow-hidden rounded-xl bg-[#1a1a1b]/50 border border-dashed border-[#3a3a3c] p-6 flex items-center justify-center">
          <div className="text-center">
            <Gamepad2 className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">{t('otherGamesPage.comingSoon', 'Em breve mais jogos!')}</p>
          </div>
        </div>
      </div>

      {/* Bottom Ad Block */}
      <AdBlockBottom />

      <div className="mt-12 mb-8 text-center max-w-md px-4">
        <img src={logoTikjogos} alt="TikJogos" className="h-4 md:h-5 mx-auto mb-2 opacity-50" />
        <p className="text-gray-600 text-[10px] leading-relaxed">
          {t('blogPage.disclaimer', 'O TikJogos é um projeto independente de fãs. Todas as marcas registradas (como nomes de personagens e franquias) pertencem aos seus respectivos proprietários e são usadas aqui apenas para fins de referência em contexto de jogo de palavras/trivia.')}
        </p>
      </div>
    </div>
  );
}
