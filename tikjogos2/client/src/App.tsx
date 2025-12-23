import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { VersionBadge } from "@/components/VersionBadge";
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
import { useAuth } from "@/hooks/useAuth";

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path="/" component={ImpostorGame} />
      <Route path="/criar-tema" component={CriarTema} />
      <Route path="/oficina" component={CriarTema} />
      <Route path="/comojogar" component={ComoJogar} />
      <Route path="/como-jogar" component={ComoJogar} />
      <Route path="/blog" component={Blog} />
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
        <Router />
        <Toaster />
        <VersionBadge />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
