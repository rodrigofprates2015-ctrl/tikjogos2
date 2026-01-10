# Implementation Plan - Analytics de Tráfego

## Tasks

- [ ] 1. Criar schema da tabela analytics_events no banco de dados
  - Adicionar definição da tabela `analytics_events` em `shared/schema.ts` usando Drizzle ORM
  - Incluir campos: id (UUID), visitorId, eventType, ipAddress, userAgent, pagePath, referrer, createdAt
  - Criar índices em: visitorId, eventType, createdAt para otimizar queries
  - Exportar tipos TypeScript: AnalyticsEvent e InsertAnalyticsEvent
  - _Requirements: 2.1, 2.5_

- [ ] 2. Implementar middleware de rastreamento automático
  - Criar arquivo `server/analyticsMiddleware.ts`
  - Implementar função `analyticsMiddleware` que intercepta todas as requisições HTTP
  - Adicionar lógica para verificar/criar cookie `visitor_id` com UUID
  - Implementar função `extractRealIP` para extrair IP considerando headers de proxy (X-Forwarded-For, X-Real-IP)
  - Adicionar filtro para ignorar arquivos estáticos (regex para .js, .css, .png, etc.) e rotas de health check
  - Implementar função assíncrona `trackEvent` que insere eventos no banco sem bloquear a requisição
  - Adicionar tratamento de erro com console.error que não interrompe o fluxo da requisição
  - Configurar cookie com: maxAge 365 dias, httpOnly false, secure em produção, sameSite 'lax'
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.3, 4.4, 4.5, 8.1, 8.5_

- [ ] 3. Criar API de consulta de métricas
  - Criar arquivo `server/analyticsRoutes.ts` com Express Router
  - Implementar rota GET `/api/analytics/summary` protegida com middleware `verifyAdmin`
  - Escrever query para calcular `totalPageviews` (count de todos os eventos)
  - Escrever query para calcular `totalUniqueVisitors` (countDistinct de visitor_id onde event_type = 'unique_visitor')
  - Escrever query para `pageviewsLast30Days` agrupando por DATE(created_at) dos últimos 30 dias
  - Escrever query para `uniqueVisitorsLast30Days` agrupando por DATE(created_at) onde event_type = 'unique_visitor'
  - Implementar função helper `fillMissingDates` que preenche dias sem dados com count = 0
  - Adicionar tratamento de erro que retorna 503 se database não disponível e 500 para outros erros
  - Exportar router como default export
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 8.2, 8.3_

- [ ] 4. Integrar middleware e rotas no servidor Express
  - Adicionar dependência `cookie-parser` ao package.json (se não existir)
  - Importar `cookie-parser` em `server/index.ts`
  - Importar `analyticsMiddleware` e `analyticsRoutes` em `server/index.ts`
  - Adicionar `app.use(cookieParser())` antes das rotas
  - Adicionar `app.use(analyticsMiddleware)` após cookieParser e antes das rotas existentes
  - Adicionar `app.use('/api/analytics', analyticsRoutes)` com as rotas existentes
  - Executar `npm run db:push` para criar a tabela no banco de dados
  - _Requirements: 4.1, 8.4_

- [ ] 5. Criar componente de gráfico reutilizável
  - Criar arquivo `client/src/components/AnalyticsChart.tsx`
  - Importar Recharts (LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer)
  - Importar date-fns (format, parseISO) e locale ptBR
  - Definir interface `AnalyticsChartProps` com: data (array de {date, count}), dataKey (string), color (string)
  - Implementar lógica para formatar datas como "DD/MM" usando date-fns
  - Renderizar ResponsiveContainer com altura 300px
  - Configurar LineChart com CartesianGrid, XAxis (dateFormatted), YAxis, Tooltip customizado, e Line
  - Adicionar mensagem "Nenhum dado disponível ainda" quando data está vazio
  - Estilizar Tooltip com cores do tema (hsl(var(--card)), hsl(var(--border)))
  - _Requirements: 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [ ] 6. Criar página de dashboard de analytics
  - Criar arquivo `client/src/pages/AnalyticsDashboard.tsx`
  - Importar useQuery do React Query e componentes UI (Card, Skeleton)
  - Importar ícones do lucide-react (BarChart3, Users, Eye)
  - Definir tipo TypeScript `AnalyticsSummary` com estrutura da resposta da API
  - Implementar useQuery com queryKey `['/api/analytics/summary']`, staleTime 5 minutos, refetchOnWindowFocus false
  - Criar componente `AnalyticsLoadingSkeleton` com Skeleton para cards e gráficos
  - Renderizar estado de loading com skeleton
  - Renderizar estado de erro com Card e mensagem amigável
  - Renderizar título "Analytics de Tráfego" com ícone BarChart3
  - Criar grid responsivo (1 coluna mobile, 2 colunas desktop) para KPI cards
  - Renderizar Card "Total de Pageviews" com ícone Eye, número formatado (toLocaleString), e descrição
  - Renderizar Card "Visitantes Únicos" com ícone Users, número formatado, e descrição
  - Renderizar dois Cards com AnalyticsChart: um para pageviews e outro para unique visitors
  - Passar dados corretos (pageviewsLast30Days, uniqueVisitorsLast30Days) e cores diferentes para cada gráfico
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 7.1, 7.3, 7.4, 7.5, 7.6, 8.6_

- [ ] 7. Integrar página de analytics no dashboard administrativo
  - Abrir arquivo `client/src/pages/AdminDashboard.tsx`
  - Importar componente `AnalyticsDashboard` e ícone `BarChart3` do lucide-react
  - Importar componentes Tabs (Tabs, TabsContent, TabsList, TabsTrigger) se não estiverem importados
  - Adicionar nova TabsTrigger com value "analytics", ícone BarChart3, e texto "Analytics"
  - Ajustar grid-cols do TabsList para incluir a nova tab (grid-cols-4 ou grid-cols-5 dependendo do número atual)
  - Adicionar TabsContent com value "analytics" renderizando o componente AnalyticsDashboard
  - Verificar que a autenticação admin existente protege o acesso à página
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 8. Adicionar testes unitários para o middleware de analytics
  - Criar arquivo `server/__tests__/analyticsMiddleware.test.ts`
  - Escrever teste: "deve criar cookie visitor_id para novo visitante"
  - Escrever teste: "deve ler cookie visitor_id existente para visitante recorrente"
  - Escrever teste: "deve extrair IP de header X-Forwarded-For"
  - Escrever teste: "deve extrair IP de header X-Real-IP como fallback"
  - Escrever teste: "deve ignorar arquivos estáticos (.js, .css, .png)"
  - Escrever teste: "deve ignorar rotas de health check"
  - Escrever teste: "deve registrar event_type como 'unique_visitor' para novo visitante"
  - Escrever teste: "deve registrar event_type como 'pageview' para visitante recorrente"
  - Escrever teste: "não deve bloquear requisição se tracking falhar"
  - _Requirements: 1.1, 1.2, 1.3, 4.3, 4.4, 4.5, 8.5_

- [ ] 9. Adicionar testes unitários para a API de analytics
  - Criar arquivo `server/__tests__/analyticsRoutes.test.ts`
  - Escrever teste: "GET /api/analytics/summary deve retornar estrutura correta"
  - Escrever teste: "deve calcular totalPageviews corretamente"
  - Escrever teste: "deve calcular totalUniqueVisitors corretamente"
  - Escrever teste: "deve retornar 30 dias de dados com datas preenchidas"
  - Escrever teste: "deve preencher dias sem dados com count = 0"
  - Escrever teste: "deve retornar 401 se não autenticado como admin"
  - Escrever teste: "deve retornar 503 se database não disponível"
  - Escrever teste: "deve retornar 500 em caso de erro de query"
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 10. Adicionar testes de componente para AnalyticsDashboard
  - Criar arquivo `client/src/__tests__/AnalyticsDashboard.test.tsx`
  - Escrever teste: "deve renderizar skeleton durante loading"
  - Escrever teste: "deve renderizar mensagem de erro quando API falha"
  - Escrever teste: "deve renderizar cards KPI com números formatados"
  - Escrever teste: "deve formatar números com separador de milhar (toLocaleString)"
  - Escrever teste: "deve renderizar dois gráficos com dados corretos"
  - Escrever teste: "deve usar cache de 5 minutos (staleTime)"
  - Escrever teste: "não deve refetch ao focar janela (refetchOnWindowFocus false)"
  - _Requirements: 5.4, 5.5, 5.6, 6.1, 6.2, 8.6_

- [ ] 11. Adicionar testes de componente para AnalyticsChart
  - Criar arquivo `client/src/__tests__/AnalyticsChart.test.tsx`
  - Escrever teste: "deve renderizar mensagem quando data está vazio"
  - Escrever teste: "deve renderizar LineChart com dados válidos"
  - Escrever teste: "deve formatar datas como DD/MM"
  - Escrever teste: "deve configurar Tooltip com estilo correto"
  - Escrever teste: "deve usar cor passada via props"
  - Escrever teste: "deve ser responsivo (ResponsiveContainer width 100%)"
  - _Requirements: 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [ ] 12. Criar documentação de uso e manutenção
  - Criar arquivo `ANALYTICS_README.md` na raiz do projeto
  - Documentar como o sistema de analytics funciona (cookie-based tracking)
  - Explicar estrutura da tabela analytics_events
  - Documentar endpoint da API `/api/analytics/summary` com exemplo de resposta
  - Adicionar instruções para acessar o dashboard de analytics
  - Documentar como desabilitar tracking (remover middleware)
  - Adicionar seção sobre privacidade e LGPD/GDPR
  - Incluir troubleshooting comum (database não disponível, cookie não sendo criado)
  - Documentar como adicionar novos tipos de eventos no futuro
  - _Requirements: Todos (documentação geral)_
