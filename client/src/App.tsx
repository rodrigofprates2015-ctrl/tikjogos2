import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { YouTubeMiniPlayer } from "@/components/YouTubeMiniPlayer";
import { VoiceChatProvider } from "@/hooks/VoiceChatContext";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import ImpostorGame from "@/pages/ImpostorGame";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfUse from "@/pages/TermsOfUse";
import ComoJogar from "@/pages/ComoJogar";
import CriarTema from "@/pages/CriarTema";
import Doacoes from "@/pages/Doacoes";
import OutrosJogos from "@/pages/OutrosJogos";
import Termo from "@/pages/Termo";
import AdminDashboard from "@/pages/AdminDashboard";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import PlayGame from "@/pages/PlayGame";
import CommunityThemes from "@/pages/CommunityThemes";
import Prototipo from "@/pages/Prototipo";
import ModoLocal from "@/pages/ModoLocal";
import ModoLocalJogo from "@/pages/ModoLocalJogo";
import AdTest from "@/pages/AdTest";
import RoomRedirect from "@/pages/RoomRedirect";
import ThemePage from "@/pages/ThemePage";
import Temas from "@/pages/Temas";
import GameModes from "@/pages/GameModes";
import DesenhoImpostor from "@/pages/DesenhoImpostor";
import { useAuth } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";

function VersionManager() {
  useEffect(() => {
    const CURRENT_VERSION = "1.0.1";
    const storedVersion = localStorage.getItem("app_version");

    if (storedVersion !== CURRENT_VERSION) {
      console.log("New version detected, clearing cache...");
      
      const nickname = localStorage.getItem("tikjogos_saved_nickname");
      localStorage.clear();
      sessionStorage.clear();
      
      if (nickname) {
        localStorage.setItem("tikjogos_saved_nickname", nickname);
      }
      
      localStorage.setItem("app_version", CURRENT_VERSION);
      window.location.reload();
    }
  }, []);

  return null;
}

function SessionTracker() {
  useEffect(() => {
    const startTime = Date.now();

    function sendSessionEnd() {
      const duration = Math.round((Date.now() - startTime) / 1000);
      if (duration < 2) return;

      function getCookie(name: string) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
      }
      const visitorId = getCookie('visitor_id');
      if (!visitorId) return;

      const payload = JSON.stringify({ visitorId, duration });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/session-end', new Blob([payload], { type: 'application/json' }));
      } else {
        fetch('/api/analytics/session-end', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
      }
    }

    window.addEventListener('beforeunload', sendSessionEnd);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') sendSessionEnd();
    });

    return () => {
      window.removeEventListener('beforeunload', sendSessionEnd);
    };
  }, []);

  return null;
}

/**
 * Generates route entries for a given path and component, producing
 * the PT (no prefix), EN (/en/...), and ES (/es/...) variants.
 */
function i18nRoutes(path: string, Component: React.ComponentType<any>) {
  return (
    <>
      <Route path={path} component={Component} />
      <Route path={`/en${path}`} component={Component} />
      <Route path={`/es${path}`} component={Component} />
    </>
  );
}

function AppRouter() {
  const { user, isLoading, isAuthenticated } = useAuth();

  return (
    <Switch>
      {/* Home — PT default (no prefix), EN, ES */}
      <Route path="/" component={ImpostorGame} />
      <Route path="/en" component={ImpostorGame} />
      <Route path="/es" component={ImpostorGame} />

      {i18nRoutes("/sala/:codigo", RoomRedirect)}

      {/* Criar tema */}
      {i18nRoutes("/criar-tema", CriarTema)}
      {i18nRoutes("/create-theme", CriarTema)}
      {i18nRoutes("/crear-tema", CriarTema)}
      {i18nRoutes("/oficina", CriarTema)}

      {/* Doações */}
      {i18nRoutes("/doacoes", Doacoes)}
      {i18nRoutes("/donations", Doacoes)}
      {i18nRoutes("/donaciones", Doacoes)}
      {i18nRoutes("/apoie", Doacoes)}

      {i18nRoutes("/prototipo", Prototipo)}

      {/* Desenho do Impostor */}
      {i18nRoutes("/desenho-impostor", DesenhoImpostor)}

      {/* Modo local */}
      {i18nRoutes("/modo-local", ModoLocal)}
      {i18nRoutes("/local-mode", ModoLocal)}
      {i18nRoutes("/modo-local/jogo", ModoLocalJogo)}
      {i18nRoutes("/local-mode/game", ModoLocalJogo)}

      {i18nRoutes("/ad-test", AdTest)}

      {/* Como jogar */}
      {i18nRoutes("/comojogar", ComoJogar)}
      {i18nRoutes("/como-jogar", ComoJogar)}
      {i18nRoutes("/how-to-play", ComoJogar)}
      {i18nRoutes("/como-jugar", ComoJogar)}

      {/* Temas */}
      {i18nRoutes("/temas", Temas)}
      {i18nRoutes("/themes", Temas)}
      {i18nRoutes("/temas-del-juego", Temas)}

      {/* Blog */}
      {i18nRoutes("/blog", Blog)}
      {i18nRoutes("/blog/:slug", BlogPost)}

      {/* Privacidade */}
      {i18nRoutes("/privacidade", PrivacyPolicy)}
      {i18nRoutes("/privacy", PrivacyPolicy)}
      {i18nRoutes("/privacidad", PrivacyPolicy)}

      {/* Termos */}
      {i18nRoutes("/termos", TermsOfUse)}
      {i18nRoutes("/terms", TermsOfUse)}
      {i18nRoutes("/terminos", TermsOfUse)}

      {/* Modos de jogo */}
      {i18nRoutes("/modos", GameModes)}
      {i18nRoutes("/modos-de-jogo", GameModes)}
      {i18nRoutes("/game-modes", GameModes)}
      {i18nRoutes("/modos-de-juego", GameModes)}

      {/* Outros jogos */}
      {i18nRoutes("/outros-jogos", OutrosJogos)}
      {i18nRoutes("/other-games", OutrosJogos)}
      {i18nRoutes("/otros-juegos", OutrosJogos)}

      {i18nRoutes("/termo", Termo)}

      {/* Jogar */}
      {i18nRoutes("/jogar/:id", PlayGame)}
      {i18nRoutes("/play/:id", PlayGame)}
      {i18nRoutes("/jugar/:id", PlayGame)}

      {i18nRoutes("/dashadmin", AdminDashboard)}

      {/* SEO Theme HUB */}
      <Route path="/jogo-do-impostor/temas" component={Temas} />

      {/* SEO Theme Pages */}
      <Route path="/jogo-do-impostor/temas/disney">
        {() => <ThemePage themeSlug="disney" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/clash-royale">
        {() => <ThemePage themeSlug="clash-royale" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/valorant">
        {() => <ThemePage themeSlug="valorant" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/natal">
        {() => <ThemePage themeSlug="natal" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/animes">
        {() => <ThemePage themeSlug="animes" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/herois">
        {() => <ThemePage themeSlug="herois" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/stranger-things">
        {() => <ThemePage themeSlug="stranger-things" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/futebol">
        {() => <ThemePage themeSlug="futebol" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/classico">
        {() => <ThemePage themeSlug="classico" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/fortnite">
        {() => <ThemePage themeSlug="fortnite" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/free-fire">
        {() => <ThemePage themeSlug="free-fire" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/brawl-stars">
        {() => <ThemePage themeSlug="brawl-stars" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/pokemon">
        {() => <ThemePage themeSlug="pokemon" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/god-of-war">
        {() => <ThemePage themeSlug="god-of-war" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/kpop">
        {() => <ThemePage themeSlug="kpop" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/bts">
        {() => <ThemePage themeSlug="bts" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/harry-potter">
        {() => <ThemePage themeSlug="harry-potter" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/star-wars">
        {() => <ThemePage themeSlug="star-wars" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/the-walking-dead">
        {() => <ThemePage themeSlug="the-walking-dead" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/la-casa-de-papel">
        {() => <ThemePage themeSlug="la-casa-de-papel" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/the-boys">
        {() => <ThemePage themeSlug="the-boys" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/game-of-thrones">
        {() => <ThemePage themeSlug="game-of-thrones" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/round-6">
        {() => <ThemePage themeSlug="round-6" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/one-piece">
        {() => <ThemePage themeSlug="one-piece" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/attack-on-titan">
        {() => <ThemePage themeSlug="attack-on-titan" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/jujutsu-kaisen">
        {() => <ThemePage themeSlug="jujutsu-kaisen" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/demon-slayer">
        {() => <ThemePage themeSlug="demon-slayer" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/my-hero-academia">
        {() => <ThemePage themeSlug="my-hero-academia" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/tokyo-ghoul">
        {() => <ThemePage themeSlug="tokyo-ghoul" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/chainsaw-man">
        {() => <ThemePage themeSlug="chainsaw-man" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/roblox">
        {() => <ThemePage themeSlug="roblox" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/supernatural">
        {() => <ThemePage themeSlug="supernatural" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/dragon-ball">
        {() => <ThemePage themeSlug="dragon-ball" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/naruto">
        {() => <ThemePage themeSlug="naruto" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/bandas-de-rock">
        {() => <ThemePage themeSlug="bandas-de-rock" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/minecraft">
        {() => <ThemePage themeSlug="minecraft" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/gta">
        {() => <ThemePage themeSlug="gta" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/fnaf">
        {() => <ThemePage themeSlug="fnaf" />}
      </Route>
      <Route path="/jogo-do-impostor/temas/super-herois">
        {() => <ThemePage themeSlug="super-herois" />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <VoiceChatProvider>
          <LanguageProvider>
            <VersionManager />
            <SessionTracker />
            <AppRouter />
            <Toaster />
            <YouTubeMiniPlayer />
          </LanguageProvider>
        </VoiceChatProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
