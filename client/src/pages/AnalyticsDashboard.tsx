import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Users, Eye } from 'lucide-react';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { getQueryFn } from '@/lib/queryClient';

type AnalyticsSummary = {
  totalPageviews: number;
  totalUniqueVisitors: number;
  pageviewsLast30Days: Array<{ date: string; count: number }>;
  uniqueVisitorsLast30Days: Array<{ date: string; count: number }>;
};

export default function AnalyticsDashboard() {
  const { data, isLoading, error } = useQuery<AnalyticsSummary>({
    queryKey: ['/api/analytics/summary'],
    queryFn: getQueryFn({ on401: 'throw' }),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <AnalyticsLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              Erro ao carregar dados de analytics. Tente novamente mais tarde.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Analytics de Tráfego</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pageviews</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {data?.totalPageviews.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Todas as visualizações de página
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitantes Únicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {data?.totalUniqueVisitors.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Visitantes identificados por cookie
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pageviews - Últimos 30 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              data={data?.pageviewsLast30Days || []}
              dataKey="count"
              color="#8884d8"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visitantes Únicos - Últimos 30 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              data={data?.uniqueVisitorsLast30Days || []}
              dataKey="count"
              color="#82ca9d"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <div className="grid grid-cols-1 gap-6">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
