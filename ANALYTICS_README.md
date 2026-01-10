# Sistema de Analytics de Tráfego - TikJogos

## Visão Geral

O sistema de Analytics de Tráfego rastreia visitantes únicos e pageviews através de cookies persistentes, armazenando os dados no PostgreSQL e exibindo métricas em tempo real no dashboard administrativo.

## Como Funciona

### Rastreamento por Cookie

1. **Primeira Visita**: Quando um usuário acessa o site pela primeira vez, o sistema:
   - Gera um UUID único
   - Armazena no cookie `visitor_id` (válido por 365 dias)
   - Registra um evento `unique_visitor` no banco de dados

2. **Visitas Subsequentes**: Quando o usuário retorna:
   - Lê o cookie `visitor_id` existente
   - Registra um evento `pageview` no banco de dados

3. **Dados Capturados**:
   - Timestamp (UTC)
   - IP do visitante (considerando proxies)
   - User Agent do navegador
   - Caminho da página acessada
   - Referrer (origem do acesso)

### Estrutura do Banco de Dados

**Tabela: `analytics_events`**

```sql
CREATE TABLE analytics_events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id VARCHAR(36) NOT NULL,
  event_type VARCHAR(20) NOT NULL, -- 'unique_visitor' ou 'pageview'
  ip_address VARCHAR(45),           -- Suporta IPv4 e IPv6
  user_agent TEXT,
  page_path VARCHAR(500),
  referrer VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX idx_analytics_visitor_id ON analytics_events(visitor_id);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);
```

## API

### GET /api/analytics/summary

Retorna um resumo completo das métricas de analytics.

**Autenticação**: Requer Bearer token de admin

**Resposta**:
```json
{
  "totalPageviews": 15234,
  "totalUniqueVisitors": 3421,
  "pageviewsLast30Days": [
    { "date": "2024-01-01", "count": 245 },
    { "date": "2024-01-02", "count": 312 },
    ...
  ],
  "uniqueVisitorsLast30Days": [
    { "date": "2024-01-01", "count": 89 },
    { "date": "2024-01-02", "count": 102 },
    ...
  ]
}
```

**Cálculos**:
- `totalPageviews`: Contagem total de todos os eventos (unique_visitor + pageview)
- `totalUniqueVisitors`: Contagem de visitor_id distintos onde event_type = 'unique_visitor'
- Arrays de 30 dias: Agrupados por data, com dias sem dados preenchidos com count = 0

## Acessando o Dashboard

1. Acesse `/dashadmin`
2. Faça login com as credenciais de administrador
3. Role até a seção "Analytics de Tráfego"
4. Visualize:
   - **Cards KPI**: Números totais de pageviews e visitantes únicos
   - **Gráficos**: Evolução das métricas nos últimos 30 dias

## Arquitetura

### Backend

**Middleware de Tracking** (`server/analyticsMiddleware.ts`):
- Intercepta todas as requisições HTTP
- Ignora arquivos estáticos (.js, .css, imagens)
- Processa de forma assíncrona (não bloqueia requisições)
- Tratamento de erros gracioso

**API de Métricas** (`server/analyticsRoutes.ts`):
- Queries otimizadas com índices
- Preenchimento automático de datas faltantes
- Proteção com middleware de admin

### Frontend

**Componentes**:
- `AnalyticsChart`: Gráfico reutilizável com Recharts
- `AnalyticsDashboard`: Página principal com cards e gráficos
- Integrado no `AdminDashboard`

**Tecnologias**:
- React Query para cache (5 minutos)
- Recharts para visualização
- date-fns para formatação de datas
- Radix UI para componentes

## Configuração

### Instalação

As dependências já estão instaladas:
- `cookie-parser`: Parsing de cookies
- `recharts`: Gráficos
- `date-fns`: Manipulação de datas

### Migração do Banco

Execute para criar a tabela:
```bash
npm run db:push
```

### Variáveis de Ambiente

Nenhuma configuração adicional necessária. O sistema usa:
- `DATABASE_URL`: Conexão PostgreSQL (já configurada)
- `NODE_ENV`: Define se cookies são secure (production)

## Desabilitando o Tracking

Para desabilitar temporariamente o tracking, comente as linhas em `server/index.ts`:

```typescript
// app.use(cookieParser());
// app.use(analyticsMiddleware);
```

## Privacidade e LGPD/GDPR

### Dados Coletados

- **Cookie**: UUID anônimo, sem informações pessoais
- **IP**: Armazenado para detecção de fraude
- **User Agent**: Informações técnicas do navegador

### Conformidade

- Cookies não são essenciais (podem ser bloqueados)
- Dados anônimos (não identificam pessoas)
- Sem rastreamento cross-site
- Sem compartilhamento com terceiros

### Recomendações

Para conformidade total:
1. Adicione aviso de cookies no site
2. Permita opt-out via configurações
3. Implemente anonimização de IP (últimos octetos)
4. Defina política de retenção de dados

## Troubleshooting

### Cookie não está sendo criado

**Problema**: Visitantes não são rastreados

**Soluções**:
1. Verifique se `cookie-parser` está instalado
2. Confirme que o middleware está registrado antes das rotas
3. Em produção, certifique-se que o site usa HTTPS (cookies secure)

### Database não disponível

**Problema**: Erro "Database not available" nos logs

**Soluções**:
1. Verifique `DATABASE_URL` nas variáveis de ambiente
2. Confirme que o banco PostgreSQL está acessível
3. Execute `npm run db:push` para criar a tabela

### Dados não aparecem no dashboard

**Problema**: Gráficos vazios ou erro 401

**Soluções**:
1. Verifique se está autenticado como admin
2. Confirme que o Bearer token está correto
3. Verifique se há eventos na tabela `analytics_events`
4. Limpe o cache do React Query (recarregue a página)

### Performance lenta

**Problema**: Queries demoradas

**Soluções**:
1. Verifique se os índices foram criados
2. Execute `EXPLAIN ANALYZE` nas queries
3. Considere adicionar mais índices compostos
4. Implemente cache no backend (Redis)

## Melhorias Futuras

### Curto Prazo

- [ ] Adicionar filtros de data customizados
- [ ] Exportar dados para CSV
- [ ] Gráfico de páginas mais visitadas
- [ ] Análise de referrers

### Médio Prazo

- [ ] Dashboard em tempo real (WebSocket)
- [ ] Métricas de sessão (duração, bounce rate)
- [ ] Segmentação por dispositivo/navegador
- [ ] Alertas de tráfego anormal

### Longo Prazo

- [ ] Machine learning para previsão de tráfego
- [ ] Integração com Google Analytics
- [ ] A/B testing framework
- [ ] Heatmaps de cliques

## Adicionando Novos Tipos de Eventos

Para rastrear eventos customizados (ex: cliques em botões):

1. **Adicione o tipo no schema**:
```typescript
// shared/schema.ts
eventType: varchar("event_type", { length: 20 }).notNull(),
// Aceita: 'unique_visitor' | 'pageview' | 'button_click' | 'game_start'
```

2. **Crie função de tracking no frontend**:
```typescript
// client/src/lib/analytics.ts
export async function trackEvent(eventType: string, metadata?: object) {
  await fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, metadata }),
  });
}
```

3. **Adicione rota no backend**:
```typescript
// server/analyticsRoutes.ts
router.post('/track', async (req, res) => {
  const { eventType, metadata } = req.body;
  // Validar e inserir no banco
});
```

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs do servidor (`console.log` com prefixo `[Analytics]`)
2. Consulte este README
3. Revise o código em `server/analyticsMiddleware.ts` e `server/analyticsRoutes.ts`

## Licença

Este sistema faz parte do projeto TikJogos e segue a mesma licença do projeto principal.
