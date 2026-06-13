import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  ImagePlus,
  Instagram,
  Loader2,
  LogOut,
  Palette,
  RefreshCw,
  Search,
  Shield,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

type SkinRequestStatus = "awaiting_payment" | "approved" | "rejected" | "cancelled" | "unknown";

type SkinRequest = {
  id: string;
  paymentId: string;
  status: SkinRequestStatus;
  name: string;
  instagram?: string;
  about: string;
  photoName?: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
};

const statusLabels: Record<SkinRequestStatus, string> = {
  awaiting_payment: "Aguardando PIX",
  approved: "Pago",
  rejected: "Recusado",
  cancelled: "Cancelado",
  unknown: "Status desconhecido",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusClass(status: SkinRequestStatus) {
  if (status === "approved") return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
  if (status === "awaiting_payment") return "border-amber-400/30 bg-amber-500/15 text-amber-200";
  if (status === "rejected" || status === "cancelled") return "border-rose-400/30 bg-rose-500/15 text-rose-200";
  return "border-slate-400/30 bg-slate-500/15 text-slate-200";
}

export default function Dashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState<SkinRequest[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const selected = requests.find(request => request.id === selectedId) || requests[0] || null;

  const metrics = useMemo(() => {
    const paid = requests.filter(request => request.status === "approved").length;
    const pending = requests.filter(request => request.status === "awaiting_payment").length;
    const totalAmount = requests
      .filter(request => request.status === "approved")
      .reduce((sum, request) => sum + request.amount, 0);

    return { paid, pending, totalAmount };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return requests;

    return requests.filter(request => (
      request.name.toLowerCase().includes(normalized) ||
      request.instagram?.toLowerCase().includes(normalized) ||
      request.about.toLowerCase().includes(normalized) ||
      request.paymentId.includes(normalized)
    ));
  }, [query, requests]);

  const fetchRequests = useCallback(async (activeToken: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/skin-requests", {
        headers: { Authorization: `Bearer ${activeToken}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        setToken(null);
        setRequests([]);
        return;
      }

      if (!res.ok) throw new Error("Falha ao carregar pedidos");

      const data: SkinRequest[] = await res.json();
      setRequests(data);
      setSelectedId(current => current || data[0]?.id || null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const response = await apiRequest("POST", "/api/admin/login", { email, password });
      const data = await response.json();
      if (!data.success) throw new Error("Credenciais inválidas");

      localStorage.setItem("adminToken", data.token);
      setToken(data.token);
      await fetchRequests(data.token);
    } catch {
      setLoginError("Credenciais inválidas");
      localStorage.removeItem("adminToken");
      setToken(null);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    const currentToken = token || localStorage.getItem("adminToken");
    if (currentToken) {
      await fetch("/api/admin/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${currentToken}` },
      }).catch(() => {});
    }

    localStorage.removeItem("adminToken");
    setToken(null);
    setRequests([]);
    setSelectedId(null);
  };

  const copyRequest = async (request: SkinRequest) => {
    const text = [
      `Pedido: ${request.id}`,
      `Pagamento: ${request.paymentId}`,
      `Status: ${statusLabels[request.status]}`,
      `Nome: ${request.name}`,
      `Instagram: ${request.instagram || "nao informado"}`,
      `Foto: ${request.photoName || "nao enviada"}`,
      `Descricao: ${request.about}`,
    ].join("\n");

    await navigator.clipboard.writeText(text);
  };

  useEffect(() => {
    document.title = "Pedidos de Skin - TikJogos";
    const saved = localStorage.getItem("adminToken");
    if (!saved) return;

    fetch("/api/admin/verify", { headers: { Authorization: `Bearer ${saved}` } })
      .then(res => {
        if (!res.ok) {
          localStorage.removeItem("adminToken");
          return;
        }

        setToken(saved);
        fetchRequests(saved);
      })
      .catch(() => localStorage.removeItem("adminToken"));
  }, [fetchRequests]);

  useEffect(() => {
    if (!token) return;
    const intervalId = window.setInterval(() => fetchRequests(token), 15000);
    return () => window.clearInterval(intervalId);
  }, [fetchRequests, token]);

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090d1a] px-4 text-white">
        <Card className="w-full max-w-md border-white/10 bg-slate-900/90 text-white shadow-2xl">
          <CardHeader>
            <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Voltar para o site
            </Link>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300 text-slate-950">
              <Shield className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-black">Dashboard de skins</CardTitle>
            <CardDescription className="text-slate-400">
              Entre com o acesso admin para ver os pedidos de personagens personalizados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email admin"
                className="h-12 border-slate-700 bg-slate-950 text-white"
              />
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Senha"
                className="h-12 border-slate-700 bg-slate-950 text-white"
              />
              {loginError && <p className="text-sm font-bold text-rose-300">{loginError}</p>}
              <Button type="submit" disabled={isLoggingIn} className="h-12 w-full bg-amber-300 font-black text-slate-950 hover:bg-amber-200">
                {isLoggingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090d1a] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/personagem" className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Ver pagina de personagem
            </Link>
            <h1 className="text-3xl font-black uppercase tracking-normal text-white md:text-5xl">Pedidos de skins</h1>
            <p className="mt-2 text-sm text-slate-400">
              Caixa de entrada dos jogadores que compraram ou iniciaram pedido de personagem personalizado.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => token && fetchRequests(token)}
              disabled={isLoading}
              variant="outline"
              className="border-white/10 bg-slate-950 text-white hover:bg-slate-800"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
              Atualizar
            </Button>
            <Button onClick={handleLogout} variant="outline" className="border-white/10 bg-slate-950 text-white hover:bg-slate-800">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border-white/10 bg-slate-900/70 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-300">
                <Palette className="h-4 w-4 text-amber-300" />
                Total de pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black">{requests.length}</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-900/70 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-300">
                <Clock className="h-4 w-4 text-amber-300" />
                Aguardando PIX
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black">{metrics.pending}</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-900/70 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Pagos
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between gap-3">
              <p className="text-3xl font-black">{metrics.paid}</p>
              <span className="text-sm font-bold text-emerald-200">R$ {metrics.totalAmount.toFixed(2)}</span>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <Card className="border-white/10 bg-slate-900/70 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-5 w-5 text-sky-300" />
                Remetentes
              </CardTitle>
              <CardDescription className="text-slate-400">Quem enviou solicitacao de skin.</CardDescription>
              <div className="relative pt-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 translate-y-0.5 text-slate-500" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por nome, @ ou pagamento"
                  className="h-11 border-slate-700 bg-slate-950 pl-10 text-white"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
                {isLoading && requests.length === 0 ? (
                  <div className="flex items-center justify-center py-12 text-slate-400">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Carregando pedidos...
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 p-8 text-center text-slate-400">
                    Nenhum pedido de skin recebido ainda.
                  </div>
                ) : (
                  filteredRequests.map(request => (
                    <button
                      key={request.id}
                      onClick={() => setSelectedId(request.id)}
                      className={cn(
                        "w-full rounded-2xl border p-4 text-left transition",
                        selected?.id === request.id
                          ? "border-amber-300/50 bg-amber-300/10"
                          : "border-white/10 bg-slate-950/45 hover:border-white/25"
                      )}
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-base font-black text-white">{request.name}</p>
                          <p className="mt-1 truncate text-sm font-bold text-slate-400">{request.instagram || "Sem Instagram"}</p>
                        </div>
                        <Badge className={cn("shrink-0 border", statusClass(request.status))}>
                          {statusLabels[request.status]}
                        </Badge>
                      </div>
                      <p className="mt-3 text-xs font-bold text-slate-500">
                        {formatDate(request.createdAt)} · PIX {request.paymentId}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-900/70 text-white">
            <CardHeader>
              <CardTitle>Detalhes do pedido</CardTitle>
              <CardDescription className="text-slate-400">
                Dados enviados pelo jogador na pagina /personagem.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selected ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 p-10 text-center text-slate-400">
                  Selecione um remetente para ver o pedido.
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500">Remetente</p>
                      <h2 className="mt-1 text-2xl font-black text-white">{selected.name}</h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge className={cn("border", statusClass(selected.status))}>{statusLabels[selected.status]}</Badge>
                        <Badge className="border border-white/10 bg-slate-800 text-slate-200">R$ {selected.amount.toFixed(2)}</Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => copyRequest(selected)}
                      variant="outline"
                      className="border-white/10 bg-slate-900 text-white hover:bg-slate-800"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar pedido
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500">Instagram</p>
                      <p className="mt-2 flex items-center gap-2 text-base font-bold text-white">
                        <Instagram className="h-4 w-4 text-rose-300" />
                        {selected.instagram || "Nao informado"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500">Foto</p>
                      <p className="mt-2 flex items-center gap-2 break-all text-base font-bold text-white">
                        <ImagePlus className="h-4 w-4 text-amber-300" />
                        {selected.photoName || "Nao anexada"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500">Pagamento</p>
                      <p className="mt-2 text-base font-bold text-white">PIX {selected.paymentId}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500">Criado em</p>
                      <p className="mt-2 text-base font-bold text-white">{formatDate(selected.createdAt)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">Descricao para criacao</p>
                    <Textarea
                      readOnly
                      value={selected.about}
                      className="min-h-44 resize-none border-slate-700 bg-slate-950 text-sm font-bold leading-relaxed text-white"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
