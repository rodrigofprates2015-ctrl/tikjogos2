import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3, Users, Eye, Gamepad2, TrendingUp, TrendingDown,
  Smartphone, Monitor, Globe, Clock, DoorOpen, Trophy, AlertTriangle,
  Activity
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
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
    activeRooms: number; abandonmentRate: number;
    gameModes: NameValue[]; themeUsage: NameValue[];
    roomsLast30Days: TimeSeries;
  };
};

type AnalyticsDashboardProps = { token: string | null };

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#7c3aed', '#4f46e5', '#4338ca'];
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
  if (value === 0) return <span className="text-xs text-muted-foreground">sem variação</span>;
  const isPositive = value > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
      <Icon className="h-3 w-3" />
      {isPositive ? '+' : ''}{value}%
      <span className="text-muted-foreground font-normal">vs semana anterior</span>
    </span>
  );
}

function KpiCard({ title, value, icon: Icon, change, subtitle, color = 'text-foreground' }: {
  title: string; value: string; icon: any; change?: number; subtitle?: string; color?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold tracking-tight ${color}`}>{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {change !== undefined && <div className="mt-2"><ChangeIndicator value={change} /></div>}
      </CardContent>
    </Card>
  );
}

function MiniChart({ data, color }: { data: TimeSeries; color: string }) {
  if (!data || data.length === 0) return <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Sem dados</div>;
  const formatted = data.map(d => ({ ...d, label: format(parseISO(d.date), 'dd/MM', { locale: ptBR }) }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={formatted}>
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11 }} width={40} />
        <Tooltip
          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
          labelFormatter={l => `Data: ${l}`}
          formatter={(v: number) => [v.toLocaleString('pt-BR'), '']}
        />
        <Area type="monotone" dataKey="count" stroke={color} strokeWidth={2} fill={`url(#grad-${color.replace('#','')})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function DevicePieChart({ data }: { data: NameValue[] }) {
  if (!data || data.length === 0) return <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Sem dados</div>;
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={2}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v: number) => [v.toLocaleString('pt-BR'), '']} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-3 flex-1">
        {data.map((d, i) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          const label = d.name === 'mobile' ? 'Mobile' : d.name === 'desktop' ? 'Desktop' : d.name === 'tablet' ? 'Tablet' : d.name;
          const DevIcon = DEVICE_ICONS[d.name] || Monitor;
          return (
            <div key={d.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <DevIcon className="h-3.5 w-3.5" style={{ color: COLORS[i % COLORS.length] }} />
                  {label}
                </span>
                <span className="font-medium">{pct}%</span>
              </div>
              <Progress value={pct} className="h-1.5" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HorizontalBarList({ data, color }: { data: NameValue[]; color: string }) {
  if (!data || data.length === 0) return <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">Sem dados</div>;
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="space-y-3">
      {data.slice(0, 8).map((d, i) => (
        <div key={d.name} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="truncate max-w-[200px]">{d.name}</span>
            <span className="font-medium text-muted-foreground">{d.value.toLocaleString('pt-BR')}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${max > 0 ? (d.value / max) * 100 : 0}%`, backgroundColor: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const GAME_MODE_LABELS: Record<string, string> = {
  palavraSecreta: 'Palavra Secreta',
  palavras: 'Locais & Funções',
  duasFaccoes: 'Duas Facções',
  categoriaItem: 'Categoria & Item',
  perguntasDiferentes: 'Perguntas Diferentes',
  palavraComunidade: 'Tema Comunidade',
  'impostor-desenho': 'Impostor Desenho',
};

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
        <Card className="border-yellow-600"><CardContent className="pt-6">
          <p className="text-yellow-600 font-semibold mb-2">Autenticação necessária</p>
          <p className="text-sm text-muted-foreground">Faça login como administrador para visualizar o dashboard.</p>
        </CardContent></Card>
      </div>
    );
  }

  if (isLoading) return <LoadingSkeleton />;

  if (error) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    return (
      <div className="p-6">
        <Card className="border-destructive"><CardContent className="pt-6">
          <p className="text-destructive font-semibold mb-2">Erro ao carregar dashboard</p>
          <p className="text-sm text-muted-foreground">{msg}</p>
        </CardContent></Card>
      </div>
    );
  }

  if (!data) return null;

  const { overview, timeSeries, devices, browsers, geo, games } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Analytics</h1>
          <p className="text-sm text-muted-foreground">Visão geral do TikJogos</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview" className="gap-2"><Activity className="h-4 w-4" />Visão Geral</TabsTrigger>
          <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" />Usuários</TabsTrigger>
          <TabsTrigger value="games" className="gap-2"><Gamepad2 className="h-4 w-4" />Jogos</TabsTrigger>
        </TabsList>

        {/* ═══ OVERVIEW TAB ═══ */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Pageviews" value={formatNum(overview.totalPageviews)} icon={Eye} change={overview.changes.pageviews} />
            <KpiCard title="Visitantes Únicos" value={formatNum(overview.totalUniqueVisitors)} icon={Users} change={overview.changes.visitors} />
            <KpiCard title="Jogadores Únicos" value={formatNum(overview.totalPlayers)} icon={Gamepad2} change={overview.changes.players} />
            <KpiCard title="Sessão Média" value={formatDuration(overview.avgSessionDuration)} icon={Clock} change={overview.changes.session} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Pageviews - 30 dias</CardTitle></CardHeader>
              <CardContent><MiniChart data={timeSeries.pageviews} color="#6366f1" /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Visitantes Únicos - 30 dias</CardTitle></CardHeader>
              <CardContent><MiniChart data={timeSeries.visitors} color="#8b5cf6" /></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Salas Criadas - 30 dias</CardTitle></CardHeader>
            <CardContent><MiniChart data={timeSeries.rooms} color="#f59e0b" /></CardContent>
          </Card>
        </TabsContent>

        {/* ═══ USERS TAB ═══ */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard title="Visitantes Únicos (IPs)" value={formatNum(overview.totalUniqueVisitors)} icon={Users} subtitle="Visitantes com IPs diferentes" />
            <KpiCard title="Jogadores Únicos" value={formatNum(overview.totalPlayers)} icon={Gamepad2} subtitle="Entraram em pelo menos 1 sala" />
            <KpiCard title="Sessão Média" value={formatDuration(overview.avgSessionDuration)} icon={Clock} subtitle="Tempo médio no site" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Smartphone className="h-4 w-4" />Dispositivos</CardTitle></CardHeader>
              <CardContent><DevicePieChart data={devices} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" />Navegadores</CardTitle></CardHeader>
              <CardContent><HorizontalBarList data={browsers} color="#8b5cf6" /></CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" />Países</CardTitle></CardHeader>
              <CardContent><HorizontalBarList data={geo.countries} color="#6366f1" /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" />Cidades</CardTitle></CardHeader>
              <CardContent><HorizontalBarList data={geo.cities} color="#a78bfa" /></CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══ GAMES TAB ═══ */}
        <TabsContent value="games" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total de Salas" value={formatNum(games.roomsTotal)} icon={DoorOpen} subtitle="Desde o início" />
            <KpiCard title="Salas Hoje" value={formatNum(games.roomsToday)} icon={DoorOpen} subtitle="Criadas hoje" />
            <KpiCard title="Salas Ativas" value={formatNum(games.activeRooms)} icon={Activity} subtitle="Em andamento agora" color="text-emerald-500" />
            <KpiCard title="Taxa de Abandono" value={`${games.abandonmentRate}%`} icon={AlertTriangle}
              subtitle="Salas sem jogadores (30d)" color={games.abandonmentRate > 50 ? 'text-red-500' : 'text-foreground'} />
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Salas Criadas - 30 dias</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={(games.roomsLast30Days || []).map(d => ({ ...d, label: format(parseISO(d.date), 'dd/MM', { locale: ptBR }) }))}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} width={40} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4" />Jogos Mais Jogados</CardTitle></CardHeader>
              <CardContent>
                <HorizontalBarList
                  data={(games.gameModes || []).map(g => ({ ...g, name: GAME_MODE_LABELS[g.name] || g.name }))}
                  color="#f59e0b"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Gamepad2 className="h-4 w-4" />Modos Mais Usados</CardTitle></CardHeader>
              <CardContent>
                <HorizontalBarList
                  data={(games.themeUsage || []).map(t => ({ ...t, name: GAME_MODE_LABELS[t.name] || t.name }))}
                  color="#6366f1"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Salas Este Mês</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{formatNum(games.roomsMonth)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Jogadores Únicos</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{formatNum(overview.totalPlayers)}</div></CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div><Skeleton className="h-7 w-48" /><Skeleton className="h-4 w-32 mt-1" /></div>
      </div>
      <Skeleton className="h-10 w-96" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}
