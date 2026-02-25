import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3, Users, Eye, Gamepad2, TrendingUp, TrendingDown,
  Smartphone, Monitor, Globe, Clock, DoorOpen, Trophy, AlertTriangle,
  Activity, MapPin, Timer, Flame, Target, CalendarDays, Hash, Sparkles
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type TimeSeries = Array<{ date: string; count: number }>;
type NameValue = { name: string; value: number };

type DashboardData = {
  overview: {
    totalPageviews: number;
    totalUniqueVisitors: number;
    totalPlayers: number;
    avgSessionDuration: number;
    changes: { pageviews: number; visitors: number; players: number; session: number };
  };
  timeSeries: { pageviews: TimeSeries; visitors: TimeSeries; rooms: TimeSeries };
  devices: NameValue[];
  browsers: NameValue[];
  geo: { countries: NameValue[]; cities: NameValue[] };
  games: {
    roomsTotal: number; roomsToday: number; roomsMonth: number;
    activeRooms: number; abandonmentRate: number; avgRoomDuration: number;
    gameModes: NameValue[]; themeUsage: NameValue[];
    roomsLast30Days: TimeSeries; roomsPerDayMonth: TimeSeries;
  };
  sincronia?: {
    totalRoomsCreated: number;
    activeRooms: number;
    playingRooms: number;
    waitingRooms: number;
    totalConnectedPlayers: number;
    rooms: Array<{
      code: string; hostId: string; phase: string;
      playerCount: number; connectedPlayers: number;
      category: string; currentRound: number; totalRounds: number;
    }>;
  };
  topPages: NameValue[];
  referrers: NameValue[];
};

type AnalyticsDashboardProps = { token: string | null };

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#06b6d4', '#f97316', '#84cc16',
];

const GAME_MODE_LABELS: Record<string, string> = {
  palavraSecreta: 'Palavra Secreta',
  palavras: 'Locais & Funções',
  duasFaccoes: 'Duas Facções',
  categoriaItem: 'Categoria & Item',
  perguntasDiferentes: 'Perguntas Diferentes',
  palavraComunidade: 'Tema Comunidade',
  'impostor-desenho': 'Impostor Desenho',
};

const DEVICE_ICONS: Record<string, any> = { mobile: Smartphone, desktop: Monitor, tablet: Monitor };

function formatNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString('pt-BR');
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function ChangeIndicator({ value }: { value: number }) {
  if (value === 0) return <span className="text-[10px] text-white/40">sem variação</span>;
  const isPositive = value > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
      <Icon className="h-3 w-3" />
      {isPositive ? '+' : ''}{value}%
      <span className="text-white/30 font-normal ml-0.5">vs sem. anterior</span>
    </span>
  );
}

function KpiCard({ title, value, icon: Icon, change, subtitle, accent = '#6366f1' }: {
  title: string; value: string; icon: any; change?: number; subtitle?: string; accent?: string;
}) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, ${accent}20, transparent)` }} />
      <Card className="relative bg-[#1e293b]/80 border-white/[0.06] backdrop-blur-sm rounded-2xl hover:border-white/[0.12] transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}20` }}>
              <Icon className="h-5 w-5" style={{ color: accent }} />
            </div>
            {change !== undefined && <ChangeIndicator value={change} />}
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
          <p className="text-[13px] text-white/50 mt-1">{title}</p>
          {subtitle && <p className="text-[11px] text-white/30 mt-0.5">{subtitle}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function StatMini({ label, value, icon: Icon, accent = '#6366f1' }: {
  label: string; value: string; icon: any; accent?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
      <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${accent}15` }}>
        <Icon className="h-4 w-4" style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-white truncate">{value}</div>
        <div className="text-[11px] text-white/40 truncate">{label}</div>
      </div>
    </div>
  );
}

function MiniChart({ data, color, height = 200 }: { data: TimeSeries; color: string; height?: number }) {
  if (!data || data.length === 0) return <div className="h-48 flex items-center justify-center text-white/30 text-sm">Sem dados</div>;
  const formatted = data.map(d => ({ ...d, label: format(parseISO(d.date), 'dd/MM', { locale: ptBR }) }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formatted}>
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} width={35} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
          labelFormatter={l => `${l}`}
          formatter={(v: number) => [v.toLocaleString('pt-BR'), '']}
        />
        <Area type="monotone" dataKey="count" stroke={color} strokeWidth={2} fill={`url(#grad-${color.replace('#','')})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function DevicePieChart({ data }: { data: NameValue[] }) {
  if (!data || data.length === 0) return <div className="h-48 flex items-center justify-center text-white/30 text-sm">Sem dados</div>;
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={150} height={150}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value" strokeWidth={0}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
            formatter={(v: number) => [v.toLocaleString('pt-BR'), '']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-3 flex-1">
        {data.map((d, i) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          const label = d.name === 'mobile' ? '📱 Mobile' : d.name === 'desktop' ? '💻 Desktop' : d.name === 'tablet' ? '📱 Tablet' : d.name;
          return (
            <div key={d.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">{label}</span>
                <span className="font-semibold text-white">{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HorizontalBarList({ data, color, showIndex = false }: { data: NameValue[]; color: string; showIndex?: boolean }) {
  if (!data || data.length === 0) return <div className="h-32 flex items-center justify-center text-white/30 text-sm">Sem dados</div>;
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="space-y-2.5">
      {data.slice(0, 8).map((d, i) => (
        <div key={d.name} className="group">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="flex items-center gap-2 text-white/60 group-hover:text-white/80 transition-colors truncate max-w-[220px]">
              {showIndex && <span className="text-[11px] font-bold text-white/20 w-4">{i + 1}</span>}
              {d.name}
            </span>
            <span className="font-semibold text-white/80 tabular-nums">{d.value.toLocaleString('pt-BR')}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500 group-hover:opacity-100 opacity-80"
              style={{ width: `${max > 0 ? (d.value / max) * 100 : 0}%`, backgroundColor: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <div className="h-8 w-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
        <Icon className="h-4 w-4 text-white/50" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white/80">{title}</h3>
        {subtitle && <p className="text-[11px] text-white/30">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function AnalyticsDashboard({ token }: AnalyticsDashboardProps) {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/analytics/dashboard', token],
    queryFn: async () => {
      if (!token) throw new Error('Token não disponível');
      const res = await fetch('/api/analytics/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `${res.status}: ${res.statusText}`);
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!token,
  });

  if (!token) {
    return (
      <div className="p-6">
        <Card className="bg-[#1e293b]/80 border-amber-500/30">
          <CardContent className="pt-6">
            <p className="text-amber-400 font-semibold mb-2">Autenticação necessária</p>
            <p className="text-sm text-white/50">Faça login como administrador para visualizar o dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) return <LoadingSkeleton />;

  if (error) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    return (
      <div className="p-6">
        <Card className="bg-[#1e293b]/80 border-rose-500/30">
          <CardContent className="pt-6">
            <p className="text-rose-400 font-semibold mb-2">Erro ao carregar dashboard</p>
            <p className="text-sm text-white/50">{msg}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const { overview, timeSeries, devices, browsers, geo, games, sincronia } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
            <p className="text-sm text-white/40">Visão completa do TikJogos</p>
          </div>
        </div>
        <Badge variant="outline" className="border-white/10 text-white/40 text-[11px]">
          Atualizado agora
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-[#1e293b]/60 border border-white/[0.06] p-1 rounded-xl">
          <TabsTrigger value="overview" className="gap-2 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 text-sm">
            <Activity className="h-4 w-4" />Visão Geral
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 text-sm">
            <Users className="h-4 w-4" />Usuários
          </TabsTrigger>
          <TabsTrigger value="games" className="gap-2 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 text-sm">
            <Gamepad2 className="h-4 w-4" />Impostor
          </TabsTrigger>
          <TabsTrigger value="sincronia" className="gap-2 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 text-sm">
            <Sparkles className="h-4 w-4" />Sincronia
          </TabsTrigger>
        </TabsList>

        {/* ═══ OVERVIEW TAB ═══ */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Pageviews" value={formatNum(overview.totalPageviews)} icon={Eye} change={overview.changes.pageviews} accent="#6366f1" />
            <KpiCard title="Visitantes Únicos (IPs)" value={formatNum(overview.totalUniqueVisitors)} icon={Users} change={overview.changes.visitors} accent="#8b5cf6" />
            <KpiCard title="Jogadores Únicos" value={formatNum(overview.totalPlayers)} icon={Gamepad2} change={overview.changes.players} accent="#ec4899" subtitle="Entraram em pelo menos 1 sala" />
            <KpiCard title="Sessão Média" value={formatDuration(overview.avgSessionDuration)} icon={Clock} change={overview.changes.session} accent="#f59e0b" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#1e293b]/80 border-white/[0.06] rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-indigo-400" />
                  Pageviews — 30 dias
                </CardTitle>
              </CardHeader>
              <CardContent><MiniChart data={timeSeries.pageviews} color="#6366f1" /></CardContent>
            </Card>
            <Card className="bg-[#1e293b]/80 border-white/[0.06] rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-400" />
                  Visitantes Únicos — 30 dias
                </CardTitle>
              </CardHeader>
              <CardContent><MiniChart data={timeSeries.visitors} color="#8b5cf6" /></CardContent>
            </Card>
          </div>

          {/* Rooms chart full width */}
          <Card className="bg-[#1e293b]/80 border-white/[0.06] rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
                <DoorOpen className="h-4 w-4 text-amber-400" />
                Salas Criadas por Dia — 30 dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={(timeSeries.rooms || []).map(d => ({ ...d, label: format(parseISO(d.date), 'dd/MM', { locale: ptBR }) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} width={35} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatMini label="Salas Hoje" value={formatNum(games.roomsToday)} icon={DoorOpen} accent="#f59e0b" />
            <StatMini label="Salas Este Mês" value={formatNum(games.roomsMonth)} icon={CalendarDays} accent="#10b981" />
            <StatMini label="Salas Ativas" value={formatNum(games.activeRooms)} icon={Flame} accent="#ef4444" />
            <StatMini label="Total de Salas" value={formatNum(games.roomsTotal)} icon={Hash} accent="#6366f1" />
          </div>
        </TabsContent>

        {/* ═══ USERS TAB ═══ */}
        <TabsContent value="users" className="space-y-6">
          {/* User KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard title="Visitantes Únicos (IPs)" value={formatNum(overview.totalUniqueVisitors)} icon={Users} change={overview.changes.visitors} accent="#8b5cf6" subtitle="IPs diferentes que acessaram" />
            <KpiCard title="Jogadores Únicos" value={formatNum(overview.totalPlayers)} icon={Gamepad2} change={overview.changes.players} accent="#ec4899" subtitle="Entraram em pelo menos 1 sala" />
            <KpiCard title="Tempo Médio de Sessão" value={formatDuration(overview.avgSessionDuration)} icon={Timer} change={overview.changes.session} accent="#f59e0b" subtitle="Duração média no site" />
          </div>

          {/* Devices + Browsers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#1e293b]/80 border-white/[0.06] rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-indigo-400" />
                  Dispositivos
                </CardTitle>
              </CardHeader>
              <CardContent><DevicePieChart data={devices} /></CardContent>
            </Card>
            <Card className="bg-[#1e293b]/80 border-white/[0.06] rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-purple-400" />
                  Navegadores
                </CardTitle>
              </CardHeader>
              <CardContent><HorizontalBarList data={browsers} color="#8b5cf6" showIndex /></CardContent>
            </Card>
          </div>

          {/* Geo: Countries + Cities */}
          <SectionTitle icon={MapPin} title="Localização" subtitle="Países e cidades dos visitantes" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#1e293b]/80 border-white/[0.06] rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-indigo-400" />
                  Países
                </CardTitle>
              </CardHeader>
              <CardContent><HorizontalBarList data={geo.countries} color="#6366f1" showIndex /></CardContent>
            </Card>
            <Card className="bg-[#1e293b]/80 border-white/[0.06] rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-pink-400" />
                  Cidades
                </CardTitle>
              </CardHeader>
              <CardContent><HorizontalBarList data={geo.cities} color="#ec4899" showIndex /></CardContent>
            </Card>
          </div>

          {/* Top Pages + Referrers */}
          <SectionTitle icon={Eye} title="Tráfego" subtitle="Páginas mais visitadas e origens" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#1e293b]/80 border-white/[0.06] rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-400" />
                  Páginas Mais Visitadas
                </CardTitle>
              </CardHeader>
              <CardContent><HorizontalBarList data={data.topPages || []} color="#10b981" showIndex /></CardContent>
            </Card>
            <Card className="bg-[#1e293b]/80 border-white/[0.06] rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-cyan-400" />
                  Referências (Origem)
                </CardTitle>
              </CardHeader>
              <CardContent><HorizontalBarList data={data.referrers || []} color="#06b6d4" showIndex /></CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══ GAMES / SALAS TAB ═══ */}
        <TabsContent value="games" className="space-y-6">
          {/* Game KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total de Salas" value={formatNum(games.roomsTotal)} icon={DoorOpen} accent="#6366f1" subtitle="Desde o início" />
            <KpiCard title="Salas Ativas Agora" value={formatNum(games.activeRooms)} icon={Flame} accent="#ef4444" subtitle="Em andamento" />
            <KpiCard title="Duração Média da Sala" value={formatDuration(games.avgRoomDuration || 0)} icon={Timer} accent="#10b981" subtitle="Tempo médio de jogo" />
            <KpiCard
              title="Taxa de Abandono"
              value={`${games.abandonmentRate}%`}
              icon={AlertTriangle}
              accent={games.abandonmentRate > 50 ? '#ef4444' : '#f59e0b'}
              subtitle="Salas sem jogadores (30d)"
            />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatMini label="Salas Hoje" value={formatNum(games.roomsToday)} icon={DoorOpen} accent="#f59e0b" />
            <StatMini label="Salas Este Mês" value={formatNum(games.roomsMonth)} icon={CalendarDays} accent="#10b981" />
            <StatMini label="Jogadores Únicos" value={formatNum(overview.totalPlayers)} icon={Gamepad2} accent="#ec4899" />
            <StatMini label="Total Geral" value={formatNum(games.roomsTotal)} icon={Target} accent="#6366f1" />
          </div>

          {/* Rooms chart */}
          <Card className="bg-[#1e293b]/80 border-white/[0.06] rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-amber-400" />
                Salas Criadas por Dia — 30 dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={(games.roomsLast30Days || []).map(d => ({ ...d, label: format(parseISO(d.date), 'dd/MM', { locale: ptBR }) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} width={35} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly rooms chart */}
          {games.roomsPerDayMonth && games.roomsPerDayMonth.length > 0 && (
            <Card className="bg-[#1e293b]/80 border-white/[0.06] rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-emerald-400" />
                  Salas Criadas — Mês Atual
                </CardTitle>
              </CardHeader>
              <CardContent><MiniChart data={games.roomsPerDayMonth} color="#10b981" /></CardContent>
            </Card>
          )}

          {/* Game Rankings */}
          <SectionTitle icon={Trophy} title="Ranking de Jogos" subtitle="Qual tipo de jogo dá mais engajamento?" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#1e293b]/80 border-white/[0.06] rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  Jogos Mais Jogados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HorizontalBarList
                  data={(games.gameModes || []).map(g => ({ ...g, name: GAME_MODE_LABELS[g.name] || g.name }))}
                  color="#f59e0b"
                  showIndex
                />
              </CardContent>
            </Card>
            <Card className="bg-[#1e293b]/80 border-white/[0.06] rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4 text-indigo-400" />
                  Temas / Modos Mais Usados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HorizontalBarList
                  data={(games.themeUsage || []).map(t => ({ ...t, name: GAME_MODE_LABELS[t.name] || t.name }))}
                  color="#6366f1"
                  showIndex
                />
              </CardContent>
            </Card>
          </div>

          {/* Engagement insight */}
          <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20 rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Target className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Insight de Engajamento</h4>
                  <p className="text-[13px] text-white/50 leading-relaxed">
                    {games.abandonmentRate > 50
                      ? `A taxa de abandono está em ${games.abandonmentRate}%. Considere melhorar o onboarding ou reduzir o tempo de espera nas salas.`
                      : games.gameModes && games.gameModes.length > 0
                        ? `O modo "${GAME_MODE_LABELS[games.gameModes[0]?.name] || games.gameModes[0]?.name}" é o mais popular com ${games.gameModes[0]?.value} partidas. Taxa de abandono saudável em ${games.abandonmentRate}%.`
                        : 'Colete mais dados para gerar insights sobre engajamento.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ SINCRONIA TAB ═══ */}
        <TabsContent value="sincronia" className="space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard title="Salas Criadas (sessão)" value={String(sincronia?.totalRoomsCreated ?? 0)} icon={Gamepad2} accent="#10b981" subtitle="Desde o início do servidor" />
            <KpiCard title="Salas Ativas" value={String(sincronia?.activeRooms ?? 0)} icon={Activity} accent="#06b6d4" subtitle="Com jogadores conectados" />
            <KpiCard title="Em Jogo" value={String(sincronia?.playingRooms ?? 0)} icon={Gamepad2} accent="#f59e0b" subtitle="Partidas em andamento" />
            <KpiCard title="Jogadores Online" value={String(sincronia?.totalConnectedPlayers ?? 0)} icon={Users} accent="#8b5cf6" subtitle="Conectados agora" />
          </div>

          {/* Active rooms list */}
          <Card className="bg-[#1e293b]/60 border-white/[0.06]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Salas Ativas do Sincronia</CardTitle>
            </CardHeader>
            <CardContent>
              {sincronia?.rooms && sincronia.rooms.length > 0 ? (
                <div className="space-y-3">
                  {sincronia.rooms.map(room => (
                    <div key={room.code} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="flex items-center gap-4">
                        <div className="px-3 py-1.5 bg-emerald-500/20 rounded-lg">
                          <span className="text-emerald-400 font-mono font-bold text-lg">{room.code}</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {room.phase === 'waiting' ? '⏳ Aguardando' : '🎮 Jogando'}
                            {room.phase === 'playing' && ` (Rodada ${room.currentRound}/${room.totalRounds})`}
                          </p>
                          <p className="text-white/40 text-xs">Tema: {room.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-white/40" />
                        <span className="text-white/60 text-sm font-medium">{room.connectedPlayers}/{room.playerCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-center py-8">Nenhuma sala ativa no momento</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-2xl bg-white/[0.06]" />
        <div>
          <Skeleton className="h-7 w-48 bg-white/[0.06]" />
          <Skeleton className="h-4 w-32 mt-1 bg-white/[0.06]" />
        </div>
      </div>
      <Skeleton className="h-10 w-96 bg-white/[0.06] rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-36 rounded-2xl bg-white/[0.06]" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-72 rounded-2xl bg-white/[0.06]" />
        <Skeleton className="h-72 rounded-2xl bg-white/[0.06]" />
      </div>
    </div>
  );
}
