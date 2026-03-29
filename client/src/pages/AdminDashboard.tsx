import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Home,
  Eye,
  LogOut,
  RefreshCw,
  Lock,
  AlertTriangle,
  User,
  Skull,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  Search,
  BarChart3,
  Paintbrush,
  Gamepad2,
  Sparkles,
  Type,
  Menu,
  X,
  Activity,
  Clock,
  Circle,
  Star,
  MessageSquare,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import AnalyticsDashboard from "./AnalyticsDashboard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── Types ───────────────────────────────────────────────────────────────────

type Player = { uid: string; name: string; waitingForGame?: boolean; connected?: boolean };
type GameData = { eliminatedPlayers?: string[]; votingResults?: Record<string, string>; [key: string]: any };
type Room = {
  code: string; hostId: string; status: string; gameMode: string | null;
  currentCategory: string | null; currentWord: string | null; impostorId: string | null;
  gameData: GameData | null; players: Player[]; createdAt: string;
};
type Theme = {
  id: string; titulo: string; autor: string; palavras: string[]; isPublic: boolean;
  accessCode: string | null; paymentStatus: string; paymentId: string | null;
  approved: boolean; createdAt: string;
};
type DrawingPlayer = { uid: string; name: string; connected?: boolean };
type DrawingGameData = {
  word?: string; impostorIds?: string[]; drawingOrder?: string[];
  currentDrawerIndex?: number; currentDrawerId?: string; turnTimeLimit?: number;
  votes?: Array<{ playerId: string; playerName: string; targetId: string; targetName: string }>;
  votingStarted?: boolean; votesRevealed?: boolean;
};
type DrawingRoom = { code: string; hostId: string; status: string; gameData: DrawingGameData | null; players: DrawingPlayer[]; createdAt: string };
type SincRoom = { code: string; hostId: string; phase: string; playerCount: number; connectedPlayers: number; category: string; currentRound: number; totalRounds: number };
type SincStats = { totalRoomsCreated: number; activeRooms: number; playingRooms: number; waitingRooms: number; totalConnectedPlayers: number; rooms: SincRoom[] };
type DesafioGameData = {
  currentWord?: string;
  vidasMap?: Record<string, number>;
  turnIndex?: number;
  wordStatus?: 'aguardando' | 'jogando' | 'defendendo' | 'fim_de_jogo';
  vencedorId?: string;
  vencedorName?: string;
  lastAction?: { type: string; desafianteId?: string; desafiadoId?: string; resultado?: boolean; letra?: string; playerName?: string };
};
type DesafioRoom = {
  code: string; hostId: string; status: string; gameMode: string | null;
  gameData: DesafioGameData | null; players: Player[]; createdAt: string;
};

type NavItem = "overview" | "impostor" | "desenho" | "sincronia" | "palavra" | "temas" | "analytics" | "feedback";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${active ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
  );
}

function StatCard({
  label, value, icon: Icon, accent = "#6366f1", sub,
}: { label: string; value: string | number; icon: any; accent?: string; sub?: string }) {
  return (
    <Card className="bg-slate-800/70 border-slate-700 hover:border-slate-600 transition-colors">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl shrink-0" style={{ background: `${accent}22` }}>
            <Icon className="w-5 h-5" style={{ color: accent }} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-snug">{label}</p>
            {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Game-specific room tables ────────────────────────────────────────────────

function ImpostorRoomsTable({ rooms, onInspect }: { rooms: Room[]; onInspect: (code: string) => void }) {
  if (rooms.length === 0) return <EmptyState />;
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-700 hover:bg-transparent">
            <TableHead className="text-slate-400 font-medium">Status</TableHead>
            <TableHead className="text-slate-400 font-medium">Código</TableHead>
            <TableHead className="text-slate-400 font-medium">Jogadores</TableHead>
            <TableHead className="text-slate-400 font-medium">Modo</TableHead>
            <TableHead className="text-slate-400 font-medium">Criada</TableHead>
            <TableHead className="text-slate-400 font-medium" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room.code} className="border-slate-700/50 hover:bg-slate-700/30" data-testid={`row-room-${room.code}`}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <StatusDot active={room.status === "playing"} />
                  <Badge className={room.status === "playing" ? "bg-emerald-600/80 text-emerald-100 text-xs" : "bg-slate-600/80 text-slate-300 text-xs"}>
                    {room.status === "playing" ? "Jogando" : "Aguardando"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="font-mono font-bold text-white text-sm">{room.code}</TableCell>
              <TableCell className="text-slate-300 text-sm">{room.players.length}/10</TableCell>
              <TableCell className="text-slate-400 text-sm">{room.gameMode || "—"}</TableCell>
              <TableCell className="text-slate-500 text-xs">{new Date(room.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</TableCell>
              <TableCell>
                <Button size="sm" variant="ghost" onClick={() => onInspect(room.code)} className="text-slate-400 hover:text-white hover:bg-slate-700 h-7 px-2 text-xs" data-testid={`button-inspect-${room.code}`}>
                  <Eye className="w-3.5 h-3.5 mr-1" /> Ver
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function DrawingRoomsTable({ rooms, onInspect }: { rooms: DrawingRoom[]; onInspect: (code: string) => void }) {
  if (rooms.length === 0) return <EmptyState />;
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-700 hover:bg-transparent">
            <TableHead className="text-slate-400 font-medium">Status</TableHead>
            <TableHead className="text-slate-400 font-medium">Código</TableHead>
            <TableHead className="text-slate-400 font-medium">Jogadores</TableHead>
            <TableHead className="text-slate-400 font-medium">Palavra</TableHead>
            <TableHead className="text-slate-400 font-medium">Criada</TableHead>
            <TableHead className="text-slate-400 font-medium" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room.code} className="border-slate-700/50 hover:bg-slate-700/30">
              <TableCell>
                <div className="flex items-center gap-2">
                  <StatusDot active={room.status !== "waiting"} />
                  <Badge className={room.status === "drawing" ? "bg-purple-600/80 text-purple-100 text-xs" : room.status === "voting" ? "bg-amber-600/80 text-amber-100 text-xs" : "bg-slate-600/80 text-slate-300 text-xs"}>
                    {room.status === "drawing" ? "Desenhando" : room.status === "voting" ? "Votação" : room.status === "discussion" ? "Discussão" : "Aguardando"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="font-mono font-bold text-white text-sm">{room.code}</TableCell>
              <TableCell className="text-slate-300 text-sm">{room.players.length}</TableCell>
              <TableCell className="text-slate-400 text-sm">{room.gameData?.word || "—"}</TableCell>
              <TableCell className="text-slate-500 text-xs">{new Date(room.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</TableCell>
              <TableCell>
                <Button size="sm" variant="ghost" onClick={() => onInspect(room.code)} className="text-slate-400 hover:text-white hover:bg-slate-700 h-7 px-2 text-xs">
                  <Eye className="w-3.5 h-3.5 mr-1" /> Ver
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SincroniaRoomsTable({ stats }: { stats: SincStats | null }) {
  if (!stats || stats.rooms.length === 0) return <EmptyState />;
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-700 hover:bg-transparent">
            <TableHead className="text-slate-400 font-medium">Status</TableHead>
            <TableHead className="text-slate-400 font-medium">Código</TableHead>
            <TableHead className="text-slate-400 font-medium">Jogadores</TableHead>
            <TableHead className="text-slate-400 font-medium">Categoria</TableHead>
            <TableHead className="text-slate-400 font-medium">Rodada</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.rooms.map((room) => (
            <TableRow key={room.code} className="border-slate-700/50 hover:bg-slate-700/30">
              <TableCell>
                <div className="flex items-center gap-2">
                  <StatusDot active={room.phase === "playing"} />
                  <Badge className={room.phase === "playing" ? "bg-emerald-600/80 text-emerald-100 text-xs" : "bg-slate-600/80 text-slate-300 text-xs"}>
                    {room.phase === "playing" ? "Jogando" : "Aguardando"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="font-mono font-bold text-white text-sm">{room.code}</TableCell>
              <TableCell className="text-slate-300 text-sm">{room.connectedPlayers}/{room.playerCount}</TableCell>
              <TableCell className="text-slate-400 text-sm capitalize">{room.category || "todas"}</TableCell>
              <TableCell className="text-slate-400 text-sm">{room.currentRound}/{room.totalRounds}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function DesafioRoomsTable({ rooms, onInspect }: { rooms: DesafioRoom[]; onInspect: (code: string) => void }) {
  if (rooms.length === 0) return <EmptyState />;
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-700 hover:bg-transparent">
            <TableHead className="text-slate-400 font-medium">Status</TableHead>
            <TableHead className="text-slate-400 font-medium">Código</TableHead>
            <TableHead className="text-slate-400 font-medium">Jogadores</TableHead>
            <TableHead className="text-slate-400 font-medium">Palavra Atual</TableHead>
            <TableHead className="text-slate-400 font-medium">Fase</TableHead>
            <TableHead className="text-slate-400 font-medium">Criada</TableHead>
            <TableHead className="text-slate-400 font-medium" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room) => {
            const wordStatus = room.gameData?.wordStatus;
            return (
              <TableRow key={room.code} className="border-slate-700/50 hover:bg-slate-700/30">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <StatusDot active={room.status === "playing"} />
                    <Badge className={room.status === "playing" ? "bg-emerald-600/80 text-emerald-100 text-xs" : "bg-slate-600/80 text-slate-300 text-xs"}>
                      {room.status === "playing" ? "Jogando" : "Aguardando"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="font-mono font-bold text-white text-sm">{room.code}</TableCell>
                <TableCell className="text-slate-300 text-sm">{room.players.length}</TableCell>
                <TableCell className="text-slate-400 text-sm font-mono">
                  {room.gameData?.currentWord ? (
                    <span className="text-violet-300 font-semibold tracking-widest">
                      {room.gameData.currentWord.toUpperCase()}
                    </span>
                  ) : "—"}
                </TableCell>
                <TableCell>
                  {wordStatus && (
                    <Badge className={
                      wordStatus === 'jogando' ? "bg-violet-600/80 text-xs" :
                      wordStatus === 'defendendo' ? "bg-amber-600/80 text-xs" :
                      wordStatus === 'fim_de_jogo' ? "bg-red-600/80 text-xs" :
                      "bg-slate-600/80 text-xs"
                    }>
                      {wordStatus === 'jogando' ? 'Jogando' : wordStatus === 'defendendo' ? 'Defendendo' : wordStatus === 'fim_de_jogo' ? 'Fim' : 'Aguardando'}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-slate-500 text-xs">{new Date(room.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" onClick={() => onInspect(room.code)} className="text-slate-400 hover:text-white hover:bg-slate-700 h-7 px-2 text-xs">
                    <Eye className="w-3.5 h-3.5 mr-1" /> Ver
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 text-slate-500">
      <Circle className="w-8 h-8 mx-auto mb-3 opacity-30" />
      <p className="text-sm">Nenhuma sala ativa no momento</p>
    </div>
  );
}

// ─── Feedback View ────────────────────────────────────────────────────────────

type FeedbackEntry = { id: string; rating: number; comment: string | null; gameMode: string | null; createdAt: string };
type FeedbackData = { total: number; avgRating: number | null; distribution: Array<{ rating: number; count: number }>; responses: FeedbackEntry[] };

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={13} className={s <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-600 text-slate-600"} />
      ))}
    </div>
  );
}

function FeedbackView({ token }: { token: string }) {
  const [data, setData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/feedback', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = filter ? data?.responses.filter(r => r.rating === filter) : data?.responses;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20">
            <Star className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Feedback dos Jogadores</h2>
            <p className="text-slate-400 text-sm">{data?.total ?? 0} avaliações recebidas</p>
          </div>
        </div>
        <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/60 border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 transition-all text-xs">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Atualizar
        </button>
      </div>

      {loading && !data ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-slate-800 animate-pulse" />)}
        </div>
      ) : !data || data.total === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Star size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-semibold">Nenhuma avaliação ainda</p>
          <p className="text-sm mt-1">As respostas do popup aparecerão aqui.</p>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total" value={data.total} icon={Users} accent="#f59e0b" />
            <StatCard label="Nota Média" value={data.avgRating != null ? `${data.avgRating} ★` : "—"} icon={Star} accent="#f59e0b" />
            <StatCard label="Com Comentário" value={data.responses.filter(r => r.comment).length} icon={MessageSquare} accent="#a855f7" />
            <StatCard label="Nota 5 ⭐" value={data.distribution.find(d => d.rating === 5)?.count ?? 0} icon={Trophy} accent="#10b981" />
          </div>

          {/* Distribution */}
          <Card className="bg-slate-800/70 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <TrendingUp size={15} className="text-amber-400" /> Distribuição de Notas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[5,4,3,2,1].map(star => {
                const cnt = data.distribution.find(d => d.rating === star)?.count ?? 0;
                const pct = data.total > 0 ? Math.round((cnt / data.total) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12 shrink-0">
                      <span className="text-slate-400 text-sm font-bold">{star}</span>
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                    </div>
                    <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-slate-500 text-xs w-20 text-right tabular-nums">{cnt} ({pct}%)</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Responses */}
          <Card className="bg-slate-800/70 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <MessageSquare size={15} className="text-purple-400" /> Respostas
                </CardTitle>
                <div className="flex gap-1.5 flex-wrap">
                  <button onClick={() => setFilter(null)} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${filter === null ? "bg-slate-600 text-white" : "text-slate-500 hover:text-slate-300"}`}>Todas</button>
                  {[5,4,3,2,1].map(s => (
                    <button key={s} onClick={() => setFilter(filter === s ? null : s)} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${filter === s ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-slate-500 hover:text-slate-300"}`}>{s}★</button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {filtered && filtered.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">Nenhuma resposta com esse filtro.</p>
                ) : filtered?.map(r => (
                  <div key={r.id} className="p-3.5 rounded-xl bg-slate-700/40 border border-slate-700/60 space-y-1.5">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <StarDisplay rating={r.rating} />
                      <span className="text-slate-500 text-xs">
                        {r.createdAt ? format(parseISO(r.createdAt), "dd/MM/yy 'às' HH:mm", { locale: ptBR }) : ""}
                      </span>
                    </div>
                    {r.comment ? (
                      <p className="text-slate-300 text-sm leading-relaxed">{r.comment}</p>
                    ) : (
                      <p className="text-slate-600 text-xs italic">Sem comentário</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ─── Inspectors ──────────────────────────────────────────────────────────────

function ImpostorInspectDialog({ room, onClose }: { room: Room | null; onClose: () => void }) {
  if (!room) return null;
  const impostor = room.players.find(p => p.uid === room.impostorId);
  return (
    <Dialog open={!!room} onOpenChange={() => onClose()}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Skull className="w-5 h-5 text-red-400" /> Impostor — Sala {room.code}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Status", room.status === "playing" ? "Jogando" : "Aguardando"],
              ["Modo", room.gameMode || "—"],
              ["Categoria", room.currentCategory || "—"],
              ["Palavra", room.currentWord || "—"],
            ].map(([l, v]) => (
              <div key={l} className="bg-slate-700/50 p-3 rounded-lg">
                <p className="text-slate-400 text-xs mb-1">{l}</p>
                <p className="text-white font-medium text-sm">{v}</p>
              </div>
            ))}
          </div>
          {impostor && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
              <p className="text-red-400 text-xs mb-1 flex items-center gap-2"><Skull className="w-3.5 h-3.5" /> IMPOSTOR</p>
              <p className="text-white font-bold">{impostor.name}</p>
            </div>
          )}
          <div>
            <p className="text-slate-400 text-xs mb-2">Jogadores ({room.players.length})</p>
            <div className="grid grid-cols-2 gap-2">
              {room.players.map((p) => {
                const isImpostor = p.uid === room.impostorId;
                const isHost = p.uid === room.hostId;
                return (
                  <div key={p.uid} className={`p-3 rounded-lg flex items-center gap-2 ${isImpostor ? "bg-red-500/20 border border-red-500/30" : "bg-slate-700/50"}`}>
                    <User className={`w-4 h-4 shrink-0 ${isImpostor ? "text-red-400" : "text-slate-400"}`} />
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${isImpostor ? "text-red-300" : "text-white"}`}>{p.name}</p>
                      <div className="flex gap-1 flex-wrap mt-0.5">
                        {isHost && <Badge className="text-[10px] bg-yellow-600/80 px-1 py-0">Host</Badge>}
                        {isImpostor && <Badge className="text-[10px] bg-red-600/80 px-1 py-0">Impostor</Badge>}
                        {!p.connected && <Badge className="text-[10px] bg-orange-600/80 px-1 py-0">Offline</Badge>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DrawingInspectDialog({ room, onClose }: { room: DrawingRoom | null; onClose: () => void }) {
  if (!room) return null;
  return (
    <Dialog open={!!room} onOpenChange={() => onClose()}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Paintbrush className="w-5 h-5 text-purple-400" /> Desenho — Sala {room.code}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <p className="text-slate-400 text-xs mb-1">Status</p>
              <Badge className={room.status === "drawing" ? "bg-purple-600" : room.status === "voting" ? "bg-amber-600" : "bg-slate-600"}>
                {room.status}
              </Badge>
            </div>
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <p className="text-slate-400 text-xs mb-1">Tempo/Turno</p>
              <p className="text-white font-medium text-sm">{room.gameData?.turnTimeLimit || 30}s</p>
            </div>
          </div>
          {room.gameData?.word && (
            <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
              <p className="text-blue-400 text-xs mb-1">Palavra Secreta</p>
              <p className="text-white font-bold">{room.gameData.word}</p>
            </div>
          )}
          {room.gameData?.impostorIds && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
              <p className="text-red-400 text-xs mb-1 flex items-center gap-1.5"><Skull className="w-3.5 h-3.5" /> Impostores</p>
              <p className="text-white font-bold">
                {room.gameData.impostorIds.map(id => room.players.find(p => p.uid === id)?.name || "?").join(", ")}
              </p>
            </div>
          )}
          <div>
            <p className="text-slate-400 text-xs mb-2">Jogadores ({room.players.length})</p>
            <div className="grid grid-cols-2 gap-2">
              {room.players.map((p) => {
                const isImpostor = room.gameData?.impostorIds?.includes(p.uid);
                const isHost = p.uid === room.hostId;
                return (
                  <div key={p.uid} className={`p-3 rounded-lg flex items-center gap-2 ${isImpostor ? "bg-red-500/20 border border-red-500/30" : "bg-slate-700/50"}`}>
                    <User className={`w-4 h-4 shrink-0 ${isImpostor ? "text-red-400" : "text-slate-400"}`} />
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${isImpostor ? "text-red-300" : "text-white"}`}>{p.name}</p>
                      <div className="flex gap-1 flex-wrap mt-0.5">
                        {isHost && <Badge className="text-[10px] bg-yellow-600/80 px-1 py-0">Host</Badge>}
                        {isImpostor && <Badge className="text-[10px] bg-red-600/80 px-1 py-0">Impostor</Badge>}
                        {!p.connected && <Badge className="text-[10px] bg-orange-600/80 px-1 py-0">Offline</Badge>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DesafioInspectDialog({ room, onClose }: { room: DesafioRoom | null; onClose: () => void }) {
  if (!room) return null;
  const gd = room.gameData;
  return (
    <Dialog open={!!room} onOpenChange={() => onClose()}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Type className="w-5 h-5 text-violet-400" /> Desafio da Palavra — Sala {room.code}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <p className="text-slate-400 text-xs mb-1">Status</p>
              <Badge className={room.status === "playing" ? "bg-emerald-600" : "bg-slate-600"}>
                {room.status === "playing" ? "Jogando" : "Aguardando"}
              </Badge>
            </div>
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <p className="text-slate-400 text-xs mb-1">Fase</p>
              <p className="text-white font-medium text-sm capitalize">{gd?.wordStatus || "—"}</p>
            </div>
          </div>

          {gd?.currentWord && (
            <div className="bg-violet-500/10 border border-violet-500/30 p-4 rounded-lg">
              <p className="text-violet-400 text-xs mb-1">Fragmento Atual</p>
              <p className="text-white font-bold text-2xl tracking-widest font-mono">{gd.currentWord.toUpperCase()}</p>
            </div>
          )}

          {gd?.vencedorName && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-lg">
              <p className="text-emerald-400 text-xs mb-1">Vencedor</p>
              <p className="text-white font-bold">{gd.vencedorName}</p>
            </div>
          )}

          <div>
            <p className="text-slate-400 text-xs mb-2">Jogadores ({room.players.length})</p>
            <div className="grid grid-cols-2 gap-2">
              {room.players.map((p) => {
                const vidas = gd?.vidasMap?.[p.uid] ?? 3;
                const isHost = p.uid === room.hostId;
                const isEliminated = vidas === 0;
                return (
                  <div key={p.uid} className={`p-3 rounded-lg flex items-center gap-2 ${isEliminated ? "bg-red-500/10 border border-red-500/20 opacity-60" : "bg-slate-700/50"}`}>
                    <User className={`w-4 h-4 shrink-0 ${isEliminated ? "text-red-400" : "text-slate-400"}`} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${isEliminated ? "text-red-300 line-through" : "text-white"}`}>{p.name}</p>
                      <div className="flex gap-1 flex-wrap mt-0.5 items-center">
                        {isHost && <Badge className="text-[10px] bg-yellow-600/80 px-1 py-0">Host</Badge>}
                        {!p.connected && <Badge className="text-[10px] bg-orange-600/80 px-1 py-0">Offline</Badge>}
                        <span className="text-xs text-slate-400">{"❤️".repeat(Math.max(0, vidas))}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Theme management ─────────────────────────────────────────────────────────

function TemasView({ token, themes, setThemes, onLogout }: {
  token: string | null;
  themes: Theme[];
  setThemes: (t: Theme[]) => void;
  onLogout: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Theme | null>(null);

  const filtered = themes.filter(t =>
    t.titulo.toLowerCase().includes(search.toLowerCase()) ||
    t.autor.toLowerCase().includes(search.toLowerCase())
  );

  const doApprove = async (id: string) => {
    const res = await fetch(`/api/admin/themes/${id}/approve`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { setThemes(themes.map(t => t.id === id ? { ...t, approved: true } : t)); setSelected(null); }
    else if (res.status === 401) onLogout();
  };
  const doReject = async (id: string) => {
    const res = await fetch(`/api/admin/themes/${id}/reject`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { setThemes(themes.map(t => t.id === id ? { ...t, approved: false } : t)); setSelected(null); }
    else if (res.status === 401) onLogout();
  };
  const doDelete = async (id: string) => {
    if (!confirm("Excluir este tema? Ação irreversível.")) return;
    const res = await fetch(`/api/admin/themes/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { setThemes(themes.filter(t => t.id !== id)); setSelected(null); }
    else if (res.status === 401) onLogout();
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar tema ou autor..."
          className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          data-testid="input-theme-search"
        />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-transparent">
              <TableHead className="text-slate-400">Tema</TableHead>
              <TableHead className="text-slate-400">Autor</TableHead>
              <TableHead className="text-slate-400">Palavras</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400">Pagamento</TableHead>
              <TableHead className="text-slate-400" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((theme) => (
              <TableRow key={theme.id} className="border-slate-700/50 hover:bg-slate-700/30">
                <TableCell className="text-white font-medium text-sm">{theme.titulo}</TableCell>
                <TableCell className="text-slate-400 text-sm">{theme.autor}</TableCell>
                <TableCell className="text-slate-400 text-sm">{theme.palavras.length}</TableCell>
                <TableCell>
                  <Badge className={theme.approved ? "bg-emerald-600/80 text-xs" : "bg-amber-600/80 text-xs"}>
                    {theme.approved ? "Aprovado" : "Pendente"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={theme.paymentStatus === "approved" ? "bg-emerald-600/80 text-xs" : theme.paymentStatus === "pending" ? "bg-amber-600/80 text-xs" : "bg-slate-600/80 text-xs"}>
                    {theme.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" onClick={() => setSelected(theme)} className="text-slate-400 hover:text-white h-7 px-2 text-xs">
                    <FileText className="w-3.5 h-3.5 mr-1" /> Ver
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5" /> {selected?.titulo}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Autor", selected.autor],
                  ["Público", selected.isPublic ? "Sim" : "Não"],
                  ["Código Acesso", selected.accessCode || "—"],
                  ["Pagamento", selected.paymentStatus],
                ].map(([l, v]) => (
                  <div key={l} className="bg-slate-700/50 p-3 rounded-lg">
                    <p className="text-slate-400 text-xs mb-1">{l}</p>
                    <p className="text-white font-medium">{v}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-2">Palavras ({selected.palavras.length})</p>
                <div className="p-3 bg-slate-700/50 rounded-lg max-h-48 overflow-y-auto flex flex-wrap gap-1.5">
                  {selected.palavras.map((w, i) => <Badge key={i} variant="secondary" className="bg-slate-600 text-xs">{w}</Badge>)}
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-700">
                {!selected.approved && (
                  <Button onClick={() => doApprove(selected.id)} className="bg-emerald-600 hover:bg-emerald-700 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1.5" /> Aprovar
                  </Button>
                )}
                {selected.approved && (
                  <Button onClick={() => doReject(selected.id)} variant="secondary" className="bg-amber-600 hover:bg-amber-700 text-sm">
                    <XCircle className="w-4 h-4 mr-1.5" /> Rejeitar
                  </Button>
                )}
                <Button onClick={() => doDelete(selected.id)} variant="destructive" className="text-sm ml-auto">
                  <Trash2 className="w-4 h-4 mr-1.5" /> Excluir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Overview (home) ─────────────────────────────────────────────────────────

function OverviewView({
  rooms, drawingRooms, sincStats, desafioRooms, token,
}: {
  rooms: Room[]; drawingRooms: DrawingRoom[];
  sincStats: SincStats | null; desafioRooms: DesafioRoom[];
  token: string | null;
}) {
  const totalOnline =
    rooms.filter(r => r.gameMode !== 'desafioPalavra').reduce((s, r) => s + r.players.filter(p => p.connected !== false).length, 0) +
    drawingRooms.reduce((s, r) => s + r.players.filter(p => p.connected !== false).length, 0) +
    (sincStats?.totalConnectedPlayers ?? 0) +
    desafioRooms.reduce((s, r) => s + r.players.filter(p => p.connected !== false).length, 0);

  const totalRooms = rooms.filter(r => r.gameMode !== 'desafioPalavra').length + drawingRooms.length + (sincStats?.activeRooms ?? 0) + desafioRooms.length;
  const playing = rooms.filter(r => r.status === "playing" && r.gameMode !== 'desafioPalavra').length + drawingRooms.filter(r => r.status !== "waiting").length + (sincStats?.playingRooms ?? 0) + desafioRooms.filter(r => r.status === "playing").length;
  const waiting = rooms.filter(r => r.status === "waiting" && r.gameMode !== 'desafioPalavra').length + drawingRooms.filter(r => r.status === "waiting").length + (sincStats?.waitingRooms ?? 0) + desafioRooms.filter(r => r.status === "waiting").length;

  const { data: analytics } = useQuery<any>({
    queryKey: ["/api/analytics/dashboard", token],
    queryFn: async () => {
      if (!token) return null;
      const res = await fetch("/api/analytics/dashboard", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    enabled: !!token,
  });

  const roomsChart = analytics?.timeSeries?.rooms || [];
  const formattedRoomsChart = roomsChart.map((d: any) => ({
    ...d,
    label: format(parseISO(d.date), "dd/MM", { locale: ptBR }),
  }));

  const gameCards = [
    { label: "Impostor Clássico", rooms: rooms.length, players: rooms.reduce((s, r) => s + r.players.length, 0), accent: "#6366f1", icon: Skull },
    { label: "Impostor Desenho", rooms: drawingRooms.length, players: drawingRooms.reduce((s, r) => s + r.players.length, 0), accent: "#a855f7", icon: Paintbrush },
    { label: "Sincronia", rooms: sincStats?.activeRooms ?? 0, players: sincStats?.totalConnectedPlayers ?? 0, accent: "#10b981", icon: Sparkles },
    { label: "Desafio da Palavra", rooms: desafioRooms.length, players: desafioRooms.reduce((s, r) => s + r.players.length, 0), accent: "#f59e0b", icon: Type },
  ];

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Salas Ativas" value={totalRooms} icon={Home} accent="#6366f1" />
        <StatCard label="Jogadores Online" value={totalOnline} icon={Users} accent="#10b981" />
        <StatCard label="Jogando agora" value={playing} icon={Activity} accent="#f59e0b" />
        <StatCard label="Aguardando" value={waiting} icon={Clock} accent="#64748b" />
      </div>

      {/* Per-game mini cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {gameCards.map((g) => (
          <Card key={g.label} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg shrink-0" style={{ background: `${g.accent}22` }}>
                  <g.icon className="w-4 h-4" style={{ color: g.accent }} />
                </div>
                <p className="text-xs text-slate-400 leading-tight">{g.label}</p>
              </div>
              <p className="text-xl font-bold text-white">{g.rooms} <span className="text-xs text-slate-500 font-normal">salas</span></p>
              <p className="text-sm text-slate-400 mt-0.5">{g.players} jogadores</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rooms chart */}
      <Card className="bg-slate-800/70 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-300 font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            Salas Criadas — Últimos 30 dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          {formattedRoomsChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={formattedRoomsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} width={30} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "12px", color: "#fff" }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">Carregando dados...</div>
          )}
        </CardContent>
      </Card>

      {/* Analytics stats if available */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Pageviews (total)" value={analytics.overview?.totalPageviews?.toLocaleString("pt-BR") || "0"} icon={Eye} accent="#6366f1" />
          <StatCard label="Visitantes Únicos" value={analytics.overview?.totalUniqueVisitors?.toLocaleString("pt-BR") || "0"} icon={Users} accent="#8b5cf6" />
          <StatCard label="Jogadores Únicos" value={analytics.overview?.totalPlayers?.toLocaleString("pt-BR") || "0"} icon={Gamepad2} accent="#ec4899" />
          <StatCard label="Sessão Média" value={(() => { const s = analytics.overview?.avgSessionDuration || 0; if (s < 60) return `${s}s`; return `${Math.floor(s/60)}m ${s%60}s`; })()} icon={Clock} accent="#f59e0b" />
        </div>
      )}
    </div>
  );
}

// ─── Per-game section wrapper ─────────────────────────────────────────────────

function GameSection({
  title, icon: Icon, accent, statsCards, children, lastUpdated,
}: {
  title: string; icon: any; accent: string; statsCards: React.ReactNode; children: React.ReactNode; lastUpdated?: Date;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: `${accent}22` }}>
            <Icon className="w-5 h-5" style={{ color: accent }} />
          </div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>
        {lastUpdated && (
          <span className="text-xs text-slate-500">
            Atualizado às {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{statsCards}</div>
      <Card className="bg-slate-800/70 border-slate-700">
        <CardContent className="p-0 pt-1">{children}</CardContent>
      </Card>
    </div>
  );
}

function GameSessionsChart({ gameType, token, accent }: { gameType: string; token: string | null; accent: string }) {
  const { data, isLoading } = useQuery<{ date: string; count: number }[]>({
    queryKey: ["/api/admin/game-sessions", gameType, token],
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch(`/api/admin/game-sessions/${gameType}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  const chartData = (data || []).map(d => ({
    ...d,
    label: format(parseISO(d.date), "dd/MM", { locale: ptBR }),
  }));

  const totalGames = (data || []).reduce((s, d) => s + d.count, 0);

  return (
    <Card className="bg-slate-800/70 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-slate-300 font-medium flex items-center gap-2">
          <BarChart3 className="w-4 h-4" style={{ color: accent }} />
          Partidas Jogadas — Últimos 30 dias
          <span className="ml-auto text-xs text-slate-400 font-normal">{totalGames} total</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[180px] flex items-center justify-center text-slate-500 text-sm">Carregando...</div>
        ) : chartData.length === 0 || totalGames === 0 ? (
          <div className="h-[180px] flex flex-col items-center justify-center text-slate-500 text-sm gap-1">
            <Activity className="w-6 h-6 mb-1 opacity-40" />
            Nenhuma partida registrada ainda
            <span className="text-xs text-slate-600">Inicia quando uma sala com 3+ jogadores começa</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "12px", color: "#fff" }}
                formatter={(v: number) => [v, "Partidas"]}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="count" fill={accent} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [nav, setNav] = useState<NavItem>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [drawingRooms, setDrawingRooms] = useState<DrawingRoom[]>([]);
  const [sincStats, setSincStats] = useState<SincStats | null>(null);
  const [desafioRooms, setDesafioRooms] = useState<DesafioRoom[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const [inspectRoom, setInspectRoom] = useState<Room | null>(null);
  const [inspectDrawing, setInspectDrawing] = useState<DrawingRoom | null>(null);
  const [inspectDesafio, setInspectDesafio] = useState<DesafioRoom | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");
    try {
      localStorage.removeItem("adminToken");
      const response = await apiRequest("POST", "/api/admin/login", { email, password });
      const data = await response.json();
      if (data.success) {
        setToken(data.token);
        localStorage.setItem("adminToken", data.token);
        setIsAuthenticated(true);
      }
    } catch {
      setLoginError("Credenciais inválidas");
      setToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem("adminToken");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = useCallback(async () => {
    try {
      const t = localStorage.getItem("adminToken");
      await fetch("/api/admin/logout", { method: "POST", headers: { Authorization: t ? `Bearer ${t}` : "" } });
    } finally {
      localStorage.removeItem("adminToken");
      setToken(null);
      setIsAuthenticated(false);
      setRooms([]); setDrawingRooms([]); setSincStats(null); setDesafioRooms([]); setThemes([]);
      setEmail(""); setPassword(""); setLoginError("");
    }
  }, []);

  const fetchAll = useCallback(async (t: string) => {
    const headers = { Authorization: `Bearer ${t}` };
    const [roomsRes, drawRes, sincRes, desafioRes] = await Promise.allSettled([
      fetch("/api/admin/rooms", { headers }),
      fetch("/api/admin/drawing-rooms", { headers }),
      fetch("/api/admin/sincronia-rooms", { headers }),
      fetch("/api/admin/desafio-rooms", { headers }),
    ]);

    if (roomsRes.status === "fulfilled" && roomsRes.value.ok) setRooms(await roomsRes.value.json());
    else if (roomsRes.status === "fulfilled" && roomsRes.value.status === 401) { handleLogout(); return; }

    if (drawRes.status === "fulfilled" && drawRes.value.ok) setDrawingRooms(await drawRes.value.json());
    if (sincRes.status === "fulfilled" && sincRes.value.ok) setSincStats(await sincRes.value.json());
    if (desafioRes.status === "fulfilled" && desafioRes.value.ok) setDesafioRooms(await desafioRes.value.json());

    setLastUpdated(new Date());
  }, [handleLogout]);

  const fetchThemes = useCallback(async (t: string) => {
    const res = await fetch("/api/admin/themes", { headers: { Authorization: `Bearer ${t}` } });
    if (res.ok) setThemes(await res.json());
    else if (res.status === 401) handleLogout();
  }, [handleLogout]);

  const inspectImpostor = async (code: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/rooms/${code}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setInspectRoom(await res.json());
    else if (res.status === 401) handleLogout();
  };

  const inspectDrawingRoom = async (code: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/drawing-rooms/${code}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setInspectDrawing(await res.json());
    else if (res.status === 401) handleLogout();
  };

  const inspectDesafioRoom = async (code: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/desafio-rooms/${code}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setInspectDesafio(await res.json());
    else if (res.status === 401) handleLogout();
  };

  useEffect(() => {
    const saved = localStorage.getItem("adminToken");
    if (!saved) return;
    fetch("/api/admin/verify", { headers: { Authorization: `Bearer ${saved}` } })
      .then(res => {
        if (res.ok) { setToken(saved); setIsAuthenticated(true); }
        else localStorage.removeItem("adminToken");
      })
      .catch(() => localStorage.removeItem("adminToken"));
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    fetchAll(token);
    fetchThemes(token);
    const interval = setInterval(() => fetchAll(token), 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, token, fetchAll, fetchThemes]);

  // ── Login screen ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-indigo-400" />
            </div>
            <CardTitle className="text-white text-xl">Admin Dashboard</CardTitle>
            <p className="text-slate-400 text-sm mt-1">Acesso restrito ao administrador</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-300 text-sm">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@tikjogos.com" className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  required data-testid="input-admin-email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-300 text-sm">Senha</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  required data-testid="input-admin-password" />
              </div>
              {loginError && (
                <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 shrink-0" />{loginError}
                </div>
              )}
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading} data-testid="button-admin-login">
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Nav items ──
  const navItems: { id: NavItem; label: string; icon: any; accent: string; badge?: number }[] = [
    { id: "overview", label: "Visão Geral", icon: Home, accent: "#6366f1" },
    { id: "impostor", label: "Impostor Clássico", icon: Skull, accent: "#6366f1", badge: rooms.length || undefined },
    { id: "desenho", label: "Impostor Desenho", icon: Paintbrush, accent: "#a855f7", badge: drawingRooms.length || undefined },
    { id: "sincronia", label: "Sincronia", icon: Sparkles, accent: "#10b981", badge: sincStats?.activeRooms || undefined },
    { id: "palavra", label: "Desafio da Palavra", icon: Type, accent: "#f59e0b", badge: desafioRooms.filter(r => r.players.some(p => p.connected !== false)).length || undefined },
    { id: "temas", label: "Temas", icon: FileText, accent: "#ec4899", badge: themes.filter(t => !t.approved).length || undefined },
    { id: "analytics", label: "Analytics", icon: BarChart3, accent: "#06b6d4" },
    { id: "feedback", label: "Feedback", icon: Star, accent: "#f59e0b" },
  ];

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={`${mobile ? "w-full" : "w-56 shrink-0"} space-y-0.5`}>
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => { setNav(item.id); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${nav === item.id ? "bg-slate-700 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          data-testid={`nav-${item.id}`}
        >
          <div className="p-1.5 rounded-lg shrink-0" style={{ background: nav === item.id ? `${item.accent}33` : "transparent" }}>
            <item.icon className="w-4 h-4" style={{ color: nav === item.id ? item.accent : "currentColor" }} />
          </div>
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <Badge className="text-[10px] h-5 px-1.5 bg-slate-600">{item.badge}</Badge>
          )}
        </button>
      ))}
    </nav>
  );

  // ── Content by nav ──
  const renderContent = () => {
    switch (nav) {
      case "overview":
        return (
          <OverviewView
            rooms={rooms} drawingRooms={drawingRooms}
            sincStats={sincStats} desafioRooms={desafioRooms}
            token={token}
          />
        );

      case "impostor":
        return (
          <div className="space-y-5">
            <GameSection
              title="Impostor Clássico" icon={Skull} accent="#6366f1" lastUpdated={lastUpdated}
              statsCards={<>
                <StatCard label="Salas Ativas" value={rooms.length} icon={Home} accent="#6366f1" />
                <StatCard label="Jogadores" value={rooms.reduce((s, r) => s + r.players.length, 0)} icon={Users} accent="#8b5cf6" />
                <StatCard label="Jogando" value={rooms.filter(r => r.status === "playing").length} icon={Activity} accent="#10b981" />
                <StatCard label="Aguardando" value={rooms.filter(r => r.status === "waiting").length} icon={Clock} accent="#64748b" />
              </>}
            >
              <ImpostorRoomsTable rooms={rooms} onInspect={inspectImpostor} />
            </GameSection>
            <GameSessionsChart gameType="impostor" token={token} accent="#6366f1" />
          </div>
        );

      case "desenho":
        return (
          <div className="space-y-5">
            <GameSection
              title="Impostor Desenho" icon={Paintbrush} accent="#a855f7" lastUpdated={lastUpdated}
              statsCards={<>
                <StatCard label="Salas Ativas" value={drawingRooms.length} icon={Home} accent="#a855f7" />
                <StatCard label="Jogadores" value={drawingRooms.reduce((s, r) => s + r.players.length, 0)} icon={Users} accent="#8b5cf6" />
                <StatCard label="Jogando" value={drawingRooms.filter(r => r.status !== "waiting").length} icon={Activity} accent="#10b981" />
                <StatCard label="Aguardando" value={drawingRooms.filter(r => r.status === "waiting").length} icon={Clock} accent="#64748b" />
              </>}
            >
              <DrawingRoomsTable rooms={drawingRooms} onInspect={inspectDrawingRoom} />
            </GameSection>
            <GameSessionsChart gameType="desenho" token={token} accent="#a855f7" />
          </div>
        );

      case "sincronia":
        return (
          <div className="space-y-5">
            <GameSection
              title="Sincronia (Respostas em Comum)" icon={Sparkles} accent="#10b981" lastUpdated={lastUpdated}
              statsCards={<>
                <StatCard label="Salas Ativas" value={sincStats?.activeRooms ?? 0} icon={Home} accent="#10b981" />
                <StatCard label="Jogadores Online" value={sincStats?.totalConnectedPlayers ?? 0} icon={Users} accent="#34d399" />
                <StatCard label="Jogando" value={sincStats?.playingRooms ?? 0} icon={Activity} accent="#10b981" />
                <StatCard label="Aguardando" value={sincStats?.waitingRooms ?? 0} icon={Clock} accent="#64748b" />
              </>}
            >
              <SincroniaRoomsTable stats={sincStats} />
            </GameSection>
            <GameSessionsChart gameType="sincronia" token={token} accent="#10b981" />
          </div>
        );

      case "palavra":
        return (
          <div className="space-y-5">
            <GameSection
              title="Desafio da Palavra" icon={Type} accent="#f59e0b" lastUpdated={lastUpdated}
              statsCards={<>
                <StatCard label="Salas Ativas" value={desafioRooms.length} icon={Home} accent="#f59e0b" />
                <StatCard label="Jogadores" value={desafioRooms.reduce((s, r) => s + r.players.length, 0)} icon={Users} accent="#fbbf24" />
                <StatCard label="Jogando" value={desafioRooms.filter(r => r.status === "playing").length} icon={Activity} accent="#10b981" />
                <StatCard label="Aguardando" value={desafioRooms.filter(r => r.status !== "playing").length} icon={Clock} accent="#64748b" />
              </>}
            >
              <DesafioRoomsTable rooms={desafioRooms} onInspect={inspectDesafioRoom} />
            </GameSection>
            <GameSessionsChart gameType="desafio" token={token} accent="#f59e0b" />
          </div>
        );

      case "temas":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-xl bg-pink-500/20">
                <FileText className="w-5 h-5 text-pink-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Moderação de Temas</h2>
              <Badge className="bg-amber-600/80 ml-auto">{themes.filter(t => !t.approved).length} pendentes</Badge>
            </div>
            <TemasView token={token} themes={themes} setThemes={setThemes} onLogout={handleLogout} />
          </div>
        );

      case "analytics":
        return <AnalyticsDashboard token={token} />;

      case "feedback":
        return <FeedbackView token={token} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-slate-800/80 border-b border-slate-700 px-4 py-3 flex items-center gap-3 sticky top-0 z-20 backdrop-blur-sm">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2 font-bold text-white">
          <Gamepad2 className="w-5 h-5 text-indigo-400" />
          <span className="hidden sm:block">TikJogos Admin</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 mr-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Ao vivo · atualiza a cada 5s
          </div>
          <Button variant="ghost" size="icon" onClick={() => token && fetchAll(token)} className="text-slate-400 hover:text-white h-8 w-8" data-testid="button-refresh-all">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-white h-8 w-8" data-testid="button-admin-logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-slate-700 p-4 overflow-y-auto z-40" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2 font-bold text-white mb-5 px-1">
                <Gamepad2 className="w-5 h-5 text-indigo-400" /> TikJogos Admin
              </div>
              <Sidebar mobile />
            </aside>
          </div>
        )}

        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 shrink-0 bg-slate-800/40 border-r border-slate-700/50 p-3 h-[calc(100vh-57px)] sticky top-[57px] overflow-y-auto">
          <Sidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>

      {/* Inspect dialogs */}
      <ImpostorInspectDialog room={inspectRoom} onClose={() => setInspectRoom(null)} />
      <DrawingInspectDialog room={inspectDrawing} onClose={() => setInspectDrawing(null)} />
      <DesafioInspectDialog room={inspectDesafio} onClose={() => setInspectDesafio(null)} />
    </div>
  );
}
