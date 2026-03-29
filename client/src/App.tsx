import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { useEffect, lazy, Suspense } from "react";
import NotFound from "@/pages/not-found";
import FeedbackPopup from "@/components/FeedbackPopup";
import { useFeedback } from "@/hooks/useFeedback";
// ImpostorGame is the home page — keep it eager so there's no lazy waterfall on /
import ImpostorGame from "@/pages/ImpostorGame";
import RoomRedirect from "@/pages/RoomRedirect";
import DesafioDaPalavra from "@/pages/DesafioDaPalavra";
import { useAuth } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";

// Lazy-loaded pages - reduces initial JS bundle for faster LCP on mobile
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("@/pages/TermsOfUse"));
const ComoJogar = lazy(() => import("@/pages/ComoJogar"));
const ComoJogarDesenho = lazy(() => import("@/pages/ComoJogarDesenho"));
const ComoJogarSincronia = lazy(() => import("@/pages/ComoJogarSincronia"));
const ComoJogarDesafioPalavra = lazy(() => import("@/pages/ComoJogarDesafioPalavra"));
const CriarTema = lazy(() => import("@/pages/CriarTema"));
const Doacoes = lazy(() => import("@/pages/Doacoes"));
const OutrosJogos = lazy(() => import("@/pages/OutrosJogos"));
const Termo = lazy(() => import("@/pages/Termo"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const PlayGame = lazy(() => import("@/pages/PlayGame"));
const CommunityThemes = lazy(() => import("@/pages/CommunityThemes"));
const Prototipo = lazy(() => import("@/pages/Prototipo"));
const ModoLocal = lazy(() => import("@/pages/ModoLocal"));
const ModoLocalJogo = lazy(() => import("@/pages/ModoLocalJogo"));
const AdTest = lazy(() => import("@/pages/AdTest"));
const ThemePage = lazy(() => import("@/pages/ThemePage"));
const Temas = lazy(() => import("@/pages/Temas"));
const GameModes = lazy(() => import("@/pages/GameModes"));
const DesenhoImpostor = lazy(() => import("@/pages/DesenhoImpostor"));
const RespostasEmComum = lazy(() => import("@/pages/RespostasEmComum"));
const SincBrGame = lazy(() => import("@/pages/SincBrGame"));

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

function LazyFallback() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#1a1b2e]">
      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AppRouter() {
  const { user, isLoading, isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<LazyFallback />}>
    <Switch>
      {/* Home — PT default (no prefix), EN, ES */}
      <Route path="/" component={ImpostorGame} />
      <Route path="/en" component={ImpostorGame} />
      <Route path="/es" component={ImpostorGame} />

      {i18nRoutes("/sala/:codigo", RoomRedirect)}

      {/* Desafio da Palavra */}
      <Route path="/desafio-da-palavra" component={DesafioDaPalavra} />
      <Route path="/desafio/:codigo">
        {(params) => <DesafioDaPalavra initialCode={params.codigo} />}
      </Route>

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

      {i18nRoutes("/respostas-em-comum", RespostasEmComum)}
      {i18nRoutes("/common-answers", RespostasEmComum)}
      {i18nRoutes("/respuestas-en-comun", RespostasEmComum)}

      {i18nRoutes("/sincronia-br", SincBrGame)}
      {i18nRoutes("/sincronia-battle-royale", SincBrGame)}

      {/* Modo local */}
      {i18nRoutes("/modo-local", ModoLocal)}
      {i18nRoutes("/local-mode", ModoLocal)}
      {i18nRoutes("/modo-local/jogo", ModoLocalJogo)}
      {i18nRoutes("/local-mode/game", ModoLocalJogo)}

      {i18nRoutes("/ad-test", AdTest)}

      {/* Como jogar */}
      {/* Como Jogar - game-specific pages */}
      {i18nRoutes("/como-jogar/jogo-do-impostor", ComoJogar)}
      {i18nRoutes("/how-to-play/impostor-game", ComoJogar)}
      {i18nRoutes("/como-jugar/juego-del-impostor", ComoJogar)}

      {i18nRoutes("/como-jogar/jogo-do-impostor-desenho", ComoJogarDesenho)}
      {i18nRoutes("/how-to-play/impostor-drawing-game", ComoJogarDesenho)}
      {i18nRoutes("/como-jugar/juego-del-impostor-dibujo", ComoJogarDesenho)}

      {i18nRoutes("/como-jogar/sincronia", ComoJogarSincronia)}
      {i18nRoutes("/how-to-play/sincronia", ComoJogarSincronia)}
      {i18nRoutes("/como-jugar/sincronia", ComoJogarSincronia)}

      <Route path="/como-jogar/desafio-da-palavra" component={ComoJogarDesafioPalavra} />
      <Route path="/how-to-play/word-challenge" component={ComoJogarDesafioPalavra} />
      <Route path="/en/how-to-play/word-challenge" component={ComoJogarDesafioPalavra} />
      <Route path="/como-jugar/desafio-de-la-palabra" component={ComoJogarDesafioPalavra} />
      <Route path="/es/como-jugar/desafio-de-la-palabra" component={ComoJogarDesafioPalavra} />

      {/* Legacy redirects — keep old URLs working */}
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
    </Suspense>
  );
}

function FeedbackController() {
  const { showFeedback, dismiss, markDone } = useFeedback();

  if (!showFeedback) return null;
  return <FeedbackPopup onDismiss={dismiss} onDone={markDone} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <VersionManager />
          <SessionTracker />
          <AppRouter />
          <FeedbackController />
          <Toaster />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
