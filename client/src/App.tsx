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
import GameModes from "@/pages/GameModes";
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

      {/* Blog */}
      {i18nRoutes("/blog", Blog)}
      {i18nRoutes("/blog/:id", BlogPost)}

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
