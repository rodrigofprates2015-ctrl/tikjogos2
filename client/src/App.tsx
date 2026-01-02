import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { VersionBadge } from "@/components/VersionBadge";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import ImpostorGame from "@/pages/ImpostorGame";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfUse from "@/pages/TermsOfUse";
import ComoJogar from "@/pages/ComoJogar";
import CriarTema from "@/pages/CriarTema";
import OutrosJogos from "@/pages/OutrosJogos";
import Termo from "@/pages/Termo";
import AdminDashboard from "@/pages/AdminDashboard";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import CommunityThemes from "@/pages/CommunityThemes";
import Prototipo from "@/pages/Prototipo";
import ModoLocal from "@/pages/ModoLocal";
import ModoLocalJogo from "@/pages/ModoLocalJogo";
import AdTest from "@/pages/AdTest";
import RoomRedirect from "@/pages/RoomRedirect";
import { useAuth } from "@/hooks/useAuth";

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

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path="/" component={ImpostorGame} />
      <Route path="/sala/:codigo" component={RoomRedirect} />
      {/* Rotas de criação de temas temporariamente desabilitadas */}
      {/* <Route path="/criar-tema" component={CriarTema} /> */}
      {/* <Route path="/oficina" component={CriarTema} /> */}
      {/* Rotas de temas da comunidade temporariamente desabilitadas */}
      {/* <Route path="/temas" component={CommunityThemes} /> */}
      {/* <Route path="/temas-comunidade" component={CommunityThemes} /> */}
      <Route path="/prototipo" component={Prototipo} />
      <Route path="/modo-local" component={ModoLocal} />
      <Route path="/modo-local/jogo" component={ModoLocalJogo} />
      <Route path="/ad-test" component={AdTest} />
      <Route path="/comojogar" component={ComoJogar} />
      <Route path="/como-jogar" component={ComoJogar} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/privacidade" component={PrivacyPolicy} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/termos" component={TermsOfUse} />
      <Route path="/terms" component={TermsOfUse} />
      <Route path="/outros-jogos" component={OutrosJogos} />
      <Route path="/termo" component={Termo} />
      <Route path="/dashadmin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <VersionManager />
        <Router />
        <Toaster />
        <VersionBadge />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
